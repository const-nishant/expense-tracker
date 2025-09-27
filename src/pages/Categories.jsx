import CategoryManager from "../components/CategoryManager.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

const Categories = () => {
  return (
    <div className="space-y-6">
      <CategoryManager />
    </div>
  );
};

export default Categories;
