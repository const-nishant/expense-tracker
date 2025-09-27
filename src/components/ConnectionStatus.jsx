import { useState, useEffect } from "react";
import {
  addConnectionListener,
  getConnectionState,
  checkFirebaseConnection,
} from "../firebase/config.js";
import { useExpense } from "../context/ExpenseContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { useRecurringExpense } from "../context/RecurringExpenseContext.js";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(getConnectionState());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [firebaseHealthy, setFirebaseHealthy] = useState(true);

  const { refreshExpenses } = useExpense();
  const { refreshSystemData } = useSystemData();
  const { refreshRecurringExpenses } = useRecurringExpense();

  useEffect(() => {
    const unsubscribe = addConnectionListener(setIsOnline);

    // Check Firebase connection health periodically
    const healthCheck = async () => {
      if (isOnline) {
        const healthy = await checkFirebaseConnection();
        setFirebaseHealthy(healthy);
      }
    };

    // Initial health check
    healthCheck();

    // Check every 30 seconds
    const interval = setInterval(healthCheck, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshExpenses(),
        refreshSystemData(),
        refreshRecurringExpenses(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isOnline && firebaseHealthy) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Connected</span>
        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    );
  }

  if (isOnline && !firebaseHealthy) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span>Firebase Issues</span>
        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
        >
          {isRefreshing ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span>Offline</span>
    </div>
  );
};

export default ConnectionStatus;
