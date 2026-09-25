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
  FileText,
  MapPin,
  Search,
  LogOut,
  FileQuestion,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  LayoutDashboard,
  Building,
  User,
  ChevronRight,
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
            Professional <br />
            <span className="font-semibold text-blue-400">Cadastral Verification</span>
          </h1>
          <p className="text-slate-400 mt-6 max-w-md text-lg">
            Secure, efficient, and standardized land title validation for certified surveyors.
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
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Surveyor Portal</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in with your official credentials</p>

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
                  Sign In to Dashboard
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
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("surveyor_token");
    navigate("/login");
  };

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
        <button
          onClick={() => navigate("/dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            location.pathname === "/dashboard"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="font-medium text-sm">Dashboard</span>
        </button>
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
function Topbar() {
  const surveyorName = localStorage.getItem("surveyor_name") || "Surveyor";
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-800">Surveyor Portal</h1>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900">{surveyorName}</p>
          <p className="text-xs text-slate-500">Certified Land Surveyor</p>
        </div>
        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
          {surveyorName.charAt(0)}
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

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

  const filteredRequests = requests.filter((r) => {
    const isPending = ["submitted", "under_review"].includes(r.status);
    if (activeTab === "pending" && !isPending) return false;
    if (activeTab === "completed" && isPending) return false;
    return (
      r.landTitleNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.sellerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const pendingCount = requests.filter((r) => ["submitted", "under_review"].includes(r.status)).length;
  const completedCount = requests.filter((r) => ["approved", "rejected"].includes(r.status)).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Stats Overview */}
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

          {/* Main Content Area */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "pending"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "completed"
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
        </main>
      </div>
    </div>
  );
}

function ReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.pathname.split("/").pop();
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
      const r = await api.get("/verifications");
      const foundReq = r.data.find((x: Request) => x.id === requestId);
      setReq(foundReq);
      if (foundReq) {
        setNotes(foundReq.surveyorNotes || "");
        // Fetch specific land details (since /lands might only return published ones)
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
        surveyorId,
      });
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to update verification status.");
      setSubmitting(false);
    }
  };

  if (!req)
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading verification data...
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Review Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
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
          {req.status === "submitted" || req.status === "under_review" ? (
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
                    <p className="font-medium text-slate-900">{req.surfaceAreaSqM} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Region</p>
                    <p className="font-medium text-slate-900">{req.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Division / Subdivision</p>
                    <p className="font-medium text-slate-900">{req.division}, {req.subdivision}</p>
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
                {req.status === "submitted" || req.status === "under_review" ? (
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
                  <User size={18} className="text-slate-400" /> Applicant / Seller
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
