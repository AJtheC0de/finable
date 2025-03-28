// AddFixedCost.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FixedCostForm from "../components/FixedCostForm";

const AddFixedCost = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/fixed-costs");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="page-container">
      <Header title="Fixkosten hinzufügen" />
      <div className="content-container">
        <FixedCostForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default AddFixedCost;
// end AddFixedCost.jsx
