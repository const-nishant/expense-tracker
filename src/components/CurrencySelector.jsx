import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { useCurrencyConversion } from "../context/CurrencyConversionContext.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { DEFAULT_USER_SETTINGS } from "../constants/defaultData.js";

const CurrencySelector = ({ className = "", showConversion = false }) => {
  const { currency, setCurrency } = useCurrency();
  const { currencies, loading } = useSystemData();
  const {
    exchangeRates,
    loading: ratesLoading,
    refreshRates,
  } = useCurrencyConversion();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency && newCurrency !== currency) {
      setCurrency(newCurrency);
    }
  };

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      await refreshRates();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCurrencyDisplay = (curr) => {
    const rate = exchangeRates[curr.code];
    const rateText = rate
      ? `1 ${currency} = ${rate.toFixed(4)} ${curr.code}`
      : "";

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-lg">{curr.symbol}</span>
          <div className="flex flex-col">
            <span className="font-medium">{curr.code}</span>
            <span className="text-xs text-muted-foreground">{curr.name}</span>
          </div>
        </div>
        {showConversion && rate && currency !== curr.code && (
          <Badge variant="outline" className="text-xs">
            {rateText}
          </Badge>
        )}
      </div>
    );
  };

  if (loading || !currencies || currencies.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Select disabled value="INR">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Loading currencies..." />
          </SelectTrigger>
        </Select>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={currency || DEFAULT_USER_SETTINGS.currency || "INR"}
        onValueChange={handleCurrencyChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {(() => {
              const selectedCurrency = currencies.find(
                (c) =>
                  c.code ===
                  (currency || DEFAULT_USER_SETTINGS.currency || "INR")
              );
              return selectedCurrency ? (
                <div className="flex items-center gap-2">
                  <span>{selectedCurrency.symbol}</span>
                  <span>{selectedCurrency.code}</span>
                </div>
              ) : (
                "Select Currency"
              );
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((curr) => (
            <SelectItem key={curr.code} value={curr.code}>
              {getCurrencyDisplay(curr)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefreshRates}
        disabled={ratesLoading || isRefreshing}
        className="h-8 w-8 p-0"
      >
        <RefreshCw
          className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
        />
      </Button>
    </div>
  );
};

export default CurrencySelector;
