import { useState } from "react";
import { useRecurringExpense } from "../context/RecurringExpenseContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { useCurrency } from "../context/CurrencyContext.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategorySelect from "./CategorySelect.jsx";
import CurrencySelector from "./CurrencySelector.jsx";

const RecurringExpenseManager = () => {
  const {
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useRecurringExpense();
  const { categories } = useSystemData();
  const { currency } = useCurrency();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    frequency: "monthly",
    description: "",
    currency: currency,
    isActive: true,
  });

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExpense) {
      updateRecurringExpense(editingExpense.id, formData);
      setEditingExpense(null);
    } else {
      addRecurringExpense(formData);
    }
    setFormData({
      title: "",
      amount: "",
      category: "",
      frequency: "monthly",
      description: "",
      currency: currency,
      isActive: true,
    });
    setShowAddForm(false);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency,
      description: expense.description || "",
      currency: expense.currency,
      isActive: expense.isActive,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    setFormData({
      title: "",
      amount: "",
      category: "",
      frequency: "monthly",
      description: "",
      currency: currency,
      isActive: true,
    });
  };

  const toggleActive = (id, isActive) => {
    updateRecurringExpense(id, { isActive: !isActive });
  };

  const getCategoryEmoji = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category ? category.emoji : "📦";
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category ? category.color : "#BB8FCE";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Expenses</h2>
        <Button onClick={() => setShowAddForm(true)} className="h-9">
          Add Recurring Expense
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingExpense
                ? "Edit Recurring Expense"
                : "Add Recurring Expense"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter title"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="flex-1 h-9"
                />
                <CurrencySelector
                  className="w-24 h-9"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <CategorySelect
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Frequency
                </Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequency: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows="2"
                placeholder="Add any additional details..."
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active
              </Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="h-9"
              >
                Cancel
              </Button>
              <Button type="submit" className="h-9">
                {editingExpense ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recurring Expenses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringExpenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{
                        backgroundColor: getCategoryColor(expense.category),
                      }}
                    >
                      {getCategoryEmoji(expense.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{expense.title}</h3>
                      <p className="text-sm text-gray-500">
                        {expense.frequency}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      expense.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {expense.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {expense.amount} {expense.currency}
                  </p>
                  <p className="text-sm text-gray-600">{expense.category}</p>
                  {expense.description && (
                    <p className="text-sm text-gray-500">
                      {expense.description}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={expense.isActive ? "secondary" : "default"}
                    onClick={() => toggleActive(expense.id, expense.isActive)}
                  >
                    {expense.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteRecurringExpense(expense.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recurringExpenses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recurring expenses found. Add your first recurring expense to get
          started!
        </div>
      )}
    </div>
  );
};

export default RecurringExpenseManager;
