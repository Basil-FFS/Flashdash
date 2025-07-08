import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import Filters from "./pages/Filters";
import { getCurrentUser } from "./utils/api";
import Sidebar from "./components/Sidebar";

function ComingSoon() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#004845] text-white">
      <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow text-center">
        <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
        <p className="text-lg text-white text-opacity-80">This feature is coming soon.</p>
      </div>
    </div>
  );
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#004845] text-white flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 flex flex-col items-center justify-start gap-8">{children}</main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then(u => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
      });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#004845] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const token = localStorage.getItem("token");

  return (
    <div style={{ background: '#004845', color: 'white', minHeight: '100vh' }}>
      {/* Fixed Logo */}
      <img src="https://i.ibb.co/W40V9Psr/FFS-NEW.png" alt="Logo" style={{ position: 'fixed', top: 20, left: 20, width: 60, height: 60, zIndex: 1000 }} />
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout><Dashboard user={user} /></MainLayout>} />
            {user.role === "admin" && (
              <Route path="/admin" element={<MainLayout><AdminPanel user={user} token={token} /></MainLayout>} />
            )}
            {user.role === "admin" && (
              <Route path="/filters" element={<MainLayout><Filters user={user} token={token} /></MainLayout>} />
            )}
            <Route path="/coming-soon" element={<MainLayout><ComingSoon /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
