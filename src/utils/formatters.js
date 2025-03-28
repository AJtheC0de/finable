// formatters.js is empty
// src/utils/formatters.js

/**
 * Formatiert einen Betrag als Währung (CHF)
 * @param {number} amount - Der zu formatierende Betrag
 * @param {boolean} includeCurrency - Ob das Währungssymbol angezeigt werden soll (Standard: true)
 * @returns {string} - Der formatierte Betrag
 */
export const formatAmount = (amount, includeCurrency = true) => {
  return new Intl.NumberFormat("de-CH", {
    style: includeCurrency ? "currency" : "decimal",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Formatiert ein Datum im deutschen Format (TT.MM.JJJJ)
 * @param {string|Date} dateString - Das zu formatierende Datum
 * @returns {string} - Das formatierte Datum
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${date.getFullYear()}`;
};
