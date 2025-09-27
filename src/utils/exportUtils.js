export const exportToCSV = (expenses, filename = "expenses.csv") => {
  if (!expenses || expenses.length === 0) {
    alert("No expenses to export");
    return;
  }

  // Define CSV headers
  const headers = ["Title", "Amount", "Category", "Date", "Description"];

  // Convert expenses to CSV format
  const csvContent = [
    headers.join(","),
    ...expenses.map((expense) =>
      [
        `"${(expense.title || "").replace(/"/g, '""')}"`,
        expense.amount || 0,
        `"${(expense.category || "").replace(/"/g, '""')}"`,
        expense.date || "",
        `"${(expense.description || "").replace(/"/g, '""')}"`,
      ].join(",")
    ),
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToJSON = (expenses, filename = "expenses.json") => {
  if (!expenses || expenses.length === 0) {
    alert("No expenses to export");
    return;
  }

  const jsonContent = JSON.stringify(expenses, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
