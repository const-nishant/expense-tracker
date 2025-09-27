import { useState } from "react";
import { useSystemData } from "../context/SystemDataContext.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, RotateCcw, Tag } from "lucide-react";

const CategoryManager = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetCategoriesToDefaults,
  } = useSystemData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    color: "#FF6B6B",
  });

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D7BDE2",
  ];

  const emojis = [
    "🍕",
    "🚗",
    "🎬",
    "🛍️",
    "💳",
    "🏥",
    "📚",
    "✈️",
    "📦",
    "🍔",
    "🚌",
    "🎮",
    "👕",
    "💡",
    "💊",
    "🎓",
    "🏖️",
    "📱",
    "☕",
    "🚲",
    "🎵",
    "🛒",
    "🏠",
    "💻",
    "🎯",
    "🌮",
    "🚇",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      addCategory(formData);
    }
    setFormData({ name: "", emoji: "", color: "#FF6B6B" });
    setShowAddForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      emoji: category.emoji,
      color: category.color,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: "", emoji: "", color: "#FF6B6B" });
  };

  const handleResetToDefaults = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all categories to defaults? This will delete all your custom categories."
      )
    ) {
      const result = await resetCategoriesToDefaults();
      if (result.success) {
        toast.success("Categories reset to defaults successfully!");
      } else {
        toast.error(result.error || "Failed to reset categories");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Categories
          </h2>
          <p className="text-muted-foreground">
            Create and organize your expense categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            size="sm"
            className="text-orange-600 hover:text-orange-700 h-9"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="categoryName" className="text-sm font-medium">
                    Category Name
                  </Label>
                  <Input
                    id="categoryName"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter category name"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Emoji</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, emoji }))
                        }
                        className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                          formData.emoji === emoji
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, color }))
                        }
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          formData.color === color
                            ? "border-foreground scale-110"
                            : "border-border hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 h-10">
                    {editingCategory ? "Update" : "Add"} Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <Card
            key={category.id || `category-${index}`}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCategory(category.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
