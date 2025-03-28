// src/components/AddActionModal.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import "../styles/AddActionModal.css";

const AddActionModal = ({ onClose, onSelectExpense, onSelectIncome }) => {
  return (
    <div className="add-action-modal-overlay" onClick={onClose}>
      <motion.div
        className="add-action-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()} // Verhindert, dass Klicks auf das Modal es schließen
      >
        <button className="close-modal-button" onClick={onClose}>
          <IoCloseOutline size={24} />
        </button>

        <h3>Was möchtest du hinzufügen?</h3>

        <div className="action-buttons">
          <button className="action-button expense" onClick={onSelectExpense}>
            <IoRemoveCircleOutline size={28} />
            <span>Ausgabe</span>
          </button>

          <button className="action-button income" onClick={onSelectIncome}>
            <IoAddCircleOutline size={28} />
            <span>Einnahme</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddActionModal;
