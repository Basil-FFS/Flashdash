import { useState } from "react";
import { login, getCurrentUser } from "../utils/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);
      const { token } = result;
      localStorage.setItem("token", token);

      const user = await getCurrentUser(token);
      onLogin(user);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#004845', color: 'white' }}>
      {/* Fixed Logo */}
      <img src="https://i.ibb.co/W40V9Psr/FFS-NEW.png" alt="Logo" style={{ position: 'fixed', top: 20, left: 20, width: 60, height: 60, zIndex: 1000 }} />
      <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'white', letterSpacing: 1 }}>
          Login to FlashDash
        </h2>

        {error && <p className="text-red-300 mb-2 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-white text-[#004845] py-2 rounded font-semibold hover:bg-gray-200 transition">
          Log In
        </button>

        <p className="text-center text-sm text-gray-300">
          Employee only login
        </p>
      </form>
    </div>
  );
}

export default Login;
