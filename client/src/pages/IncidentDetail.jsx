import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

const incidentSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    service: z.string().min(1, "Service is required"),
    severity: z.enum(['SEV1', 'SEV2', 'SEV3', 'SEV4']),
    status: z.enum(['OPEN', 'MITIGATED', 'RESOLVED']),
    owner: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
});

const services = ['Auth', 'Payments', 'Backend', 'Frontend', 'Database', 'Search', 'Notifications'];

const IncidentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(incidentSchema),
    });

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                const response = await api.get(`/incidents/${id}`);
                reset(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to load incident details");
                setLoading(false);
            }
        };
        fetchIncident();
    }, [id, reset]);

    const onSubmit = async (data) => {
        setError(null);
        try {
            await api.patch(`/incidents/${id}`, data);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.errors || "Failed to update incident");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (error && !isSubmitting) {
        return (
            <div className="text-center py-20">
                <div className="inline-flex items-center gap-2 text-red-600 mb-4">
                    <AlertCircle size={24} />
                    <h2 className="text-xl font-bold">Error</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-tight">Incident Details</h1>
                    <span className="text-sm text-gray-500 font-mono text-xs opacity-70">ID: {id}</span>
                </div>

                <div className="p-6">
                    {error && typeof error === 'string' && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-200 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Title (Read Only / Editable) - Requirement implies "update status", wireframe shows others editable. I'll make them editable. */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                {...register('title')}
                                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Service */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Service
                                </label>
                                <select
                                    {...register('service')}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    {...register('status')}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="MITIGATED">Mitigated</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Severity
                                </label>
                                <select
                                    {...register('severity')}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="SEV1">SEV1 (Critical)</option>
                                    <option value="SEV2">SEV2 (High)</option>
                                    <option value="SEV3">SEV3 (Moderate)</option>
                                    <option value="SEV4">SEV4 (Low)</option>
                                </select>
                            </div>

                            {/* Assigned To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Assigned To
                                </label>
                                <input
                                    type="text"
                                    {...register('owner')}
                                    placeholder="Unassigned"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Timestamps (Read Only) */}
                        {/* We could display CreatedAt/UpdatedAt here if needed, but not in form data usually */}

                        {/* Summary */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Summary
                            </label>
                            <textarea
                                {...register('summary')}
                                rows={4}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetail;
