// src/components/FixedCostItem.jsx
import React from "react";
import { motion } from "framer-motion";
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";
import { formatAmount } from "../utils/formatters";

const FixedCostItem = ({ fixedCost, onEdit, onDelete }) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(fixedCost);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(fixedCost.id);
  };

  return (
    <motion.li
      className="fixed-cost-item"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="fixed-cost-info">
        <div className="fixed-cost-header">
          <span className="fixed-cost-name">{fixedCost.name}</span>
          {fixedCost.is_recurring && (
            <span className="fixed-cost-recurring">Wiederkehrend</span>
          )}
        </div>
        <div className="fixed-cost-category">
          {fixedCost.categories?.icon}{" "}
          {fixedCost.categories?.name || "Ohne Kategorie"}
        </div>
      </div>
      <div className="fixed-cost-details">
        <div className="fixed-cost-amount">
          {formatAmount(fixedCost.amount)}
        </div>
        <div className="fixed-cost-actions">
          <button
            className="button-icon"
            onClick={handleEdit}
            aria-label="Bearbeiten"
          >
            <IoCreateOutline size={18} />
          </button>
          <button
            className="button-icon"
            onClick={handleDelete}
            aria-label="Löschen"
          >
            <IoTrashOutline size={18} />
          </button>
        </div>
      </div>
    </motion.li>
  );
};

export default FixedCostItem;
