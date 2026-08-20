import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { UserCheck, Plus, Shield, Mail, Phone } from 'lucide-react';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', desc: 'Full System Control' },
  { value: 'manager', label: 'Manager', desc: 'Manage Orders, Services & Offers' },
  { value: 'developer', label: 'Developer', desc: 'Update Dev Timeline & Upload Code Artifacts' },
  { value: 'designer', label: 'Designer', desc: 'Update Design Timeline & Upload Assets' },
  { value: 'video_editor', label: 'Video Editor', desc: 'Upload Video Renders & Delivery Links' },
  { value: 'support', label: 'Support', desc: 'View Orders, Customers & Internal Notes' }
];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('developer');

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get('/admin/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/employees', { name, email, password, phone, role });
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Staff & Role-Based Access Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision staff accounts for Developers, Designers, Video Editors, Managers & Support with granular RBAC permissions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Employee</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div key={emp._id} className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{emp.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                    {emp.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-slate-500" /> {emp.email}</p>
                <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-slate-500" /> {emp.phone || 'No phone'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1322] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-white">Provision Staff Account</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
              <div>
                <label className="block text-slate-400 mb-1">Select Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — ({r.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
