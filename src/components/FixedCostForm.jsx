// src/components/FixedCostForm.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { addFixedCost, updateFixedCost } from "../utils/supabaseClient";
import CategorySelect from "./CategorySelect";
import "../styles/CustomDropdown.css";

const FixedCostForm = ({ existingCost, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    isRecurring: true,
  });

  useEffect(() => {
    // Wenn wir einen existierenden Eintrag bearbeiten, setzen wir die Formulardaten
    if (existingCost) {
      setFormData({
        name: existingCost.name || "",
        amount: existingCost.amount || "",
        category: existingCost.category || "",
        isRecurring:
          existingCost.is_recurring !== undefined
            ? existingCost.is_recurring
            : true,
      });
    }
  }, [existingCost]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

      if (existingCost) {
        // Aktualisieren eines bestehenden Eintrags
        await updateFixedCost(existingCost.id, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: formData.category || null,
          is_recurring: formData.isRecurring,
        });
      } else {
        // Hinzufügen eines neuen Eintrags
        await addFixedCost(
          user.id,
          formData.name,
          parseFloat(formData.amount),
          formData.category || null,
          formData.isRecurring
        );
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Fehler beim Speichern der Fixkosten:", error);
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
        {existingCost ? "Fixkosten bearbeiten" : "Neue Fixkosten"}
      </h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Bezeichnung</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          placeholder="z.B. Miete, Strom, Internet"
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Betrag (CHF)</label>
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
        />
      </div>

      <CategorySelect
        value={formData.category}
        onChange={handleCategoryChange}
      />

      <div className="form-group">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
          />
          <label htmlFor="isRecurring">Wiederkehrende Kosten</label>
        </div>
      </div>

      <div className="button-group">
        <button
          type="submit"
          className="button button-block"
          disabled={loading}
        >
          {loading
            ? "Wird gespeichert..."
            : existingCost
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

export default FixedCostForm;
