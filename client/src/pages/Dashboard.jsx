import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State derived from URL or defaults
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const status = searchParams.get('status') || '';
    const severity = searchParams.get('severity') || '';
    const search = searchParams.get('search') || '';

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10, // hardcoded for now or fetch from preset
                sort,
                order,
                status: status || undefined,
                severity: severity || undefined,
                search: search || undefined,
            };

            const response = await api.get('/incidents', { params });
            setIncidents(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [page, sort, order, status, severity, search]);

    const updateParams = (newParams) => {
        const nextParams = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                nextParams.delete(key);
            } else {
                nextParams.set(key, value);
            }
        });
        setSearchParams(nextParams);
    };

    const handleSort = (field) => {
        const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc';
        updateParams({ sort: field, order: newOrder });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            updateParams({ page: newPage });
        }
    };

    // Debounced search could be added here, currently relies on enter or blur ideally, 
    // but for simplicity I'll bind to input with small debounce logic or just onChange
    const handleSearch = (e) => {
        const value = e.target.value;
        // Simple direct update for now, ideally debounce
        // To avoid lag, maybe local state then effect?
        // For this mini app, I'll update params on blur or Enter
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
                <div className="flex gap-2">
                    {/* Placeholder for export or bulk actions */}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search incidents..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        defaultValue={search}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') updateParams({ search: e.currentTarget.value, page: 1 });
                        }}
                        onBlur={(e) => updateParams({ search: e.target.value, page: 1 })}
                    />
                </div>

                <select
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={status}
                    onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="MITIGATED">Mitigated</option>
                    <option value="RESOLVED">Resolved</option>
                </select>

                <select
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={severity}
                    onChange={(e) => updateParams({ severity: e.target.value, page: 1 })}
                >
                    <option value="">All Severities</option>
                    <option value="SEV1">SEV1 (Critical)</option>
                    <option value="SEV2">SEV2 (High)</option>
                    <option value="SEV3">SEV3 (Moderate)</option>
                    <option value="SEV4">SEV4 (Low)</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('title')}>
                                    <div className="flex items-center gap-1">Title <ArrowUpDown size={14} /></div>
                                </th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('severity')}>
                                    <div className="flex items-center gap-1">Severity <ArrowUpDown size={14} /></div>
                                </th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center gap-1">Created At <ArrowUpDown size={14} /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading incidents...
                                    </td>
                                </tr>
                            ) : incidents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No incidents found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                incidents.map((incident) => (
                                    <tr
                                        key={incident.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/incidents/${incident.id}`)}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{incident.title}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{incident.service}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${incident.severity === 'SEV1' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                                                incident.severity === 'SEV2' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                                                    incident.severity === 'SEV3' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                                                        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                }`}>
                                                {incident.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${incident.status === 'OPEN' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                                incident.status === 'MITIGATED' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                                    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                                                }`}>
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 tabular-nums">
                                            {format(new Date(incident.createdAt), 'MMM d, yyyy HH:mm')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
