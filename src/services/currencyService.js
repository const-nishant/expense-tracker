// Currency conversion service using ExchangeRate-API
class CurrencyService {
  constructor() {
    this.baseUrl = "https://api.exchangerate-api.com/v4/latest";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getExchangeRates(baseCurrency = "INR") {
    const cacheKey = `rates_${baseCurrency}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.rates;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${baseCurrency}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rates = data.rates;

      // Cache the rates
      this.cache.set(cacheKey, {
        rates,
        timestamp: Date.now(),
      });

      return rates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);

      // Return fallback rates if API fails
      return this.getFallbackRates(baseCurrency);
    }
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates[toCurrency];

      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      return amount * rate;
    } catch (error) {
      console.error("Error converting currency:", error);
      return amount; // Return original amount if conversion fails
    }
  }

  getFallbackRates(baseCurrency) {
    // Fallback exchange rates (approximate values)
    const fallbackRates = {
      INR: {
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0095,
        JPY: 1.8,
        CAD: 0.016,
        AUD: 0.018,
        CHF: 0.011,
        CNY: 0.087,
        BRL: 0.061,
        INR: 1,
      },
      USD: {
        INR: 83.0,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 150.0,
        CAD: 1.35,
        AUD: 1.5,
        CHF: 0.88,
        CNY: 7.25,
        BRL: 5.05,
        USD: 1,
      },
      EUR: {
        INR: 90.0,
        USD: 1.09,
        GBP: 0.86,
        JPY: 163.0,
        CAD: 1.47,
        AUD: 1.63,
        CHF: 0.96,
        CNY: 7.89,
        BRL: 5.5,
        EUR: 1,
      },
    };

    return fallbackRates[baseCurrency] || fallbackRates["INR"];
  }

  clearCache() {
    this.cache.clear();
  }
}

export const currencyService = new CurrencyService();
