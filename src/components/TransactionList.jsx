// src/components/TransactionList.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { deleteExpense } from "../utils/supabaseClient";
import TransactionItem from "./TransactionItem";
import "../styles/TransactionList.css";

const TransactionList = ({ transactions, onTransactionDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (id) => {
    if (!window.confirm("Möchten Sie diese Ausgabe wirklich löschen?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteExpense(id);
      if (onTransactionDelete) {
        onTransactionDelete(id);
      }
    } catch (err) {
      console.error("Fehler beim Löschen der Ausgabe:", err);
      setError("Die Ausgabe konnte nicht gelöscht werden");
    } finally {
      setLoading(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>Keine Transaktionen vorhanden</p>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      {error && <div className="error-message">{error}</div>}

      <motion.div
        className="transaction-list"
        initial="hidden"
        animate="visible"
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
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <TransactionItem
              transaction={transaction}
              onDelete={handleDelete}
            />
          </motion.div>
        ))}
      </motion.div>

      {loading && (
        <div className="loading-indicator-sm">Wird verarbeitet...</div>
      )}
    </div>
  );
};

export default TransactionList;
