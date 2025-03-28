// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Ersetzen Sie diese Werte mit Ihren eigenen Supabase-Anmeldedaten
const supabaseUrl = "https://qntqzmrsaftizalyshnq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudHF6bXJzYWZ0aXphbHlzaG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjMzMDYsImV4cCI6MjA1ODU5OTMwNn0.JzcsaVkE4ZsYoulHtSJ60crjOkYeMpVRLQXkfkbh7hU";

// Erstellen eines Supabase-Clients
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ----- Authentifizierungs-Funktionen -----

export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler bei der Registrierung:", error.message);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler beim Login:", error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Fehler beim Logout:", error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzers:", error.message);
    return null;
  }
};

// ----- Kontostand-Funktionen -----

export const fetchBalance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("balances")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 ist der Fehlercode für "keine Daten gefunden"
    return data;
  } catch (error) {
    console.error("Fehler beim Abrufen des Kontostands:", error.message);
    throw error;
  }
};

export const updateBalance = async (userId, amount) => {
  try {
    const { data, error } = await supabase.from("balances").upsert(
      {
        user_id: userId,
        amount: amount,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kontostands:", error.message);
    throw error;
  }
};

// ----- Kategorie-Funktionen -----

export const fetchCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fehler beim Abrufen der Kategorien:", error.message);
    throw error;
  }
};

export const addCategory = async (userId, name, icon) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name,
        icon,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Kategorie:", error.message);
    throw error;
  }
};

export const updateCategory = async (id, updates) => {
  try {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Kategorie:", error.message);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Fehler beim Löschen der Kategorie:", error.message);
    throw error;
  }
};

// ----- Fixkosten-Funktionen -----

export const fetchFixedCosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("fixed_costs")
      .select(
        `
        *,
        categories(id, name, icon)
      `
      )
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fehler beim Abrufen der Fixkosten:", error.message);
    throw error;
  }
};

export const addFixedCost = async (
  userId,
  name,
  amount,
  categoryId,
  isRecurring
) => {
  try {
    const { data, error } = await supabase
      .from("fixed_costs")
      .insert({
        user_id: userId,
        name,
        amount,
        category: categoryId,
        is_recurring: isRecurring,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Fixkosten:", error.message);
    throw error;
  }
};

export const updateFixedCost = async (id, updates) => {
  try {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("fixed_costs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Fixkosten:", error.message);
    throw error;
  }
};

export const deleteFixedCost = async (id) => {
  try {
    // Die Fixkosten suchen und sicherstellen, dass sie existieren
    const { data: existingCost, error: fetchError } = await supabase
      .from("fixed_costs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fehler beim Suchen der Fixkosten:", fetchError.message);
      throw fetchError;
    }

    if (!existingCost) {
      throw new Error("Fixkosten nicht gefunden");
    }

    // Fixkosten löschen
    const { error } = await supabase.from("fixed_costs").delete().eq("id", id);

    if (error) {
      console.error("Supabase-Fehler beim Löschen der Fixkosten:", error);
      throw error;
    }

    // Eine kurze Pause einlegen, um sicherzustellen, dass die Änderung in der Datenbank synchronisiert ist
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("Fixkosten erfolgreich gelöscht:", id);
    return true;
  } catch (error) {
    console.error("Fehler beim Löschen der Fixkosten:", error.message);
    throw error;
  }
};

// ----- Ausgaben-Funktionen -----

export const fetchExpenses = async (userId, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        *,
        categories(id, name, icon)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fehler beim Abrufen der Ausgaben:", error.message);
    throw error;
  }
};

export const addExpense = async (userId, name, amount, categoryId, date) => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: userId,
        name,
        amount,
        category: categoryId,
        date: date?.toISOString() || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Aktualisieren des Kontostands
    try {
      const balance = await fetchBalance(userId);
      if (balance) {
        await updateBalance(userId, balance.amount - amount);
      } else {
        await updateBalance(userId, -amount);
      }
    } catch (balanceError) {
      console.error(
        "Fehler beim Aktualisieren des Kontostands:",
        balanceError.message
      );
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Ausgabe:", error.message);
    throw error;
  }
};

