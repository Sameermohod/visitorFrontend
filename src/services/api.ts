import axios from 'axios';

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api/v1'
  : 'https://visitorbackend-732d.onrender.com/api/v1';
const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const tenantId = localStorage.getItem('tenantId') || '';
  const tenantSlug = localStorage.getItem('tenantSlug') || 'lotus-heights';

  return {
    Authorization: token ? `Bearer ${token}` : '',
    'x-tenant-id': tenantId,
    'x-tenant-slug': tenantSlug,
  };
};

// Automatic JWT Token Refresh Interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const msg = error.response.data?.message;
      if (msg && (msg.includes('expired') || msg.includes('Token has expired'))) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token found');

          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          if (res.data && res.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Clear credentials on session expiration
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// PREMIUM SANDBOX MOCK DATA (Fallback for direct testing)
// ============================================================================

const mockTenants = [
  { id: 't1', name: 'Lotus Heights', slug: 'lotus-heights', themePrimary: '#1E293B', themeSecondary: '#10B981' },
  { id: 't2', name: 'Green Valley Society', slug: 'green-valley', themePrimary: '#0F172A', themeSecondary: '#06B6D4' },
  { id: 't3', name: 'Skyline Towers', slug: 'skyline-towers', themePrimary: '#111827', themeSecondary: '#EC4899' },
];

let mockUsers = [
  { id: 'u1', email: 'admin@saassociety.com', firstName: 'Lotus', lastName: 'Admin', role: 'Society Admin', tenantId: 't1' },
  { id: 'u2', email: 'guard@saassociety.com', firstName: 'Bahadur', lastName: 'Singh', role: 'Security Guard', tenantId: 't1' },
  { id: 'u3', email: 'resident@saassociety.com', firstName: 'Amit', lastName: 'Sharma', role: 'Resident', tenantId: 't1' },
];

let mockFlats = [
  { id: 'f101', number: 'A-101', floorNumber: 1, type: '3BHK', owner: 'Amit Sharma' },
  { id: 'f102', number: 'A-102', floorNumber: 1, type: '2BHK', owner: 'Pooja Verma' },
  { id: 'f201', number: 'B-201', floorNumber: 2, type: '3BHK', owner: 'Rahul Sen' },
  { id: 'f202', number: 'B-202', floorNumber: 2, type: '2BHK', owner: 'John Doe' },
];

let mockResidents = [
  { id: 'r1', user: { firstName: 'Amit', lastName: 'Sharma', email: 'resident@saassociety.com', phoneNumber: '+919876543210' }, flat: { number: 'A-101' }, ownershipStatus: 'OWNER', familyMembers: [{ name: 'Suman Sharma', relation: 'Spouse' }, { name: 'Aryan Sharma', relation: 'Son' }], emergencyContacts: [{ name: 'Vikram Sharma', phone: '+919999999999', relation: 'Brother' }] },
  { id: 'r2', user: { firstName: 'Pooja', lastName: 'Verma', email: 'pooja@gmail.com', phoneNumber: '+919123456780' }, flat: { number: 'A-102' }, ownershipStatus: 'TENANT', familyMembers: [], emergencyContacts: [] },
];

let mockStaff: any[] = [
  { id: 's1', firstName: 'Ram', lastName: 'Singh', phoneNumber: '+919999922222', type: 'Guard', salaryMonthly: 18000, shiftStart: '08:00', shiftEnd: '20:00', user: { email: 'guard@saassociety.com', role: { name: 'Security Guard' } } },
];

let mockVisitors = [
  { id: 'v1', name: 'Zomato Delivery', phoneNumber: '9898989898', visitorType: 'DELIVERY', vehicleNumber: 'MH-12-AB-1234', company: 'Zomato', purpose: 'Food Delivery', status: 'IN_SOCIETY', qrCode: 'PASS-LOTA-ZOM1', validFrom: '2026-05-25T00:00:00Z', validUntil: '2026-05-25T23:59:59Z' },
  { id: 'v2', name: 'Ramesh Kumar', phoneNumber: '9000000001', visitorType: 'GUEST', vehicleNumber: 'DL-1C-5678', company: 'None', purpose: 'Family Visit', status: 'PRE_APPROVED', qrCode: 'PASS-LOTA-RAM2', validFrom: '2026-05-25T00:00:00Z', validUntil: '2026-05-25T23:59:59Z' },
];

let mockVisitorLogs = [
  { id: 'vl1', visitor: { name: 'Zomato Delivery', visitorType: 'DELIVERY', vehicleNumber: 'MH-12-AB-1234', company: 'Zomato' }, flat: { number: 'A-101' }, checkedInAt: '2026-05-25T10:14:00Z', checkedOutAt: null, notes: 'Checked at gate' },
  { id: 'vl2', visitor: { name: 'Ola Cab', visitorType: 'CAB', vehicleNumber: 'DL-3C-0987', company: 'Ola' }, flat: { number: 'B-201' }, checkedInAt: '2026-05-25T08:30:00Z', checkedOutAt: '2026-05-25T09:00:00Z', notes: 'Checked out ok' },
];

let mockComplaints = [
  { id: 'c1', ticketNumber: 'TIC-LOTA-12891', title: 'Water leakage in toilet', description: 'There is a continuous leakage in the master bedroom bathroom toilet pipe.', category: 'PLUMBING', priority: 'HIGH', status: 'OPEN', raisedBy: 'u3', resident: { firstName: 'Amit', lastName: 'Sharma', phoneNumber: '+919876543210' }, staff: null, comments: [], createdAt: '2026-05-24T12:00:00Z' },
  { id: 'c2', ticketNumber: 'TIC-LOTA-90214', title: 'Lift elevator stopped working', description: 'Wing B main elevator is stuck on the 4th floor.', category: 'INFRASTRUCTURE', priority: 'URGENT', status: 'IN_PROGRESS', raisedBy: 'u3', resident: { firstName: 'Amit', lastName: 'Sharma', phoneNumber: '+919876543210' }, staff: { firstName: 'Ram', lastName: 'Singh', type: 'Plumber', phoneNumber: '+919999922222' }, comments: [{ user: { firstName: 'Ram', lastName: 'Singh' }, comment: 'On it, resolving by evening.', createdAt: '2026-05-25T09:00:00Z' }], createdAt: '2026-05-25T08:00:00Z' },
];

let mockInvoices = [
  { id: 'i1', invoiceNumber: 'INV-202605-A101-10', flat: { number: 'A-101' }, totalAmount: 2950, paidAmount: 2950, dueDate: '2026-06-15', status: 'PAID', billPeriodStart: '2026-05-01', billPeriodEnd: '2026-05-31' },
  { id: 'i2', invoiceNumber: 'INV-202605-A102-12', flat: { number: 'A-102' }, totalAmount: 2950, paidAmount: 0, dueDate: '2026-06-15', status: 'UNPAID', billPeriodStart: '2026-05-01', billPeriodEnd: '2026-05-31' },
];

let mockNotices = [
  { id: 'n1', title: 'Monthly General Body Meeting', content: 'Dear residents, the monthly GBM will be held in the clubhouse at 10 AM on Sunday, 31st May. Please attend.', category: 'EVENT', creator: { firstName: 'Lotus', lastName: 'Admin' }, publishAt: '2026-05-24T10:00:00Z' },
  { id: 'n2', title: 'Pest Control Schedule Wing A', content: 'Wing A pest control is scheduled for 28th May from 10 AM to 4 PM. Kindly cooperate.', category: 'MAINTENANCE', creator: { firstName: 'Lotus', lastName: 'Admin' }, publishAt: '2026-05-25T08:00:00Z' },
];

// ============================================================================
// CORE API EXPORTS
// ============================================================================

export const api = {
  // Auth Operations
  login: async (credentials: any) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, credentials, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      // Mock Fallback
      const user = mockUsers.find(
        (u) => u.email === credentials.email && credentials.password === 'welcome123'
      ) || (credentials.email === 'superadmin@saassociety.com' && credentials.password === 'superadmin123' ? { id: 'sa1', email: credentials.email, firstName: 'Global', lastName: 'SuperAdmin', role: 'Super Admin', tenantId: null } : null);

      if (!user) throw new Error('Invalid email or welcome123 password mock!');

      return {
        success: true,
        data: {
          accessToken: 'mock-access-token-jwt',
          refreshToken: 'mock-refresh-token-jwt',
          user,
        },
      };
    }
  },

  signup: async (signupData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, signupData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newTenant = {
        id: `t${Math.random()}`,
        name: signupData.tenantName,
        slug: signupData.tenantSlug,
        themePrimary: '#0F172A',
        themeSecondary: '#10B981',
      };
      mockTenants.push(newTenant);
      return { success: true, data: { tenant: newTenant } };
    }
  },

  // Society structure
  getSociety: async () => {
    try {
      const res = await axios.get(`${API_BASE}/society`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return {
        success: true,
        data: {
          name: 'Lotus Heights',
          address: 'Main street, Sector 4',
          buildings: [
            {
              id: 'b1',
              name: 'Building Wing A',
              wings: [{ id: 'w1', name: 'Wing A', flats: mockFlats }],
            },
          ],
        },
      };
    }
  },

  getFlats: async () => {
    try {
      const res = await axios.get(`${API_BASE}/society/flats`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockFlats };
    }
  },

  batchGenerateFlats: async (payload: any) => {
    try {
      const res = await axios.post(`${API_BASE}/society/flats/batch`, payload, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newInvs = [];
      for (let floor = 1; floor <= payload.floorsCount; floor++) {
        for (let flatNum = 1; flatNum <= payload.flatsPerFloor; flatNum++) {
          const numStr = `${floor}${flatNum.toString().padStart(2, '0')}`;
          newInvs.push({
            id: `f-${Math.random()}`,
            number: `${payload.wingName}-${numStr}`,
            floorNumber: floor,
            type: payload.flatType,
            owner: 'Vacant'
          });
        }
      }
      mockFlats.push(...newInvs);
      return { success: true, data: { wing: { name: payload.wingName }, flats: newInvs } };
    }
  },

  // Residents Directory
  getResidents: async () => {
    try {
      const res = await axios.get(`${API_BASE}/residents/directory`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockResidents };
    }
  },

  onboardResident: async (residentData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/residents/onboard`, residentData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newRes = {
        id: `r${Math.random()}`,
        user: { firstName: residentData.firstName, lastName: residentData.lastName, email: residentData.email, phoneNumber: residentData.phoneNumber },
        flat: { number: mockFlats.find(f => f.id === residentData.flatId)?.number || 'A-101' },
        ownershipStatus: residentData.ownershipStatus,
        familyMembers: residentData.familyMembers || [],
        emergencyContacts: residentData.emergencyContacts || [],
      };
      mockResidents.push(newRes);
      return { success: true, data: newRes };
    }
  },

  getStaff: async () => {
    try {
      const res = await axios.get(`${API_BASE}/staff/directory`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockStaff };
    }
  },

  onboardStaff: async (staffData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/staff/onboard`, staffData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newStaff = {
        id: `s${Math.random()}`,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        phoneNumber: staffData.phoneNumber,
        type: staffData.type,
        salaryMonthly: staffData.salaryMonthly || 15000,
        shiftStart: staffData.shiftStart || '08:00',
        shiftEnd: staffData.shiftEnd || '20:00',
        user: staffData.email ? { email: staffData.email, role: { name: staffData.type.toLowerCase().includes('guard') ? 'Security Guard' : 'Maintenance Staff' } } : null
      };
      mockStaff.push(newStaff);
      return { success: true, data: newStaff };
    }
  },

  toggleStaffActive: async (staffId: string, isActive: boolean) => {
    try {
      const res = await axios.patch(`${API_BASE}/staff/${staffId}/status`, { isActive }, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const staffMember = mockStaff.find(s => s.id === staffId);
      if (staffMember) {
        staffMember.isActive = isActive;
      }
      return { success: true, message: 'Staff status successfully updated' };
    }
  },

  // Visitors Pass Management
  getVisitorLogs: async () => {
    try {
      const res = await axios.get(`${API_BASE}/visitors/logs`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockVisitorLogs };
    }
  },

  preApproveVisitor: async (visitorData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/visitors/pre-approve`, visitorData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newVisitor = {
        id: `v${Math.random()}`,
        name: visitorData.name,
        phoneNumber: visitorData.phoneNumber,
        visitorType: visitorData.visitorType,
        vehicleNumber: visitorData.vehicleNumber,
        company: visitorData.company,
        purpose: visitorData.purpose,
        status: 'PRE_APPROVED',
        qrCode: `PASS-MOCK-${Math.floor(1000 + Math.random() * 9000)}`,
        validFrom: visitorData.validFrom,
        validUntil: visitorData.validUntil,
      };
      mockVisitors.push(newVisitor);
      return { success: true, data: newVisitor };
    }
  },

  getMyPreApprovals: async () => {
    try {
      const res = await axios.get(`${API_BASE}/visitors/my-approvals`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockVisitors };
    }
  },

  verifyPass: async (qrCode: string) => {
    try {
      const res = await axios.get(`${API_BASE}/visitors/verify-pass?qrCode=${qrCode}`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const visitor = mockVisitors.find(v => v.qrCode === qrCode);
      if (!visitor) throw new Error('Invalid QR code.');
      return { success: true, data: visitor };
    }
  },

  checkInVisitor: async (checkInData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/visitors/check-in`, checkInData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const visitor = mockVisitors.find(v => v.id === checkInData.visitorId);
      if (visitor) visitor.status = 'IN_SOCIETY';

      const newLog = {
        id: `vl${Math.random()}`,
        visitor: {
          name: visitor?.name || 'Walk-in Guest',
          visitorType: visitor?.visitorType || 'GUEST',
          vehicleNumber: visitor?.vehicleNumber || '',
          company: visitor?.company || '',
        },
        flat: { number: mockFlats.find(f => f.id === checkInData.flatId)?.number || 'A-101' },
        checkedInAt: new Date().toISOString(),
        checkedOutAt: null,
        notes: checkInData.notes,
      };
      mockVisitorLogs.unshift(newLog);
      return { success: true, data: newLog };
    }
  },

  checkOutVisitor: async (logId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/visitors/check-out/${logId}`, {}, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const log = mockVisitorLogs.find(l => l.id === logId);
      if (log) log.checkedOutAt = new Date().toISOString();
      return { success: true, data: log };
    }
  },

  deleteVisitorPass: async (passId: string) => {
    try {
      const res = await axios.delete(`${API_BASE}/visitors/${passId}`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      mockVisitors = mockVisitors.filter(v => v.id !== passId);
      return { success: true, message: 'Visitor pass deleted successfully' };
    }
  },

  manualEntry: async (entryData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/visitors/manual-entry`, entryData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      // Mock Fallback for local sandbox testing
      const newVisitorObj = {
        id: `v${Math.random()}`,
        name: entryData.name,
        phoneNumber: entryData.phoneNumber,
        visitorType: entryData.visitorType,
        vehicleNumber: entryData.vehicleNumber || 'None',
        company: entryData.company || 'None',
        purpose: entryData.purpose || 'Manual Check-in',
        status: 'IN_SOCIETY',
        qrCode: `MOCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      mockVisitors.unshift(newVisitorObj);
      const newLog = {
        id: `vl${Math.random()}`,
        visitor: newVisitorObj,
        flat: { number: mockFlats.find(f => f.id === entryData.flatId)?.number || 'A-101' },
        checkedInAt: new Date().toISOString(),
        checkedOutAt: null,
        notes: entryData.notes || 'Checked at gate',
      };
      mockVisitorLogs.unshift(newLog);
      return { success: true, data: newLog };
    }
  },

  // Complaints Lifecycle
  getComplaints: async (status?: string) => {
    try {
      const res = await axios.get(`${API_BASE}/complaints${status ? `?status=${status}` : ''}`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockComplaints };
    }
  },

  raiseComplaint: async (complaintData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/complaints/raise`, complaintData, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      // Mock AI Category Heuristics
      let category = 'GENERAL';
      const text = `${complaintData.title} ${complaintData.description}`.toLowerCase();
      if (text.includes('leak') || text.includes('water') || text.includes('tap')) category = 'PLUMBING';
      else if (text.includes('electric') || text.includes('wire') || text.includes('fuse')) category = 'ELECTRICAL';
      else if (text.includes('lift') || text.includes('elevator')) category = 'INFRASTRUCTURE';

      let staffObj: any = null;
      let status: 'OPEN' | 'IN_PROGRESS' = 'OPEN';
      if (complaintData.staffId) {
        const found = mockStaff.find(s => s.id === complaintData.staffId);
        if (found) {
          staffObj = found;
          status = 'IN_PROGRESS';
        }
      }

      const newTicket = {
        id: `c${Math.random()}`,
        ticketNumber: `TIC-MOCK-${Math.floor(10000 + Math.random() * 90000)}`,
        title: complaintData.title,
        description: complaintData.description,
        category,
        priority: complaintData.priority,
        status,
        raisedBy: 'Amit Sharma',
        resident: { firstName: 'Amit', lastName: 'Sharma', phoneNumber: '+919876543210' },
        staff: staffObj,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      mockComplaints.unshift(newTicket);
      return { success: true, data: newTicket };
    }
  },

  assignStaff: async (complaintId: string, staffId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/complaints/${complaintId}/assign`, { staffId }, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      const complaint = mockComplaints.find(c => c.id === complaintId);
      const staffMember = mockStaff.find(s => s.id === staffId);
      if (complaint && staffMember) {
        complaint.staff = staffMember;
        complaint.status = 'IN_PROGRESS';
      }
      return { success: true, data: complaint };
    }
  },

  updateComplaintStatus: async (complaintId: string, status: string) => {
    try {
      const res = await axios.patch(`${API_BASE}/complaints/${complaintId}/status`, { status }, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      const complaint = mockComplaints.find(c => c.id === complaintId);
      if (complaint) {
        complaint.status = status;
      }
      return { success: true, data: complaint };
    }
  },

  addComplaintComment: async (complaintId: string, comment: string) => {
    try {
      const res = await axios.post(`${API_BASE}/complaints/${complaintId}/comments`, { comment }, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      const complaint = mockComplaints.find(c => c.id === complaintId);
      if (complaint) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newCom = {
          user: { firstName: user.firstName || 'Staff', lastName: user.lastName || 'Member', email: user.email || '' },
          comment,
          createdAt: new Date().toISOString(),
        };
        if (!complaint.comments) (complaint as any).comments = [];
        (complaint.comments as any[]).push(newCom);
      }
      return { success: true, data: complaint };
    }
  },

  // Invoicing & Ledger
  getInvoices: async () => {
    try {
      const res = await axios.get(`${API_BASE}/billing/invoices`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockInvoices };
    }
  },

  generateMonthlyInvoices: async (billingData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/billing/generate`, billingData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newInvs = mockFlats.map(f => ({
        id: `i${Math.random()}`,
        invoiceNumber: `INV-${billingData.periodStart.replace(/-/g, '')}-${f.number}-${Math.floor(Math.random() * 99)}`,
        flat: { number: f.number },
        totalAmount: billingData.baseAmount * 1.18, // GST
        paidAmount: 0,
        dueDate: '2026-06-15',
        status: 'UNPAID',
        billPeriodStart: billingData.periodStart,
        billPeriodEnd: billingData.periodEnd,
      }));
      mockInvoices.push(...newInvs);
      return { success: true, data: { generatedCount: newInvs.length } };
    }
  },

  payInvoice: async (payData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/billing/pay`, payData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const inv = mockInvoices.find(i => i.id === payData.invoiceId);
      if (inv) {
        inv.paidAmount += payData.amount;
        if (inv.paidAmount >= inv.totalAmount) inv.status = 'PAID';
      }
      return { success: true, data: { invoice: inv } };
    }
  },

  // Notice Announcements
  getNotices: async () => {
    try {
      const res = await axios.get(`${API_BASE}/notices`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return { success: true, data: mockNotices };
    }
  },

  createNotice: async (noticeData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/notices`, noticeData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      const newNotice = {
        id: `n${Math.random()}`,
        title: noticeData.title,
        content: noticeData.content,
        category: noticeData.category,
        creator: { firstName: 'Lotus', lastName: 'Admin' },
        publishAt: new Date().toISOString(),
      };
      mockNotices.unshift(newNotice);
      return { success: true, data: newNotice };
    }
  },

  // Consolidated Analytics Dashboard
  getDashboardStats: async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      // Determine simulated view based on locally logged role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = user.role || 'Society Admin';

      if (role === 'Super Admin') {
        return {
          success: true,
          data: {
            view: 'SUPER_ADMIN',
            stats: { totalTenants: mockTenants.length, activeTenants: mockTenants.length, suspendedTenants: 0 },
            tenants: mockTenants,
          },
        };
      }

      if (role === 'Resident') {
        return {
          success: true,
          data: {
            view: 'RESIDENT',
            flatDetails: { number: 'A-101', type: '3BHK' },
            stats: { myComplaintsCount: 1, myPendingBillsCount: 0, myVisitorPassesCount: 1 },
          },
        };
      }

      if (role === 'Security Guard') {
        return {
          success: true,
          data: {
            view: 'GUARD',
            stats: { visitorsTodayCount: mockVisitorLogs.length },
          },
        };
      }

      if (role === 'Supervisor') {
        return {
          success: true,
          data: {
            view: 'SUPERVISOR',
            stats: {
              residentsCount: mockResidents.length,
              guardsCount: 1,
              openComplaints: mockComplaints.filter(c => c.status === 'OPEN').length,
              visitorsTodayCount: mockVisitorLogs.length,
            },
          },
        };
      }

      if (role === 'Plumber' || role === 'Electrician' || role === 'Cleaner' || role === 'Maintenance Staff') {
        return {
          success: true,
          data: {
            view: 'STAFF',
            stats: {
              myOpenComplaints: mockComplaints.filter(c => c.status === 'OPEN').length,
            },
          },
        };
      }

      return {
        success: true,
        data: {
          view: 'SOCIETY_ADMIN',
          stats: {
            residentsCount: mockResidents.length,
            guardsCount: 1,
            openComplaints: mockComplaints.filter(c => c.status === 'OPEN').length,
            resolvedComplaints: mockComplaints.filter(c => c.status === 'RESOLVED').length,
            visitorsTodayCount: mockVisitorLogs.length,
            financials: {
              totalBilled: mockInvoices.reduce((a, b) => a + b.totalAmount, 0),
              totalCollected: mockInvoices.reduce((a, b) => a + b.paidAmount, 0),
              outstanding: mockInvoices.reduce((a, b) => a + (b.totalAmount - b.paidAmount), 0),
            },
          },
        },
      };
    }
  },

  // Get society configurations / AI settings
  getSettings: async () => {
    try {
      const res = await axios.get(`${API_BASE}/society/settings`, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      return {
        success: true,
        data: {
          aiEnabled: localStorage.getItem('mockAiEnabled') === 'true',
          aiProvider: localStorage.getItem('mockAiProvider') || 'GEMINI',
          hasApiKey: !!localStorage.getItem('mockAiApiKey'),
          name: 'Lotus Heights',
          slug: 'lotus-heights'
        }
      };
    }
  },

  // Update society settings
  updateSettings: async (settingsData: any) => {
    try {
      const res = await axios.post(`${API_BASE}/society/settings`, settingsData, { headers: getHeaders() });
      return res.data;
    } catch (e) {
      localStorage.setItem('mockAiEnabled', String(settingsData.aiEnabled));
      localStorage.setItem('mockAiProvider', settingsData.aiProvider);
      if (settingsData.aiApiKey) {
        localStorage.setItem('mockAiApiKey', settingsData.aiApiKey);
      }
      return {
        success: true,
        data: {
          aiEnabled: settingsData.aiEnabled,
          aiProvider: settingsData.aiProvider,
          hasApiKey: !!settingsData.aiApiKey || !!localStorage.getItem('mockAiApiKey'),
        }
      };
    }
  },

  // Send message to AI assistant
  chatWithAI: async (chatPayload: { message: string; history: any[] }) => {
    try {
      const res = await axios.post(`${API_BASE}/chat`, chatPayload, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      return {
        success: true,
        data: {
          response: `[Mock AI Assistant Mode]: I received your message "${chatPayload.message}". Real-time completions will be functional once the backend server and LLM API credentials are configured.`
        }
      };
    }
  },

  // Super Admin: Toggle tenant active/inactive status
  toggleTenantStatus: async (id: string, isActive: boolean) => {
    try {
      const res = await axios.patch(`${API_BASE}/super-admin/tenants/${id}/status`, { isActive }, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      throw e;
    }
  },

  // Super Admin: Delete tenant/society
  deleteTenant: async (id: string) => {
    try {
      const res = await axios.delete(`${API_BASE}/super-admin/tenants/${id}`, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      throw e;
    }
  },

  // Super Admin: Fetch global dashboard data
  getSuperAdminData: async (filters?: { tenantId?: string; startDate?: string; endDate?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.tenantId) params.append('tenantId', filters.tenantId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await axios.get(`${API_BASE}/super-admin/data${queryString}`, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      throw e;
    }
  },

  // Super Admin: Delete user
  deleteUser: async (id: string) => {
    try {
      const res = await axios.delete(`${API_BASE}/super-admin/users/${id}`, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      throw e;
    }
  },

  // Super Admin: Delete staff
  deleteStaff: async (id: string) => {
    try {
      const res = await axios.delete(`${API_BASE}/super-admin/staff/${id}`, { headers: getHeaders() });
      return res.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      throw e;
    }
  },
};

export default api;
