// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const Header = ({ title, showBackButton = true }) => {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      {showBackButton && (
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Zurück"
        >
          <IoArrowBack />
        </button>
      )}
      <h1 className="page-title">{title}</h1>
    </header>
  );
};

export default Header;
// end Header.jsx