export const updateExpense = async (id, updates, originalAmount) => {
  try {
    const { user_id, amount } = await supabase
      .from("expenses")
      .select("user_id, amount")
      .eq("id", id)
      .single()
      .then(({ data }) => data);

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Aktualisieren des Kontostands, wenn sich der Betrag geändert hat
    if (amount !== updates.amount && user_id) {
      try {
        const balance = await fetchBalance(user_id);
        if (balance) {
          // Alte Ausgabe zurückerstatten und neue abziehen
          const newBalance = balance.amount + originalAmount - updates.amount;
          await updateBalance(user_id, newBalance);
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Ausgabe:", error.message);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    // Zuerst die Ausgabe abrufen, um den Betrag zu kennen
    const { data: expense } = await supabase
      .from("expenses")
      .select("user_id, amount")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;

    // Kontostand aktualisieren, indem der Betrag zurückerstattet wird
    if (expense) {
      try {
        const balance = await fetchBalance(expense.user_id);
        if (balance) {
          await updateBalance(expense.user_id, balance.amount + expense.amount);
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Fehler beim Löschen der Ausgabe:", error.message);
    throw error;
  }
};

// ----- Geplante Ausgaben-Funktionen -----

export const fetchPlannedExpenses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("planned_expenses")
      .select(
        `
        *,
        categories(id, name, icon)
      `
      )
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fehler beim Abrufen der geplanten Ausgaben:", error.message);
    throw error;
  }
};

export const addPlannedExpense = async (
  userId,
  name,
  amount,
  categoryId,
  dueDate,
  deductNow
) => {
  try {
    const { data, error } = await supabase
      .from("planned_expenses")
      .insert({
        user_id: userId,
        name,
        amount,
        category: categoryId,
        due_date: dueDate.toISOString(),
        deduct_now: deductNow,
        is_completed: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Wenn deductNow aktiviert ist, sofort vom Kontostand abziehen
    if (deductNow) {
      try {
        const balance = await fetchBalance(userId);
        if (balance) {
          await updateBalance(userId, balance.amount - amount);
        } else {
          await updateBalance(userId, -amount);
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return data;
  } catch (error) {
    console.error(
      "Fehler beim Hinzufügen der geplanten Ausgabe:",
      error.message
    );
    throw error;
  }
};

export const updatePlannedExpense = async (id, updates) => {
  try {
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("planned_expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren der geplanten Ausgabe:",
      error.message
    );
    throw error;
  }
};

export const deletePlannedExpense = async (id) => {
  try {
    // Zuerst die geplante Ausgabe abrufen
    const { data: plannedExpense } = await supabase
      .from("planned_expenses")
      .select("user_id, amount, deduct_now")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("planned_expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Wenn der Betrag bereits abgezogen wurde, zurückerstatten
    if (plannedExpense && plannedExpense.deduct_now) {
      try {
        const balance = await fetchBalance(plannedExpense.user_id);
        if (balance) {
          await updateBalance(
            plannedExpense.user_id,
            balance.amount + plannedExpense.amount
          );
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Fehler beim Löschen der geplanten Ausgabe:", error.message);
    throw error;
  }
};

export const completeExpense = async (plannedExpenseId) => {
  try {
    // Zuerst die geplante Ausgabe abrufen
    const { data: plannedExpense } = await supabase
      .from("planned_expenses")
      .select("*")
      .eq("id", plannedExpenseId)
      .single();

    if (!plannedExpense) throw new Error("Geplante Ausgabe nicht gefunden");

    // Geplante Ausgabe als abgeschlossen markieren
    const { error: updateError } = await supabase
      .from("planned_expenses")
      .update({
        is_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plannedExpenseId);

    if (updateError) throw updateError;

    // Neue Ausgabe erstellen
    const { error: expenseError } = await supabase.from("expenses").insert({
      user_id: plannedExpense.user_id,
      name: plannedExpense.name,
      amount: plannedExpense.amount,
      category: plannedExpense.category,
      date: new Date().toISOString(),
    });

    if (expenseError) throw expenseError;

    // Kontostand aktualisieren, wenn der Betrag nicht bereits abgezogen wurde
    if (!plannedExpense.deduct_now) {
      try {
        const balance = await fetchBalance(plannedExpense.user_id);
        if (balance) {
          await updateBalance(
            plannedExpense.user_id,
            balance.amount - plannedExpense.amount
          );
        } else {
          await updateBalance(plannedExpense.user_id, -plannedExpense.amount);
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return true;
  } catch (error) {
    console.error(
      "Fehler beim Abschließen der geplanten Ausgabe:",
      error.message
    );
    throw error;
  }
};

// ----- Einnahmen-Funktionen -----

export const fetchIncomes = async (userId, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from("incomes")
      .select(
        `
        *,
        categories(id, name, icon)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fehler beim Abrufen der Einnahmen:", error.message);
    throw error;
  }
};

export const addIncome = async (userId, name, amount, categoryId, date) => {
  try {
    const { data, error } = await supabase
      .from("incomes")
      .insert({
        user_id: userId,
        name,
        amount,
        category: categoryId,
        date: date?.toISOString() || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Aktualisieren des Kontostands
    try {
      const balance = await fetchBalance(userId);
      if (balance) {
        await updateBalance(userId, balance.amount + amount);
      } else {
        await updateBalance(userId, amount);
      }
    } catch (balanceError) {
      console.error(
        "Fehler beim Aktualisieren des Kontostands:",
        balanceError.message
      );
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Einnahme:", error.message);
    throw error;
  }
};

export const updateIncome = async (id, updates, originalAmount) => {
  try {
    const { user_id, amount } = await supabase
      .from("incomes")
      .select("user_id, amount")
      .eq("id", id)
      .single()
      .then(({ data }) => data);

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("incomes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Aktualisieren des Kontostands, wenn sich der Betrag geändert hat
    if (amount !== updates.amount && user_id) {
      try {
        const balance = await fetchBalance(user_id);
        if (balance) {
          // Alte Einnahme zurücknehmen und neue hinzufügen
          const newBalance = balance.amount - originalAmount + updates.amount;
          await updateBalance(user_id, newBalance);
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Einnahme:", error.message);
    throw error;
  }
};

export const deleteIncome = async (id) => {
  try {
    // Zuerst die Einnahme abrufen, um den Betrag zu kennen
    const { data: income } = await supabase
      .from("incomes")
      .select("user_id, amount")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("incomes").delete().eq("id", id);

    if (error) throw error;

    // Kontostand aktualisieren, indem der Betrag abgezogen wird
    if (income) {
      try {
        const balance = await fetchBalance(income.user_id);
        if (balance) {
          await updateBalance(income.user_id, balance.amount - income.amount);
        }
      } catch (balanceError) {
        console.error(
          "Fehler beim Aktualisieren des Kontostands:",
          balanceError.message
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Fehler beim Löschen der Einnahme:", error.message);
    throw error;
  }
};
