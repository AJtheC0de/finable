// ExpenseForm.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { addExpense, updateExpense } from "../utils/supabaseClient";
import CategorySelect from "./CategorySelect";

const ExpenseForm = ({ existingExpense, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    // Wenn wir einen existierenden Eintrag bearbeiten, setzen wir die Formulardaten
    if (existingExpense) {
      setFormData({
        name: existingExpense.name,
        amount: existingExpense.amount,
        category: existingExpense.category,
        date: new Date(existingExpense.date).toISOString().split("T")[0],
      });
    }
  }, [existingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.name || !formData.amount) {
        throw new Error("Bitte füllen Sie alle Pflichtfelder aus");
      }

      if (existingExpense) {
        // Aktualisieren einer bestehenden Ausgabe
        await updateExpense(
          existingExpense.id,
          {
            name: formData.name,
            amount: parseFloat(formData.amount),
            category: formData.category || null,
            date: new Date(formData.date).toISOString(),
          },
          existingExpense.amount // Originalbetrag für Bilanzkorrekturen
        );
      } else {
        // Hinzufügen einer neuen Ausgabe
        await addExpense(
          user.id,
          formData.name,
          parseFloat(formData.amount),
          formData.category || null,
          new Date(formData.date)
        );
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Fehler beim Speichern der Ausgabe:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="form-title">
        {existingExpense ? "Ausgabe bearbeiten" : "Neue Ausgabe"}
      </h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="amount">Betrag (€)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          className="form-control"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Bezeichnung</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          placeholder="z.B. Einkauf Supermarkt"
          required
        />
      </div>

      <CategorySelect
        value={formData.category}
        onChange={handleCategoryChange}
      />

      <div className="form-group">
        <label htmlFor="date">Datum</label>
        <input
          type="date"
          id="date"
          name="date"
          className="form-control"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="button-group">
        <button
          type="submit"
          className="button button-block"
          disabled={loading}
        >
          {loading
            ? "Wird gespeichert..."
            : existingExpense
            ? "Aktualisieren"
            : "Hinzufügen"}
        </button>
        <button
          type="button"
          className="button button-secondary button-block"
          onClick={onCancel}
          disabled={loading}
        >
          Abbrechen
        </button>
      </div>
    </motion.form>
  );
};

export default ExpenseForm;
//  ExpenseForm.jsx
