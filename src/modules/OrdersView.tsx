/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  DollarSign,
  Building2,
  User,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { OrderItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface OrdersViewProps {
  state: AppDatabaseState;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Sales' | 'Purchase'>('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [formOrder, setFormOrder] = useState<Partial<OrderItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const statuses = [
    'All',
    'Pending',
    'Confirmed',
    'Processing',
    'Dispatched',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = state.orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerOrSupplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || o.orderType === typeFilter;
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesBiz = businessFilter === 'All' || o.businessId === businessFilter;
    return matchesSearch && matchesType && matchesStatus && matchesBiz;
  });

  const handleOpenAdd = () => {
    setFormOrder({
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      orderTitle: '',
      customerOrSupplier: '',
      businessId: state.businesses[0]?.id || '',
      orderType: 'Sales',
      orderDate: todayStr,
      expectedDeliveryDate: todayStr,
      amount: 0,
      currency: 'INR',
      description: '',
      assignedPersonId: state.people[0]?.id || '',
      status: 'Pending',
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (order: OrderItem) => {
    setFormOrder(JSON.parse(JSON.stringify(order)));
    setIsEditing(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrder.orderTitle?.trim() || !formOrder.customerOrSupplier?.trim()) {
      showToast('Order title and customer/supplier name are required', 'error');
      return;
    }
    storageService.saveOrder(formOrder as OrderItem);
    showToast(`Order "${formOrder.orderNumber}" saved`);
    setIsEditing(false);
  };

  const handleDeleteOrder = (id: string) => {
    storageService.deleteOrder(id);
    showToast('Order deleted');
    setDeleteConfirmId(null);
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Dispatched':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Processing':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Confirmed':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <span>Order & Pipeline Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Track multi-business sales & purchase orders, procurement & dispatch schedules
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by number, title, customer or supplier..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Sales', 'Purchase'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                typeFilter === type
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60 md:col-span-2">
            No orders found matching the selected filters.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const biz = state.businesses.find((b) => b.id === ord.businessId);
            const assigned = state.people.find((p) => p.id === ord.assignedPersonId);

            return (
              <div
                key={ord.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            ord.orderType === 'Sales'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ord.orderType === 'Sales' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" />
                          )}
                          {ord.orderType}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md border font-bold ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                        {ord.orderTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(ord)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(ord.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium mt-1">
                    Party: <span className="text-white font-semibold">{ord.customerOrSupplier}</span>
                  </p>

                  {ord.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {ord.description}
                    </p>
                  )}

                  {/* Value and Dates */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Value:</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {formatCurrency(ord.amount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Expected Delivery:</span>
                      <span className="font-mono text-slate-300 font-medium">
                        {ord.expectedDeliveryDate}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                    {biz && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="w-3 h-3 text-sky-400" />
                        {biz.name}
                      </span>
                    )}
                    {assigned && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <User className="w-3 h-3 text-indigo-400" />
                        Lead: {assigned.fullName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Order Date: {ord.orderDate}</span>
                  {ord.notes && <span className="italic truncate max-w-[150px]">{ord.notes}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Order Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveOrder}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>{formOrder.id ? 'Edit Order' : 'Create New Order'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formOrder.orderNumber || ''}
                    onChange={(e) => setFormOrder({ ...formOrder, orderNumber: e.target.value })}
                    placeholder="e.g. EXP-2026-089"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Order Type
                  </label>
                  <select
                    value={formOrder.orderType || 'Sales'}
                    onChange={(e) => setFormOrder({ ...formOrder, orderType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Sales">Sales Order (Outgoing)</option>
                    <option value="Purchase">Purchase Order (Incoming)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Order Title / Product *
                </label>
                <input
                  type="text"
                  required
                  value={formOrder.orderTitle || ''}
                  onChange={(e) => setFormOrder({ ...formOrder, orderTitle: e.target.value })}
                  placeholder="e.g. 50 MT Cumin Seeds Machine Cleaned 99%"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Customer / Supplier Party *
                </label>
                <input
                  type="text"
                  required
                  value={formOrder.customerOrSupplier || ''}
                  onChange={(e) => setFormOrder({ ...formOrder, customerOrSupplier: e.target.value })}
                  placeholder="e.g. Al-Mansoor Foodstuff Trading LLC"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Order Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formOrder.amount || ''}
                    onChange={(e) => setFormOrder({ ...formOrder, amount: Number(e.target.value) })}
                    placeholder="e.g. 18500000"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Order Status
                  </label>
                  <select
                    value={formOrder.status || 'Pending'}
                    onChange={(e) => setFormOrder({ ...formOrder, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formOrder.orderDate || todayStr}
                    onChange={(e) => setFormOrder({ ...formOrder, orderDate: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formOrder.expectedDeliveryDate || todayStr}
                    onChange={(e) => setFormOrder({ ...formOrder, expectedDeliveryDate: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Related Business
                  </label>
                  <select
                    value={formOrder.businessId || ''}
                    onChange={(e) => setFormOrder({ ...formOrder, businessId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">None</option>
                    {state.businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Assigned Person
                  </label>
                  <select
                    value={formOrder.assignedPersonId || ''}
                    onChange={(e) => setFormOrder({ ...formOrder, assignedPersonId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">None</option>
                    {state.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Description / Consignment Details
                </label>
                <textarea
                  rows={2}
                  value={formOrder.description || ''}
                  onChange={(e) => setFormOrder({ ...formOrder, description: e.target.value })}
                  placeholder="Container numbers, port of discharge, terms of LC..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md"
              >
                Save Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Order?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this order from your ledger?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
