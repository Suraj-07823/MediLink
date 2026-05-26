import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusTabs = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'approved', label: 'Approved', icon: '✓' },
  { key: 'rejected', label: 'Rejected', icon: '✗' },
];

const AdminDoctors = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [activeApprovalId, setActiveApprovalId] = useState(null);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [formError, setFormError] = useState('');

  const authToken = useMemo(() => localStorage.getItem('medilink_auth_token') || '', []);
  const API_BASE = '/api/admin';

  const fetchDoctors = async (status) => {
    setLoading(true);
    try {
      const query = status ? `?status=${status}` : '';
      const response = await axios.get(`${API_BASE}/doctors${query}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setDoctors(response.data.doctors || []);
      setCounts((prev) => ({
        ...prev,
        [status]: response.data.count ?? response.data.doctors.length,
      }));
    } catch (error) {
      console.error('Fetch admin doctors failed', error);
      toast.error(error?.response?.data?.message || 'Unable to load doctors');
    } finally {
      setLoading(false);
      setActiveApprovalId(null);
      setActiveRejectId(null);
      setRejectReason('');
      setFormError('');
    }
  };

  useEffect(() => {
    fetchDoctors(activeTab);
  }, [activeTab]);

  const updateCounts = (status, delta) => {
    setCounts((prev) => ({
      ...prev,
      [status]: Math.max(0, (prev[status] ?? 0) + delta),
    }));
  };

  const handleApprove = async (doctorId) => {
    try {
      await axios.put(
        `${API_BASE}/doctors/${doctorId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success('Doctor approved successfully');
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      updateCounts(activeTab, -1);
      setActiveApprovalId(null);
    } catch (error) {
      console.error('Approve failed', error);
      toast.error(error?.response?.data?.message || 'Unable to approve doctor');
    }
  };

  const handleReject = async (doctorId) => {
    if (!rejectReason.trim()) {
      setFormError('Rejection reason cannot be empty.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/doctors/${doctorId}/reject`,
        { reason: rejectReason.trim() },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success('Doctor rejected successfully');
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      updateCounts(activeTab, -1);
      setActiveRejectId(null);
      setRejectReason('');
      setFormError('');
    } catch (error) {
      console.error('Reject failed', error);
      toast.error(error?.response?.data?.message || 'Unable to reject doctor');
    }
  };

  const getTabColor = (tab) => {
    if (tab === 'pending') return { text: 'text-amber-600', border: 'border-b-2 border-amber-600', bg: 'bg-amber-50' };
    if (tab === 'approved') return { text: 'text-green-600', border: 'border-b-2 border-green-600', bg: 'bg-green-50' };
    return { text: 'text-red-600', border: 'border-b-2 border-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Manage Doctors</h1>
        <p className="text-slate-600">Review registrations, approve providers, and manage rejections</p>
      </div>

      {/* Tabs — underline style */}
      <div className="border-b border-slate-200 flex gap-0">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === tab.key
                ? getTabColor(tab.key).text + ' ' + getTabColor(tab.key).border
                : 'text-slate-600 border-b-2 border-transparent hover:text-slate-900'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-[3px] border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-600">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl">
            <p className="text-4xl mb-3">
              {activeTab === 'pending' ? '✅' : activeTab === 'approved' ? '👨‍⚕️' : '⚠️'}
            </p>
            <p className="text-slate-900 font-semibold">
              {activeTab === 'pending' ? 'No pending approvals' : activeTab === 'approved' ? 'No approved doctors yet' : 'No rejected doctors'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'pending' && 'All doctor registrations have been reviewed'}
              {activeTab === 'approved' && 'Approved doctors will appear here'}
              {activeTab === 'rejected' && 'Rejected applications will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => {
              const color = getTabColor(activeTab);
              return (
                <div key={doctor._id} className={`border-l-4 ${color.bg} border-${color.text.split('-')[1]}-600 rounded-2xl bg-white p-6`}>
                  
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Dr. {doctor.userId?.name}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{doctor.speciality || 'Speciality not specified'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${color.bg} ${color.text}`}>
                      {activeTab}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm text-slate-900 mt-0.5">{doctor.userId?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</p>
                      <p className="text-sm text-slate-900 mt-0.5">{doctor.userId?.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Qualification</p>
                      <p className="text-sm text-slate-900 mt-0.5">{doctor.qualification || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clinic</p>
                      <p className="text-sm text-slate-900 mt-0.5">{doctor.clinicName || '—'}</p>
                    </div>
                  </div>

                  {/* Clinic address & rejection reason */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Clinic Location</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {doctor.clinicAddress?.area || 'Area not specified'}
                        {doctor.clinicAddress?.pincode && ` • ${doctor.clinicAddress.pincode}`}
                      </p>
                    </div>
                    {activeTab === 'rejected' && doctor.rejectionReason && (
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Rejection Reason</p>
                        <p className="text-sm text-red-800 mt-1">{doctor.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {activeTab === 'pending' && (
                    <div className="border-t border-slate-200 pt-4">
                      {activeApprovalId === doctor._id ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="font-semibold text-green-900 mb-2">Confirm approval?</p>
                          <p className="text-sm text-green-800 mb-4">This doctor will be activated immediately.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(doctor._id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors"
                            >
                              Yes, approve
                            </button>
                            <button
                              onClick={() => setActiveApprovalId(null)}
                              className="px-4 py-2 border border-green-300 text-green-700 font-semibold rounded-lg text-sm hover:bg-green-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : activeRejectId === doctor._id ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <p className="font-semibold text-red-900 mb-2">Rejection reason</p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => {
                              setRejectReason(e.target.value);
                              if (formError) setFormError('');
                            }}
                            placeholder="Explain why you're rejecting this application"
                            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows={3}
                          />
                          {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(doctor._id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors"
                            >
                              Submit rejection
                            </button>
                            <button
                              onClick={() => {
                                setActiveRejectId(null);
                                setRejectReason('');
                                setFormError('');
                              }}
                              className="px-4 py-2 border border-red-300 text-red-700 font-semibold rounded-lg text-sm hover:bg-red-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveApprovalId(doctor._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setActiveRejectId(doctor._id)}
                            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;
