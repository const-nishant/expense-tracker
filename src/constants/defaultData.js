// Default categories for new users
export const DEFAULT_CATEGORIES = [
  { name: "Food", emoji: "🍕", color: "#FF6B6B" },
  { name: "Transportation", emoji: "🚗", color: "#4ECDC4" },
  { name: "Entertainment", emoji: "🎬", color: "#45B7D1" },
  { name: "Shopping", emoji: "🛍️", color: "#96CEB4" },
  { name: "Bills", emoji: "💳", color: "#FFEAA7" },
  { name: "Healthcare", emoji: "🏥", color: "#DDA0DD" },
  { name: "Education", emoji: "📚", color: "#98D8C8" },
  { name: "Travel", emoji: "✈️", color: "#F7DC6F" },
  { name: "Other", emoji: "📦", color: "#BB8FCE" },
];

// Default currencies for new users
export const DEFAULT_CURRENCIES = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    locale: "en-GB",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    locale: "ja-JP",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    locale: "en-CA",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    locale: "en-AU",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    locale: "de-CH",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    locale: "zh-CN",
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    locale: "en-IN",
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    locale: "pt-BR",
  },
];

// Default budgets for new users (based on default categories)
export const DEFAULT_BUDGETS = [
  { category: "Food", amount: 500 },
  { category: "Transportation", amount: 300 },
  { category: "Entertainment", amount: 200 },
  { category: "Shopping", amount: 400 },
  { category: "Bills", amount: 600 },
  { category: "Healthcare", amount: 200 },
  { category: "Education", amount: 300 },
  { category: "Travel", amount: 500 },
  { category: "Other", amount: 100 },
];

// Default user settings
export const DEFAULT_USER_SETTINGS = {
  currency: "INR",
  theme: "light",
  notifications: true,
  language: "en",
};
