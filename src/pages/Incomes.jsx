// src/pages/Incomes.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoAddOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchIncomes, deleteIncome } from "../utils/supabaseClient";
import Header from "../components/Header";
import { formatAmount, formatDate } from "../utils/formatters";
import "../styles/Expenses.css"; // Wir können die gleichen Styles verwenden

const Incomes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
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

  // Laden der Einnahmen
  useEffect(() => {
    loadIncomes();
  }, [user]);

  // Filtern der Einnahmen, wenn sich der Suchbegriff oder Filter ändert
  useEffect(() => {
    filterIncomes();
  }, [incomes, searchTerm, filters]);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      // Mehr Einnahmen laden, z.B. die letzten 100
      const data = await fetchIncomes(user.id, 100);
      setIncomes(data);

      // Berechne den Gesamtbetrag
      const total = data.reduce(
        (sum, income) => sum + parseFloat(income.amount || 0),
        0
      );
      setTotalAmount(total);

      setError("");
    } catch (error) {
      console.error("Fehler beim Laden der Einnahmen:", error);
      setError("Einnahmen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const filterIncomes = () => {
    let result = [...incomes];

    // Suche nach Begriff
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (income) =>
          income.name.toLowerCase().includes(search) ||
          (income.categories?.name || "").toLowerCase().includes(search)
      );
    }

    // Datum filtern
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter((income) => new Date(income.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Ende des Tages
      result = result.filter((income) => new Date(income.date) <= endDate);
    }

    // Kategorie filtern
    if (filters.category) {
      result = result.filter((income) => income.category === filters.category);
    }

    // Betrag filtern
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      result = result.filter((income) => parseFloat(income.amount) >= min);
    }

    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      result = result.filter((income) => parseFloat(income.amount) <= max);
    }

    setFilteredIncomes(result);
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deleteIncome(id);
      // Neu laden, um den Kontostand korrekt zu aktualisieren
      await loadIncomes();
    } catch (error) {
      console.error("Fehler beim Löschen der Einnahme:", error);
      setError("Einnahme konnte nicht gelöscht werden");
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

  return (
    <div className="page-container">
      <Header title="Alle Einnahmen" />

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
            <span className="summary-value income-amount">
              {formatAmount(totalAmount)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Anzahl</span>
            <span className="summary-value">{filteredIncomes.length}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Liste der Einnahmen */}
        {loading ? (
          <div className="loading-indicator">Wird geladen...</div>
        ) : filteredIncomes.length === 0 ? (
          <div className="empty-state">
            <p>Keine Einnahmen gefunden</p>
            {incomes.length > 0 && searchTerm && (
              <button className="button button-sm" onClick={resetFilters}>
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="transaction-list-container">
            <ul className="transaction-list">
              {filteredIncomes.map((income) => (
                <li key={income.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-name">{income.name}</div>
                    <div className="transaction-category">
                      {income.categories?.name || "Ohne Kategorie"}
                    </div>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-amount income-amount">
                      {formatAmount(income.amount)}
                    </div>
                    <div className="transaction-date">
                      {formatDate(income.date)}
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <button
                      className="action-button edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-income/${income.id}`);
                      }}
                      aria-label="Bearbeiten"
                    >
                      <IoCreateOutline size={18} />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Möchten Sie diese Einnahme wirklich löschen?"
                          )
                        ) {
                          handleDeleteIncome(income.id);
                        }
                      }}
                      aria-label="Löschen"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Hinzufügen-Button */}
      <motion.div
        className="add-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/add-income")}
      >
        <IoAddOutline size={24} />
      </motion.div>
    </div>
  );
};

export default Incomes;
