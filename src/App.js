// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Styles
import "./styles/index.css";
import "./styles/components.css";
import "./styles/dashboard.css";
import "./styles/login.css"; // Neue Login-Styles

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import AddIncome from "./pages/AddIncome";
import AddFixedCost from "./pages/AddFixedCost";
import AddFixedCostFromPlanned from "./pages/AddFixedCostFromPlanned"; // Neue Komponente
import AddPlannedExpense from "./pages/AddPlannedExpense";
import Categories from "./pages/Categories";
import FixedCosts from "./pages/FixedCosts";
import Expenses from "./pages/Expenses";
import PlannedExpenses from "./pages/PlannedExpenses";
import UpdateBalance from "./pages/UpdateBalance";

// ScrollToTop Komponente
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Geschützte Route-Komponente
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Wird geladen...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Öffentliche Routen */}
            <Route path="/login" element={<Login />} />

            {/* Geschützte Routen */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />

            {/* Route für AddIncome */}
            <Route
              path="/add-income"
              element={
                <ProtectedRoute>
                  <AddIncome />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-fixed-cost"
              element={
                <ProtectedRoute>
                  <AddFixedCost />
                </ProtectedRoute>
              }
            />

            {/* Neue Route für das Hinzufügen von Fixkosten aus geplanten Ausgaben */}
            <Route
              path="/add-fixed-cost-from-planned/:id"
              element={
                <ProtectedRoute>
                  <AddFixedCostFromPlanned />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-planned-expense"
              element={
                <ProtectedRoute>
                  <AddPlannedExpense />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />

            <Route
              path="/fixed-costs"
              element={
                <ProtectedRoute>
                  <FixedCosts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/planned-expenses"
              element={
                <ProtectedRoute>
                  <PlannedExpenses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/update-balance"
              element={
                <ProtectedRoute>
                  <UpdateBalance />
                </ProtectedRoute>
              }
            />

            {/* Fallback-Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
