'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Users, Activity, Mail, Phone, MoreHorizontal, Trash2 } from 'lucide-react';
import { getLeads, deleteLead } from '@/lib/api/leads';
import type { Lead } from '@/types/admin';
import InputLead from './InputLead';
import LeadStage from './LeadStage';

const LeadCenter: React.FC<{ user?: any }> = ({ user }) => {
    const isAdmin = user?.role === 'admin';
    const [view, setView] = useState<'list' | 'form'>('list');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await getLeads({ search: searchTerm });
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try {
            await deleteLead(id);
            setLeads(leads.filter(l => l._id !== id));
        } catch (error) {
            console.error('Failed to delete lead:', error);
        }
    };

    // Show InputLead if in form view (accessible to all users)
    if (view === 'form') {
        return <InputLead onSuccess={() => setView('list')} onCancel={() => setView('list')} />;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lead Center</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all your leads in one place</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchLeads}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setView('form')}
                        className="flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold text-gray-900 hover:bg-yellow-500 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Lead</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search leads by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source & Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
                                        <p className="text-gray-500 mt-2 text-sm">Loading leads...</p>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm">
                                                    {lead.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{lead.fullName}</div>
                                                    <div className="text-xs text-gray-500">Added on {new Date(lead.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {lead.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 w-fit uppercase">
                                                    {lead.source}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 w-fit uppercase border border-yellow-100">
                                                    {lead.serviceInterest}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${lead.lifecycleStage === 'Converted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                lead.lifecycleStage === 'Dead' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    lead.lifecycleStage === 'Hot' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {lead.lifecycleStage}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(lead._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default LeadCenter;
