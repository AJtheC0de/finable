// src/components/CategorySelect.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchCategories } from "../utils/supabaseClient";
import CustomDropdown from "./CustomDropdown";

const CategorySelect = ({ value, onChange, required = false }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await fetchCategories(user.id);
        setCategories(categoriesData);
        setError("");
      } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
        setError("Kategorien konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [user]);

  // Formatiere Kategorien für den CustomDropdown
  const dropdownOptions = [
    { value: "", label: "Keine Kategorie", icon: "📋" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon || "📊",
    })),
  ];

  return (
    <div className="form-group">
      <label htmlFor="category">Kategorie</label>
      {error && <div className="error-text">{error}</div>}

      {loading ? (
        <div className="loading-indicator-sm">Lädt Kategorien...</div>
      ) : (
        <CustomDropdown
          options={dropdownOptions}
          value={value}
          onChange={onChange}
          placeholder="Kategorie auswählen"
        />
      )}
    </div>
  );
};

export default CategorySelect;
