// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoAddOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
} from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import {
  signOut,
  fetchBalance,
  fetchExpenses,
  fetchIncomes,
  fetchFixedCosts,
  fetchPlannedExpenses,
} from "../utils/supabaseClient";
import TransactionList from "../components/TransactionList";
import AddActionModal from "../components/AddActionModal";
import { formatAmount, formatDate } from "../utils/formatters";
// Import des Logos
import finableLogo from "../assets/images/finable.svg";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [combinedTransactions, setCombinedTransactions] = useState([]);
  const [plannedExpenses, setPlannedExpenses] = useState([]);
  const [fixedCosts, setFixedCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlannedExpenses, setShowPlannedExpenses] = useState(false);

  // Diese useEffect lädt Daten jedes Mal neu, wenn das Dashboard angezeigt wird
  useEffect(() => {
    loadData();
  }, [user, location]); // location wurde hinzugefügt, um bei Routenwechseln neu zu laden

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Dashboard: Lade Daten neu...");

      // Kontostand laden
      const balanceData = await fetchBalance(user.id);
      setBalance(balanceData?.amount || 0);

      // Letzte Transaktionen laden
      const expensesData = await fetchExpenses(user.id, 10);
      setTransactions(expensesData || []);

      // Einnahmen laden
      const incomesData = await fetchIncomes(user.id, 10); // Lade die letzten 10 Einnahmen
      setIncomes(incomesData || []);

      // Kombiniere und sortiere Ausgaben und Einnahmen nach Datum
      const combined = [
        ...expensesData.map((expense) => ({
          ...expense,
          transactionType: "expense",
          displayAmount: `-${formatAmount(expense.amount)}`,
        })),
        ...incomesData.map((income) => ({
          ...income,
          transactionType: "income",
          displayAmount: `+${formatAmount(income.amount)}`,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); // Sortiere nach Datum und nimm die 5 neuesten

      setCombinedTransactions(combined);

      // Fixkosten laden (falls im Dashboard angezeigt)
      const fixedCostsData = await fetchFixedCosts(user.id);
      setFixedCosts(fixedCostsData || []);

      // Geplante Ausgaben laden
      const plannedExpensesData = await fetchPlannedExpenses(user.id);
      // Sortiere nach Fälligkeitsdatum und nimm die nächsten 3
      const sortedPlannedExpenses = (plannedExpensesData || [])
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 3);
      setPlannedExpenses(sortedPlannedExpenses);

      setError(null);
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      setError("Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
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

  const handleLogout = async () => {
    try {
      await signOut();
      // Nach dem Abmelden zum Login-Bildschirm umleiten
      navigate("/login");
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
      // Selbst bei einem Fehler zum Login-Bildschirm umleiten
      // Das verbessert die UX, damit Benutzer nicht stecken bleiben
      navigate("/login");
    }
  };

  if (loading && transactions.length === 0 && plannedExpenses.length === 0) {
    return <div className="loading">Wird geladen...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={finableLogo} alt="finable Logo" className="header-logo" />
          <h1>finable</h1>
        </div>
        <div className="header-actions">
          <button
            className="menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            <IoMenuOutline size={24} />
          </button>
        </div>

        {showMenu && (
          <motion.div
            className="menu-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ul>
              <li onClick={() => navigate("/categories")}>Kategorien</li>
              <li onClick={() => navigate("/fixed-costs")}>Fixkosten</li>
              <li onClick={() => navigate("/expenses")}>Alle Ausgaben</li>
              <li onClick={() => navigate("/incomes")}>Alle Einnahmen</li>
              <li onClick={() => navigate("/planned-expenses")}>
                Geplante Ausgaben
              </li>
              <li onClick={handleLogout}>
                <IoLogOutOutline /> Abmelden
              </li>
            </ul>
          </motion.div>
        )}
      </header>

      <motion.div
        className="balance-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>Guthaben</h2>
        <div className="balance-amount">{formatAmount(balance)}</div>
        <button
          className="update-balance-button"
          onClick={() => navigate("/update-balance")}
        >
          Aktualisieren
        </button>
      </motion.div>

      <div className="transactions-section">
        <div className="section-header">
          <h3 className="section-title">Letzte Transaktionen</h3>
          <div>
            <button
              className="view-all-button"
              onClick={() => navigate("/expenses")}
              style={{ marginRight: "10px" }}
            >
              Ausgaben
            </button>
            <button
              className="view-all-button"
              onClick={() => navigate("/incomes")}
            >
              Einnahmen
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {combinedTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Keine Transaktionen vorhanden</p>
            <button
              className="button button-sm"
              onClick={() => setShowAddModal(true)}
            >
              Erste Transaktion hinzufügen
            </button>
          </div>
        ) : (
          <ul className="transaction-list">
            {combinedTransactions.map((transaction) => (
              <li
                key={`${transaction.transactionType}-${transaction.id}`}
                className="transaction-item"
                onClick={() =>
                  navigate(`/${transaction.transactionType}s/${transaction.id}`)
                }
              >
                <div className="transaction-info">
                  <div className="transaction-name">{transaction.name}</div>
                  <div className="transaction-category">
                    {transaction.categories?.name || "Ohne Kategorie"}
                  </div>
                </div>
                <div className="transaction-details">
                  <div
                    className={`transaction-amount ${
                      transaction.transactionType === "income"
                        ? "income-amount"
                        : "expense-amount"
                    }`}
                  >
                    {transaction.displayAmount}
                  </div>
                  <div className="transaction-date">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bereich für geplante Ausgaben */}
      {plannedExpenses.length > 0 && (
        <div className="planned-expenses-section">
          <div
            className="collapsible-header"
            onClick={() => setShowPlannedExpenses(!showPlannedExpenses)}
          >
            <div className="section-title-with-icon">
              <IoCalendarOutline className="section-icon" />
              <h3 className="section-title">Nächste geplante Ausgaben</h3>
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
                {plannedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`planned-expense-card ${getStatusClass(
                      expense.due_date
                    )}`}
                    onClick={() => navigate("/planned-expenses")}
                  >
                    <div className="planned-expense-content">
                      <div className="planned-expense-name">{expense.name}</div>
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
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hinzufügen-Button - aktualisiert, um das Modal zu öffnen */}
      <motion.div
        className="add-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
      >
        <IoAddOutline size={24} />
      </motion.div>

      {/* Modal für Ausgabe/Einnahme hinzufügen */}
      {showAddModal && (
        <AddActionModal
          onClose={() => setShowAddModal(false)}
          onSelectExpense={() => {
            setShowAddModal(false);
            navigate("/add-expense");
          }}
          onSelectIncome={() => {
            setShowAddModal(false);
            navigate("/add-income");
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
