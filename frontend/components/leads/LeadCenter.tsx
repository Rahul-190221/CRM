'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, RefreshCw, Users, Mail, Phone, Trash2, Eye, ChevronDown, Check, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getLeads, deleteLead, updateLeadStage, importLeadsFromFile, assignLeads, getBDMsForAssignment } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType, BDM } from '@/types/admin';
import InputLead from './InputLead';


const stageColors: Record<LeadStageType, { bg: string; text: string; border: string; dot: string }> = {
    'Intake':     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-400' },
    'Processing': { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200', dot: 'bg-yellow-400' },
    'Hot':        { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200', dot: 'bg-orange-400' },
    'Converted':  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',  dot: 'bg-green-500' },
    'Dead':       { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-400' },
};

const stages: LeadStageType[] = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];

const StageDropdown: React.FC<{ value: LeadStageType; onChange: (s: LeadStageType) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const colors = stageColors[value];

    const handleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 6, left: r.left });
        }
        setOpen(v => !v);
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all duration-200 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer shadow-sm'
                } ${colors.bg} ${colors.text} ${colors.border}`}
            >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                <span className="tracking-tight whitespace-nowrap">{value}</span>
                {!disabled && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[170px]"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Select Stage</p>
                        </div>
                        {stages.map(stage => {
                            const sc = stageColors[stage];
                            const isSelected = stage === value;
                            return (
                                <button
                                    key={stage}
                                    onClick={() => { onChange(stage); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                                        isSelected
                                            ? `${sc.bg} ${sc.text}`
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                                    {stage}
                                    {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

const BDMDropdown: React.FC<{
    lead: Lead;
    bdms: BDM[];
    onAssign: (leadId: string, bdmId: string) => void;
    disabled?: boolean;
}> = ({ lead, bdms, onAssign, disabled }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const currentBDM = lead.assignedTo
        ? (typeof lead.assignedTo === 'object' ? lead.assignedTo : bdms.find(b => b._id === lead.assignedTo))
        : null;
    const displayName = currentBDM
        ? (typeof currentBDM === 'object' ? currentBDM.name : String(currentBDM))
        : 'Not Assigned';

    const handleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 6, left: r.left });
        }
        setOpen(v => !v);
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold border transition-all duration-200 max-w-[130px] ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer shadow-sm'
                } ${currentBDM
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentBDM ? 'bg-blue-400' : 'bg-gray-300'}`} />
                <span className="truncate">{displayName}</span>
                {!disabled && <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[200px] max-w-[240px]"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Assign BDM</p>
                        </div>
                        <button
                            onClick={() => { onAssign(lead._id, ''); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                                !currentBDM ? 'bg-gray-50 text-gray-700' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                            Unassigned
                            {!currentBDM && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0 text-gray-500" />}
                        </button>
                        {bdms.map(bdm => {
                            const isSelected = currentBDM && (typeof currentBDM === 'object' ? currentBDM._id === bdm._id : currentBDM === bdm._id);
                            return (
                                <button
                                    key={bdm._id}
                                    onClick={() => { onAssign(lead._id, bdm._id); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                    <span className="flex flex-col text-left min-w-0">
                                        <span className="truncate">{bdm.name}</span>
                                        <span className="text-[11px] text-gray-400 font-medium truncate">{bdm.role}</span>
                                    </span>
                                    {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

const downloadTemplate = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Luminedge CRM';

    // ── Sheet 1: Leads Import ──────────────────────────────────────────
    const ws = wb.addWorksheet('Leads Import');
    const dateFmt = 'yyyy-mm-dd';
    ws.columns = [
        { header: 'Full Name',        key: 'name',         width: 24 },
        { header: 'Email',            key: 'email',        width: 30 },
        { header: 'Phone Number',     key: 'phone',        width: 18 },
        { header: 'Lead Source',      key: 'source',       width: 18 },
        { header: 'Service Interest', key: 'service',      width: 20 },
        { header: 'Notes',            key: 'notes',        width: 38 },
        { header: 'Stage',            key: 'stage',        width: 14 },
        { header: 'Last Follow Up',   key: 'lastFollowUp', width: 18, style: { numFmt: dateFmt } },
        { header: 'Next Follow Up',   key: 'nextFollowUp', width: 18, style: { numFmt: dateFmt } },
    ];

    // Yellow bold header row
    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACE39' } };
        cell.font   = { bold: true, color: { argb: 'FF000000' }, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            bottom: { style: 'medium', color: { argb: 'FF000000' } }
        };
    });
    headerRow.height = 22;
    ws.views = [{ state: 'frozen', ySplit: 1 }]; // freeze header

    // Example data rows
    const rows: any[][] = [
        ['John Doe',    'john@example.com',  '01700000000', 'Social Media', 'IELTS',         'Interested in IELTS preparation course', 'Intake',     new Date('2026-05-14'), new Date('2026-05-21')],
        ['Jane Smith',  'jane@example.com',  '01800000000', 'Referral',     'PTE',           'Wants PTE coaching and mock tests',      'Processing', new Date('2026-05-10'), new Date('2026-05-17')],
        ['Alice Rahman','alice@example.com', '01900000000', 'Walk-in',      'Study Abroad',  'Needs study abroad guidance',            'Intake',     null,                   null],
    ];
    rows.forEach(r => {
        const row = ws.addRow(r);
        row.eachCell(cell => {
            cell.alignment = { vertical: 'middle' };
        });
        row.height = 18;
    });

    // Data-validation dropdowns — values MUST match DB enum exactly
    for (let i = 2; i <= 500; i++) {
        ws.getCell(`D${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"Website,Referral,Social Media,Email Campaign,Walk-in,Phone,Other"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Source',
            error: 'Must be one of: Website, Referral, Social Media, Email Campaign, Walk-in, Phone, Other'
        };
        ws.getCell(`E${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"IELTS,PTE,GRE,TOEFL,Study Abroad,Visa Processing"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Service',
            error: 'Must be one of: IELTS, PTE, GRE, TOEFL, Study Abroad, Visa Processing'
        };
        ws.getCell(`G${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"Intake,Processing,Hot,Converted,Dead"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Stage',
            error: 'Must be: Intake, Processing, Hot, Converted, or Dead.'
        };
    }

    // ── Sheet 2: Valid Options reference ──────────────────────────────
    const ref = wb.addWorksheet('Valid Options');
    const refHeaders = ['Lead Source Options', 'Service Interest Options', 'Stage Options', 'Date Format'];
    const refData = [
        ['Website',        'IELTS',          'Intake',     'YYYY-MM-DD'],
        ['Referral',       'PTE',            'Processing', '(e.g. 2026-05-21)'],
        ['Social Media',   'GRE',            'Hot',        ''],
        ['Email Campaign', 'TOEFL',          'Converted',  ''],
        ['Walk-in',        'Study Abroad',   'Dead',       ''],
        ['Phone',          'Visa Processing','',           ''],
        ['Other',          '',               '',           ''],
    ];
    ref.columns = [{ width: 22 }, { width: 22 }, { width: 14 }, { width: 22 }];
    const refHead = ref.addRow(refHeaders);
    refHead.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACE39' } };
        cell.font = { bold: true, size: 11 };
        cell.alignment = { horizontal: 'center' };
    });
    refData.forEach(r => ref.addRow(r));

    // Write & trigger download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'luminedge_leads_import_template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
};

const LeadCenter: React.FC<{ onViewLead?: (id: string) => void; refreshKey?: number }> = ({ onViewLead, refreshKey = 0 }) => {
    const isAdmin = true;
    const [view, setView] = useState<'list' | 'form'>('list');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [bdms, setBdms] = useState<BDM[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
    const [updatingBDMId, setUpdatingBDMId] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importToast, setImportToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
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
    }, [searchTerm, refreshKey]);

    useEffect(() => {
        if (!isAdmin) return;
        getBDMsForAssignment()
            .then(data => setBdms(data))
            .catch(() => {});
    }, [isAdmin]);

    const handleAssignBDM = async (leadId: string, bdmId: string) => {
        setUpdatingBDMId(leadId);
        try {
            await assignLeads([leadId], bdmId);
            setLeads(prev => prev.map(l => {
                if (l._id !== leadId) return l;
                if (!bdmId) return { ...l, assignedTo: undefined };
                const bdm = bdms.find(b => b._id === bdmId);
                return { ...l, assignedTo: bdm ? { _id: bdm._id, name: bdm.name, email: bdm.email } : bdmId };
            }));
        } catch (error) {
            console.error('Failed to assign BDM:', error);
            alert('Failed to assign BDM');
        } finally {
            setUpdatingBDMId(null);
        }
    };

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

    const handleStageChange = async (id: string, newStage: LeadStageType) => {
        setUpdatingStageId(id);
        try {
            await updateLeadStage(id, newStage);
            setLeads(prev => prev.map(l => l._id === id ? { ...l, lifecycleStage: newStage } : l));
        } catch (error) {
            console.error('Failed to update stage:', error);
            alert('Failed to update lead stage');
        } finally {
            setUpdatingStageId(null);
        }
    };

    const handleImportCSV = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setIsImporting(true);
            setImportToast(null);
            try {
                const result = await importLeadsFromFile(file);
                const skippedMsg = result.failed > 0 ? ` ${result.failed} skipped (duplicates).` : '';
                setImportToast({ type: result.imported > 0 ? 'success' : 'error', message: `Imported ${result.imported} lead${result.imported !== 1 ? 's' : ''}.${skippedMsg}` });
                fetchLeads();
            } catch (err: any) {
                setImportToast({ type: 'error', message: err.message || 'Import failed. Check the file format.' });
            } finally {
                setIsImporting(false);
                setTimeout(() => setImportToast(null), 5000);
            }
        };
        input.click();
    };

    // Show InputLead if in form view (accessible to all users)
    if (view === 'form') {
        return <InputLead onSuccess={() => setView('list')} onCancel={() => setView('list')} />;
    }

    return (
        <div className="min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#00000F]/85">Lead Center</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all your leads in one place</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={fetchLeads}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                        title="Download CSV Template"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Template</span>
                    </button>
                    <button
                        onClick={handleImportCSV}
                        disabled={isImporting}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors bg-white shadow-sm disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{isImporting ? 'Importing…' : 'Import'}</span>
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
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[#00000F]/[0.07]">
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
                            <p className={`text-[12px] uppercase tracking-wider mb-1 transition-all ${
                                isActive ? 'font-bold ' + card.activeSub : 'font-medium text-gray-400'
                            }`}>{card.label}</p>
                            <p className={`text-2xl transition-all ${
                                isActive ? 'font-bold ' + card.activeText : 'font-semibold text-gray-800'
                            }`}>{card.count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[#00000F]/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em]">Lead Info</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em]">Contact</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] hidden sm:table-cell">Source & Service</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em]">Stage</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] hidden md:table-cell">BDM</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] hidden lg:table-cell">Notes</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] hidden lg:table-cell">Last Follow Up</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] hidden lg:table-cell">Next Follow Up</th>
                                <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] text-center">Profile</th>
                                {isAdmin && <th className="px-3 sm:px-5 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] text-right">Del</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 10 : 9} className="px-4 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
                                        <p className="text-gray-500 mt-2 text-sm">Loading leads...</p>
                                    </td>
                                </tr>
                            ) : displayedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 10 : 9} className="px-4 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedLeads.map((lead) => (
                                    <tr key={lead._id} className="group transition-all duration-300 hover:bg-white border-l-4 border-l-transparent hover:border-l-[#FACE39]">
                                        <td className="px-3 sm:px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center text-yellow-700 font-bold text-base shadow-sm group-hover:shadow-md transition-shadow">
                                                    {lead.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <button
                                                        onClick={() => onViewLead?.(lead._id)}
                                                        className="text-[15px] font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none hover:text-[#FACE39] transition-colors block leading-tight text-left"
                                                    >
                                                        {lead.fullName}
                                                    </button>
                                                    <div className="text-[12px] font-medium text-gray-400 mt-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs font-normal text-gray-700">
                                                    <div className="p-1 rounded bg-gray-100/50 group-hover:bg-white transition-colors">
                                                        <Mail className="w-3 h-3 text-gray-400 group-hover:text-[#FACE39]" />
                                                    </div>
                                                    <span className="truncate max-w-[130px]">{lead.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                                                    <div className="p-1 rounded bg-gray-100/50 group-hover:bg-white transition-colors">
                                                        <Phone className="w-3 h-3 text-gray-400 group-hover:text-[#FACE39]" />
                                                    </div>
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-4 hidden sm:table-cell">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-900 text-white w-fit uppercase tracking-wider">
                                                    {lead.source}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-400/10 text-yellow-700 w-fit uppercase tracking-wider border border-yellow-400/20">
                                                    {lead.serviceInterest}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-4">
                                            <StageDropdown
                                                value={lead.lifecycleStage}
                                                onChange={(stage) => handleStageChange(lead._id, stage)}
                                                disabled={updatingStageId === lead._id}
                                            />
                                        </td>
                                        <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                                            {isAdmin ? (
                                                <BDMDropdown
                                                    lead={lead}
                                                    bdms={bdms}
                                                    onAssign={handleAssignBDM}
                                                    disabled={updatingBDMId === lead._id}
                                                />
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {lead.assignedTo
                                                            ? (typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo)
                                                            : <span className="text-gray-400 italic font-normal">Not Assigned</span>}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Assigned BDM</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-5 py-4 hidden lg:table-cell">
                                            <div className="max-w-[160px] group-hover:max-w-[200px] transition-all">
                                                <span className="text-xs text-gray-600 line-clamp-2 italic" title={lead.notes || ''}>
                                                    {lead.notes ? `"${lead.notes}"` : <span className="text-gray-400">No notes yet</span>}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-5 py-4 hidden lg:table-cell">
                                            {(() => {
                                                const last = lead.followUps?.[lead.followUps.length - 1];
                                                return last?.date
                                                    ? <span className="text-xs font-semibold text-gray-700">{new Date(last.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    : <span className="text-xs text-gray-400 italic">—</span>;
                                            })()}
                                        </td>
                                        <td className="px-3 sm:px-5 py-4 hidden lg:table-cell">
                                            {(() => {
                                                const last = lead.followUps?.[lead.followUps.length - 1];
                                                return last?.nextFollowUpDate
                                                    ? <span className="text-xs font-semibold text-[#FACE39] bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">{new Date(last.nextFollowUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    : <span className="text-xs text-gray-400 italic">—</span>;
                                            })()}
                                        </td>
                                        <td className="px-3 sm:px-5 py-4 text-center">
                                            <button
                                                onClick={() => onViewLead?.(lead._id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FACE39] text-gray-900 rounded-xl text-xs font-bold transition-all border border-gray-100 hover:border-[#FACE39] shadow-sm hover:shadow-md group/btn"
                                            >
                                                <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                                <span className="hidden sm:inline">View</span>
                                            </button>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-3 sm:px-5 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(lead._id)}
                                                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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

            {/* Import toast */}
            {importToast && (
                <div className="fixed bottom-8 right-8 z-50 max-w-sm">
                    <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${
                        importToast.type === 'success'
                            ? 'bg-white border-green-100 text-green-700'
                            : 'bg-white border-red-100 text-red-700'
                    }`}>
                        {importToast.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                            : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                        }
                        <p className="text-sm font-semibold">{importToast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );

};
export default LeadCenter;
