import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusTabs = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'approved', label: 'Approved', icon: '✓' },
  { key: 'rejected', label: 'Rejected', icon: '✗' },
];

const tabStyles = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  approved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  rejected: 'text-rose-600 bg-rose-50 border-rose-200',
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

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
      await axios.put(`${API_BASE}/doctors/${doctorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      toast.success('Doctor approved successfully');
      setDoctors((prev) => prev.filter((doctor) => doctor._id !== doctorId));
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
      await axios.put(`${API_BASE}/doctors/${doctorId}/reject`, { reason: rejectReason.trim() }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      toast.success('Doctor rejected successfully');
      setDoctors((prev) => prev.filter((doctor) => doctor._id !== doctorId));
      updateCounts(activeTab, -1);
      setActiveRejectId(null);
      setRejectReason('');
      setFormError('');
    } catch (error) {
      console.error('Reject failed', error);
      toast.error(error?.response?.data?.message || 'Unable to reject doctor');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Manage Doctors</h1>
            <p className="mt-2 text-sm text-slate-600">Review doctor registrations, approve providers, and manage rejected applications.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            Current tab: <span className="font-semibold text-slate-900">{statusLabels[activeTab]}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-white">
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
              Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
              No {statusLabels[activeTab].toLowerCase()} at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => {
                const badge = tabStyles[activeTab];
                return (
                  <div key={doctor._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className={`border-l-4 ${badge}`} />
                    <div className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge}`}>
                              {doctor.status}
                            </span>
                            <span className="text-sm text-slate-500">Submitted by</span>
                            <span className="font-medium text-slate-900">{doctor.userId?.name || 'Unknown'}</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                              <p className="text-sm text-slate-900 mt-1">{doctor.userId?.email || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                              <p className="text-sm text-slate-900 mt-1">{doctor.userId?.phone || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Specialty</p>
                              <p className="text-sm text-slate-900 mt-1">{doctor.specialty || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Clinic</p>
                              <p className="text-sm text-slate-900 mt-1">{doctor.clinicName || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:w-64">
                          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">Clinic address</p>
                            <p>{doctor.clinicAddress?.area || 'Area not shared'}</p>
                            <p>{doctor.clinicAddress?.city || 'City not shared'}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">Reason for joining</p>
                            <p>{doctor.personalStatement || 'No statement provided'}</p>
                          </div>
                        </div>
                      </div>

                      {activeTab === 'pending' && (
                        <div className="mt-5 space-y-3">
                          {activeApprovalId === doctor._id ? (
                            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                              <p className="font-semibold">Confirm approval</p>
                              <p className="mt-2">Approve this doctor’s registration and make them active in the system.</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(doctor._id)}
                                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                  Yes, approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveApprovalId(null)}
                                  className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : activeRejectId === doctor._id ? (
                            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                              <p className="font-semibold">Provide a rejection reason</p>
                              <textarea
                                value={rejectReason}
                                onChange={(event) => {
                                  setRejectReason(event.target.value);
                                  if (formError) setFormError('');
                                }}
                                rows={3}
                                className="mt-3 w-full rounded-2xl border border-rose-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                placeholder="Explain why this application is rejected"
                              />
                              {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReject(doctor._id)}
                                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                                >
                                  Submit rejection
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRejectId(null);
                                    setRejectReason('');
                                    setFormError('');
                                  }}
                                  className="rounded-2xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveApprovalId(doctor._id);
                                  setActiveRejectId(null);
                                }}
                                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRejectId(doctor._id);
                                  setActiveApprovalId(null);
                                }}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'rejected' && doctor.rejectionReason && (
                        <div className="mt-5 rounded-3xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
                          <p className="font-semibold">Rejection reason</p>
                          <p className="mt-2">{doctor.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
