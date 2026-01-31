'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Plus, User, Phone, Mail } from 'lucide-react';

interface Lead {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    lifecycleStage: string;
    source: string;
}

interface Column {
    name: string;
    items: Lead[];
    color: string;
    bgColor: string;
}

interface Columns {
    [key: string]: Column;
}

// Mock data
const mockLeads: Lead[] = [
    { _id: '1', fullName: 'Sarah Johnson', email: 'sarah@example.com', phone: '+880 1234-567890', source: 'Website', lifecycleStage: 'Hot' },
    { _id: '2', fullName: 'Michael Chen', email: 'michael@example.com', phone: '+880 1234-567891', source: 'Referral', lifecycleStage: 'Processing' },
    { _id: '3', fullName: 'Emily Davis', email: 'emily@example.com', phone: '+880 1234-567892', source: 'Social Media', lifecycleStage: 'Intake' },
    { _id: '4', fullName: 'James Wilson', email: 'james@example.com', phone: '+880 1234-567893', source: 'Walk-in', lifecycleStage: 'Hot' },
    { _id: '5', fullName: 'Anna Martinez', email: 'anna@example.com', phone: '+880 1234-567894', source: 'Email Campaign', lifecycleStage: 'Converted' },
    { _id: '6', fullName: 'Robert Brown', email: 'robert@example.com', phone: '+880 1234-567895', source: 'Website', lifecycleStage: 'Dead' },
    { _id: '7', fullName: 'Lisa Thompson', email: 'lisa@example.com', phone: '+880 1234-567896', source: 'Referral', lifecycleStage: 'Intake' },
    { _id: '8', fullName: 'David Lee', email: 'david@example.com', phone: '+880 1234-567897', source: 'Website', lifecycleStage: 'Processing' },
];

const LeadStage: React.FC = () => {
    const initialColumns: Columns = {
        Intake: { name: 'Intake', items: mockLeads.filter(l => l.lifecycleStage === 'Intake'), color: 'border-blue-500', bgColor: 'bg-blue-50' },
        Processing: { name: 'Processing', items: mockLeads.filter(l => l.lifecycleStage === 'Processing'), color: 'border-yellow-500', bgColor: 'bg-yellow-50' },
        Hot: { name: 'Hot Leads', items: mockLeads.filter(l => l.lifecycleStage === 'Hot'), color: 'border-orange-500', bgColor: 'bg-orange-50' },
        Converted: { name: 'Converted', items: mockLeads.filter(l => l.lifecycleStage === 'Converted'), color: 'border-green-500', bgColor: 'bg-green-50' },
        Dead: { name: 'Dead', items: mockLeads.filter(l => l.lifecycleStage === 'Dead'), color: 'border-red-500', bgColor: 'bg-red-50' },
    };

    const [columns] = useState<Columns>(initialColumns);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lead Stage Pipeline</h2>
                    <p className="text-sm text-gray-500 mt-1">Drag and drop leads between stages to update their status.</p>
                </div>
                <button className="flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold text-gray-900 hover:bg-yellow-500 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Lead</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(columns).map(([columnId, column]) => (
                    <div key={columnId} className={`rounded-xl border-t-4 ${column.color} bg-white shadow-sm`}>
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">{column.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${column.bgColor} text-gray-700`}>
                                    {column.items.length}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 space-y-3 min-h-[400px]">
                            {column.items.map((lead, index) => (
                                <div
                                    key={lead._id}
                                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs">
                                                {lead.fullName.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-gray-900 text-sm">{lead.fullName}</span>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {lead.email}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {lead.phone}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                            {lead.source}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {column.items.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    No leads in this stage
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeadStage;
