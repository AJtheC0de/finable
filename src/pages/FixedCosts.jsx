// src/pages/FixedCosts.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoRepeatOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchFixedCosts,
  deleteFixedCost,
  supabase,
  fetchPlannedExpenses,
} from "../utils/supabaseClient";
import Header from "../components/Header";
import FixedCostForm from "../components/FixedCostForm";
import "../styles/fixcosts.css";

const FixedCosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fixedCosts, setFixedCosts] = useState([]);
  const [plannedExpenses, setPlannedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [showPlannedExpenses, setShowPlannedExpenses] = useState(false);

  // Laden der Fixkosten
  useEffect(() => {
    // Abonnieren der Änderungen an der fixed_costs-Tabelle
    const fixedCostsSubscription = supabase
      .channel("fixed_costs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fixed_costs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Änderung erkannt:", payload);
          // Bei jeder Änderung die Daten neu laden
          loadFixedCosts();
        }
      )
      .subscribe();

    // Initiale Daten laden
    loadFixedCosts();
    loadPlannedExpenses();

    // Aufräumen beim Unmount
    return () => {
      supabase.removeChannel(fixedCostsSubscription);
    };
  }, [user]);

  const loadFixedCosts = async () => {
    try {
      setLoading(true);
      const data = await fetchFixedCosts(user.id);
      console.log("Geladene Fixkosten:", data);
      setFixedCosts(data);
      setError("");
    } catch (error) {
      console.error("Fehler beim Laden der Fixkosten:", error);
      setError("Fixkosten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const loadPlannedExpenses = async () => {
    try {
      const data = await fetchPlannedExpenses(user.id);
      // Sortiere nach Fälligkeitsdatum (nächste zuerst)
      const sortedData = [...data].sort(
        (a, b) => new Date(a.due_date) - new Date(b.due_date)
      );
      setPlannedExpenses(sortedData);
    } catch (error) {
      console.error("Fehler beim Laden der geplanten Ausgaben:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCost(null);
  };

  const handleFormSuccess = () => {
    loadFixedCosts();
    handleFormClose();
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Sind Sie sicher, dass Sie diese Fixkosten löschen möchten?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Versuche zuerst die RPC-Funktion
      try {
        const { error: rpcError } = await supabase.rpc("delete_fixed_cost", {
          cost_id: id,
        });

        if (rpcError) {
          throw rpcError;
        }
      } catch (rpcError) {
        // Fallback zur Standard-Löschmethode
        console.log("RPC-Methode nicht verfügbar, nutze Standard-Löschmethode");
        await deleteFixedCost(id);
      }

      // Lokalen State aktualisieren
      setFixedCosts((prevCosts) => prevCosts.filter((cost) => cost.id !== id));

      setTimeout(() => {
        loadFixedCosts();
      }, 500);
    } catch (error) {
      console.error("Fehler beim Löschen der Fixkosten:", error);
      setError(`Fixkosten konnten nicht gelöscht werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Berechne das gesamte monatliche Volumen der Fixkosten
  const totalFixedCosts = fixedCosts.reduce(
    (total, cost) => total + parseFloat(cost.amount || 0),
    0
  );

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

  // Text für die verbleibenden Tage
  const getRemainingDaysText = (dueDate) => {
    const days = getDaysUntilDue(dueDate);

    if (days < 0) return `${Math.abs(days)} Tage überfällig`;
    if (days === 0) return "Heute fällig";
    if (days === 1) return "Morgen fällig";
    return `In ${days} Tagen fällig`;
  };

  // Status-Klasse basierend auf Fälligkeitsdatum
  const getStatusClass = (dueDate) => {
    const daysUntilDue = getDaysUntilDue(dueDate);

    if (daysUntilDue < 0) return "status-overdue"; // überfällig
    if (daysUntilDue <= 3) return "status-warning"; // wird bald fällig
    return ""; // noch genug Zeit
  };

  // Handler für das Hinzufügen einer geplanten Ausgabe zu den Fixkosten
  const handleAddPlannedToFixed = (plannedExpense) => {
    navigate(`/add-fixed-cost-from-planned/${plannedExpense.id}`);
  };

  // Formatieren des Betrags mit deutschem Format
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
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

  // Gruppieren nach Kategorien für die Visualisierung
  const groupedByCategoryMap = fixedCosts.reduce((groups, cost) => {
    const categoryName = cost.categories?.name || "Ohne Kategorie";
    if (!groups[categoryName]) {
      groups[categoryName] = {
        name: categoryName,
        icon: cost.categories?.icon || "📊",
        total: 0,
        items: [],
      };
    }
    groups[categoryName].total += parseFloat(cost.amount || 0);
    groups[categoryName].items.push(cost);
    return groups;
  }, {});

  const groupedByCategory = Object.values(groupedByCategoryMap).sort(
    (a, b) => b.total - a.total
  );

  if (loading && fixedCosts.length === 0) {
    return <div className="loading">Wird geladen...</div>;
  }

  return (
    <div className="page-container">
      <Header title="Fixkosten" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {error && <div className="error-message">{error}</div>}

        {/* Zusammenfassung der Fixkosten */}
        {fixedCosts.length > 0 && (
          <motion.div
            className="fixed-costs-summary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="summary-header">
              <h3>Monatliche Fixkosten</h3>
              <span className="summary-total">
                {formatAmount(totalFixedCosts)}
              </span>
            </div>

            {/* Kategorien-Übersicht */}
            <div className="category-overview">
              {groupedByCategory.map((category, index) => (
                <div
                  key={category.name}
                  className="category-bar-container"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="category-info">
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                    <span className="category-amount">
                      {formatAmount(category.total)}
                    </span>
                  </div>
                  <div className="category-bar-background">
                    <div
                      className="category-bar"
                      style={{
                        width: `${(category.total / totalFixedCosts) * 100}%`,
                        backgroundColor: `hsl(${160 + index * 40}, 80%, 45%)`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bereich für geplante Ausgaben, die zu Fixkosten hinzugefügt werden können */}
        {plannedExpenses.length > 0 && !showForm && (
          <div className="planned-expenses-section">
            <div
              className="collapsible-header"
              onClick={() => setShowPlannedExpenses(!showPlannedExpenses)}
            >
              <div className="section-title-with-icon">
                <IoCalendarOutline className="section-icon" />
                <h3 className="section-title">Geplante Ausgaben</h3>
              </div>
              <div className="collapse-actions">
                <button
                  className="view-all-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Verhindert, dass das Klicken auf "Alle anzeigen" das Panel öffnet/schließt
                    navigate("/planned-expenses");
                  }}
                >
                  Alle anzeigen
                </button>
                {showPlannedExpenses ? (
                  <IoChevronUpOutline className="collapse-icon" />
                ) : (
                  <IoChevronDownOutline className="collapse-icon" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {showPlannedExpenses && (
                <motion.div
                  className="planned-expenses-preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {plannedExpenses.slice(0, 3).map((expense) => (
                    <div
                      key={expense.id}
                      className={`planned-expense-card ${getStatusClass(
                        expense.due_date
                      )}`}
                    >
                      <div className="planned-expense-info">
                        <div className="planned-expense-content">
                          <div className="planned-expense-name">
                            {expense.name}
                          </div>
                          <div className="planned-expense-amount">
                            {formatAmount(expense.amount)}
                          </div>
                        </div>
                        <div className="planned-expense-footer">
                          <div className="planned-expense-date">
                            {formatDate(expense.due_date)}
                          </div>
                          <div
                            className={`planned-expense-countdown ${
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
                          className="action-button add-to-fixed"
                          onClick={() => handleAddPlannedToFixed(expense)}
                          title="Zu Fixkosten hinzufügen"
                        >
                          <IoAddOutline size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Liste der Fixkosten */}
        {fixedCosts.length === 0 && !showForm ? (
          <div className="empty-state">
            <p>Keine Fixkosten vorhanden</p>
            <button className="button" onClick={() => setShowForm(true)}>
              Erste Fixkosten hinzufügen
            </button>
          </div>
        ) : (
          !showForm && (
            <motion.div
              className="fixed-costs-container"
              initial="hidden"
              animate="visible"
            >
              <div className="section-header">
                <h3 className="section-title">Alle Fixkosten</h3>
              </div>

              <motion.div
                className="fixed-costs-grid"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {fixedCosts.map((cost) => (
                  <motion.div
                    key={cost.id}
                    className="fixed-cost-card"
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                  >
                    <div className="card-header">
                      <div className="card-category">
                        {cost.categories?.icon || "📊"}{" "}
                        {cost.categories?.name || "Ohne Kategorie"}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-button edit"
                          onClick={() => handleEdit(cost)}
                          aria-label="Bearbeiten"
                        >
                          <IoCreateOutline size={16} />
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDelete(cost.id)}
                          aria-label="Löschen"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="card-content">
                      <h4 className="cost-name">{cost.name}</h4>
                      <div className="cost-amount">
                        {formatAmount(cost.amount)}
                      </div>
                    </div>

                    {cost.is_recurring && (
                      <div className="recurring-badge">
                        <IoRepeatOutline size={14} />
                        <span>Wiederkehrend</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )
        )}

        {/* Formular zum Hinzufügen/Bearbeiten */}
        {showForm && (
          <FixedCostForm
            existingCost={editingCost}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        )}

        {/* Hinzufügen-Button (nur anzeigen, wenn das Formular nicht angezeigt wird) */}
        {!showForm && (
          <motion.div
            className="add-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
          >
            <IoAddOutline size={24} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FixedCosts;
