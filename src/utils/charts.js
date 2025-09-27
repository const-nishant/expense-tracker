export const prepareChartData = (expenses) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
};

export const prepareMonthlyData = (expenses) => {
  const monthlyTotals = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
    return acc;
  }, {});

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      amount,
    }));
};
