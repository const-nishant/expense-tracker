import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useExpense } from "../context/ExpenseContext.js";
import { useSystemData } from "../context/SystemDataContext.js";

// Hook for prefetching data when user becomes available
export const useDataPrefetch = () => {
  const { user } = useAuth();
  const { fetchExpenses } = useExpense();
  const { refreshSystemData } = useSystemData();

  const prefetchData = useCallback(async () => {
    if (!user) return;

    // Prefetch data in the background
    try {
      await Promise.all([fetchExpenses(), refreshSystemData()]);
    } catch (error) {
      console.error("Error prefetching data:", error);
    }
  }, [user, fetchExpenses, refreshSystemData]);

  useEffect(() => {
    if (user) {
      // Prefetch data after a short delay to not block initial render
      const timer = setTimeout(prefetchData, 100);
      return () => clearTimeout(timer);
    }
  }, [user, prefetchData]);

  return { prefetchData };
};
