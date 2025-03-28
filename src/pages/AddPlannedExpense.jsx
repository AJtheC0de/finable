// AddPlannedExpense.jsx
// src/pages/AddPlannedExpense.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoCalendarOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { addPlannedExpense } from "../utils/supabaseClient";
import Header from "../components/Header";
import CategorySelect from "../components/CategorySelect";
import "../styles/AddPlannedExpense.css";

const AddPlannedExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Standardmäßig auf ein Datum in der nächsten Woche setzen
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekFormatted = nextWeek.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    dueDate: nextWeekFormatted,
    deductNow: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (!formData.name || !formData.amount || !formData.dueDate) {
        throw new Error("Bitte fülle alle Pflichtfelder aus");
      }

      await addPlannedExpense(
        user.id,
        formData.name,
        parseFloat(formData.amount),
        formData.category || null,
        new Date(formData.dueDate),
        formData.deductNow
      );

      navigate("/planned-expenses");
    } catch (error) {
      console.error("Fehler beim Speichern der geplanten Ausgabe:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header title="Geplante Ausgabe hinzufügen" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form planned-expense-form">
          <div className="form-group">
            <label htmlFor="name">Bezeichnung</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="z.B. Versicherungsbeitrag"
              required
              autoFocus
            />
          </div>

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
            />
          </div>

          <CategorySelect
            value={formData.category}
            onChange={handleCategoryChange}
          />

          <div className="form-group date-picker-group">
            <label htmlFor="dueDate">
              <IoCalendarOutline className="input-icon" /> Fälligkeitsdatum
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="form-control"
              value={formData.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="deductNow"
              name="deductNow"
              checked={formData.deductNow}
              onChange={handleChange}
            />
            <label htmlFor="deductNow" className="checkbox-label">
              <IoCheckmarkCircleOutline className="input-icon" />
              Betrag jetzt vom Kontostand abziehen
            </label>
          </div>

          <div className="form-help">
            <p>
              Wenn diese Option aktiviert ist, wird der Betrag sofort vom
              Kontostand abgezogen. Andernfalls wird er erst beim Markieren als
              erledigt abgezogen.
            </p>
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="button button-block"
              disabled={loading}
            >
              {loading ? "Wird gespeichert..." : "Ausgabe planen"}
            </button>
            <button
              type="button"
              className="button button-secondary button-block"
              onClick={() => navigate("/planned-expenses")}
              disabled={loading}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPlannedExpense;
