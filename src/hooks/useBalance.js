// src/hooks/useBalance.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchBalance,
  updateBalance as updateBalanceApi,
} from "../utils/supabaseClient";
import { formatAmount } from "../utils/formatters";

const useBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBalance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchBalance(user.id);
      setBalance(data?.amount || 0);
      setError(null);
    } catch (err) {
      console.error("Fehler beim Laden des Kontostands:", err);
      setError("Kontostand konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (newAmount) => {
    if (!user) return;

    try {
      setLoading(true);
      await updateBalanceApi(user.id, newAmount);
      setBalance(newAmount);
      setError(null);
      return true;
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Kontostands:", err);
      setError("Kontostand konnte nicht aktualisiert werden");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Beim ersten Rendern und bei Änderungen am Auth-Status
  useEffect(() => {
    if (user) {
      loadBalance();
    }
  }, [user]);

  return {
    balance,
    loading,
    error,
    loadBalance,
    updateBalance: updateUserBalance,
    formatAmount,
  };
};

export default useBalance;
