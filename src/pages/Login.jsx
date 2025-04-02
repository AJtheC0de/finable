// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signIn, signUp, signInWithGoogle } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { IoLogoGoogle, IoEye, IoEyeOff } from "react-icons/io5";
import "../styles/index.css";
import "../styles/login.css";
// Import des Logos
import finableLogo from "../assets/images/finable.svg";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Wenn der Benutzer bereits angemeldet ist, zum Dashboard weiterleiten
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("Bitte füllen Sie alle Felder aus.");
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return false;
    }

    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return false;
    }

    // Passwort-Komplexität (mindestens 8 Zeichen)
    if (!isLogin && password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return false;
    }

    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Bei erfolgreicher Registrierung eine Erfolgsbenachrichtigung anzeigen
        alert(
          "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen."
        );
        // Nach der Registrierung zur Login-Ansicht wechseln
        setIsLogin(true);
      }
      // Der Auth-State wird automatisch aktualisiert und die ProtectedRoute wird navigieren
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        isLogin
          ? "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten."
          : "Registrierung fehlgeschlagen. Bitte versuchen Sie es mit einer anderen E-Mail."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      // Die Weiterleitung wird von Supabase und der ProtectedRoute behandelt
    } catch (error) {
      console.error("Google Auth error:", error);
      setError(
        "Google-Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src={finableLogo} alt="finable Logo" className="auth-logo" />
        <h1>finable</h1>
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>{isLogin ? "Anmelden" : "Registrieren"}</h2>

        <div className="toggle-container">
          <div
            className={`toggle-option ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Anmelden
          </div>
          <div
            className={`toggle-option ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Registrieren
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
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
                aria-label={
                  showPassword ? "Passwort verbergen" : "Passwort anzeigen"
                }
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Passwort bestätigen</label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex="-1"
                  aria-label={
                    showConfirmPassword
                      ? "Passwort verbergen"
                      : "Passwort anzeigen"
                  }
                >
                  {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
                </button>
              </div>
            </div>
          )}

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

        <div className="separator">
          <span>ODER</span>
        </div>

        {/* Google-Button */}
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <div className="google-icon">
            <IoLogoGoogle />
          </div>
          {isLogin ? "Mit Google anmelden" : "Mit Google registrieren"}
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
