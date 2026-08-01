import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Search, UserX, UserCheck, Trash2, Eye, Award, DollarSign } from 'lucide-react';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await axiosClient.get('/admin/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await axiosClient.put(`/admin/customers/${id}/status`);
      await fetchCustomers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete customer account permanently?')) return;
    try {
      await axiosClient.delete(`/admin/customers/${id}`);
      await fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            View profiles, reward points history, spend telemetry, suspend or delete accounts.
          </p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <div key={customer._id} className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{customer.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{customer.email}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    customer.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {customer.status || 'active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold">{customer.rewardPoints || 0} Points</span>
                </div>
                <div className="text-right text-slate-400">
                  <span>{customer.phone || 'No phone'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate(`/customers/${customer._id}`)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-xs font-semibold flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                <div className="flex space-x-1">
                  <button
                    onClick={() => handleToggleStatus(customer._id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    title="Toggle Suspend Status"
                  >
                    {customer.status === 'suspended' ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <UserX className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleDelete(customer._id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
