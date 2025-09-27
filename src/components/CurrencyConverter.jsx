import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "../context/CurrencyContext.js";
import { useCurrencyConversion } from "../context/CurrencyConversionContext.js";
import { useSystemData } from "../context/SystemDataContext.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";

const CurrencyConverter = ({ className = "" }) => {
  const { currency: userCurrency } = useCurrency();
  const { currencies } = useSystemData();
  const { convertAmount, getExchangeRate, refreshRates, loading } =
    useCurrencyConversion();

  const [fromCurrency, setFromCurrency] = useState(userCurrency);
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState(1000);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!amount || fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      return;
    }

    setIsConverting(true);
    try {
      const result = await convertAmount(amount, fromCurrency, toCurrency);
      setConvertedAmount(result);
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsConverting(false);
    }
  }, [amount, fromCurrency, toCurrency, convertAmount]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getRate = () => {
    return getExchangeRate(fromCurrency, toCurrency);
  };

  useEffect(() => {
    handleConvert();
  }, [amount, fromCurrency, toCurrency, handleConvert]);

  const rate = getRate();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Currency Converter</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRates}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount"
            className="text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span>{curr.symbol}</span>
                      <span>{curr.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={swapCurrencies}
              className="h-10 w-10 p-0"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span>{curr.symbol}</span>
                      <span>{curr.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Converted Amount</Label>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-2xl font-bold">
              {isConverting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Converting...
                </div>
              ) : (
                formatCurrency(convertedAmount, toCurrency, currencies)
              )}
            </div>
            {rate && fromCurrency !== toCurrency && (
              <div className="text-sm text-muted-foreground mt-1">
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
