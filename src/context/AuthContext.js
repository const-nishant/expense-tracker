import { createContext, useContext, useState, useEffect } from "react";
import { firebaseAuth } from "../firebase/auth.js";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await firebaseAuth.signIn(email, password);
  };

  const signup = async (email, password, name) => {
    return await firebaseAuth.createUser(email, password, name);
  };

  const signInWithGoogle = async () => {
    return await firebaseAuth.signInWithGoogle();
  };

  const resendVerification = async () => {
    return await firebaseAuth.resendEmailVerification();
  };

  const logout = async () => {
    return await firebaseAuth.signOut();
  };

  const value = {
    user,
    loading,
    login,
    signup,
    signInWithGoogle,
    logout,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
