import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

  if (missingKeys.length > 0) {
    console.error("Missing Firebase environment variables:", missingKeys);
    throw new Error(
      `Missing Firebase configuration: ${missingKeys.join(", ")}`
    );
  }
};

// Validate configuration before initializing
validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore with optimized settings
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
});

// Configure Firestore settings for better performance
import {
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  doc,
  getDoc,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";

// Connection state management
let isOnline = navigator.onLine;
let connectionListeners = [];

export const addConnectionListener = (callback) => {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter(
      (listener) => listener !== callback
    );
  };
};

export const getConnectionState = () => isOnline;

// Initialize emulator in development if needed
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIRESTORE_EMULATOR === "true"
) {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Firebase: Connected to Firestore emulator");
  } catch (error) {
    console.warn("Firebase: Could not connect to emulator:", error);
  }
}

// Handle online/offline state
window.addEventListener("online", async () => {
  isOnline = true;
  try {
    await enableNetwork(db);
    console.log("Firebase: Connected to network");
  } catch (error) {
    console.error("Firebase: Error enabling network:", error);
    // Don't update connection state if network enable fails
    isOnline = false;
  }
  connectionListeners.forEach((callback) => callback(isOnline));
});

window.addEventListener("offline", async () => {
  isOnline = false;
  try {
    await disableNetwork(db);
    console.log("Firebase: Disconnected from network");
  } catch (error) {
    console.error("Firebase: Error disabling network:", error);
  }
  connectionListeners.forEach((callback) => callback(false));
});

// Add connection health check
export const checkFirebaseConnection = async () => {
  try {
    // Try a simple operation to test connection
    const testDoc = doc(db, "_health_check", "test");
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.error("Firebase connection health check failed:", error);

    // Check for specific error types
    if (error.code === "unavailable" || error.code === "deadline-exceeded") {
      console.warn("Firebase: Network connectivity issues detected");
    } else if (error.code === "permission-denied") {
      console.warn("Firebase: Authentication or permission issues");
    } else if (error.code === "not-found") {
      // This is actually expected for health check
      return true;
    }

    return false;
  }
};

// Add global Firebase error handler
export const setupFirebaseErrorHandling = () => {
  // Listen for unhandled Firebase errors
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && event.reason.code) {
      const firebaseErrorCodes = [
        "unavailable",
        "deadline-exceeded",
        "internal",
        "unknown",
        "aborted",
        "permission-denied",
        "not-found",
        "already-exists",
        "resource-exhausted",
        "failed-precondition",
        "out-of-range",
        "unimplemented",
        "data-loss",
        "unauthenticated",
      ];

      if (firebaseErrorCodes.includes(event.reason.code)) {
        console.warn("Firebase error caught:", {
          code: event.reason.code,
          message: event.reason.message,
          stack: event.reason.stack,
        });

        // Prevent the error from showing in console
        event.preventDefault();
      }
    }
  });
};

// Initialize error handling
setupFirebaseErrorHandling();

export default app;
