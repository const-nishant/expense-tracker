import { useState } from "react";
import { useExpense } from "../context/ExpenseContext.js";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import CategorySelect from "../components/CategorySelect.jsx";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Calendar, ArrowUpDown } from "lucide-react";

const Transactions = () => {
  const { expenses } = useExpense();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredExpenses = expenses.filter((expense) => {
    if (filterCategory && expense.category !== filterCategory) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        expense.title?.toLowerCase().includes(searchLower) ||
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category?.toLowerCase().includes(searchLower) ||
        expense.amount?.toString().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    if (dateFrom || dateTo) {
      const expenseDate = new Date(expense.date);
      if (dateFrom && expenseDate < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && expenseDate > new Date(dateTo)) {
        return false;
      }
    }
    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.amount - a.amount;
      case "date":
        return new Date(b.date) - new Date(a.date);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your expense transactions
          </p>
        </div>
        <Button onClick={() => setShowExpenseForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <CategorySelect
                value={filterCategory}
                onValueChange={setFilterCategory}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort by
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setFilterCategory("");
                setSortBy("date");
                setSearchTerm("");
                setDateFrom("");
                setDateTo("");
              }}
              variant="outline"
              size="sm"
            >
              Clear Filters
            </Button>
            {(filterCategory || searchTerm || dateFrom || dateTo) && (
              <Badge variant="secondary">
                {[
                  filterCategory && "Category",
                  searchTerm && "Search",
                  (dateFrom || dateTo) && "Date",
                ]
                  .filter(Boolean)
                  .join(", ")}{" "}
                filters active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedExpenses.length} of {expenses.length} transactions
        </p>
        {sortedExpenses.length !== expenses.length && (
          <Badge variant="outline">Filtered results</Badge>
        )}
      </div>

      {/* Expense List */}
      <ExpenseList expenses={sortedExpenses} onEdit={setEditingExpense} />

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

export default Transactions;
