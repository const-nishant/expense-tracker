import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { firebaseDB } from "../firebase/database.js";
import { useAuth } from "./AuthContext.js";
import { useExpense } from "./ExpenseContext.js";
import { useCurrency } from "./CurrencyContext.js";

export const RecurringExpenseContext = createContext();

export const useRecurringExpense = () => {
  const context = useContext(RecurringExpenseContext);
  if (!context) {
    throw new Error(
      "useRecurringExpense must be used within a RecurringExpenseProvider"
    );
  }
  return context;
};

export const RecurringExpenseProvider = ({ children }) => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const { user } = useAuth();
  const { addExpense } = useExpense();
  const { currency } = useCurrency();

  // Fetch recurring expenses on user change (no real-time listener)
  useEffect(() => {
    if (!user) {
      setRecurringExpenses([]);
      return;
    }

    const fetchRecurringExpenses = async () => {
      try {
        const result = await firebaseDB.getDocuments(
          "recurringExpenses",
          user.uid
        );
        if (result.success) {
          setRecurringExpenses(result.data);
        }
      } catch (error) {
        console.error("Error fetching recurring expenses:", error);
      }
    };

    fetchRecurringExpenses();
  }, [user]);

  const refreshRecurringExpenses = async () => {
    if (!user) return;

    try {
      const result = await firebaseDB.getDocuments(
        "recurringExpenses",
        user.uid
      );
      if (result.success) {
        setRecurringExpenses(result.data);
      }
    } catch (error) {
      console.error("Error refreshing recurring expenses:", error);
    }
  };

  const addRecurringExpense = async (expenseData) => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const result = await firebaseDB.addDocument("recurringExpenses", {
        ...expenseData,
        userId: user.uid,
        lastProcessed: null,
        isActive: true,
      });
      if (result.success) {
        await refreshRecurringExpenses();
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateRecurringExpense = useCallback(
    async (id, updates) => {
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await firebaseDB.updateDocument(
          "recurringExpenses",
          id,
          updates
        );
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  const deleteRecurringExpense = async (id) => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const result = await firebaseDB.deleteDocument("recurringExpenses", id);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const processRecurringExpenses = useCallback(async () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    for (const recurringExpense of recurringExpenses) {
      if (!recurringExpense.isActive) continue;

      const lastProcessed = recurringExpense.lastProcessed
        ? new Date(recurringExpense.lastProcessed)
        : null;
      const shouldProcess = shouldProcessRecurringExpense(
        recurringExpense,
        lastProcessed,
        now
      );

      if (shouldProcess) {
        const expenseData = {
          title: recurringExpense.title,
          amount: recurringExpense.amount,
          category: recurringExpense.category,
          date: today,
          description:
            recurringExpense.description ||
            `Recurring: ${recurringExpense.frequency}`,
          currency: recurringExpense.currency || currency,
        };

        const result = await addExpense(expenseData);
        if (result.success) {
          await updateRecurringExpense(recurringExpense.id, {
            lastProcessed: now.toISOString(),
          });
        }
      }
    }
  }, [recurringExpenses, addExpense, currency, updateRecurringExpense]);

  const shouldProcessRecurringExpense = (expense, lastProcessed, now) => {
    if (!lastProcessed) return true;

    const daysSinceLastProcess = Math.floor(
      (now - lastProcessed) / (1000 * 60 * 60 * 24)
    );

    switch (expense.frequency) {
      case "daily":
        return daysSinceLastProcess >= 1;
      case "weekly":
        return daysSinceLastProcess >= 7;
      case "monthly":
        return daysSinceLastProcess >= 30;
      case "yearly":
        return daysSinceLastProcess >= 365;
      default:
        return false;
    }
  };

  // Process recurring expenses on app load
  useEffect(() => {
    processRecurringExpenses();
  }, [processRecurringExpenses]);

  const value = {
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    processRecurringExpenses,
    refreshRecurringExpenses,
  };

  return (
    <RecurringExpenseContext.Provider value={value}>
      {children}
    </RecurringExpenseContext.Provider>
  );
};
