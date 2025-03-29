// src/pages/AddFixedCostFromPlanned.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  addFixedCost,
  fetchPlannedExpense,
  deletePlannedExpense,
} from "../utils/supabaseClient";
import Header from "../components/Header";
import CategorySelect from "../components/CategorySelect";

const AddFixedCostFromPlanned = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plannedExpense, setPlannedExpense] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    isRecurring: true,
    removePlannedExpense: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Lade die geplante Ausgabe beim ersten Render
  useEffect(() => {
    const loadPlannedExpense = async () => {
      try {
        setLoading(true);
        // Diese Funktion muss in supabaseClient.js hinzugefügt werden
        const expense = await fetchPlannedExpense(id);

        if (!expense) {
          throw new Error("Geplante Ausgabe konnte nicht gefunden werden");
        }

        setPlannedExpense(expense);
        setFormData({
          name: expense.name || "",
          amount: expense.amount || "",
          category: expense.category || "",
          isRecurring: true,
          removePlannedExpense: false,
        });

        setError("");
      } catch (error) {
        console.error("Fehler beim Laden der geplanten Ausgabe:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPlannedExpense();
    }
  }, [id]);

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
    setSubmitting(true);
    setError("");

    try {
      if (!formData.name || !formData.amount) {
        throw new Error("Bitte füllen Sie alle Pflichtfelder aus");
      }

      // Fixkosten hinzufügen
      await addFixedCost(
        user.id,
        formData.name,
        parseFloat(formData.amount),
        formData.category || null,
        formData.isRecurring
      );

      // Optional: Geplante Ausgabe löschen wenn gewünscht
      if (formData.removePlannedExpense) {
        await deletePlannedExpense(id);
      }

      navigate("/fixed-costs");
    } catch (error) {
      console.error("Fehler beim Speichern der Fixkosten:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Wird geladen...</div>;
  }

  return (
    <div className="page-container">
      <Header title="Fixkosten aus geplanter Ausgabe" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
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

          <div className="form-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="removePlannedExpense"
                name="removePlannedExpense"
                checked={formData.removePlannedExpense}
                onChange={handleChange}
              />
              <label htmlFor="removePlannedExpense">
                Geplante Ausgabe nach der Konvertierung entfernen
              </label>
            </div>
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="button button-block"
              disabled={submitting}
            >
              {submitting ? "Wird gespeichert..." : "Als Fixkosten speichern"}
            </button>
            <button
              type="button"
              className="button button-secondary button-block"
              onClick={() => navigate("/fixed-costs")}
              disabled={submitting}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddFixedCostFromPlanned;
