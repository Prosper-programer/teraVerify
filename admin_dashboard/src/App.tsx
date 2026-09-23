import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import {
  Users,
  Map,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// TYPES
type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  phone: string;
};
type Land = {
  id: string;
  title: string;
  landTitleNumber: string;
  verificationStatus: string;
  sellerId: string;
};
type Request = {
  id: string;
  landTitleNumber: string;
  sellerName: string;
  surveyorId: string;
  status: string;
  surveyorNotes: string;
};

function Login() {
  const [email, setEmail] = useState("admin@terraverify.cm");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        identifier: email,
        password,
      });
      if (res.data.user.role !== "admin") throw new Error("Unauthorized");
      localStorage.setItem("admin_token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB] font-sans">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-100"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8">
          Sign in to the TerraVerify admin center
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Email Address
            </label>
            <input
              className="w-full bg-slate-50 border-0 p-4 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <input
              className="w-full bg-slate-50 border-0 p-4 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold transition-colors shadow-sm shadow-blue-200"
        >
          Sign In to Dashboard
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [u, l, r, t] = await Promise.all([
        api.get("/users"),
        api.get("/lands"),
        api.get("/verifications"),
        api.get("/transactions"),
      ]);
      setUsers(u.data);
      setLands(l.data);
      setRequests(r.data);
      setTransactions(t.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  const toggleUser = async (id: string) => {
    if (!confirm("Toggle user access status?")) return;
    await api.put(`/users/${id}/toggle-status`);
    fetchData();
  };

  const changeRole = async (id: string) => {
    const role = prompt(
      "Assign new role (buyer, seller, surveyor, advisor, admin):",
    );
    if (role) {
      await api.put(`/users/${id}/role`, { role });
      fetchData();
    }
  };

  const removeLand = async (id: string) => {
    if (!confirm("Permanently remove this listing?")) return;
    try {
      await api.delete(`/lands/${id}`);
      setLands(lands.filter((l) => l.id !== id));
      alert("Listing removed successfully.");
    } catch (err) {
      alert("Failed to remove land.");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100">
      {/* Sidebar - Soft and Clean */}
      <div className="w-70 bg-white border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.01)] z-10">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-200">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">
            TerraVerify
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
            { id: "users", icon: Users, label: "Community" },
            { id: "lands", icon: Map, label: "Registry" },
            { id: "verifications", icon: CheckCircle, label: "Verifications" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-50/80 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <tab.icon
                size={20}
                strokeWidth={activeTab === tab.id ? 2.5 : 2}
                className={
                  activeTab === tab.id ? "text-blue-600" : "text-slate-400"
                }
              />
              {tab.label}
              {activeTab === tab.id && (
                <ChevronRight size={16} className="ml-auto text-blue-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-medium transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-10 xl:p-12">
          {/* Header */}
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
                {activeTab === "dashboard"
                  ? "Good morning, Henri 👋"
                  : activeTab === "users"
                    ? "Community Directory"
                    : activeTab === "lands"
                      ? "Land Registry"
                      : "Verification Log"}
              </h2>
              <p className="text-slate-500">
                {activeTab === "dashboard"
                  ? "Here's what's happening across the platform today."
                  : "Manage and monitor system records cleanly and securely."}
              </p>
            </div>
          </header>

          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Members",
                  value: users.length,
                  icon: Users,
                  color: "blue",
                },
                {
                  title: "Registered Plots",
                  value: lands.length,
                  icon: Map,
                  color: "indigo",
                },
                {
                  title: "Pending Reviews",
                  value: requests.filter((r) =>
                    ["submitted", "under_review"].includes(r.status),
                  ).length,
                  icon: Clock,
                  color: "amber",
                },
                {
                  title: "Verified Authentic",
                  value: lands.filter(
                    (l) => l.verificationStatus === "verified",
                  ).length,
                  icon: ShieldCheck,
                  color: "emerald",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}
                    >
                      <stat.icon size={26} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-slate-800">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="lg:col-span-4 bg-linear-to-r from-pink-50 to-rose-50 p-6 rounded-3xl border border-pink-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white text-pink-600 shadow-sm shadow-pink-100/50">
                    <span className="font-bold text-xl">FCFA</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-pink-400/80 uppercase tracking-wider mb-1">
                      Basic Payment Count
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {transactions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl w-72 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/50 text-slate-400 font-medium">
                    <tr>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Member Name
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        System Role
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Account Status
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">
                                {u.fullName}
                              </p>
                              <p className="text-slate-400 text-xs mt-0.5">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold capitalize tracking-wide">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {u.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold">
                              <CheckCircle size={14} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">
                              <XCircle size={14} /> Suspended
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => changeRole(u.id)}
                              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl text-xs font-semibold transition-all"
                            >
                              Role
                            </button>
                            <button
                              onClick={() => toggleUser(u.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${u.status === "active" ? "bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                            >
                              {u.status === "active" ? "Suspend" : "Reactivate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "lands" && (
            <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/50 text-slate-400 font-medium">
                    <tr>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Title No.
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Property Name
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Authentication
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide text-right">
                        Manage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lands.map((l) => (
                      <tr
                        key={l.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-8 py-5 font-bold text-slate-700">
                          {l.landTitleNumber}
                        </td>
                        <td className="px-8 py-5 text-slate-500">{l.title}</td>
                        <td className="px-8 py-5">
                          {l.verificationStatus === "verified" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold tracking-wide">
                              <ShieldCheck size={14} /> VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold tracking-wide">
                              <Clock size={14} /> PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => removeLand(l.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "verifications" && (
            <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/50 text-slate-400 font-medium">
                    <tr>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Dossier / Title
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Personnel
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Status
                      </th>
                      <th className="px-8 py-5 font-medium tracking-wide">
                        Surveyor Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-700 mb-0.5">
                            {r.landTitleNumber}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: {r.id.split("-")[0]}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-slate-600 mb-0.5">
                            <span className="text-slate-400">Seller:</span>{" "}
                            {r.sellerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            <span className="text-slate-400">Surveyor:</span>{" "}
                            {r.surveyorId
                              ? r.surveyorId.slice(0, 8)
                              : "Pending"}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${
                              r.status === "approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : r.status === "rejected"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {r.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {r.surveyorNotes ? (
                            <div className="max-w-62.5 truncate text-slate-500 bg-slate-50 px-3 py-2 rounded-xl text-xs">
                              {r.surveyorNotes}
                            </div>
                          ) : (
                            <span className="text-slate-300 italic text-xs">
                              No notes provided
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
