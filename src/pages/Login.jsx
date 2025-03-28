// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signIn, signUp } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/index.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Wenn der Benutzer bereits angemeldet ist, zum Dashboard weiterleiten
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Optional: Nach der Registrierung eine Erfolgsbenachrichtigung anzeigen
      }
      // Der Auth-State wird automatisch aktualisiert und die ProtectedRoute wird navigieren
    } catch (error) {
      setError(
        isLogin
          ? "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten."
          : "Registrierung fehlgeschlagen. Bitte versuchen Sie es mit einer anderen E-Mail."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo">
        <h1>finable</h1>
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        <div className="toggle-container">
          <div
            className={`toggle-option ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </div>
          <div
            className={`toggle-option ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="button button-block"
            disabled={loading}
          >
            {loading
              ? "Wird bearbeitet..."
              : isLogin
              ? "Anmelden"
              : "Registrieren"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
// Login.jsx
