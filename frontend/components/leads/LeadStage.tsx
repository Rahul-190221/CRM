'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Upload, Download, RefreshCw, ChevronDown } from 'lucide-react';
import { getLeads, updateLeadStage, importLeadsFromCSV } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';

interface LeadStats {
    total: number;
    intake: number;
    processing: number;
    hot: number;
    converted: number;
    dead: number;
}

const stageColors: Record<LeadStageType, { bg: string; text: string; border: string }> = {
    'Intake': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Processing': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Hot': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Converted': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Dead': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const stages: LeadStageType[] = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];

const LeadStage: React.FC<{ user?: any }> = ({ user: _user }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | LeadStageType>('all');
    const [stats, setStats] = useState<LeadStats>({
        total: 0, intake: 0, processing: 0, hot: 0, converted: 0, dead: 0
    });

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await getLeads();
            setLeads(data);
            calculateStats(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (leadsData: Lead[]) => {
        const newStats: LeadStats = {
            total: leadsData.length,
            intake: leadsData.filter(l => l.lifecycleStage === 'Intake').length,
            processing: leadsData.filter(l => l.lifecycleStage === 'Processing').length,
            hot: leadsData.filter(l => l.lifecycleStage === 'Hot').length,
            converted: leadsData.filter(l => l.lifecycleStage === 'Converted').length,
            dead: leadsData.filter(l => l.lifecycleStage === 'Dead').length,
        };
        setStats(newStats);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleStageChange = async (leadId: string, newStage: LeadStageType) => {
        try {
            await updateLeadStage(leadId, newStage);
            setLeads(leads.map(lead =>
                lead._id === leadId ? { ...lead, lifecycleStage: newStage } : lead
            ));
            // Recalculate stats
            const updatedLeads = leads.map(lead =>
                lead._id === leadId ? { ...lead, lifecycleStage: newStage } : lead
            );
            calculateStats(updatedLeads);
        } catch (error) {
            console.error('Failed to update lead stage:', error);
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    await importLeadsFromCSV(file);
                    fetchLeads();
                } catch (error) {
                    console.error('Failed to import leads:', error);
                }
            }
        };
        input.click();
    };

    const handleExport = () => {
        const csvContent = [
            ['Full Name', 'Email', 'Phone', 'Lead Source', 'Service Interest', 'Assigned BDM', 'Stage', 'Notes', 'Created Date', 'Next Follow-Up', 'Last Updated'].join(','),
            ...filteredLeads.map(lead => [
                lead.fullName,
                lead.email,
                lead.phone,
                lead.source,
                lead.serviceInterest || '',
                typeof lead.assignedTo === 'object' ? (lead.assignedTo as any)?.name || '' : '',
                lead.lifecycleStage,
                `"${(lead.notes || '').replace(/"/g, '""')}"`,
                new Date(lead.createdAt).toLocaleDateString(),
                lead.followUps?.[0]?.nextFollowUpDate ? new Date(lead.followUps[0].nextFollowUpDate).toLocaleDateString() : '-',
                new Date(lead.updatedAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredLeads = useMemo(() => {
        let result = leads;

        // Filter by stage
        if (activeFilter !== 'all') {
            result = result.filter(lead => lead.lifecycleStage === activeFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(lead =>
                lead.fullName.toLowerCase().includes(term) ||
                lead.email.toLowerCase().includes(term) ||
                lead.phone.includes(term)
            );
        }

        return result;
    }, [leads, activeFilter, searchTerm]);

    const filterTabs = [
        { key: 'all' as const, label: 'All', count: stats.total },
        { key: 'Intake' as const, label: 'Intake', count: stats.intake },
        { key: 'Processing' as const, label: 'Processing', count: stats.processing },
        { key: 'Hot' as const, label: 'Hot Leads', count: stats.hot },
        { key: 'Converted' as const, label: 'Converted', count: stats.converted },
        { key: 'Dead' as const, label: 'Dead Leads', count: stats.dead },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Stage</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage leads through different stages</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === tab.key
                                ? 'bg-gray-900 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Intake</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.intake}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Processing</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processing}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Hot Leads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.hot}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Converted</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.converted}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase">Dead Leads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.dead}</p>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-[#FEF9C3]">
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Lead Source</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Service Interest</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned BDM</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Stage</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Created Date</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Next Follow-Up</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
                                        <p className="text-gray-500 mt-2 text-sm">Loading leads...</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-12 text-center">
                                        <p className="text-gray-500">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.fullName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{lead.phone}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{lead.source}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{lead.serviceInterest || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {typeof lead.assignedTo === 'object' ? (lead.assignedTo as any)?.name || '-' : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <select
                                                    value={lead.lifecycleStage}
                                                    onChange={(e) => handleStageChange(lead._id, e.target.value as LeadStageType)}
                                                    className={`appearance-none px-3 py-1.5 pr-8 rounded-md text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 ${stageColors[lead.lifecycleStage].bg
                                                        } ${stageColors[lead.lifecycleStage].text} ${stageColors[lead.lifecycleStage].border}`}
                                                >
                                                    {stages.map(stage => (
                                                        <option key={stage} value={stage}>{stage.toLowerCase()}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={lead.notes || ''}>
                                            {lead.notes || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(lead.createdAt).toLocaleDateString('en-CA')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {lead.followUps?.[0]?.nextFollowUpDate
                                                ? new Date(lead.followUps[0].nextFollowUpDate).toLocaleDateString('en-CA')
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(lead.updatedAt).toLocaleDateString('en-CA')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                    <span>Showing {filteredLeads.length} of {stats.total} leads</span>
                    <span className="text-right">
                        <span className="text-green-600 font-medium">{stats.converted} converted</span>
                        <span className="mx-2">·</span>
                        <span className="text-red-600 font-medium">{stats.dead} dead leads</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LeadStage;
