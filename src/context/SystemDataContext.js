import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { firebaseDB } from "../firebase/database.js";
import { useAuth } from "./AuthContext.js";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CURRENCIES,
  DEFAULT_BUDGETS,
} from "../constants/defaultData.js";

export const SystemDataContext = createContext();

export const useSystemData = () => {
  const context = useContext(SystemDataContext);
  if (!context) {
    throw new Error("useSystemData must be used within a SystemDataProvider");
  }
  return context;
};

export const SystemDataProvider = ({ children }) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const { user } = useAuth();

  // Initialize default data if it doesn't exist
  const initializeDefaultData = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user has any categories
      const categoriesResult = await firebaseDB.getDocuments(
        "categories",
        user.uid
      );
      if (categoriesResult.success && categoriesResult.data.length === 0) {
        // Create default categories
        for (const category of DEFAULT_CATEGORIES) {
          await firebaseDB.addDocument("categories", {
            ...category,
            userId: user.uid,
          });
        }
      }

      // Check if user has any currencies
      const currenciesResult = await firebaseDB.getDocuments(
        "currencies",
        user.uid
      );
      if (currenciesResult.success && currenciesResult.data.length === 0) {
        // Create default currencies
        for (const currency of DEFAULT_CURRENCIES) {
          await firebaseDB.addDocument("currencies", {
            ...currency,
            userId: user.uid,
          });
        }
      }

      // Check if user has any budgets
      const budgetsResult = await firebaseDB.getDocuments("budgets", user.uid);
      if (budgetsResult.success && budgetsResult.data.length === 0) {
        // Create default budgets
        for (const budget of DEFAULT_BUDGETS) {
          await firebaseDB.addDocument("budgets", {
            ...budget,
            userId: user.uid,
          });
        }
      }
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }, [user]);

  // Optimized data fetching with caching
  const fetchSystemData = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setCategories(DEFAULT_CATEGORIES);
        setCurrencies(DEFAULT_CURRENCIES);
        setBudgets({});
        setLoading(false);
        return;
      }

      // Cache for 60 seconds to avoid unnecessary requests
      const now = Date.now();
      if (!forceRefresh && lastFetch && now - lastFetch < 60000) {
        return;
      }

      setLoading(true);
      try {
        // Initialize default data first (only if needed)
        await initializeDefaultData();

        // Fetch all collections in parallel for better performance
        const [categoriesResult, currenciesResult, budgetsResult] =
          await Promise.all([
            firebaseDB.getDocuments("categories", user.uid),
            firebaseDB.getDocuments("currencies", user.uid),
            firebaseDB.getDocuments("budgets", user.uid),
          ]);

        if (categoriesResult.success) {
          setCategories(categoriesResult.data || DEFAULT_CATEGORIES);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }

        if (currenciesResult.success) {
          setCurrencies(currenciesResult.data || DEFAULT_CURRENCIES);
        } else {
          setCurrencies(DEFAULT_CURRENCIES);
        }

        if (budgetsResult.success) {
          // Process budgets into map
          const budgetsMap = {};
          (budgetsResult.data || []).forEach((budget) => {
            budgetsMap[budget.category] = budget.amount;
          });
          setBudgets(budgetsMap);
        }

        setLastFetch(now);
      } catch (error) {
        console.error("Error loading system data:", error);
      } finally {
        setLoading(false);
      }
    },
    [user, initializeDefaultData, lastFetch]
  );

  // Fetch system data on user change
  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const refreshSystemData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const collections = [
        { name: "categories" },
        { name: "currencies" },
        { name: "budgets" },
      ];

      const result = await firebaseDB.getMultipleCollections(
        collections,
        user.uid
      );

      if (result.success) {
        setCategories(result.data.categories || []);
        setCurrencies(result.data.currencies || []);

        const budgetsMap = {};
        (result.data.budgets || []).forEach((budget) => {
          budgetsMap[budget.category] = budget.amount;
        });
        setBudgets(budgetsMap);
      }
    } catch (error) {
      console.error("Error refreshing system data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addCategory = useCallback(
    async (categoryData) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await firebaseDB.addDocument("categories", {
          ...categoryData,
          userId: user.uid,
        });
        if (result.success) {
          await refreshSystemData();
        }
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [user, refreshSystemData]
  );

  const updateCategory = useCallback(
    async (categoryId, updates) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await firebaseDB.updateDocument(
          "categories",
          categoryId,
          updates
        );
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await firebaseDB.deleteDocument(
          "categories",
          categoryId
        );
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const addCurrency = useCallback(
    async (currencyData) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await firebaseDB.addDocument("currencies", {
          ...currencyData,
          userId: user.uid,
        });
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const updateBudget = useCallback(
    async (category, amount) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        // First, check if budget exists for this category
        const budgetsResult = await firebaseDB.getDocuments(
          "budgets",
          user.uid
        );
        if (budgetsResult.success) {
          const existingBudget = budgetsResult.data.find(
            (b) => b.category === category
          );

          if (existingBudget) {
            // Update existing budget
            const result = await firebaseDB.updateDocument(
              "budgets",
              existingBudget.id,
              { amount }
            );
            return result;
          } else {
            // Create new budget
            const result = await firebaseDB.addDocument("budgets", {
              category,
              amount,
              userId: user.uid,
            });
            return result;
          }
        }
        return { success: false, error: "Failed to fetch budgets" };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const getCategoryById = useCallback(
    (id) => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  const getCategoryByName = useCallback(
    (name) => {
      return categories.find(
        (cat) => cat.name.toLowerCase() === name.toLowerCase()
      );
    },
    [categories]
  );

  const getCurrencyByCode = useCallback(
    (code) => {
      return currencies.find((curr) => curr.code === code);
    },
    [currencies]
  );

  // Reset functions to restore defaults
  const resetCategoriesToDefaults = useCallback(async () => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // Delete all existing categories
      const categoriesResult = await firebaseDB.getDocuments(
        "categories",
        user.uid
      );
      if (categoriesResult.success) {
        for (const category of categoriesResult.data) {
          await firebaseDB.deleteDocument("categories", category.id);
        }
      }

      // Add default categories
      for (const category of DEFAULT_CATEGORIES) {
        await firebaseDB.addDocument("categories", {
          ...category,
          userId: user.uid,
        });
      }

      await refreshSystemData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user, refreshSystemData]);

  const resetCurrenciesToDefaults = useCallback(async () => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // Delete all existing currencies
      const currenciesResult = await firebaseDB.getDocuments(
        "currencies",
        user.uid
      );
      if (currenciesResult.success) {
        for (const currency of currenciesResult.data) {
          await firebaseDB.deleteDocument("currencies", currency.id);
        }
      }

      // Add default currencies
      for (const currency of DEFAULT_CURRENCIES) {
        await firebaseDB.addDocument("currencies", {
          ...currency,
          userId: user.uid,
        });
      }

      await refreshSystemData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user, refreshSystemData]);

  const resetBudgetsToDefaults = useCallback(async () => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // Delete all existing budgets
      const budgetsResult = await firebaseDB.getDocuments("budgets", user.uid);
      if (budgetsResult.success) {
        for (const budget of budgetsResult.data) {
          await firebaseDB.deleteDocument("budgets", budget.id);
        }
      }

      // Add default budgets
      for (const budget of DEFAULT_BUDGETS) {
        await firebaseDB.addDocument("budgets", {
          ...budget,
          userId: user.uid,
        });
      }

      await refreshSystemData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user, refreshSystemData]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      categories,
      currencies,
      budgets,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addCurrency,
      updateBudget,
      getCategoryById,
      getCategoryByName,
      getCurrencyByCode,
      refreshSystemData,
      resetCategoriesToDefaults,
      resetCurrenciesToDefaults,
      resetBudgetsToDefaults,
    }),
    [
      categories,
      currencies,
      budgets,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addCurrency,
      updateBudget,
      getCategoryById,
      getCategoryByName,
      getCurrencyByCode,
      refreshSystemData,
      resetCategoriesToDefaults,
      resetCurrenciesToDefaults,
      resetBudgetsToDefaults,
    ]
  );

  return (
    <SystemDataContext.Provider value={value}>
      {children}
    </SystemDataContext.Provider>
  );
};
