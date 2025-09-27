import { createContext, useContext } from "react";
import { useSystemData } from "./SystemDataContext.js";

export const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const systemData = useSystemData();

  const value = {
    budgets: systemData.budgets,
    updateBudget: systemData.updateBudget,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
};
