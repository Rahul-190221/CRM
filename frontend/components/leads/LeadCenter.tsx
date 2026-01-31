'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, Phone, Mail, User, Tag } from 'lucide-react';

interface Lead {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    source: string;
    serviceInterest: string;
    lifecycleStage: string;
    assignedTo?: {
        name: string;
    };
    createdAt: string;
}

// Mock data for leads
const mockLeads: Lead[] = [
    { _id: '1', fullName: 'Sarah Johnson', email: 'sarah@example.com', phone: '+880 1234-567890', source: 'Website', serviceInterest: 'IELTS', lifecycleStage: 'Hot', assignedTo: { name: 'John Doe' }, createdAt: '2025-01-28' },
    { _id: '2', fullName: 'Michael Chen', email: 'michael@example.com', phone: '+880 1234-567891', source: 'Referral', serviceInterest: 'PTE', lifecycleStage: 'Processing', assignedTo: { name: 'Jane Smith' }, createdAt: '2025-01-27' },
    { _id: '3', fullName: 'Emily Davis', email: 'emily@example.com', phone: '+880 1234-567892', source: 'Social Media', serviceInterest: 'GRE', lifecycleStage: 'Intake', createdAt: '2025-01-26' },
    { _id: '4', fullName: 'James Wilson', email: 'james@example.com', phone: '+880 1234-567893', source: 'Walk-in', serviceInterest: 'TOEFL', lifecycleStage: 'Hot', assignedTo: { name: 'John Doe' }, createdAt: '2025-01-25' },
    { _id: '5', fullName: 'Anna Martinez', email: 'anna@example.com', phone: '+880 1234-567894', source: 'Email Campaign', serviceInterest: 'IELTS', lifecycleStage: 'Converted', assignedTo: { name: 'Jane Smith' }, createdAt: '2025-01-24' },
    { _id: '6', fullName: 'Robert Brown', email: 'robert@example.com', phone: '+880 1234-567895', source: 'Website', serviceInterest: 'PTE', lifecycleStage: 'Dead', createdAt: '2025-01-23' },
];

const LeadCenter: React.FC = () => {
    const [leads] = useState<Lead[]>(mockLeads);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('All');

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStage === 'All' || lead.lifecycleStage === filterStage;
        return matchesSearch && matchesFilter;
    });

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Intake': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Hot': return 'bg-orange-100 text-orange-800';
            case 'Converted': return 'bg-green-100 text-green-800';
            case 'Dead': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Lead Center</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your leads.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
                        />
                    </div>
                    <select
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                    >
                        <option value="All">All Stages</option>
                        <option value="Intake">Intake</option>
                        <option value="Processing">Processing</option>
                        <option value="Hot">Hot</option>
                        <option value="Converted">Converted</option>
                        <option value="Dead">Dead</option>
                    </select>
                    <button className="flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold text-gray-900 hover:bg-yellow-500 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Add Lead</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Lead Name</th>
                            <th className="px-6 py-4 font-semibold">Contact Info</th>
                            <th className="px-6 py-4 font-semibold">Source</th>
                            <th className="px-6 py-4 font-semibold">Stage</th>
                            <th className="px-6 py-4 font-semibold">Assigned To</th>
                            <th className="px-6 py-4 font-semibold">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No leads found.</td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead) => (
                                <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs">
                                                {lead.fullName.charAt(0)}
                                            </div>
                                            {lead.fullName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                {lead.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {lead.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                            <Tag className="w-3 h-3" /> {lead.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStageColor(lead.lifecycleStage)}`}>
                                            {lead.lifecycleStage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lead.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{lead.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadCenter;
