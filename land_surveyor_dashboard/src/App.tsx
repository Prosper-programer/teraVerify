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
  FileText,
  MapPin,
  Search,
  LogOut,
  FileQuestion,
  ArrowLeft,
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("surveyor_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

type Land = {
  id: string;
  title: string;
  description: string;
  documents: any[];
};

function Login() {
  const [email, setEmail] = useState("s.ewane@ordre-geometres-cm.org");
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
      if (res.data.user.role !== "surveyor")
        throw new Error("Unauthorized: Surveyor access only");
      localStorage.setItem("surveyor_token", res.data.token);
      localStorage.setItem("surveyor_id", res.data.user.id);
      localStorage.setItem("surveyor_name", res.data.user.fullName);
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
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <MapPin size={32} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Surveyor Portal
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8">
          Sign in to the TerraVerify verification network
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
              className="w-full bg-slate-50 border-0 p-4 rounded-xl focus:ring-2 focus:ring-amber-100 outline-none transition-all"
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
              className="w-full bg-slate-50 border-0 p-4 rounded-xl focus:ring-2 focus:ring-amber-100 outline-none transition-all"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-xl font-semibold transition-colors shadow-sm shadow-amber-200"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const surveyorName = localStorage.getItem("surveyor_name");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const r = await api.get("/verifications");
      setRequests(r.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("surveyor_token");
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("surveyor_token");
    navigate("/login");
  };

  const filteredRequests = requests.filter((r) => {
    const isPending = ["submitted", "under_review"].includes(r.status);
    if (activeTab === "pending" && !isPending) return false;
    if (activeTab === "completed" && isPending) return false;
    return (
      r.landTitleNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.sellerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans">
      <header className="bg-white border-b border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] px-10 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-tr from-amber-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-sm shadow-amber-200">
            <MapPin size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">
              TerraVerify Cadastral Verification
            </h1>
            <p className="text-slate-500 text-sm">Certified Surveyor Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-slate-600 font-medium">
            Hello, {surveyorName?.split(" ")[0]}
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "pending" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Pending Tasks (
              {
                requests.filter((r) =>
                  ["submitted", "under_review"].includes(r.status),
                ).length
              }
              )
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "completed" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Completed (
              {
                requests.filter((r) =>
                  ["approved", "rejected"].includes(r.status),
                ).length
              }
              )
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Title Number..."
              className="pl-11 pr-4 py-3 bg-white shadow-sm border border-slate-100 rounded-xl w-72 text-sm focus:ring-2 focus:ring-amber-100 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <FileQuestion size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              No Requests Found
            </h3>
            <p className="text-slate-500 text-center max-w-md">
              There are currently no verification requests in this category.
              Kick back and relax.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/review/${req.id}`)}
                className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      {req.landTitleNumber}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin size={14} /> {req.subdivision}, {req.region}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${
                      req.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : req.status === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {req.status === "submitted"
                      ? "PENDING"
                      : req.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-50">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Seller
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {req.sellerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Surface Area
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {req.surfaceAreaSqM} m²
                    </p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                      Review <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ReviewScreen() {
  const navigate = useNavigate();
  const requestId = window.location.pathname.split("/").pop();
  const [req, setReq] = useState<Request | null>(null);
  const [land, setLand] = useState<Land | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const surveyorId = localStorage.getItem("surveyor_id");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [r, l] = await Promise.all([
        api.get("/verifications"),
        api.get("/lands"),
      ]);
      const foundReq = r.data.find((x: Request) => x.id === requestId);
      setReq(foundReq);
      if (foundReq) {
        setNotes(foundReq.surveyorNotes || "");
        const foundLand = l.data.find((x: Land) => x.id === foundReq.landId);
        setLand(foundLand);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (status: "approved" | "rejected") => {
    if (!notes && status === "rejected") {
      return alert("Surveyor notes are strictly required for a rejection.");
    }
    if (
      !confirm(
        `Are you sure you want to mark this title as ${status.toUpperCase()}?`,
      )
    )
      return;

    setSubmitting(true);
    try {
      await api.put(`/verifications/${requestId}/status`, {
        status,
        surveyorNotes: notes,
        surveyorId,
      });
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to update verification status.");
      setSubmitting(false);
    }
  };

  if (!req)
    return <div className="p-20 text-center">Loading verification data...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <header className="bg-white border-b border-slate-100 px-10 py-4 z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">
              Verification Report
            </h1>
            <p className="text-slate-500 text-sm">Dossier ID: {req.id}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          {/* Header Info */}
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <p className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-1">
                Land Title Number
              </p>
              <h2 className="text-3xl font-black text-slate-800">
                {req.landTitleNumber}
              </h2>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold tracking-wide shadow-sm ${
                req.status === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : req.status === "rejected"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}
            >
              {req.status === "submitted"
                ? "PENDING"
                : req.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="p-8 grid grid-cols-2 gap-8">
            {/* Details Col */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Location
                </h3>
                <p className="font-semibold text-slate-700 text-lg flex items-center gap-2">
                  <MapPin size={18} className="text-amber-500" /> {req.region}
                </p>
                <p className="text-slate-500">
                  {req.division}, {req.subdivision}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Property Description
                </h3>
                <p className="text-slate-700 font-medium">
                  {land?.title || "Loading..."}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Seller Contact
                </h3>
                <p className="text-slate-700 font-medium">{req.sellerName}</p>
                <p className="text-slate-500">{req.sellerPhone}</p>
              </div>
            </div>

            {/* Documents & Action Col */}
            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-amber-500" /> Verification
                Documents
              </h3>
              {/* Mock Docs since actual docs are in a separate table */}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition-colors">
                  <span className="font-semibold text-slate-700 text-sm">
                    Titre Foncier (PDF)
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition-colors">
                  <span className="font-semibold text-slate-700 text-sm">
                    Plan de Bornage (PDF)
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>

              {req.status === "submitted" || req.status === "under_review" ? (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">
                    Official Surveyor Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your field findings, coordinate cross-checks, and boundary observations..."
                    className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 resize-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      disabled={submitting}
                      onClick={() => handleAction("rejected")}
                      className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 p-3 rounded-xl font-bold transition-colors"
                    >
                      Reject Title
                    </button>
                    <button
                      disabled={submitting}
                      onClick={() => handleAction("approved")}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 p-3 rounded-xl font-bold transition-colors shadow-sm shadow-emerald-200"
                    >
                      Approve Title
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">
                    Final Surveyor Notes
                  </h3>
                  <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200">
                    {req.surveyorNotes || "No notes provided."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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

// Simple ChevronRight icon component missing in lucide import
const ChevronRight = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default App;
