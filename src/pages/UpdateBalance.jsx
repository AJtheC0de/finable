// src/pages/UpdateBalance.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchBalance, updateBalance } from "../utils/supabaseClient";
import Header from "../components/Header";
import { formatAmount } from "../utils/formatters"; // Importiere die zentrale formatAmount-Funktion

const UpdateBalance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentBalance, setCurrentBalance] = useState(0);
  const [newAmount, setNewAmount] = useState("");
  const [isDeposit, setIsDeposit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Laden des aktuellen Kontostands
  useEffect(() => {
    const loadBalance = async () => {
      try {
        setIsLoading(true);
        const balance = await fetchBalance(user.id);
        setCurrentBalance(balance?.amount || 0);
      } catch (error) {
        console.error("Fehler beim Laden des Kontostands:", error);
        setError("Kontostand konnte nicht geladen werden");
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();
  }, [user]);

  // Die lokale Formatierungsfunktion wurde entfernt und durch die importierte formatAmount-Funktion ersetzt

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !newAmount ||
      isNaN(parseFloat(newAmount)) ||
      parseFloat(newAmount) <= 0
    ) {
      setError("Bitte geben Sie einen gültigen Betrag ein");
      return;
    }

    try {
      setIsLoading(true);

      const amountValue = parseFloat(newAmount);
      let newBalance;

      if (isDeposit) {
        // Einzahlung hinzufügen
        newBalance = currentBalance + amountValue;
      } else {
        // Auszahlung abziehen
        if (amountValue > currentBalance) {
          setError(
            "Der Auszahlungsbetrag kann nicht höher sein als der aktuelle Kontostand"
          );
          setIsLoading(false);
          return;
        }
        newBalance = currentBalance - amountValue;
      }

      await updateBalance(user.id, newBalance);
      navigate("/");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Kontostands:", error);
      setError("Kontostand konnte nicht aktualisiert werden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header title="Kontostand aktualisieren" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading && <div className="loading-indicator">Wird geladen...</div>}

        {!isLoading && (
          <>
            <div className="current-balance-info">
              <h3>Aktueller Kontostand</h3>
              <div className="current-balance">
                {formatAmount(currentBalance)}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group balance-type-selector">
                <div className="toggle-container">
                  <div
                    className={`toggle-option ${isDeposit ? "active" : ""}`}
                    onClick={() => setIsDeposit(true)}
                  >
                    Einzahlung
                  </div>
                  <div
                    className={`toggle-option ${!isDeposit ? "active" : ""}`}
                    onClick={() => setIsDeposit(false)}
                  >
                    Auszahlung
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Betrag (CHF)</label>
                <input
                  type="number"
                  id="amount"
                  className="form-control"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                />
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="button button-block"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Wird aktualisiert..."
                    : isDeposit
                    ? "Einzahlen"
                    : "Auszahlen"}
                </button>
                <button
                  type="button"
                  className="button button-secondary button-block"
                  onClick={() => navigate("/")}
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UpdateBalance;
