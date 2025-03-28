// src/hooks/useFixedCosts.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchFixedCosts,
  addFixedCost,
  updateFixedCost,
  deleteFixedCost,
} from "../utils/supabaseClient";
import { formatAmount } from "../utils/formatters";

const useFixedCosts = () => {
  const { user } = useAuth();
  const [fixedCosts, setFixedCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFixedCosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchFixedCosts(user.id);
      setFixedCosts(data);
      setError(null);
    } catch (err) {
      console.error("Fehler beim Laden der Fixkosten:", err);
      setError("Fixkosten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const addNewFixedCost = async (name, amount, categoryId, isRecurring) => {
    if (!user) return;

    try {
      setLoading(true);
      await addFixedCost(user.id, name, amount, categoryId, isRecurring);
      await loadFixedCosts();
      return true;
    } catch (err) {
      console.error("Fehler beim Hinzufügen der Fixkosten:", err);
      setError("Fixkosten konnten nicht hinzugefügt werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingFixedCost = async (id, updates) => {
    try {
      setLoading(true);
      await updateFixedCost(id, updates);
      await loadFixedCosts();
      return true;
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Fixkosten:", err);
      setError("Fixkosten konnten nicht aktualisiert werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingFixedCost = async (id) => {
    try {
      setLoading(true);
      await deleteFixedCost(id);
      await loadFixedCosts();
      return true;
    } catch (err) {
      console.error("Fehler beim Löschen der Fixkosten:", err);
      setError("Fixkosten konnten nicht gelöscht werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Beim ersten Rendern und bei Änderungen am Auth-Status
  useEffect(() => {
    if (user) {
      loadFixedCosts();
    }
  }, [user]);

  return {
    fixedCosts,
    loading,
    error,
    loadFixedCosts,
    addFixedCost: addNewFixedCost,
    updateFixedCost: updateExistingFixedCost,
    deleteFixedCost: deleteExistingFixedCost,
    formatAmount,
  };
};

export default useFixedCosts;
