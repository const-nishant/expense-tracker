import { useState } from "react";
import { useExpense } from "../context/ExpenseContext.js";
import { useBudget } from "../context/BudgetContext.js";
import { useCurrency } from "../context/CurrencyContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { isCurrentMonth } from "../utils/dateHelpers.js";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import ChartPie from "../components/ChartPie.jsx";
import BudgetBar from "../components/BudgetBar.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {
  const { expenses } = useExpense();
  const { budgets } = useBudget();
  const { currency } = useCurrency();
  const { categories, currencies } = useSystemData();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const currentMonthExpenses = expenses.filter((expense) =>
    isCurrentMonth(expense.date)
  );

  const totalSpent = currentMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate total monthly budget from all category budgets
  const monthlyBudget = Object.values(budgets).reduce(
    (sum, budget) => sum + budget,
    0
  );

  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const budgetUtilization =
    monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOverBudget = totalSpent > monthlyBudget;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your expenses and manage your budget
          </p>
        </div>
        <Button onClick={() => setShowExpenseForm(true)} className="gap-2 h-10">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent This Month
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent, currency, currencies)}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Budget
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(monthlyBudget, currency, currencies)}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
            {isOverBudget ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isOverBudget
                  ? "text-destructive"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {formatCurrency(monthlyBudget - totalSpent, currency, currencies)}
            </div>
            {isOverBudget && (
              <Badge variant="destructive" className="mt-2">
                Over Budget
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {categories.length > 0 ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Overall Budget</span>
                    <span
                      className={
                        isOverBudget
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {budgetUtilization.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={budgetUtilization}
                    className={`h-1.5 ${
                      isOverBudget ? "[&>div]:bg-destructive" : ""
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <BudgetBar
                      key={category.id || `category-${index}`}
                      category={category.name}
                      spent={categoryTotals[category.name] || 0}
                      budget={budgets[category.name] || 0}
                      currency={currency}
                      currencies={currencies}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No categories found. Create some categories to start tracking
                  your budget.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPie expenses={currentMonthExpenses} />
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList onEdit={setEditingExpense} />
          </CardContent>
        </Card>
      </div>

      {/* Expense Form Dialog */}
      {(showExpenseForm || editingExpense) && (
        <ExpenseForm
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          expense={editingExpense}
        />
      )}
    </div>
  );
};

export default Dashboard;
