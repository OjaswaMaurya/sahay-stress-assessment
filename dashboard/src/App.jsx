import { useState, useEffect } from "react";
import Login from "./Login";
import UserApp from "./UserApp";
import CounselorApp from "./CounselorApp";

function App() {
  const [session, setSession] = useState(null); // { role, email } or null
  const [checkedStorage, setCheckedStorage] = useState(false);

  // On page load, check if we already know who this is (avoids re-login
  // on every refresh during the demo).
  useEffect(() => {
    const role = localStorage.getItem("sahayRole");
    const email = localStorage.getItem("sahayEmail");
    if (role && email) setSession({ role, email });
    setCheckedStorage(true);
  }, []);

  function handleLogin(role, email) {
    setSession({ role, email });
  }

  function handleLogout() {
    localStorage.removeItem("sahayRole");
    localStorage.removeItem("sahayEmail");
    setSession(null);
  }

  if (!checkedStorage) return null; // avoid a login-screen flash on refresh

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return session.role === "counselor" ? (
    <CounselorApp email={session.email} onLogout={handleLogout} />
  ) : (
    <UserApp email={session.email} onLogout={handleLogout} />
  );
}

export default App;