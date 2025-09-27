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

export const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const { user } = useAuth();

  const fetchExpenses = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setExpenses([]);
        return;
      }

      // Cache for 30 seconds to avoid unnecessary requests
      const now = Date.now();
      if (!forceRefresh && lastFetch && now - lastFetch < 30000) {
        return;
      }

      setLoading(true);
      try {
        const result = await firebaseDB.getDocumentsOrdered(
          "expenses",
          "createdAt",
          "desc",
          user.uid
        );
        if (result.success) {
          setExpenses(result.data);
          setLastFetch(now);
        } else {
          console.error("Error fetching expenses:", result.error);
          setExpenses([]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    },
    [user, lastFetch]
  );

  // Fetch expenses on user change (no real-time listener)
  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, fetchExpenses]);

  const addExpense = useCallback(
    async (expenseData) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticExpense = {
        id: tempId,
        ...expenseData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      setExpenses((prev) => [optimisticExpense, ...prev]);

      try {
        const result = await firebaseDB.addDocument("expenses", {
          ...expenseData,
          userId: user.uid,
        });

        if (result.success) {
          // Replace optimistic update with real data
          setExpenses((prev) =>
            prev.map((expense) =>
              expense.id === tempId ? { ...expense, id: result.id } : expense
            )
          );
          setLastFetch(Date.now());
          return { success: true, data: { id: result.id, ...expenseData } };
        } else {
          // Revert optimistic update on failure
          setExpenses((prev) =>
            prev.filter((expense) => expense.id !== tempId)
          );
          return { success: false, error: result.error };
        }
      } catch (error) {
        // Revert optimistic update on failure
        setExpenses((prev) => prev.filter((expense) => expense.id !== tempId));
        console.error("Error adding expense:", error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const updateExpense = useCallback(
    async (expenseId, expenseData) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Optimistic update
      setExpenses((prev) => {
        const originalExpense = prev.find((exp) => exp.id === expenseId);
        if (originalExpense) {
          return prev.map((expense) =>
            expense.id === expenseId ? { ...expense, ...expenseData } : expense
          );
        }
        return prev;
      });

      try {
        const result = await firebaseDB.updateDocument(
          "expenses",
          expenseId,
          expenseData
        );

        if (result.success) {
          setLastFetch(Date.now());
          return { success: true };
        } else {
          // Revert optimistic update on failure
          setExpenses((prev) => {
            const originalExpense = prev.find((exp) => exp.id === expenseId);
            if (originalExpense) {
              return prev.map((expense) =>
                expense.id === expenseId ? originalExpense : expense
              );
            }
            return prev;
          });
          return { success: false, error: result.error };
        }
      } catch (error) {
        // Revert optimistic update on failure
        setExpenses((prev) => {
          const originalExpense = prev.find((exp) => exp.id === expenseId);
          if (originalExpense) {
            return prev.map((expense) =>
              expense.id === expenseId ? originalExpense : expense
            );
          }
          return prev;
        });
        console.error("Error updating expense:", error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const deleteExpense = useCallback(
    async (expenseId) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Optimistic update
      let originalExpense = null;
      setExpenses((prev) => {
        originalExpense = prev.find((exp) => exp.id === expenseId);
        if (originalExpense) {
          return prev.filter((expense) => expense.id !== expenseId);
        }
        return prev;
      });

      try {
        const result = await firebaseDB.deleteDocument("expenses", expenseId);

        if (result.success) {
          setLastFetch(Date.now());
          return { success: true };
        } else {
          // Revert optimistic update on failure
          if (originalExpense) {
            setExpenses((prev) =>
              [...prev, originalExpense].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )
            );
          }
          return { success: false, error: result.error };
        }
      } catch (error) {
        // Revert optimistic update on failure
        if (originalExpense) {
          setExpenses((prev) =>
            [...prev, originalExpense].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          );
        }
        console.error("Error deleting expense:", error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const refreshExpenses = useCallback(async () => {
    await fetchExpenses(true);
  }, [fetchExpenses]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      expenses,
      budgets,
      loading,
      fetchExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
      refreshExpenses,
    }),
    [
      expenses,
      budgets,
      loading,
      fetchExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
      refreshExpenses,
    ]
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};
