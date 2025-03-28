// src/components/TransactionItem.jsx (überarbeitete Version ohne Swipen)
import React from "react";
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { formatAmount, formatDate } from "../utils/formatters";
import "../styles/TransactionItem.css";

const TransactionItem = ({ transaction, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/expenses/${transaction.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Möchten Sie diese Transaktion wirklich löschen?")) {
      if (onDelete) {
        onDelete(transaction.id);
      }
    }
  };

  const handleItemClick = () => {
    navigate(`/expenses/${transaction.id}`);
  };

  return (
    <div className="transaction-item-container">
      <div className="transaction-item" onClick={handleItemClick}>
        <div className="transaction-info">
          <div className="transaction-name">{transaction.name}</div>
          <div className="transaction-category">
            {transaction.categories?.name || "Ohne Kategorie"}
          </div>
        </div>
        <div className="transaction-details">
          <div className="transaction-amount">
            {formatAmount(transaction.amount)}
          </div>
          <div className="transaction-date">{formatDate(transaction.date)}</div>
        </div>
        <div className="transaction-actions">
          <button
            className="action-button edit"
            onClick={handleEdit}
            aria-label="Bearbeiten"
          >
            <IoCreateOutline size={18} />
          </button>
          <button
            className="action-button delete"
            onClick={handleDelete}
            aria-label="Löschen"
          >
            <IoTrashOutline size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
