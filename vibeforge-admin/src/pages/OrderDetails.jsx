import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import OrderTimeline from '../components/orders/OrderTimeline';
import OrderInvoiceModal from '../components/orders/OrderInvoiceModal';
import { ArrowLeft, UserPlus, Upload, MessageSquare, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Form states
  const [newNote, setNewNote] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [assignedEmp, setAssignedEmp] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const fetchOrderAndEmployees = async () => {
    try {
      const [orderRes, empRes] = await Promise.all([
        axiosClient.get(`/admin/orders/${id}`),
        axiosClient.get('/admin/employees').catch(() => ({ data: [] }))
      ]);
      setOrder(orderRes.data);
      setEmployees(empRes.data);
      if (orderRes.data.assignedEmployee) {
        setAssignedEmp(orderRes.data.assignedEmployee._id || orderRes.data.assignedEmployee);
      }
      if (orderRes.data.expectedDeliveryDate) {
        setDeliveryDate(new Date(orderRes.data.expectedDeliveryDate).toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Failed to load order details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndEmployees();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await axiosClient.put(`/admin/orders/${id}/status`, { statusTimeline: newStatus });
      setOrder(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.put(`/admin/orders/${id}/assign`, {
        employeeId: assignedEmp,
        expectedDeliveryDate: deliveryDate
      });
      setOrder(res.data);
      alert('Employee assigned successfully!');
    } catch (err) {
      alert('Failed to assign employee');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await axiosClient.post(`/admin/orders/${id}/notes`, { note: newNote });
      setOrder(res.data);
      setNewNote('');
    } catch (err) {
      alert('Failed to add note');
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!fileTitle.trim() || !fileUrl.trim()) return;
    try {
      const res = await axiosClient.post(`/admin/orders/${id}/files`, { title: fileTitle, url: fileUrl });
      setOrder(res.data);
      setFileTitle('');
      setFileUrl('');
      alert('Delivery file added!');
    } catch (err) {
      alert('Failed to add file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl border border-slate-800">
        <p className="text-slate-400 text-sm">Order not found.</p>
        <button onClick={() => navigate('/orders')} className="mt-4 text-indigo-400 hover:underline text-xs">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">Order #{order.orderId}</h1>
            <p className="text-xs text-slate-400">Created on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => setShowInvoice(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>View Invoice</span>
        </button>
      </div>

      {/* 7-Step Interactive Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Fulfillment Status</h3>
        <OrderTimeline currentStatus={order.statusTimeline} onStatusChange={handleStatusChange} isUpdating={updating} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Items (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Customer Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Name</p>
                <p className="font-semibold text-slate-200">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold text-slate-200">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-semibold text-slate-200">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-slate-500">Address</p>
                <p className="font-semibold text-slate-200">{order.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Purchased Services</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{item.title}</p>
                    <p className="text-slate-400 mt-1">Priority: <span className="uppercase text-indigo-400 font-semibold">{item.priority}</span></p>
                    {item.requirements && <p className="text-slate-400 italic mt-1">Req: "{item.requirements}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-indigo-400 text-sm">₹{item.price?.toLocaleString()}</p>
                    <p className="text-slate-500 mt-1">Qty: {item.quantity || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Internal Admin & Staff Notes</span>
            </h3>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add confidential internal note..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl">
                Add Note
              </button>
            </form>

            <div className="space-y-2">
              {order.internalNotes?.map((n, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span className="font-bold text-indigo-300">{n.authorName}</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200 mt-1">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Employee Assignment & Delivery Files */}
        <div className="space-y-6">
          {/* Employee Assignment Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-violet-400" />
              <span>Assign Staff & Delivery</span>
            </h3>

            <form onSubmit={handleAssignEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Assign Employee</label>
                <select
                  value={assignedEmp}
                  onChange={(e) => setAssignedEmp(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl">
                Save Assignment
              </button>
            </form>
          </div>

          {/* Delivery Files Upload */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload Delivery Artifacts</span>
            </h3>

            <form onSubmit={handleUploadFile} className="space-y-2 text-xs">
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="Artifact Title (e.g. Design Assets Zip)"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500"
              />
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="File URL (Drive / Cloudinary link)"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500"
              />
              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                Upload File Link
              </button>
            </form>

            <div className="space-y-2">
              {order.deliveryFiles?.map((file, i) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-indigo-400 hover:underline truncate"
                >
                  📁 {file.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showInvoice && <OrderInvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  );
}
