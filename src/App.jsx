import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { ExpenseProvider } from "./context/ExpenseContext.js";
import { CurrencyProvider } from "./context/CurrencyContext.js";
import { CurrencyConversionProvider } from "./context/CurrencyConversionContext.js";
import { BudgetProvider } from "./context/BudgetContext.js";
import { RecurringExpenseProvider } from "./context/RecurringExpenseContext.js";
import { SystemDataProvider } from "./context/SystemDataContext.js";
import { useTheme } from "./hooks/useTheme.js";
import { useDataPrefetch } from "./hooks/useDataPrefetch.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, LogOut, User, DollarSign, Menu, X } from "lucide-react";
import { toast } from "sonner";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budget from "./pages/Budget.jsx";
import Reports from "./pages/Reports.jsx";
import Categories from "./pages/Categories.jsx";
import RecurringExpenses from "./pages/RecurringExpenses.jsx";
import Login from "./pages/Login.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import CurrencySelector from "./components/CurrencySelector.jsx";
import "./styles/main.css";

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prefetch data for better performance
  useDataPrefetch();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success("Logged out successfully!");
      navigate("/login");
    } else {
      toast.error(result.error || "Failed to logout");
    }
  };

  try {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <a href="/">
                    <h1 className="text-lg lg:text-xl font-bold text-foreground">
                      Expense Tracker
                    </h1>
                  </a>
                </div>
                <div className="hidden lg:flex space-x-1">
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <a href="/">Dashboard</a>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <a href="/transactions">Transactions</a>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <a href="/budget">Budget</a>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <a href="/reports">Reports</a>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <a href="/categories">Categories</a>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <a href="/recurring">Recurring</a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="hidden sm:block">
                  <CurrencySelector className="w-32 lg:w-40" />
                </div>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {user.displayName || user.email}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
                <Button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                >
                  {mobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-border bg-card">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <div className="sm:hidden mb-3">
                    <CurrencySelector className="w-full" />
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <a href="/" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <a
                      href="/transactions"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Transactions
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <a href="/budget" onClick={() => setMobileMenuOpen(false)}>
                      Budget
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <a href="/reports" onClick={() => setMobileMenuOpen(false)}>
                      Reports
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <a
                      href="/categories"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Categories
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <a
                      href="/recurring"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Recurring
                    </a>
                  </Button>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {user.displayName || user.email}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={toggleTheme} variant="outline" size="sm">
                        {theme === "light" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        size="sm"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/recurring" element={<RecurringExpenses />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  } catch (error) {
    console.error("App error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Error Loading App
            </h1>
            <p className="text-muted-foreground">
              Check the console for details
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SystemDataProvider>
          <CurrencyProvider>
            <CurrencyConversionProvider>
              <BudgetProvider>
                <ExpenseProvider>
                  <RecurringExpenseProvider>
                    <AppContent />
                    <Toaster />
                  </RecurringExpenseProvider>
                </ExpenseProvider>
              </BudgetProvider>
            </CurrencyConversionProvider>
          </CurrencyProvider>
        </SystemDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
