import { useExpense } from "../context/ExpenseContext.js";
import { useBudget } from "../context/BudgetContext.js";
import { useCurrency } from "../context/CurrencyContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { isCurrentMonth } from "../utils/dateHelpers.js";
import BudgetBar from "../components/BudgetBar.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

const Budget = () => {
  const { expenses } = useExpense();
  const { budgets, updateBudget } = useBudget();
  const { currency } = useCurrency();
  const { categories, currencies } = useSystemData();

  const currentMonthExpenses = expenses.filter((expense) =>
    isCurrentMonth(expense.date)
  );

  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const totalBudget = Object.values(budgets).reduce(
    (sum, budget) => sum + budget,
    0
  );
  const totalSpent = Object.values(categoryTotals).reduce(
    (sum, spent) => sum + spent,
    0
  );

  const handleBudgetChange = async (category, value) => {
    const amount = parseFloat(value) || 0;
    await updateBudget(category, amount);
  };

  const budgetUtilization =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Budget Management
        </h1>
        <p className="text-muted-foreground">
          Set and track your monthly budget across different categories
        </p>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBudget, currency, currencies)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent, currency, currencies)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budgetUtilization.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
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
              {formatCurrency(totalBudget - totalSpent, currency, currencies)}
            </div>
            {isOverBudget && (
              <Badge variant="destructive" className="mt-1">
                Over Budget
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span
                className={
                  isOverBudget ? "text-destructive" : "text-muted-foreground"
                }
              >
                {budgetUtilization.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={budgetUtilization}
              className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Budget Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <div
                  key={category.id || `category-${index}`}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {categoryTotals[category.name] >
                        (budgets[category.name] || 0) && (
                        <Badge variant="destructive" className="text-xs">
                          Over Budget
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label
                        htmlFor={`budget-${category.id}`}
                        className="text-sm text-muted-foreground"
                      >
                        Budget:
                      </Label>
                      <Input
                        id={`budget-${category.id}`}
                        type="number"
                        value={budgets[category.name] || 0}
                        onChange={(e) =>
                          handleBudgetChange(category.name, e.target.value)
                        }
                        className="w-24 text-right"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <BudgetBar
                    category={category.name}
                    spent={categoryTotals[category.name] || 0}
                    budget={budgets[category.name] || 0}
                    currency={currency}
                    currencies={currencies}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  No categories found. Create some categories to start setting
                  budgets.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budget;
