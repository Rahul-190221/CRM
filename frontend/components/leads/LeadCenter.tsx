'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, RefreshCw, Users, Mail, Phone, Trash2, Eye } from 'lucide-react';
import { getLeads, deleteLead } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';
import InputLead from './InputLead';
import LeadProfileModal from './LeadProfileModal';


const LeadCenter: React.FC<{ user?: any }> = ({ user }) => {
    const isAdmin = user?.role === 'admin';
    const [view, setView] = useState<'list' | 'form'>('list');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [stageFilter, setStageFilter] = useState<'all' | LeadStageType>('all');

    const stats = useMemo(() => ({
        total:      leads.length,
        intake:     leads.filter(l => l.lifecycleStage === 'Intake').length,
        processing: leads.filter(l => l.lifecycleStage === 'Processing').length,
        hot:        leads.filter(l => l.lifecycleStage === 'Hot').length,
        converted:  leads.filter(l => l.lifecycleStage === 'Converted').length,
        dead:       leads.filter(l => l.lifecycleStage === 'Dead').length,
    }), [leads]);

    const filterCards = [
        { key: 'all' as const,        label: 'Total Leads', count: stats.total,      accent: 'border-gray-900  bg-gray-900',   activeText: 'text-white',        activeSub: 'text-white/70',   idle: 'border-gray-200 hover:border-gray-400' },
        { key: 'Intake' as const,     label: 'Intake',      count: stats.intake,     accent: 'border-blue-500  bg-blue-50',    activeText: 'text-blue-700',     activeSub: 'text-blue-500',   idle: 'border-gray-200 hover:border-blue-300' },
        { key: 'Processing' as const, label: 'Processing',  count: stats.processing, accent: 'border-yellow-500 bg-yellow-50', activeText: 'text-yellow-700',   activeSub: 'text-yellow-600', idle: 'border-gray-200 hover:border-yellow-300' },
        { key: 'Hot' as const,        label: 'Hot Leads',   count: stats.hot,        accent: 'border-orange-500 bg-orange-50', activeText: 'text-orange-700',   activeSub: 'text-orange-500', idle: 'border-gray-200 hover:border-orange-300' },
        { key: 'Converted' as const,  label: 'Converted',   count: stats.converted,  accent: 'border-green-500  bg-green-50',  activeText: 'text-green-700',    activeSub: 'text-green-500',  idle: 'border-gray-200 hover:border-green-300' },
        { key: 'Dead' as const,       label: 'Dead Leads',  count: stats.dead,       accent: 'border-red-500    bg-red-50',    activeText: 'text-red-700',      activeSub: 'text-red-500',    idle: 'border-gray-200 hover:border-red-300' },
    ];

    const displayedLeads = useMemo(() =>
        stageFilter === 'all' ? leads : leads.filter(l => l.lifecycleStage === stageFilter),
        [leads, stageFilter]
    );

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
        <div className="min-h-full">
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
                        className="flex items-center gap-2 bg-[#FACE39] px-4 py-2 rounded-lg text-sm font-bold text-gray-900 hover:bg-[#FACE39]/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Lead</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search leads by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Stat Filter Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                {filterCards.map(card => {
                    const isActive = stageFilter === card.key;
                    return (
                        <button
                            key={card.key}
                            onClick={() => setStageFilter(card.key)}
                            className={`text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${
                                isActive ? card.accent + ' shadow-sm' : 'bg-white ' + card.idle
                            }`}
                        >
                            <p className={`text-[10px] uppercase tracking-wider mb-1 transition-all ${
                                isActive ? 'font-extrabold ' + card.activeSub : 'font-semibold text-gray-400'
                            }`}>{card.label}</p>
                            <p className={`text-2xl transition-all ${
                                isActive ? 'font-extrabold ' + card.activeText : 'font-bold text-gray-800'
                            }`}>{card.count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Info</th>
                                <th className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Source & Service</th>
                                <th className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                                <th className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Profile</th>
                                {isAdmin && <th className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Del</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
                                        <p className="text-gray-500 mt-2 text-sm">Loading leads...</p>
                                    </td>
                                </tr>
                            ) : displayedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-3 sm:px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm flex-shrink-0">
                                                    {lead.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">{lead.fullName}</div>
                                                    <div className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate max-w-[110px]">{lead.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-3 hidden sm:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 w-fit uppercase">
                                                    {lead.source}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 w-fit uppercase border border-yellow-100">
                                                    {lead.serviceInterest}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${lead.lifecycleStage === 'Converted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                lead.lifecycleStage === 'Dead' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    lead.lifecycleStage === 'Hot' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {lead.lifecycleStage}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-5 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#FACE39]/10 hover:bg-[#FACE39]/25 text-yellow-700 rounded-lg text-xs font-semibold transition-all border border-[#FACE39]/30"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">View</span>
                                            </button>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-3 sm:px-5 py-3 text-right">
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

            {selectedLead && (
                <LeadProfileModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}
        </div>
    );

};
export default LeadCenter;
