import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setCredentials } from './store';
import { DashboardLayout } from './layouts/DashboardLayout';
import api from './services/api';
import { 
  ShieldAlert, Landmark, QrCode, ClipboardList, 
  Users, CheckCircle2, AlertCircle, Plus, 
  DollarSign, Sparkles, Bot, Send, Settings, X
} from 'lucide-react';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlugForm] = useState('lotus-heights');
  const [complaintError, setComplaintError] = useState<string | null>(null);
  const [activeComment, setActiveComment] = useState<{ [complaintId: string]: string }>({});

  // Society Registration states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regTenantName, setRegTenantName] = useState('');
  const [regTenantSlug, setRegTenantSlug] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTier, setRegTier] = useState<'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('BASIC');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Common Business States
  const [stats, setStats] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [flats, setFlats] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Interactive Action Forms
  const [newResident, setNewResident] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', flatId: '', ownershipStatus: 'OWNER' });
  const [newVisitor, setNewVisitor] = useState({ name: '', phoneNumber: '', visitorType: 'GUEST', vehicleNumber: '', company: '', purpose: 'Friend Visit' });
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', priority: 'MEDIUM', staffId: '' });
  const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'GENERAL' });
  const [newBilling, setNewBilling] = useState({ baseAmount: 2500, periodStart: '2026-05-01', periodEnd: '2026-05-31' });
  const [newStaff, setNewStaff] = useState({ firstName: '', lastName: '', phoneNumber: '', type: 'Guard', salaryMonthly: 15000, shiftStart: '08:00', shiftEnd: '20:00', email: '' });

  // Flat generator configurations
  const [flatGen, setFlatGen] = useState({ wingName: '', floorsCount: 5, flatsPerFloor: 4, flatType: '2BHK' });
  const [buildingId, setBuildingId] = useState('');

  // Scan & Verify Sandbox
  const [scannedPass, setScannedPass] = useState<any>(null);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Payment UPI Simulator
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [upiLoading, setUpiLoading] = useState(false);

  // SOS Guard alert state
  const [sosActive, setSosActive] = useState(false);

  // AI Chatbot & Tenant Settings States
  const [settings, setSettings] = useState({ aiEnabled: false, aiProvider: 'GEMINI', hasApiKey: false });
  const [aiApiKey, setAiApiKey] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch view-specific metrics
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const statsRes = await api.getDashboardStats();
      if (statsRes.success) setStats(statsRes.data);

      if (user.role === 'Super Admin') {
        setLoading(false);
        return;
      }

      // Role-specific API Loading to align with backend RBAC boundaries
      const isSaaSAdmin = user.role === 'Society Admin';
      const isCommittee = user.role === 'Committee Member';
      const isResident = user.role === 'Resident';
      const isGuard = user.role === 'Security Guard';
      const isStaff = user.role === 'Maintenance Staff';

      // Residents directory
      if (isSaaSAdmin || isCommittee) {
        const resDir = await api.getResidents();
        if (resDir.success) setResidents(resDir.data);
      }

      // General visitor history
      if (isSaaSAdmin || isCommittee || isGuard) {
        const logsRes = await api.getVisitorLogs();
        if (logsRes.success) setVisitorLogs(logsRes.data);
      }

      // Complaints hub
      if (isSaaSAdmin || isCommittee || isResident || isStaff) {
        const compRes = await api.getComplaints();
        if (compRes.success) setComplaints(compRes.data);
      }

      // Maintenance Billing
      if (isSaaSAdmin || isCommittee || isResident) {
        const invRes = await api.getInvoices();
        if (invRes.success) setInvoices(invRes.data);
      }

      // Notice Board (All roles have access)
      const noticeRes = await api.getNotices();
      if (noticeRes.success) setNotices(noticeRes.data);

      // Flats mapping (All roles have access)
      const flatsRes = await api.getFlats();
      if (flatsRes.success) setFlats(flatsRes.data);

      // Staff directory (Society Admins can manage, Residents can view to assign tickets)
      if (isSaaSAdmin || isResident) {
        const staffRes = await api.getStaff();
        if (staffRes.success) setStaff(staffRes.data);
      }

      // Society layouts (All roles have access)
      const societyRes = await api.getSociety();
      if (societyRes.success && societyRes.data?.buildings?.[0]) {
        setBuildingId(societyRes.data.buildings[0].id);
      }

      // Resident personal pre-approvals
      if (isResident) {
        const myApprovals = await api.getMyPreApprovals();
        if (myApprovals.success) setVisitors(myApprovals.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success) {
        setSettings(res.data);
        if (res.data.hasApiKey) {
          setAiApiKey('••••••••••••••••••••••••••••••••');
        } else {
          setAiApiKey('');
        }
      }
    } catch (e) {
      console.error('Failed to load tenant settings:', e);
    }
  };

  useEffect(() => {
    loadData();
    if (user && user.role !== 'Super Admin') {
      loadSettings();
    }
  }, [user, localStorage.getItem('tenantSlug')]);

  // Demo Account Quick log in shortcut
  const handleQuickLogin = async (role: string) => {
    setLoginError(null);
    let credentials = { email: '', password: 'welcome123', tenantSlug: 'lotus-heights' };

    switch (role) {
      case 'Super Admin':
        credentials = { email: 'superadmin@saassociety.com', password: 'superadmin123', tenantSlug: '' };
        break;
      case 'Society Admin':
        credentials = { email: 'admin@saassociety.com', password: 'welcome123', tenantSlug: 'lotus-heights' };
        break;
      case 'Resident':
        credentials = { email: 'resident@saassociety.com', password: 'welcome123', tenantSlug: 'lotus-heights' };
        break;
      case 'Security Guard':
        credentials = { email: 'guard@saassociety.com', password: 'welcome123', tenantSlug: 'lotus-heights' };
        break;
    }

    try {
      const res = await api.login(credentials);
      if (res.success) {
        dispatch(setCredentials(res.data));
        setActiveTab('dashboard');
      }
    } catch (e: any) {
      setLoginError(e.message || 'Login failed');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await api.login({ email, password, tenantSlug });
      if (res.success) {
        dispatch(setCredentials(res.data));
        setActiveTab('dashboard');
      }
    } catch (e: any) {
      setLoginError(e.message || 'Invalid Credentials. Try welcome123');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setRegSuccess(null);
    try {
      const res = await api.signup({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        phoneNumber: regPhone,
        tenantName: regTenantName,
        tenantSlug: regTenantSlug,
        subscriptionTier: regTier
      });
      if (res.success) {
        setRegSuccess(`Society "${regTenantName}" registered successfully! You can now log in using your admin credentials.`);
        setIsRegistering(false);
        setTenantSlugForm(regTenantSlug);
        setEmail(regEmail);
        setPassword(regPassword);
      }
    } catch (e: any) {
      setLoginError(e.message || 'Registration failed. Subdomain slug might be taken.');
    }
  };

  // Onboard Resident form action
  const handleOnboardResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.flatId) {
      alert('Please select a valid flat from the dropdown list.');
      return;
    }
    try {
      const res = await api.onboardResident(newResident);
      if (res.success) {
        setNewResident({ firstName: '', lastName: '', email: '', phoneNumber: '', flatId: '', ownershipStatus: 'OWNER' });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOnboardStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.onboardStaff(newStaff);
      if (res.success) {
        alert(res.message || 'Staff member onboarded successfully!');
        setNewStaff({ firstName: '', lastName: '', phoneNumber: '', type: 'Guard', salaryMonthly: 15000, shiftStart: '08:00', shiftEnd: '20:00', email: '' });
        loadData();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to onboard staff member.');
    }
  };

  const handleBatchGenerateFlats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let bId = buildingId;
      if (!bId) {
        const societyRes = await api.getSociety();
        if (societyRes.success && societyRes.data?.buildings?.[0]) {
          bId = societyRes.data.buildings[0].id;
          setBuildingId(bId);
        }
      }

      if (!bId) {
        alert('Society layout building tower not found. Please sync seeds.');
        return;
      }

      const res = await api.batchGenerateFlats({
        buildingId: bId,
        wingName: flatGen.wingName,
        floorsCount: Number(flatGen.floorsCount),
        flatsPerFloor: Number(flatGen.flatsPerFloor),
        flatType: flatGen.flatType,
      });

      if (res.success) {
        alert(`Successfully generated Wing ${flatGen.wingName} containing ${res.data.flatsCount || res.data.flats?.length || 0} flats directly in PostgreSQL!`);
        setFlatGen({ wingName: '', floorsCount: 5, flatsPerFloor: 4, flatType: '2BHK' });
        loadData(); // Refresh list immediately!
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to generate flats.');
    }
  };

  // Generate Invoices form action
  const handleGenerateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.generateMonthlyInvoices(newBilling);
      if (res.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Notice form action
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createNotice(newNotice);
      if (res.success) {
        setNewNotice({ title: '', content: '', category: 'GENERAL' });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-approve Visitor pass action
  const handlePreApproveVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.preApproveVisitor({
        ...newVisitor,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      if (res.success) {
        setNewVisitor({ name: '', phoneNumber: '', visitorType: 'GUEST', vehicleNumber: '', company: '', purpose: 'Friend Visit' });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // File Complaint action
  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintError(null);
    try {
      const res = await api.raiseComplaint(newComplaint);
      if (res.success) {
        setNewComplaint({ title: '', description: '', priority: 'MEDIUM', staffId: '' });
        loadData();
      } else {
        if (res.errors && Array.isArray(res.errors)) {
          const errMsg = res.errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          setComplaintError(`Validation error: ${errMsg}`);
        } else {
          setComplaintError(res.message || 'Failed to file complaint ticket.');
        }
      }
    } catch (err: any) {
      setComplaintError(err.message || 'An unexpected error occurred.');
    }
  };

  // Assign a technician to a complaint
  const handleAssignStaff = async (complaintId: string, staffId: string) => {
    if (!staffId) return;
    try {
      const res = await api.assignStaff(complaintId, staffId);
      if (res.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update complaint ticket status
  const handleUpdateStatus = async (complaintId: string, status: string) => {
    try {
      const res = await api.updateComplaintStatus(complaintId, status);
      if (res.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Post a comment update
  const handlePostComment = async (complaintId: string) => {
    const comment = activeComment[complaintId];
    if (!comment || !comment.trim()) return;
    try {
      const res = await api.addComplaintComment(complaintId, comment);
      if (res.success) {
        setActiveComment({ ...activeComment, [complaintId]: '' });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Tenant Custom branding and AI settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess(null);
    setSettingsError(null);
    try {
      const res = await api.updateSettings({
        aiEnabled: settings.aiEnabled,
        aiProvider: settings.aiProvider,
        aiApiKey: aiApiKey === '••••••••••••••••••••••••••••••••' ? null : aiApiKey,
      });
      if (res.success) {
        setSettingsSuccess('Society settings updated successfully!');
        loadSettings();
      } else {
        setSettingsError(res.message || 'Failed to update settings');
      }
    } catch (error: any) {
      setSettingsError(error.message || 'Error occurred while saving settings');
    }
    setSettingsLoading(false);
  };

  // Send message to AI assistant
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    const newHistory = [...chatHistory, { role: 'user', text: userMessage }];
    setChatHistory(newHistory);
    setChatLoading(true);

    try {
      const res = await api.chatWithAI({
        message: userMessage,
        history: chatHistory,
      });

      if (res.success) {
        setChatHistory([...newHistory, { role: 'model', text: res.data.response }]);
      } else {
        setChatHistory([...newHistory, { role: 'model', text: `Error: ${res.message || 'Failed to compile response.'}` }]);
      }
    } catch (error: any) {
      setChatHistory([...newHistory, { role: 'model', text: `Error: ${error.message || 'Failed to connect to AI server.'}` }]);
    }
    setChatLoading(false);
  };

  // Scan & Verify pass
  const handleScanPass = async () => {
    setScannerError(null);
    setScannedPass(null);
    try {
      const res = await api.verifyPass(qrCodeInput.trim());
      if (res.success) {
        setScannedPass(res.data);
      }
    } catch (e: any) {
      setScannerError('Invalid passcode or expired visitor credentials.');
    }
  };

  // Guard logs guest entry
  const handleCheckInGuest = async (visitorId: string) => {
    try {
      const res = await api.checkInVisitor({
        visitorId,
        flatId: scannedPass?.resident?.flatId || '00000000-0000-0000-0000-000000000000',
        notes: 'Checked in at Main Security Gate A',
      });
      if (res.success) {
        setScannedPass(null);
        setQrCodeInput('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Guard logs guest exit
  const handleCheckOutGuest = async (logId: string) => {
    try {
      const res = await api.checkOutVisitor(logId);
      if (res.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resident deletes/revokes a pass
  const handleDeletePass = async (passId: string) => {
    try {
      const res = await api.deleteVisitorPass(passId);
      if (res.success) {
        setVisitors((prev) => prev.filter((v: any) => v.id !== passId));
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pay maintenance simulated transaction
  const handlePayInvoice = async () => {
    if (!selectedInvoice) return;
    setUpiLoading(true);
    setTimeout(async () => {
      try {
        const res = await api.payInvoice({
          invoiceId: selectedInvoice.id,
          amount: selectedInvoice.totalAmount,
          paymentMethod: 'UPI',
        });
        if (res.success) {
          setSelectedInvoice(null);
          loadData();
        }
      } catch (e) {
        console.error(e);
      }
      setUpiLoading(false);
    }, 1500);
  };

  // Unauthenticated Login / Registration Screen
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-dark-bg relative overflow-hidden font-sans">
        {/* Neon Glow Circles in background */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl z-10 border border-white/10 shadow-glass">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              SaaS Society
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              {isRegistering ? 'Register Your Apartment Complex' : 'Apartment and Housing Management Gateway'}
            </p>
          </div>

          {regSuccess && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{regSuccess}</span>
            </div>
          )}

          {loginError && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Society Slug</label>
                <input
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlugForm(e.target.value)}
                  placeholder="e.g. lotus-heights"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Access Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-neon-green transition-all duration-300"
              >
                Secure Login
              </button>

              <p className="text-center text-xs text-slate-400 mt-2">
                Need a new workspace?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setLoginError(null); }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Create New Society
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Society Name</label>
                <input
                  type="text"
                  value={regTenantName}
                  onChange={(e) => setRegTenantName(e.target.value)}
                  placeholder="e.g. Lotus Heights"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subdomain Slug</label>
                <input
                  type="text"
                  value={regTenantSlug}
                  onChange={(e) => setRegTenantSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. lotus-heights"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Admin name"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin@society.com"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Phone</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">License Tier</label>
                <select
                  value={regTier}
                  onChange={(e) => setRegTier(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                >
                  <option value="BASIC">BASIC (Up to 250 Residents)</option>
                  <option value="PREMIUM">PREMIUM (Up to 1000 Residents)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Up to 5000 Residents)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl shadow-neon-green transition-all duration-300 text-xs"
              >
                Register & Initialize Workspace
              </button>

              <p className="text-center text-xs text-slate-400 mt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setLoginError(null); }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Login to Workspace
                </button>
              </p>
            </form>
          )}

          {/* Quick login sandboxes drawer */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Demo Sandboxes</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('Super Admin')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-xs font-bold transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Super Admin</span>
              </button>
              <button
                onClick={() => handleQuickLogin('Society Admin')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-xs font-bold transition-all duration-200"
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>Society Admin</span>
              </button>
              <button
                onClick={() => handleQuickLogin('Resident')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-xs font-bold transition-all duration-200"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Resident</span>
              </button>
              <button
                onClick={() => handleQuickLogin('Security Guard')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-xs font-bold transition-all duration-200"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
                <span>Gate Guard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Master layouts with Tab routing panels
  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className={loading ? "opacity-60 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
      
      {/* ======================================================================
          SUBVIEW 1: GENERAL STATS / MAIN DASHBOARD
          ====================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          
          {/* Active SOS panel if Guard triggers panic */}
          {sosActive && (
            <div className="p-6 bg-red-500/10 border border-red-500/40 rounded-3xl animate-pulse flex flex-col sm:flex-row items-center gap-4 glow-border-danger">
              <div className="p-3 bg-red-500 rounded-full shadow-lg">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-red-500">CRITICAL EMERGENCY SOS TRIGGERED!</h3>
                <p className="text-xs text-slate-300 mt-1">Siren alert broadcasted at gate. Emergency services and committee members notified.</p>
              </div>
              <button 
                onClick={() => setSosActive(false)}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl"
              >
                Deactivate Alarm
              </button>
            </div>
          )}

          {/* SUPER ADMIN CONSOLE PANELS */}
          {stats?.view === 'SUPER_ADMIN' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Registered Tenants</span>
                    <p className="text-3xl font-extrabold text-white mt-2">{stats.stats.totalTenants}</p>
                  </div>
                  <Landmark className="w-10 h-10 text-emerald-400 opacity-60" />
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active SaaS Systems</span>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.stats.activeTenants}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-60" />
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan Subscriptions Tier</span>
                    <p className="text-lg font-extrabold text-white mt-2">BASIC / ENTERPRISE</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-cyan-400 opacity-60" />
                </div>
              </div>

              {/* Tenants list table */}
              <div className="glass-panel rounded-2xl border border-white/5 p-6 mt-4">
                <h3 className="text-lg font-bold text-white mb-4">SaaS Multi-Tenant Database Allocation</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Tenant Name</th>
                        <th className="py-3 px-4">URL Subdomain slug</th>
                        <th className="py-3 px-4">Primary Theme color</th>
                        <th className="py-3 px-4">SaaS Service Status</th>
                        <th className="py-3 px-4">Database Bounds</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.tenants?.map((t: any) => (
                        <tr key={t.id} className="hover:bg-white/5 transition-all">
                          <td className="py-4 px-4 font-bold text-white">{t.name}</td>
                          <td className="py-4 px-4 text-emerald-400 font-medium">/{t.slug}</td>
                          <td className="py-4 px-4"><span className="inline-block w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.themePrimary }} /></td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ACTIVE
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-slate-500">{t.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SOCIETY ADMIN CONSOLE PANELS */}
          {stats?.view === 'SOCIETY_ADMIN' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Residents Onboarded</span>
                    <p className="text-3xl font-extrabold text-white mt-1.5">{stats.stats.residentsCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-emerald-400 opacity-60" />
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unresolved Tickets</span>
                    <p className="text-3xl font-extrabold text-red-400 mt-1.5">{stats.stats.openComplaints}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-red-400 opacity-60" />
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Guards</span>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-1.5">{stats.stats.guardsCount}</p>
                  </div>
                  <ShieldAlert className="w-8 h-8 text-cyan-400 opacity-60" />
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visitor Entries Today</span>
                    <p className="text-3xl font-extrabold text-white mt-1.5">{stats.stats.visitorsTodayCount}</p>
                  </div>
                  <QrCode className="w-8 h-8 text-slate-400 opacity-60" />
                </div>
              </div>

              {/* Invoicing summary billing board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4">Financial Ledger Collections</h3>
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-slate-400">Total Billed Invoices</span>
                      <span className="font-bold text-white">₹{stats.stats.financials.totalBilled}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-slate-400">Total Collected Digital Payments</span>
                      <span className="font-bold text-emerald-400">₹{stats.stats.financials.totalCollected}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Ledger Outstanding Balance</span>
                      <span className="font-bold text-red-400">₹{stats.stats.financials.outstanding}</span>
                    </div>

                    {/* Progress collections ratio */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Collections Ratio</span>
                        <span>
                          {stats.stats.financials.totalBilled > 0 
                            ? ((stats.stats.financials.totalCollected / stats.stats.financials.totalBilled) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                          style={{ 
                            width: `${stats.stats.financials.totalBilled > 0 
                              ? (stats.stats.financials.totalCollected / stats.stats.financials.totalBilled) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions box */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Admin Fast Commands</h3>
                    <p className="text-xs text-slate-400">Directly execute tenant operations from the control room.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => setActiveTab('residents')} className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/5 rounded-xl text-xs font-bold text-slate-200 transition-all">
                      Add Resident Flat
                    </button>
                    <button onClick={() => setActiveTab('billing')} className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/5 rounded-xl text-xs font-bold text-slate-200 transition-all">
                      Generate billing
                    </button>
                    <button onClick={() => setActiveTab('complaints')} className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/5 rounded-xl text-xs font-bold text-slate-200 transition-all">
                      Escalate Complaints
                    </button>
                    <button onClick={() => setActiveTab('notices')} className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/5 rounded-xl text-xs font-bold text-slate-200 transition-all">
                      Publish Notice board
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESIDENT PORTAL CONSOLE PANELS */}
          {stats?.view === 'RESIDENT' && (
            <div className="flex flex-col gap-6">
              {/* Profile Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    {user?.firstName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                        Flat Number: {stats.flatDetails?.number || 'A-101'}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide bg-slate-800 text-slate-300">
                        Type: {stats.flatDetails?.type || '3BHK'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Micro Personal Stats widgets */}
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 border-r border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">My Complaints</span>
                    <span className="text-xl font-extrabold text-white mt-1 block">{stats.stats.myComplaintsCount}</span>
                  </div>
                  <div className="text-center px-4 py-2 border-r border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visitor Passes</span>
                    <span className="text-xl font-extrabold text-cyan-400 mt-1 block">{stats.stats.myVisitorPassesCount}</span>
                  </div>
                  <div className="text-center px-4 py-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Bills</span>
                    <span className="text-xl font-extrabold text-red-400 mt-1 block">{stats.stats.myPendingBillsCount}</span>
                  </div>
                </div>
              </div>

              {/* Quick links to actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <button onClick={() => setActiveTab('visitors')} className="p-6 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left flex flex-col justify-between h-40 transition-all duration-300 shadow-sm">
                  <QrCode className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white text-base">Generate Visitor QR Pass</h4>
                    <p className="text-xs text-slate-400 mt-1">Pre-approve friends, cab drivers or delivery drivers.</p>
                  </div>
                </button>
                <button onClick={() => setActiveTab('complaints')} className="p-6 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-2xl text-left flex flex-col justify-between h-40 transition-all duration-300 shadow-sm">
                  <ClipboardList className="w-8 h-8 text-cyan-400" />
                  <div>
                    <h4 className="font-bold text-white text-base">Raise Complaint ticket</h4>
                    <p className="text-xs text-slate-400 mt-1">File maintenance requests with automatic AI classification.</p>
                  </div>
                </button>
                <button onClick={() => setActiveTab('billing')} className="p-6 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-yellow-500/30 rounded-2xl text-left flex flex-col justify-between h-40 transition-all duration-300 shadow-sm">
                  <Landmark className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h4 className="font-bold text-white text-base">UPI Bills & Invoices</h4>
                    <p className="text-xs text-slate-400 mt-1">Pay society maintenance charges through sandbox scans.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* GATE GUARD CONSOLE APP VIEW */}
          {user.role === 'Security Guard' && (
            <div className="flex flex-col gap-6">
              
              {/* Emergency SOS Alarm Trigger panel */}
              <div className="glass-panel p-6 rounded-3xl border border-red-500/20 text-center flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-slate-900/60 to-red-950/10">
                <div className="p-4 bg-red-600 hover:bg-red-500 rounded-full cursor-pointer shadow-neon-cyan animate-bounce" onClick={() => setSosActive(true)}>
                  <ShieldAlert className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-500">EMERGENCY SOS SIREN ACTUATOR</h3>
                  <p className="text-xs text-slate-400 mt-1">Click above in case of fire, threat, or medical emergency. Alerts all resident devices instantly.</p>
                </div>
              </div>

              {/* QR Gate Checker scanner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-3">Gate QR Entry Scanner Simulator</h3>
                  <p className="text-xs text-slate-400 mb-4">Input pre-approved pass code to verify visitor identity.</p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. PASS-LOTA-RAM2"
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                    />
                    <button onClick={handleScanPass} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md">
                      Scan Pass
                    </button>
                  </div>

                  {scannerError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{scannerError}</span>
                    </div>
                  )}

                  {/* Render verified guest pass profile */}
                  {scannedPass && (
                    <div className="mt-6 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <div>
                          <h4 className="font-bold text-white text-sm">{scannedPass.name}</h4>
                          <span className="text-[10px] text-slate-400">{scannedPass.phoneNumber}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {scannedPass.visitorType}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-3 text-xs text-slate-300">
                        <p><strong>Flat Bound:</strong> {scannedPass?.resident?.flat?.number || 'N/A'} (Resident pre-approved)</p>
                        {scannedPass.vehicleNumber && <p><strong>Vehicle Plaque:</strong> {scannedPass.vehicleNumber}</p>}
                        {scannedPass.company && <p><strong>Provider:</strong> {scannedPass.company}</p>}
                      </div>

                      <button
                        onClick={() => handleCheckInGuest(scannedPass.id)}
                        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                      >
                        Approve and Check In Entry
                      </button>
                    </div>
                  )}
                </div>

                {/* Registry overview */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-3">Live Gate Activity Logs</h3>
                  <div className="flex flex-col gap-3 mt-2 max-h-60 overflow-y-auto">
                    {visitorLogs.map((log: any) => (
                      <div key={log.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-white block">{log.visitor.name}</span>
                          <span className="text-[10px] text-slate-500">Target Flat: {log.flat.number}</span>
                        </div>
                        {log.checkedOutAt ? (
                          <span className="text-slate-500 font-semibold">Departed</span>
                        ) : (
                          <button
                            onClick={() => handleCheckOutGuest(log.id)}
                            className="px-3 py-1 bg-rose-500/15 border border-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-[10px] font-bold"
                          >
                            Mark Out
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================================
          SUBVIEW 2: RESIDENTS DIRECTORY
          ====================================================================== */}
      {activeTab === 'residents' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Resident Listings Table */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Society Occupants Directory</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Resident Name</th>
                    <th className="py-3 px-4">Flat Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Emergency contacts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {residents.map((r: any) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-all text-xs">
                      <td className="py-4 px-4 font-semibold text-white">
                        {r.user.firstName} {r.user.lastName}
                        <span className="block text-[10px] text-slate-500">{r.user.email}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400">{r.flat?.number || 'A-101'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          r.ownershipStatus === 'OWNER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {r.ownershipStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-400">
                        {r.emergencyContacts?.[0]?.name || ' Vikram Sharma'} ({r.emergencyContacts?.[0]?.relation || 'Brother'})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Onboard Resident & Flat Generator Sidebar panels (Society Admin only) */}
          {user.role === 'Society Admin' && (
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 self-start">
              {/* Panel 1: Onboard Resident */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Onboard New Flat Resident</h3>
                <form onSubmit={handleOnboardResident} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={newResident.firstName}
                      onChange={(e) => setNewResident({ ...newResident, firstName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={newResident.lastName}
                      onChange={(e) => setNewResident({ ...newResident, lastName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newResident.email}
                      onChange={(e) => setNewResident({ ...newResident, email: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newResident.phoneNumber}
                      onChange={(e) => setNewResident({ ...newResident, phoneNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ownership Bound</label>
                    <select
                      value={newResident.ownershipStatus}
                      onChange={(e) => setNewResident({ ...newResident, ownershipStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="TENANT">TENANT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Flat Assignment</label>
                    <select
                      required
                      value={newResident.flatId}
                      onChange={(e) => setNewResident({ ...newResident, flatId: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Select Flat...</option>
                      {flats.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.number} ({f.type})</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                    Register Occupant
                  </button>
                </form>
              </div>

              {/* Panel 2: Batch Flat Generator */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Batch Flat Generator</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">Generate all flat numbers for a new wing/tower in one click directly in PostgreSQL.</p>
                
                <form onSubmit={handleBatchGenerateFlats} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Wing Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wing A"
                      value={flatGen.wingName}
                      onChange={(e) => setFlatGen({ ...flatGen, wingName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Floor Count</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={flatGen.floorsCount}
                        onChange={(e) => setFlatGen({ ...flatGen, floorsCount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Flats per Floor</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={flatGen.flatsPerFloor}
                        onChange={(e) => setFlatGen({ ...flatGen, flatsPerFloor: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Flat BHK Type</label>
                    <select
                      value={flatGen.flatType}
                      onChange={(e) => setFlatGen({ ...flatGen, flatType: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="1BHK">1 BHK</option>
                      <option value="4BHK">4 BHK</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                    Generate Flats in DB
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          SUBVIEW 3: VISITOR REGISTRY
          ====================================================================== */}
      {activeTab === 'visitors' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5">
            {user.role === 'Resident' ? (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">My Pre-Approved Visitor Passes</h3>
                {visitors.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No active pre-approved passes found. Generate one using the form on the right!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {visitors.map((v: any) => (
                      <div key={v.id} className="p-4 bg-slate-950 border border-white/5 rounded-xl text-center flex flex-col justify-between">
                        <div>
                          <span className="inline-block text-[9px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 mb-2">
                            {v.visitorType} - {v.name}
                          </span>
                          {v.phoneNumber && (
                            <p className="text-xs text-slate-400 mb-1">Phone: {v.phoneNumber}</p>
                          )}
                          {v.vehicleNumber && (
                            <p className="text-xs text-slate-400 mb-1">Vehicle: {v.vehicleNumber}</p>
                          )}
                          
                          {/* Simulation QR image */}
                          <div className="w-28 h-28 mx-auto my-3 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${v.qrCode}`} alt="Visitor pass QR" className="w-full h-full" />
                          </div>
                          
                          <p className="text-[10px] text-slate-400">Pass Code: <strong className="text-emerald-400">{v.qrCode}</strong></p>
                          <p className="text-[9px] text-slate-500 mt-1">Present to guard at main gate A</p>
                        </div>
                        
                        <button
                          onClick={() => handleDeletePass(v.id)}
                          className="mt-4 w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold py-2 rounded-xl text-xs transition-all"
                        >
                          Revoke / Delete Pass
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Gate Visitor Registry Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Visitor</th>
                        <th className="py-3 px-4">Flat Bound</th>
                        <th className="py-3 px-4">Gate In Timings</th>
                        <th className="py-3 px-4">Gate Out Timings</th>
                        <th className="py-3 px-4">Pass Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {visitorLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-all text-xs">
                          <td className="py-4 px-4 font-semibold text-white">
                            {log.visitor.name}
                            <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 text-[9px] font-bold">{log.visitor.visitorType} {log.visitor.company ? `(${log.visitor.company})` : ''}</span>
                          </td>
                          <td className="py-4 px-4 font-bold text-cyan-400">{log.flat?.number || 'A-101'}</td>
                          <td className="py-4 px-4 text-slate-300 font-mono">{new Date(log.checkedInAt).toLocaleTimeString()}</td>
                          <td className="py-4 px-4 font-mono">
                            {log.checkedOutAt ? (
                              <span className="text-slate-500">{new Date(log.checkedOutAt).toLocaleTimeString()}</span>
                            ) : (
                              <span className="text-yellow-500 font-bold uppercase text-[9px] tracking-wider animate-pulse">Inside</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              log.checkedOutAt ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {log.checkedOutAt ? 'Checked out' : 'active inside'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pre-approve Guest Card (Residents only) */}
          {user.role === 'Resident' && (
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Pre-Approve Visitor pass</h3>
                <form onSubmit={handlePreApproveVisitor} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Guest Full Name</label>
                    <input
                      type="text"
                      required
                      value={newVisitor.name}
                      onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newVisitor.phoneNumber}
                      onChange={(e) => setNewVisitor({ ...newVisitor, phoneNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Visitor Type</label>
                      <select
                        value={newVisitor.visitorType}
                        onChange={(e) => setNewVisitor({ ...newVisitor, visitorType: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="GUEST">GUEST</option>
                        <option value="DELIVERY">DELIVERY</option>
                        <option value="CAB">CAB</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle Plaque</label>
                      <input
                        type="text"
                        placeholder="e.g. DL-1C-4321"
                        value={newVisitor.vehicleNumber}
                        onChange={(e) => setNewVisitor({ ...newVisitor, vehicleNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                    Generate Entry Pass
                  </button>
                </form>
              </div>

              {/* Renders active pre-approved QR pass */}
              {visitors.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/5">
                  <h4 className="font-bold text-white text-sm mb-3">Pre-Approved Visitor passes</h4>
                  <div className="flex flex-col gap-4">
                    {visitors.slice(0, 2).map((v: any) => (
                      <div key={v.id} className="p-3.5 bg-slate-950 border border-white/5 rounded-xl text-center">
                        <span className="inline-block text-[9px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 mb-2">
                          {v.visitorType} - {v.name}
                        </span>
                        
                        {/* Simulation QR image */}
                        <div className="w-28 h-28 mx-auto my-3 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${v.qrCode}`} alt="Visitor pass QR" className="w-full h-full" />
                        </div>
                        
                        <p className="text-[10px] text-slate-400">Pass Code: <strong className="text-emerald-400">{v.qrCode}</strong></p>
                        <p className="text-[9px] text-slate-500 mt-1">Present to guard at main gate A</p>
                        
                        <button
                          onClick={() => handleDeletePass(v.id)}
                          className="mt-3 w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Revoke / Delete Pass
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          SUBVIEW 2.5: STAFF & GUARDS DIRECTORY
          ====================================================================== */}
      {activeTab === 'staff' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Staff Registry Listings Grid */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Society Staff & Security Registry</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role/Type</th>
                    <th className="py-3 px-4">Shift Hours</th>
                    <th className="py-3 px-4">Monthly Salary</th>
                    <th className="py-3 px-4">System Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staff.map((s: any) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-all text-xs">
                      <td className="py-4 px-4 font-semibold text-white">
                        {s.firstName} {s.lastName}
                        <span className="block text-[10px] text-slate-500">{s.phoneNumber}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {s.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-bold">{s.shiftStart} - {s.shiftEnd}</td>
                      <td className="py-4 px-4 text-slate-300 font-bold">₹{s.salaryMonthly || 'N/A'}</td>
                      <td className="py-4 px-4">
                        {s.user ? (
                          <div>
                            <span className="block text-emerald-400 font-medium">{s.user.email}</span>
                            <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest">{s.user.role?.name || 'Active Access'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No System Login</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Onboard Staff Sidebar panel (Society Admin only) */}
          {user.role === 'Society Admin' && (
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 self-start">
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Onboard Staff / Guard</h3>
                <form onSubmit={handleOnboardStaff} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={newStaff.firstName}
                      onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={newStaff.lastName}
                      onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newStaff.phoneNumber}
                      onChange={(e) => setNewStaff({ ...newStaff, phoneNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Staff Type / Role</label>
                    <select
                      value={newStaff.type}
                      onChange={(e) => setNewStaff({ ...newStaff, type: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="Guard">Security Guard (Creates login)</option>
                      <option value="Plumber">Plumber (Service Staff)</option>
                      <option value="Electrician">Electrician (Service Staff)</option>
                      <option value="Cleaner">Cleaner (Service Staff)</option>
                      <option value="Supervisor">Supervisor (Creates login)</option>
                    </select>
                  </div>

                  {/* System Access credentials for Guards/Supervisors/Staff */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Login Email Address {(newStaff.type === 'Guard' || newStaff.type === 'Supervisor') ? '(Required)' : '(Optional)'}
                    </label>
                    <input
                      type="email"
                      required={newStaff.type === 'Guard' || newStaff.type === 'Supervisor'}
                      placeholder={(newStaff.type === 'Guard' || newStaff.type === 'Supervisor') ? "e.g. guard1@society.com" : "Optional - creates login to resolve tickets"}
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                    <span className="block text-[9px] text-slate-500 mt-1">
                      {(newStaff.type === 'Guard' || newStaff.type === 'Supervisor')
                        ? "Generates login credentials with welcome123 default password."
                        : "If provided, generates Maintenance Staff credentials with welcome123 default password."}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shift Start</label>
                      <input
                        type="text"
                        required
                        value={newStaff.shiftStart}
                        onChange={(e) => setNewStaff({ ...newStaff, shiftStart: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shift End</label>
                      <input
                        type="text"
                        required
                        value={newStaff.shiftEnd}
                        onChange={(e) => setNewStaff({ ...newStaff, shiftEnd: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      required
                      value={newStaff.salaryMonthly}
                      onChange={(e) => setNewStaff({ ...newStaff, salaryMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <button type="submit" className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                    Register Staff / Guard
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          SUBVIEW 4: COMPLAINTS HUB
          ====================================================================== */}
      {activeTab === 'complaints' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Complaints Table */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Society Complaints SLA Registry</h3>
            
            <div className="flex flex-col gap-4">
              {complaints.map((c: any) => (
                <div key={c.id} className="p-4 bg-slate-950/40 border border-white/5 hover:border-emerald-500/10 rounded-2xl transition-all flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold block">{c.ticketNumber}</span>
                      <h4 className="font-bold text-white text-base mt-0.5">{c.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{c.description}</p>
                      
                      {/* Assigned technician status */}
                      {c.staff ? (
                        <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                          🛠️ Technician: <span className="text-emerald-400">{c.staff.firstName} {c.staff.lastName} ({c.staff.type})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400/80 mt-2 block">
                          ⚠️ Unassigned Ticket
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          c.priority === 'URGENT' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {c.priority}
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {c.category}
                        </span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          c.status === 'OPEN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                          c.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                          c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-slate-700/35 text-slate-400 border border-slate-700/50'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {/* Admin/Committee: Assign staff */}
                      {(user.role === 'Society Admin' || user.role === 'Committee Member') && !c.assignedTo && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Assign:</span>
                          <select
                            onChange={(e) => handleAssignStaff(c.id, e.target.value)}
                            defaultValue=""
                            className="bg-slate-900 text-slate-300 text-[9px] font-bold py-1 px-1.5 rounded-lg border border-white/10 focus:outline-none"
                          >
                            <option value="" disabled>Select Tech...</option>
                            {staff.filter((s: any) => s.type !== 'Guard').map((s: any) => (
                              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.type})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Admin/Committee/Technician Staff: Update Status */}
                      {(user.role === 'Society Admin' || user.role === 'Committee Member' || user.role === 'Maintenance Staff') && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                            className="bg-slate-900 text-slate-300 text-[9px] font-bold py-1 px-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment thread history */}
                  <div className="mt-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Comment Thread & Updates</span>
                    <div className="flex flex-col gap-2 mt-2">
                      {c.comments?.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No notes logged. SLA target remains 3 days.</p>
                      ) : (
                        c.comments?.map((com: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-[11px]">
                            <span className="font-bold text-emerald-400">{com.user?.firstName || 'Staff member'}:</span>
                            <span className="text-slate-300 ml-1.5">{com.comment}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add comment update input (All Roles) */}
                  <div className="mt-2 border-t border-white/5 pt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a progress update comment..."
                        value={activeComment[c.id] || ''}
                        onChange={(e) => setActiveComment({ ...activeComment, [c.id]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
                      />
                      <button
                        onClick={() => handlePostComment(c.id)}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded-xl shadow-md transition-all shrink-0"
                      >
                        Post Note
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raise Complaint Form with AI router (Resident only) */}
          {user.role === 'Resident' && (
            <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl border border-white/5 shrink-0 self-start">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Raise AI Classified Ticket</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Our NLP helper will scan keywords to auto-classify your service category.</p>

              {complaintError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{complaintError}</span>
                </div>
              )}

              <form onSubmit={handleRaiseComplaint} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Title (Min 3 characters)</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    placeholder="e.g. water leakage in bathroom sink"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  {newComplaint.title.length > 0 && newComplaint.title.length < 3 && (
                    <span className="text-[10px] text-rose-400 font-semibold mt-1 block">Title must be at least 3 characters.</span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description Details (Min 10 characters)</label>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    placeholder="Include specific location, e.g. stuck elevator or pipe leakage details..."
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  {newComplaint.description.length > 0 && newComplaint.description.length < 10 && (
                    <span className="text-[10px] text-rose-400 font-semibold mt-1 block">Description must contain at least 10 characters (current: {newComplaint.description.length}).</span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                  <select
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assign Technician (Optional)</label>
                  <select
                    value={newComplaint.staffId}
                    onChange={(e) => setNewComplaint({ ...newComplaint, staffId: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">-- Let AI Auto-Assign --</option>
                    {staff
                      .filter((s: any) => !s.type.toLowerCase().includes('guard'))
                      .map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.type})
                        </option>
                      ))}
                  </select>
                </div>

                <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                  File Service Ticket
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          SUBVIEW 5: INVOICING & BILLINGS
          ====================================================================== */}
      {activeTab === 'billing' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Invoices List Table */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Society Maintenance Invoices</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Flat No</th>
                    <th className="py-3 px-4">Billed period</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Payment status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-all text-xs">
                      <td className="py-4 px-4 font-mono text-slate-400">{inv.invoiceNumber}</td>
                      <td className="py-4 px-4 font-bold text-white">{inv.flat?.number || 'A-101'}</td>
                      <td className="py-4 px-4">{inv.billPeriodStart} to {inv.billPeriodEnd}</td>
                      <td className="py-4 px-4 font-bold text-emerald-400">₹{inv.totalAmount}</td>
                      <td className="py-4 px-4 text-slate-400">{inv.dueDate}</td>
                      <td className="py-4 px-4">
                        {inv.status === 'PAID' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            PAID
                          </span>
                        ) : user.role === 'Resident' ? (
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-md transition-all duration-200"
                          >
                            Pay invoice
                          </button>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            UNPAID
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pay Invoice UPI QR Simulation Dialog Drawer */}
          {selectedInvoice && (
            <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl border border-yellow-500/30 bg-yellow-950/5 shrink-0 self-start">
              <h3 className="text-lg font-bold text-white mb-2">Digital UPI Pay Simulator</h3>
              <p className="text-[11px] text-slate-400">Scan below generated sandbox QR inside your bank/payment app to process invoice safely.</p>
              
              <div className="my-5 p-4 bg-white rounded-2xl shadow-xl w-44 h-44 mx-auto flex items-center justify-center border border-white/20">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=saassociety@ybl&am=${selectedInvoice.totalAmount}&tn=${selectedInvoice.invoiceNumber}`} alt="UPI Payment QR" className="w-full h-full" />
              </div>

              <div className="flex flex-col gap-2.5 text-xs border-b border-white/5 pb-4 mb-4">
                <div className="flex justify-between"><span className="text-slate-400">Invoice:</span> <strong className="text-slate-200">{selectedInvoice.invoiceNumber}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Maintenance Charges:</span> <strong className="text-slate-200">₹{selectedInvoice.totalAmount}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">GST (18% included):</span> <strong className="text-slate-200">₹{(selectedInvoice.totalAmount * 0.18).toFixed(0)}</strong></div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 bg-slate-900 border border-white/5 text-slate-400 font-bold py-2 rounded-xl text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayInvoice}
                  disabled={upiLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-extrabold py-2 rounded-xl text-xs shadow-md"
                >
                  {upiLoading ? 'Verifying transaction...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Generate Maintenance billing Form (Society Admin only) */}
          {user.role === 'Society Admin' && (
            <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl border border-white/5 shrink-0 self-start">
              <h3 className="text-lg font-bold text-white mb-4">Run Recurring billing Engine</h3>
              <form onSubmit={handleGenerateBilling} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Base Maintenance Charges (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBilling.baseAmount}
                    onChange={(e) => setNewBilling({ ...newBilling, baseAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billing Period Start</label>
                  <input
                    type="date"
                    required
                    value={newBilling.periodStart}
                    onChange={(e) => setNewBilling({ ...newBilling, periodStart: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billing Period End</label>
                  <input
                    type="date"
                    required
                    value={newBilling.periodEnd}
                    onChange={(e) => setNewBilling({ ...newBilling, periodEnd: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                  Execute Stored Procedure
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          SUBVIEW 6: NOTICE BOARD
          ====================================================================== */}
      {activeTab === 'notices' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Notice Listings */}
          <div className="flex-1 flex flex-col gap-4">
            {notices.map((n: any) => (
              <div key={n.id} className="glass-panel p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {n.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Published by Admin</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(n.publishAt).toDateString()}</span>
                </div>
                <h4 className="font-bold text-white text-lg mt-3">{n.title}</h4>
                <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>

          {/* Create Notice Announcement Form (Society Admin only) */}
          {user.role === 'Society Admin' && (
            <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl border border-white/5 shrink-0 self-start">
              <h3 className="text-lg font-bold text-white mb-4">Publish Announcement notice</h3>
              <form onSubmit={handleCreateNotice} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Headline Title</label>
                  <input
                    type="text"
                    required
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Content body</label>
                  <textarea
                    required
                    rows={6}
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notice Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="EVENT">EVENT</option>
                  </select>
                </div>

                <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                  Publish notice
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          SUBVIEW 7: SOCIETY SETTINGS (Society Admin only)
          ====================================================================== */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-glass relative overflow-hidden">
            {/* Ambient background blur */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Society Core Customizations</h3>
                <p className="text-xs text-slate-400 mt-1">Configure global tenant integrations and AI modules for residents and staff.</p>
              </div>
            </div>

            {settingsSuccess && (
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="mt-6 flex flex-col gap-6">
              {/* Chatbot Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex flex-col gap-1 pr-4">
                  <label className="text-sm font-bold text-slate-200">AI Concierge & Chatbot Intercom</label>
                  <span className="text-xs text-slate-400">Enable an intelligent AI agent at the portal corner to help residents query outstanding bills, visitor check-ins, or report complaints.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, aiEnabled: !settings.aiEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.aiEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.aiEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Conditional settings fields */}
              {settings.aiEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 animate-slideDown">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">AI Provider</label>
                    <select
                      value={settings.aiProvider}
                      onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="GEMINI">Google Gemini API (Recommended)</option>
                      <option value="OPENAI">OpenAI GPT Models</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      API Credentials Key
                    </label>
                    <input
                      type="password"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder={settings.hasApiKey ? '••••••••••••••••••••••••••••••••' : 'Enter your AI API key'}
                      required={!settings.hasApiKey}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
                      Your credentials are saved securely. We will never share them. Make sure you use a billable key.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full md:w-auto md:self-end bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-neon-green transition-all duration-300 text-xs disabled:opacity-50"
              >
                {settingsLoading ? 'Applying Changes...' : 'Save Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          FLOATING DYNAMIC AI CHATBOT DRAWER
          ====================================================================== */}
      {settings.aiEnabled && (
        <>
          {/* Floating Bubble Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white rounded-full shadow-neon-green hover:scale-110 active:scale-95 transition-all duration-300 group"
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6 animate-pulse" />}
            <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
              AI Society Intercom
            </span>
          </button>

          {/* Chat Panel Box */}
          {isChatOpen && (
            <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] glass-panel border border-white/10 rounded-3xl shadow-glass flex flex-col overflow-hidden animate-slideUp font-sans">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">AI Society Intercom</h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Assistant</span>
                  </div>
                </div>
                <button 
                  onClick={() => setChatHistory([])}
                  className="text-[10px] text-slate-400 hover:text-slate-200 font-bold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"
                >
                  Clear Chat
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin">
                {chatHistory.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                    <Bot className="w-12 h-12 text-slate-500 opacity-40 animate-bounce" />
                    <div>
                      <p className="text-slate-300 font-bold text-sm">How can I assist you today?</p>
                      <p className="text-slate-500 text-xs mt-1 max-w-[220px]">Ask me about billing invoices, visitor status, society structure, or submit service tickets.</p>
                    </div>

                    {/* suggestion chips */}
                    <div className="flex flex-col gap-1.5 w-full mt-4">
                      <button
                        onClick={() => { setChatInput('What are my outstanding bills?'); }}
                        className="w-full text-left p-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-[11px] rounded-xl text-slate-300 font-semibold transition-all"
                      >
                        📊 Check outstanding bills
                      </button>
                      <button
                        onClick={() => { setChatInput('Show details of my flat'); }}
                        className="w-full text-left p-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-[11px] rounded-xl text-slate-300 font-semibold transition-all"
                      >
                        🏠 Details of my flat
                      </button>
                      <button
                        onClick={() => { setChatInput('Who are the registered visitor check-ins today?'); }}
                        className="w-full text-left p-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-[11px] rounded-xl text-slate-300 font-semibold transition-all"
                      >
                        📋 Active visitor logs today
                      </button>
                    </div>
                  </div>
                )}

                {chatHistory.map((chat, idx) => {
                  const isUser = chat.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2.5 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${isUser ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                        {isUser ? 'ME' : 'AI'}
                      </div>
                      <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${isUser ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-tr-none' : 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none'}`}>
                        {chat.text}
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex gap-2.5 self-start items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      AI
                    </div>
                    <div className="flex gap-1 p-3 bg-slate-900 border border-white/5 rounded-2xl rounded-tl-none">
                      <span className="w-2.5 h-2.5 bg-emerald-500/60 rounded-full animate-bounce" />
                      <span className="w-2.5 h-2.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2.5 h-2.5 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Footer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/60 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask society assistant..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </>
      )}

      </div>
    </DashboardLayout>
  );
};

export default App;
