import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export const formatDate = (date) => {
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatDateShort = (date) => {
  return format(new Date(date), "MMM dd");
};

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

export const getCurrentYear = () => {
  const now = new Date();
  return {
    start: startOfYear(now),
    end: endOfYear(now),
  };
};

export const isCurrentMonth = (date) => {
  const now = new Date();
  const expenseDate = new Date(date);
  return (
    now.getMonth() === expenseDate.getMonth() &&
    now.getFullYear() === expenseDate.getFullYear()
  );
};
