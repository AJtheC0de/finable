// src/hooks/usePlannedExpenses.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchPlannedExpenses,
  addPlannedExpense,
  updatePlannedExpense,
  deletePlannedExpense,
  completeExpense,
} from "../utils/supabaseClient";
import { formatAmount, formatDate } from "../utils/formatters";

const usePlannedExpenses = () => {
  const { user } = useAuth();
  const [plannedExpenses, setPlannedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlannedExpenses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchPlannedExpenses(user.id);
      setPlannedExpenses(data);
      setError(null);
    } catch (err) {
      console.error("Fehler beim Laden der geplanten Ausgaben:", err);
      setError("Geplante Ausgaben konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const addNewPlannedExpense = async (
    name,
    amount,
    categoryId,
    dueDate,
    deductNow
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      await addPlannedExpense(
        user.id,
        name,
        amount,
        categoryId,
        dueDate,
        deductNow
      );
      await loadPlannedExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Hinzufügen der geplanten Ausgabe:", err);
      setError("Geplante Ausgabe konnte nicht hinzugefügt werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingPlannedExpense = async (id, updates) => {
    try {
      setLoading(true);
      await updatePlannedExpense(id, updates);
      await loadPlannedExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Aktualisieren der geplanten Ausgabe:", err);
      setError("Geplante Ausgabe konnte nicht aktualisiert werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingPlannedExpense = async (id) => {
    try {
      setLoading(true);
      await deletePlannedExpense(id);
      await loadPlannedExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Löschen der geplanten Ausgabe:", err);
      setError("Geplante Ausgabe konnte nicht gelöscht werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completePlannedExpense = async (id) => {
    try {
      setLoading(true);
      await completeExpense(id);
      await loadPlannedExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Abschließen der geplanten Ausgabe:", err);
      setError("Geplante Ausgabe konnte nicht abgeschlossen werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Beim ersten Rendern und bei Änderungen am Auth-Status
  useEffect(() => {
    if (user) {
      loadPlannedExpenses();
    }
  }, [user]);

  return {
    plannedExpenses,
    loading,
    error,
    loadPlannedExpenses,
    addPlannedExpense: addNewPlannedExpense,
    updatePlannedExpense: updateExistingPlannedExpense,
    deletePlannedExpense: deleteExistingPlannedExpense,
    completePlannedExpense,
    formatAmount,
    formatDate,
  };
};

export default usePlannedExpenses;
