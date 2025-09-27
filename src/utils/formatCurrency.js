export const formatCurrency = (
  amount,
  currency = "INR",
  currencies = [],
  convertedAmount = null
) => {
  // Find currency info from the provided currencies array
  const currencyInfo = currencies.find((curr) => curr.code === currency);
  const locale = currencyInfo?.locale || "en-IN";

  // Use converted amount if provided, otherwise use original amount
  const displayAmount = convertedAmount !== null ? convertedAmount : amount;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(displayAmount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

export const getCurrencySymbol = (currency, currencies = []) => {
  const currencyInfo = currencies.find((curr) => curr.code === currency);
  return currencyInfo?.symbol || "$";
};

// This function is now deprecated - use currencies from SystemDataContext instead
export const getSupportedCurrencies = () => {
  return [];
};
