// Expenses.jsx
// src/pages/Expenses.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoAddOutline,
  IoSearchOutline,
  IoFilterOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchExpenses, deleteExpense } from "../utils/supabaseClient";
import Header from "../components/Header";
import TransactionList from "../components/TransactionList";
import "../styles/Expenses.css";

const Expenses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    minAmount: "",
    maxAmount: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Laden der Ausgaben
  useEffect(() => {
    loadExpenses();
  }, [user]);

  // Filtern der Ausgaben, wenn sich der Suchbegriff oder Filter ändert
  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, filters]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      // Mehr Ausgaben laden, z.B. die letzten 100
      const data = await fetchExpenses(user.id, 100);
      setExpenses(data);

      // Berechne den Gesamtbetrag
      const total = data.reduce(
        (sum, expense) => sum + parseFloat(expense.amount || 0),
        0
      );
      setTotalAmount(total);

      setError("");
    } catch (error) {
      console.error("Fehler beim Laden der Ausgaben:", error);
      setError("Ausgaben konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let result = [...expenses];

    // Suche nach Begriff
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.name.toLowerCase().includes(search) ||
          (expense.categories?.name || "").toLowerCase().includes(search)
      );
    }

    // Datum filtern
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter((expense) => new Date(expense.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Ende des Tages
      result = result.filter((expense) => new Date(expense.date) <= endDate);
    }

    // Kategorie filtern
    if (filters.category) {
      result = result.filter(
        (expense) => expense.category === filters.category
      );
    }

    // Betrag filtern
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      result = result.filter((expense) => parseFloat(expense.amount) >= min);
    }

    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      result = result.filter((expense) => parseFloat(expense.amount) <= max);
    }

    setFilteredExpenses(result);
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      // Neu laden, um den Kontostand korrekt zu aktualisieren
      await loadExpenses();
    } catch (error) {
      console.error("Fehler beim Löschen der Ausgabe:", error);
      setError("Ausgabe konnte nicht gelöscht werden");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: "",
      minAmount: "",
      maxAmount: "",
    });
    setSearchTerm("");
  };

  // Formatieren des Betrags mit deutschem Format
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="page-container">
      <Header title="Alle Ausgaben" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Suchleiste und Filter */}
        <div className="search-container">
          <div className="search-input-container">
            <IoSearchOutline className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <IoFilterOutline size={20} />
          </button>
        </div>

        {/* Filter-Bereich */}
        {showFilters && (
          <motion.div
            className="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-row">
              <div className="filter-group">
                <label>Von</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Bis</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Min. Betrag</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  className="filter-input"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
              <div className="filter-group">
                <label>Max. Betrag</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  className="filter-input"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
            </div>

            <button className="filter-reset-button" onClick={resetFilters}>
              Filter zurücksetzen
            </button>
          </motion.div>
        )}

        {/* Zusammenfassung */}
        <div className="expenses-summary">
          <div className="summary-item">
            <span className="summary-label">Gesamt</span>
            <span className="summary-value">{formatAmount(totalAmount)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Anzahl</span>
            <span className="summary-value">{filteredExpenses.length}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Liste der Ausgaben */}
        {loading ? (
          <div className="loading-indicator">Wird geladen...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>Keine Ausgaben gefunden</p>
            {expenses.length > 0 && searchTerm && (
              <button className="button button-sm" onClick={resetFilters}>
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <TransactionList
            transactions={filteredExpenses}
            onTransactionDelete={handleDeleteExpense}
          />
        )}
      </motion.div>

      {/* Hinzufügen-Button */}
      <motion.div
        className="add-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/add-expense")}
      >
        <IoAddOutline size={24} />
      </motion.div>
    </div>
  );
};

export default Expenses;
