import { useSystemData } from "../context/SystemDataContext.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CategorySelect = ({ value, onValueChange, className = "" }) => {
  const { categories } = useSystemData();

  return (
    <Select value={value} onValueChange={onValueChange} className={className}>
      <SelectTrigger>
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.name}>
            <div className="flex items-center gap-2">
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
