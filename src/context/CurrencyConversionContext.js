import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { currencyService } from "../services/currencyService.js";

export const CurrencyConversionContext = createContext();

export const useCurrencyConversion = () => {
  const context = useContext(CurrencyConversionContext);
  if (!context) {
    throw new Error(
      "useCurrencyConversion must be used within a CurrencyConversionProvider"
    );
  }
  return context;
};

export const CurrencyConversionProvider = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchExchangeRates = useCallback(async (baseCurrency = "INR") => {
    setLoading(true);
    setError(null);

    try {
      const rates = await currencyService.getExchangeRates(baseCurrency);
      setExchangeRates(rates);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch exchange rates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const convertAmount = useCallback(
    async (amount, fromCurrency, toCurrency) => {
      if (fromCurrency === toCurrency) {
        return amount;
      }

      try {
        return await currencyService.convertCurrency(
          amount,
          fromCurrency,
          toCurrency
        );
      } catch (err) {
        console.error("Currency conversion failed:", err);
        return amount; // Return original amount if conversion fails
      }
    },
    []
  );

  const getExchangeRate = useCallback(
    (fromCurrency, toCurrency) => {
      if (fromCurrency === toCurrency) return 1;

      // Try to get rate from current exchange rates
      if (exchangeRates[toCurrency]) {
        return exchangeRates[toCurrency];
      }

      // Fallback to approximate rates
      const fallbackRates = currencyService.getFallbackRates(fromCurrency);
      return fallbackRates[toCurrency] || 1;
    },
    [exchangeRates]
  );

  const refreshRates = useCallback(() => {
    currencyService.clearCache();
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  // Fetch rates on mount
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  const value = {
    exchangeRates,
    loading,
    error,
    lastUpdated,
    convertAmount,
    getExchangeRate,
    fetchExchangeRates,
    refreshRates,
  };

  return (
    <CurrencyConversionContext.Provider value={value}>
      {children}
    </CurrencyConversionContext.Provider>
  );
};
