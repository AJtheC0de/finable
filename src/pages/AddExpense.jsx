// src/pages/AddExpense.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { addExpense } from "../utils/supabaseClient";
import Header from "../components/Header";
import CategorySelect from "../components/CategorySelect"; // Unser neuer benutzerdefinierter Dropdown

const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0], // Heutiges Datum als Standardwert
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.name || !formData.amount) {
        throw new Error("Bitte füllen Sie alle Pflichtfelder aus");
      }

      await addExpense(
        user.id,
        formData.name,
        parseFloat(formData.amount),
        formData.category || null,
        new Date(formData.date)
      );

      navigate("/"); // Zurück zum Dashboard nach erfolgreicher Speicherung
    } catch (error) {
      console.error("Fehler beim Speichern der Ausgabe:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Header title="Neue Ausgabe" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
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
              placeholder="z.B. Lebensmittel"
              required
            />
          </div>

          {/* Hier verwenden wir jetzt unsere benutzerdefinierte CategorySelect-Komponente */}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wird gespeichert..." : "Ausgabe speichern"}
            </button>

            <button
              type="button"
              className="button button-secondary button-block"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpense;
