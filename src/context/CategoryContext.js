import { createContext, useContext } from "react";
import { useSystemData } from "./SystemDataContext.js";

export const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const systemData = useSystemData();

  const value = {
    categories: systemData.categories,
    addCategory: systemData.addCategory,
    updateCategory: systemData.updateCategory,
    deleteCategory: systemData.deleteCategory,
    getCategoryById: systemData.getCategoryById,
    getCategoryByName: systemData.getCategoryByName,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
