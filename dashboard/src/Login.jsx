import { useState } from "react";
import "./Login.css";

const API_BASE = "http://127.0.0.1:8000";

function Login({ onLogin }) {
  const [mode, setMode] = useState("signin"); // "signin" | "register-counselor" | "register-person"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/check-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.role === "user" && !data.person_id) {
        // First-time user — need their name before we can register them.
        setMode("register-person");
        setLoading(false);
        return;
      }

      localStorage.setItem("sahayEmail", email.trim());
      localStorage.setItem("sahayRole", data.role);
      if (data.person_id) {
        localStorage.setItem("sahayPersonId", data.person_id);
        localStorage.setItem("sahayPersonName", data.name);
      }
      onLogin(data.role, email.trim());
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterPerson(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register-person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      localStorage.setItem("sahayEmail", email.trim());
      localStorage.setItem("sahayRole", "user");
      localStorage.setItem("sahayPersonId", data.person_id);
      localStorage.setItem("sahayPersonName", data.name);
      onLogin("user", email.trim());
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterCounselor(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register-counselor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      if (!res.ok) throw new Error("Registration failed");
      localStorage.setItem("sahayEmail", email.trim());
      localStorage.setItem("sahayRole", "counselor");
      onLogin("counselor", email.trim());
    } catch {
      setError("Registration failed — check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  const handlers = {
    signin: handleSignIn,
    "register-person": handleRegisterPerson,
    "register-counselor": handleRegisterCounselor,
  };
  const titles = {
    signin: "Enter your email to continue",
    "register-person": "What's your name?",
    "register-counselor": "Register as a counselor",
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handlers[mode]}>
        <h1>SAHAY</h1>
        <p>{titles[mode]}</p>

        {mode === "register-person" && (
          <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        {mode === "register-counselor" && (
          <>
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </>
        )}
        {mode !== "register-person" && (
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Please wait…" : mode === "signin" ? "Continue" : "Confirm"}
        </button>

        {mode === "signin" && (
          <p className="login-switch" onClick={() => setMode("register-counselor")}>
            Register as a counselor
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;