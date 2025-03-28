// src/hooks/useExpenses.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../utils/supabaseClient";
import { formatDate } from "../utils/formatters";

const useExpenses = (limit = 50, offset = 0) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExpenses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchExpenses(user.id, limit, offset);
      setExpenses(data);
      setError(null);
    } catch (err) {
      console.error("Fehler beim Laden der Ausgaben:", err);
      setError("Ausgaben konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const addNewExpense = async (name, amount, categoryId, date) => {
    if (!user) return;

    try {
      setLoading(true);
      await addExpense(user.id, name, amount, categoryId, date);
      await loadExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Hinzufügen der Ausgabe:", err);
      setError("Ausgabe konnte nicht hinzugefügt werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingExpense = async (id, updates, originalAmount) => {
    try {
      setLoading(true);
      await updateExpense(id, updates, originalAmount);
      await loadExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Ausgabe:", err);
      setError("Ausgabe konnte nicht aktualisiert werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingExpense = async (id) => {
    try {
      setLoading(true);
      await deleteExpense(id);
      await loadExpenses();
      return true;
    } catch (err) {
      console.error("Fehler beim Löschen der Ausgabe:", err);
      setError("Ausgabe konnte nicht gelöscht werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Beim ersten Rendern und bei Änderungen am Auth-Status
  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    addExpense: addNewExpense,
    updateExpense: updateExistingExpense,
    deleteExpense: deleteExistingExpense,
    formatDate,
  };
};

export default useExpenses;
