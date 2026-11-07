
import { useState } from "react";
import {
  Boxes,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import "./Login.css";

export default function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);

  return (
    <main className="login-page">
      <div className="login-background" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="onda" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor="#0077DD" />
              <stop offset="50%" stopColor="#0066CC" />
              <stop offset="100%" stopColor="#00B8FF" />
            </linearGradient>
          </defs>

          <path
            d="M-100 650 C200 350 350 350 600 450 S1100 500 1540 100"
            stroke="url(#onda)"
            strokeWidth="2"
            opacity="0.6"
          />

          <path
            d="M-100 680 C200 380 350 380 600 480 S1100 530 1540 130"
            stroke="#00AFFF"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </svg>
      </div>

      <div className="login-card">
        <header className="login-header">
          <div className="login-logo">
            <Boxes size={64} strokeWidth={1.8} />
          </div>

          <h1>GHEERA</h1>

          <div className="login-subtitle">
            <span />
            <p>Sistema de gestión comercial</p>
            <span />
          </div>
        </header>

        <section className="login-panel">
          <h2>Bienvenido</h2>

          <p className="login-description">
            Ingresá tus credenciales para continuar.
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="username">
                <UserRound size={21} />
                Usuario
              </label>

              <div className="input-box">
                <UserRound size={25} className="input-icon" />

                <input
                  id="username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Nombre de usuario"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <LockKeyhole size={21} />
                Contraseña
              </label>

              <div className="input-box">
                <LockKeyhole size={25} className="input-icon" />

                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Ingresá tu contraseña"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff size={24} />
                  ) : (
                    <Eye size={24} />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button">
              <LogIn size={26} />
              <span>Ingresar al sistema</span>
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
