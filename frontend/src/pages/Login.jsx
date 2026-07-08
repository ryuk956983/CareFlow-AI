import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    login(username, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 rounded-lg bg-forest-700 flex items-center justify-center text-white text-xl overflow-hidden"><img className='w-full h-full' src="/logo.jpg" alt="CareFlow AI"/></div>
          <div>
            <h1 className="text-white text-xl font-bold leading-tight">CareFlow AI</h1>
            <p className="text-forest-600 text-xs">District health centre & supply chain command</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-5">Admins and facility staff use the same login screen.</p>

          {error && (
            <div className="mb-4 text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>
          )}

          <label className="block text-xs font-semibold text-gray-500 mb-1">USERNAME</label>
          <input
            className="input mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ghatampur.chc or admin"
            autoFocus
          />

          <label className="block text-xs font-semibold text-gray-500 mb-1">PASSWORD</label>
          <input
            type="password"
            className="input mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Demo (after seeding): admin / Admin@123 · ghatampur.chc / Ghatampur@123
          </p>
        </form>
      </div>
    </div>
  );
}
