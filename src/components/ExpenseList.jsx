import React from "react";
import { useExpense } from "../context/ExpenseContext.js";
import { useCurrency } from "../context/CurrencyContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/dateHelpers.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Receipt, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import ExpenseListSkeleton from "./ExpenseListSkeleton.jsx";

const ExpenseList = ({ expenses: propExpenses, onEdit }) => {
  const { expenses: contextExpenses, deleteExpense, loading } = useExpense();
  const { currency } = useCurrency();
  const { currencies } = useSystemData();
  const expenses = propExpenses || contextExpenses;

  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      const result = await deleteExpense(expenseId);
      if (result.success) {
        toast.success("Expense deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete expense");
      }
    }
  };

  if (loading) {
    return <ExpenseListSkeleton count={5} />;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No expenses found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.slice(0, 5).map((expense) => (
        <Card key={expense.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {expense.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {expense.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(expense.date)}</span>
                  {expense.description && (
                    <span className="truncate">• {expense.description}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className="font-medium text-sm text-foreground">
                  {formatCurrency(
                    expense.amount,
                    expense.currency || currency,
                    currencies
                  )}
                </p>
                <div className="flex gap-0.5">
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(expense)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(expense.id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {expenses.length > 5 && (
        <div className="text-center pt-2">
          <span className="text-xs text-muted-foreground">
            Showing 5 of {expenses.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ExpenseList);
