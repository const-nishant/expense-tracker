import { formatCurrency } from "../utils/formatCurrency.js";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const BudgetBar = ({ spent, budget, category, currency, currencies }) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{category}</span>
          {isOverBudget && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              Over
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div
            className={`text-sm font-medium ${
              isOverBudget ? "text-destructive" : "text-foreground"
            }`}
          >
            {formatCurrency(spent, currency, currencies)}
          </div>
          <div className="text-xs text-muted-foreground">
            / {formatCurrency(budget, currency, currencies)}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <Progress
          value={percentage}
          className={`h-1.5 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(0)}%</span>
          {isOverBudget && (
            <span className="text-destructive">
              +{formatCurrency(spent - budget, currency, currencies)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetBar;
