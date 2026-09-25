import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import {
  Users,
  Map as MapIcon,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  FileText,
  MapPin,
  FileQuestion,
  ArrowLeft,
  Building,
  User as UserIcon,
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("portal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// TYPES
type AppUser = {
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
  description: string;
  landTitleNumber: string;
  verificationStatus: string;
  sellerId: string;
  region: string;
  division: string;
  subdivision: string;
  surfaceAreaSqM?: number;
  areaSqM?: number;
  documents?: any[];
  submittedAt: string;
};
type Request = {
  id: string;
  landId: string;
  landTitleNumber: string;
  sellerName: string;
  sellerPhone: string;
  surveyorId: string;
  status: string;
  surveyorNotes: string;
  region: string;
  division: string;
  subdivision: string;
  surfaceAreaSqM: number;
  submittedAt: string;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
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
      const role = res.data.user.role;
      if (role !== "admin" && role !== "surveyor") {
        throw new Error("Unauthorized: Staff access only");
      }
      localStorage.setItem("portal_token", res.data.token);
      localStorage.setItem("portal_role", role);
      localStorage.setItem("portal_id", res.data.user.id);
      localStorage.setItem("portal_name", res.data.user.fullName);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left side branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-blue-400 mb-8">
            <ShieldCheck size={32} />
            <span className="text-xl font-bold tracking-wider text-white">TERRAVERIFY</span>
          </div>
          <h1 className="text-5xl font-light leading-tight mt-20">
            Unified <br />
            <span className="font-semibold text-blue-400">Staff Portal</span>
          </h1>
          <p className="text-slate-400 mt-6 max-w-md text-lg">
            Secure administration and verification interface for TerraVerify operations.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} TerraVerify. All rights reserved.
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center text-slate-900">
            <ShieldCheck size={28} className="text-blue-600" />
            <span className="text-xl font-bold tracking-wider">TERRAVERIFY</span>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in with your staff credentials</p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100 flex items-center gap-2">
                <XCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  className="w-full bg-white border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  className="w-full bg-white border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ role }: { role: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("portal_token");
    navigate("/login");
  };

  const navItems = role === 'admin' ? [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { id: "users", icon: Users, label: "Community", path: "/dashboard?tab=users" },
    { id: "lands", icon: MapIcon, label: "Registry", path: "/dashboard?tab=lands" },
    { id: "verifications", icon: CheckCircle, label: "Verifications", path: "/dashboard?tab=verifications" },
  ] : [
    { id: "dashboard", icon: LayoutDashboard, label: "Verifications", path: "/dashboard" }
  ];

  const currentTab = new URLSearchParams(location.search).get("tab") || "dashboard";

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <ShieldCheck size={28} className="text-blue-400" />
        <span className="text-lg font-bold tracking-wider">TERRAVERIFY</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// Topbar Component
function Topbar({ role }: { role: string }) {
  const userName = localStorage.getItem("portal_name") || "Staff";
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-800 capitalize">{role} Portal</h1>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500 capitalize">{role}</p>
        </div>
        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("portal_role") || "admin";
  const activeTab = new URLSearchParams(location.search).get("tab") || "dashboard";

  const [users, setUsers] = useState<AppUser[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [surveyorTab, setSurveyorTab] = useState<"pending" | "completed">("pending");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (role === 'admin') {
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
      } else {
        const r = await api.get("/verifications");
        setRequests(r.data);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("portal_token");
        navigate("/login");
      }
    }
  };

  // Admin Actions
  const toggleUser = async (id: string) => {
    if (!confirm("Toggle user access status?")) return;
    await api.put(`/users/${id}/toggle-status`);
    fetchData();
  };

  const changeRole = async (id: string) => {
    const newRole = prompt("Assign new role (buyer, seller, surveyor, advisor, admin):");
    if (newRole) {
      await api.put(`/users/${id}/role`, { role: newRole });
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

  // Filter Logic
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter((r) => {
    if (role === 'surveyor') {
      const isPending = ["submitted", "under_review"].includes(r.status);
      if (surveyorTab === "pending" && !isPending) return false;
      if (surveyorTab === "completed" && isPending) return false;
    }
    return (
      r.landTitleNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.sellerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const pendingCount = requests.filter((r) => ["submitted", "under_review"].includes(r.status)).length;
  const completedCount = requests.filter((r) => ["approved", "rejected"].includes(r.status)).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar role={role} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Surveyor View */}
          {role === 'surveyor' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Assignments</p>
                    <h3 className="text-2xl font-bold text-slate-900">{requests.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Pending Review</p>
                    <h3 className="text-2xl font-bold text-slate-900">{pendingCount}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Completed</p>
                    <h3 className="text-2xl font-bold text-slate-900">{completedCount}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setSurveyorTab("pending")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        surveyorTab === "pending"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setSurveyorTab("completed")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        surveyorTab === "completed"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search title or seller..."
                      className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                      <FileQuestion size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No requests found</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      There are currently no verification requests matching your criteria.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title Number</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredRequests.map((req) => (
                          <tr 
                            key={req.id} 
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                            onClick={() => navigate(`/review/${req.id}`)}
                          >
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-900">{req.landTitleNumber}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <MapPin size={14} className="text-slate-400" />
                                <span>{req.subdivision}, {req.region}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                  {req.sellerName.charAt(0)}
                                </div>
                                <span className="text-sm text-slate-700 font-medium">{req.sellerName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(req.submittedAt)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  req.status === "approved"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : req.status === "rejected"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {req.status === "submitted" ? "Pending" : req.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 font-medium text-sm hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 w-full">
                                Review <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Admin Views */}
          {role === 'admin' && (
            <>
              {/* Header */}
              <header className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                    {activeTab === "dashboard"
                      ? "System Overview"
                      : activeTab === "users"
                        ? "Community Directory"
                        : activeTab === "lands"
                          ? "Land Registry"
                          : "Verification Log"}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {activeTab === "dashboard"
                      ? "Here's what's happening across the platform today."
                      : "Manage and monitor system records cleanly and securely."}
                  </p>
                </div>
              </header>

              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Members", value: users.length, icon: Users, color: "blue" },
                    { title: "Registered Plots", value: lands.length, icon: MapIcon, color: "indigo" },
                    { title: "Pending Reviews", value: requests.filter((r) => ["submitted", "under_review"].includes(r.status)).length, icon: Clock, color: "amber" },
                    { title: "Verified Authentic", value: lands.filter((l) => l.verificationStatus === "verified").length, icon: ShieldCheck, color: "emerald" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                        <stat.icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                      </div>
                    </div>
                  ))}
                  
                  <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xl">
                      XAF
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Transactions</p>
                      <h3 className="text-2xl font-bold text-slate-900">{transactions.length}</h3>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Member Name</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">System Role</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                  {u.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{u.fullName}</p>
                                  <p className="text-slate-500 text-xs">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-xs font-semibold capitalize">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {u.status === "active" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
                                  <CheckCircle size={12} /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-semibold">
                                  <XCircle size={12} /> Suspended
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => changeRole(u.id)}
                                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-xs font-medium transition-all"
                                >
                                  Change Role
                                </button>
                                <button
                                  onClick={() => toggleUser(u.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${u.status === "active" ? "bg-white border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50" : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"}`}
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Title No.</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Property Info</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Authentication</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {lands.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-slate-900">{l.landTitleNumber}</td>
                            <td className="px-6 py-4 text-slate-600">
                              <p className="font-medium text-slate-900">{l.title}</p>
                              <p className="text-xs text-slate-500">{l.region}, {l.subdivision}</p>
                            </td>
                            <td className="px-6 py-4">
                              {l.verificationStatus === "verified" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold tracking-wide">
                                  <ShieldCheck size={12} /> VERIFIED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold tracking-wide">
                                  <Clock size={12} /> PENDING
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => removeLand(l.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Dossier / Title</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Personnel</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                          <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {requests.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">{r.landTitleNumber}</p>
                              <p className="text-xs text-slate-500">ID: {r.id.split("-")[0]}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-slate-900 text-sm mb-0.5"><span className="text-slate-500 text-xs">Seller:</span> {r.sellerName}</p>
                              <p className="text-slate-900 text-sm"><span className="text-slate-500 text-xs">Surveyor:</span> {r.surveyorId ? "Assigned" : "Pending"}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  r.status === "approved"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : r.status === "rejected"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {r.status.replace("_", " ").toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => navigate(`/review/${r.id}`)}
                                className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors flex items-center justify-end gap-1 w-full"
                              >
                                View Details <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

function ReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.pathname.split("/").pop();
  const role = localStorage.getItem("portal_role") || "admin";
  const portalId = localStorage.getItem("portal_id");
  
  const [req, setReq] = useState<Request | null>(null);
  const [land, setLand] = useState<Land | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const r = await api.get("/verifications");
      const foundReq = r.data.find((x: Request) => x.id === requestId);
      setReq(foundReq);
      if (foundReq) {
        setNotes(foundReq.surveyorNotes || "");
        try {
          const l = await api.get(`/lands/${foundReq.landId}`);
          setLand(l.data);
        } catch (landErr) {
          console.error("Failed to fetch land details", landErr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (status: "approved" | "rejected") => {
    if (role !== "surveyor" && role !== "admin") return;
    
    if (!notes && status === "rejected") {
      return alert("Surveyor notes are strictly required for a rejection.");
    }
    if (
      !confirm(
        `Are you sure you want to mark this title as ${status.toUpperCase()}?`
      )
    )
      return;

    setSubmitting(true);
    try {
      await api.put(`/verifications/${requestId}/status`, {
        status,
        surveyorNotes: notes,
        surveyorId: portalId,
      });
      navigate(role === "admin" ? "/dashboard?tab=verifications" : "/dashboard");
    } catch (err) {
      alert("Failed to update verification status.");
      setSubmitting(false);
    }
  };

  if (!req)
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role={role} />
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading verification data...
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Review Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(role === "admin" ? "/dashboard?tab=verifications" : "/dashboard")}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-bold text-xl text-slate-900">
                  {req.landTitleNumber}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    req.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : req.status === "rejected"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {req.status === "submitted" ? "Pending" : req.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                Dossier ID: <span className="font-mono text-xs">{req.id}</span>
              </p>
            </div>
          </div>
          {(req.status === "submitted" || req.status === "under_review") && (role === "surveyor" || role === "admin") ? (
             <div className="flex items-center gap-3">
                <button
                  disabled={submitting}
                  onClick={() => handleAction("rejected")}
                  className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleAction("approved")}
                  className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  Approve Title
                </button>
             </div>
          ) : null}
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Information Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Building size={20} className="text-blue-600" /> Property Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Title Number</p>
                    <p className="font-medium text-slate-900">{req.landTitleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Surface Area</p>
                    <p className="font-medium text-slate-900">{req.surfaceAreaSqM || land?.areaSqM} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Region</p>
                    <p className="font-medium text-slate-900">{req.region || land?.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Division / Subdivision</p>
                    <p className="font-medium text-slate-900">{req.division || land?.division}, {req.subdivision || land?.subdivision}</p>
                  </div>
                  <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 mb-2">Detailed Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {land?.description || land?.title || "No extended description provided for this land parcel."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action/Notes Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                 <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" /> Surveyor Field Notes
                </h2>
                {(req.status === "submitted" || req.status === "under_review") && (role === "surveyor" || role === "admin") ? (
                  <div>
                    <p className="text-sm text-slate-600 mb-4">
                      Record your official findings, coordinate cross-checks, and boundary observations. These notes will be attached to the final verification report.
                    </p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter field notes here..."
                      className="w-full h-40 p-4 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap min-h-[100px]">
                    {req.surveyorNotes || "No notes were provided during the verification process."}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Meta & Docs */}
            <div className="space-y-6">
              {/* Seller Info */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <UserIcon size={18} className="text-slate-400" /> Applicant / Seller
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
                    <p className="font-medium text-slate-900">{req.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                    <p className="font-medium text-slate-900">{req.sellerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Submission Date</p>
                    <p className="font-medium text-slate-900">{formatDate(req.submittedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Official Documents</h2>
                <div className="space-y-3">
                  {land?.documents && land.documents.length > 0 ? (
                    land.documents.map((doc: any) => (
                      <a 
                        key={doc.id}
                        href={doc.fileUrl ? `http://localhost:5001${doc.fileUrl}` : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-700 group-hover:text-blue-700 capitalize">
                          <FileText size={16} className="text-slate-400 group-hover:text-blue-500" />
                          {doc.name || (doc.type ? doc.type.replace('_', ' ') : 'Document')}
                        </div>
                        <ChevronRight size={16} className="text-slate-400" />
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No documents attached.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
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
        <Route path="/review/:id" element={<ReviewScreen />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
