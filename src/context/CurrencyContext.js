import { createContext, useContext, useState, useEffect } from "react";
import { firebaseDB } from "../firebase/database.js";
import { useAuth } from "./AuthContext.js";
import { DEFAULT_USER_SETTINGS } from "../constants/defaultData.js";

export const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(DEFAULT_USER_SETTINGS.currency);
  const [userSettings, setUserSettings] = useState(null);
  const { user } = useAuth();

  // Fetch user settings on user change (no real-time listener)
  useEffect(() => {
    if (!user) {
      setUserSettings(null);
      setCurrency(DEFAULT_USER_SETTINGS.currency);
      return;
    }

    const loadUserSettings = async () => {
      try {
        const result = await firebaseDB.getDocuments("userSettings", user.uid);

        if (result.success && result.data.length > 0) {
          setUserSettings(result.data[0]);
          setCurrency(
            result.data[0].currency || DEFAULT_USER_SETTINGS.currency
          );
        } else {
          // Create default settings if none exist
          try {
            await firebaseDB.addDocument("userSettings", {
              userId: user.uid,
              currency: DEFAULT_USER_SETTINGS.currency,
            });
            setCurrency(DEFAULT_USER_SETTINGS.currency);
          } catch (error) {
            console.error("Error creating default settings:", error);
          }
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadUserSettings();
  }, [user]);

  const updateCurrency = async (newCurrency) => {
    if (!user) return;

    // Update local state immediately for better UX
    setCurrency(newCurrency);

    try {
      if (userSettings) {
        // Update existing settings
        await firebaseDB.updateDocument("userSettings", userSettings.id, {
          currency: newCurrency,
        });
      } else {
        // Create new settings if none exist
        const result = await firebaseDB.addDocument("userSettings", {
          userId: user.uid,
          currency: newCurrency,
        });
        if (result.success) {
          setUserSettings({
            id: result.id,
            userId: user.uid,
            currency: newCurrency,
          });
        }
      }
    } catch (error) {
      console.error("Error updating currency:", error);
      // Revert to previous currency on error
      setCurrency(userSettings?.currency || DEFAULT_USER_SETTINGS.currency);
    }
  };

  const value = {
    currency,
    setCurrency: updateCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
