// src/pages/Categories.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoGridOutline,
} from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../utils/supabaseClient";
import Header from "../components/Header";
import "../styles/categories.css";

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" oder "list"
  const [formData, setFormData] = useState({
    name: "",
    icon: "📊", // Standard-Icon
  });

  // Liste der verfügbaren Icons
  const availableIcons = [
    "📊",
    "🏠",
    "🚗",
    "🍔",
    "🎬",
    "💊",
    "🛍️",
    "💼",
    "💰",
    "📱",
    "🧾",
    "🚌",
    "✈️",
    "🎮",
    "💻",
    "👕",
    "💄",
    "🏋️",
    "🥖",
    "📚",
    "🎨",
    "🍷",
    "☕",
    "🏦",
    "🚙",
    "🎵",
    "🪂",
    "🗑️",
  ];

  // Laden der Kategorien
  useEffect(() => {
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories(user.id);
      setCategories(data);
      setError("");
    } catch (error) {
      console.error("Fehler beim Laden der Kategorien:", error);
      setError("Kategorien konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectIcon = (icon) => {
    setFormData((prev) => ({
      ...prev,
      icon,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "📊",
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingCategory) {
        // Kategorie aktualisieren
        await updateCategory(editingCategory.id, {
          name: formData.name,
          icon: formData.icon,
        });
      } else {
        // Neue Kategorie hinzufügen
        await addCategory(user.id, formData.name, formData.icon);
      }

      await loadCategories();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Fehler beim Speichern der Kategorie:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
    });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Sind Sie sicher, dass Sie diese Kategorie löschen möchten?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error("Fehler beim Löschen der Kategorie:", error);
      setError("Kategorie konnte nicht gelöscht werden");
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return <div className="loading">Wird geladen...</div>;
  }

  // Sortieren der Kategorien nach Name
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="page-container">
      <Header title="Kategorien" />

      <motion.div
        className="content-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {error && <div className="error-message">{error}</div>}

        {/* Optionen und Ansichtsumschalter */}
        {categories.length > 0 && !showAddForm && (
          <div className="view-options">
            <span>{categories.length} Kategorien</span>
            <button
              className={`view-toggle ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid-Ansicht"
            >
              <IoGridOutline size={20} />
            </button>
            <button
              className={`view-toggle ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="Listen-Ansicht"
            >
              <IoGridOutline size={20} style={{ transform: "rotate(90deg)" }} />
            </button>
          </div>
        )}

        {/* Liste der Kategorien */}
        {categories.length === 0 && !showAddForm ? (
          <div className="empty-state">
            <p>Keine Kategorien vorhanden</p>
            <button className="button" onClick={() => setShowAddForm(true)}>
              Erste Kategorie erstellen
            </button>
          </div>
        ) : (
          !showAddForm && (
            <motion.div
              className={`categories-container ${
                viewMode === "grid" ? "grid-view" : "list-view"
              }`}
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
              {sortedCategories.map((category) => (
                <motion.div
                  key={category.id}
                  className="category-card"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="category-icon-container">
                    <span className="category-icon">{category.icon}</span>
                  </div>
                  <div className="category-details">
                    <h3 className="category-name">{category.name}</h3>
                  </div>
                  <div className="category-actions">
                    <button
                      className="action-button edit"
                      onClick={() => handleEdit(category)}
                      aria-label="Bearbeiten"
                    >
                      <IoCreateOutline size={18} />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDelete(category.id)}
                      aria-label="Löschen"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}

        {/* Formular zum Hinzufügen/Bearbeiten */}
        {showAddForm && (
          <motion.form
            className="form category-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="form-title">
              {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}
            </h3>

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="z.B. Lebensmittel"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <div className="selected-icon-preview">
                <div className="icon-preview">{formData.icon}</div>
                <span>Ausgewähltes Icon</span>
              </div>
              <div className="icon-grid">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-button ${
                      formData.icon === icon ? "selected" : ""
                    }`}
                    onClick={() => selectIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
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
                  : editingCategory
                  ? "Aktualisieren"
                  : "Hinzufügen"}
              </button>
              <button
                type="button"
                className="button button-secondary button-block"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                disabled={loading}
              >
                Abbrechen
              </button>
            </div>
          </motion.form>
        )}

        {/* Hinzufügen-Button (nur anzeigen, wenn das Formular nicht angezeigt wird) */}
        {!showAddForm && (
          <motion.div
            className="add-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
          >
            <IoAddOutline size={24} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Categories;
// ende Categories.jsx
