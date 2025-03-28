// src/pages/PlannedExpenses.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCalendarOutline,
  IoHomeOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchPlannedExpenses,
  deletePlannedExpense,
  completeExpense,
} from "../utils/supabaseClient";
import Header from "../components/Header";
import "../styles/PlannedExpenses.css";

const PlannedExpenses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plannedExpenses, setPlannedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Laden der geplanten Ausgaben
  useEffect(() => {
    loadPlannedExpenses();
  }, [user]);

  const loadPlannedExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchPlannedExpenses(user.id);

      // Sortiere nach Fälligkeitsdatum (nächste zuerst)
      const sortedData = [...data].sort(
        (a, b) => new Date(a.due_date) - new Date(b.due_date)
      );

      setPlannedExpenses(sortedData);

      // Berechne den Gesamtbetrag
      const total = data.reduce(
        (sum, expense) => sum + parseFloat(expense.amount || 0),
        0
      );
      setTotalAmount(total);

      setError("");
    } catch (error) {
      console.error("Fehler beim Laden der geplanten Ausgaben:", error);
      setError("Geplante Ausgaben konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedExpenseId(id);
    setConfirmAction("delete");
    setShowConfirmDialog(true);
  };

  const handleComplete = (id) => {
    setSelectedExpenseId(id);
    setConfirmAction("complete");
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);

      if (confirmAction === "delete") {
        await deletePlannedExpense(selectedExpenseId);
      } else if (confirmAction === "complete") {
        await completeExpense(selectedExpenseId);
      }

      await loadPlannedExpenses();
      setShowConfirmDialog(false);
      setSelectedExpenseId(null);
    } catch (error) {
      console.error("Fehler bei der Aktion:", error);
      setError(`Die Aktion konnte nicht durchgeführt werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Formatieren des Betrags mit deutschem Format
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Formatieren des Datums (TT.MM.JJJJ)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}.${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${date.getFullYear()}`;
  };

  // Berechne Tage bis zur Fälligkeit
  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Status-Klasse basierend auf Fälligkeitsdatum
  const getStatusClass = (dueDate) => {
    const daysUntilDue = getDaysUntilDue(dueDate);

    if (daysUntilDue < 0) return "status-overdue"; // überfällig
    if (daysUntilDue <= 3) return "status-warning"; // wird bald fällig
    return ""; // noch genug Zeit
  };

  // Text für die verbleibenden Tage
  const getRemainingDaysText = (dueDate) => {
    const days = getDaysUntilDue(dueDate);

    if (days < 0) return `${Math.abs(days)} Tage überfällig`;
    if (days === 0) return "Heute fällig";
    if (days === 1) return "Morgen fällig";
    return `In ${days} Tagen fällig`;
  };

  return (
    <div className="page-container">
      <Header title="Geplante Ausgaben" />

      {/* Home-Button unter dem Header hinzufügen */}
      <div className="navigation-actions">
        <button className="home-button" onClick={() => navigate("/")}>
          <IoHomeOutline /> Zurück zum Dashboard
        </button>
      </div>

      <motion.div
        className="content-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Zusammenfassung */}
        <div className="planned-expenses-summary">
          <div className="summary-header">
            <h3>Geplante Ausgaben</h3>
            <span className="summary-total">{formatAmount(totalAmount)}</span>
          </div>
          <div className="summary-details">
            <div className="summary-item">
              <IoCalendarOutline className="summary-icon" />
              <span>{plannedExpenses.length} geplante Ausgaben</span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Liste der geplanten Ausgaben */}
        {loading ? (
          <div className="loading-indicator">Wird geladen...</div>
        ) : plannedExpenses.length === 0 ? (
          <div className="empty-state">
            <p>Keine geplanten Ausgaben vorhanden</p>
            <button
              className="button"
              onClick={() => navigate("/add-planned-expense")}
            >
              Erste geplante Ausgabe hinzufügen
            </button>
          </div>
        ) : (
          <ul className="planned-expenses-list">
            {plannedExpenses.map((expense) => (
              <motion.li
                key={expense.id}
                className={`planned-expense-item ${getStatusClass(
                  expense.due_date
                )}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="expense-main-content">
                  <div className="expense-details">
                    <div className="expense-name">
                      {expense.name}
                      {expense.deduct_now && (
                        <span className="deducted-badge">Abgezogen</span>
                      )}
                    </div>
                    <div className="expense-category">
                      {expense.categories?.icon || "📋"}{" "}
                      {expense.categories?.name || "Keine Kategorie"}
                    </div>
                  </div>
                  <div className="expense-amount-date">
                    <div className="expense-amount">
                      {formatAmount(expense.amount)}
                    </div>
                    <div className="expense-due-date">
                      Fällig am: {formatDate(expense.due_date)}
                    </div>
                    <div
                      className={`expense-countdown ${
                        getDaysUntilDue(expense.due_date) < 0
                          ? "days-past"
                          : getDaysUntilDue(expense.due_date) === 0
                          ? "days-today"
                          : "days-future"
                      }`}
                    >
                      {getRemainingDaysText(expense.due_date)}
                    </div>
                  </div>
                </div>
                <div className="expense-actions">
                  <button
                    className="action-button complete"
                    onClick={() => handleComplete(expense.id)}
                    title="Als erledigt markieren"
                  >
                    <IoCheckmarkCircleOutline size={20} />
                  </button>
                  <button
                    className="action-button edit"
                    onClick={() =>
                      navigate(`/edit-planned-expense/${expense.id}`)
                    }
                    title="Bearbeiten"
                  >
                    <IoCreateOutline size={20} />
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDelete(expense.id)}
                    title="Löschen"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Verbesserter Bestätigungsdialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div
            className={`confirm-dialog ${
              confirmAction === "delete" ? "delete" : "complete"
            }`}
          >
            <h3>
              {confirmAction === "delete"
                ? "Geplante Ausgabe löschen?"
                : "Ausgabe als erledigt markieren?"}
            </h3>
            <p>
              {confirmAction === "delete"
                ? "Dies kann nicht rückgängig gemacht werden."
                : "Die geplante Ausgabe wird als Ausgabe erfasst und vom Kontostand abgezogen (falls nicht bereits geschehen)."}
            </p>
            <div className="confirm-buttons">
              <button
                className="button-secondary"
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
              >
                Abbrechen
              </button>
              <button
                className={`button ${
                  confirmAction === "delete" ? "delete" : ""
                }`}
                onClick={handleConfirmAction}
                disabled={loading}
              >
                {loading
                  ? "Wird bearbeitet..."
                  : confirmAction === "delete"
                  ? "Löschen"
                  : "Als erledigt markieren"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hinzufügen-Button */}
      <motion.div
        className="add-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/add-planned-expense")}
      >
        <IoAddOutline size={24} />
      </motion.div>
    </div>
  );
};

export default PlannedExpenses;
