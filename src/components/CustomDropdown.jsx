// src/components/CustomDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import "../styles/CustomDropdown.css";

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Auswählen...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  // Finde die ausgewählte Option basierend auf dem value
  useEffect(() => {
    const selected = options.find((option) => option.value === value);
    setSelectedOption(selected || null);
  }, [value, options]);

  // Klick außerhalb des Dropdowns schließt ihn
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div
      className={`custom-dropdown ${className} ${isOpen ? "open" : ""}`}
      ref={dropdownRef}
    >
      <div className="dropdown-selected" onClick={toggleDropdown}>
        {selectedOption ? (
          <div className="selected-option">
            {selectedOption.icon && (
              <span className="option-icon">{selectedOption.icon}</span>
            )}
            <span className="option-label">{selectedOption.label}</span>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <IoChevronDownOutline className="dropdown-arrow" />
      </div>

      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.icon && (
                <span className="option-icon">{option.icon}</span>
              )}
              <span className="option-label">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
// end of CustomDropdown
