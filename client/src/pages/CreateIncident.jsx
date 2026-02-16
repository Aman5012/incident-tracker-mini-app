import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const incidentSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    service: z.string().min(1, "Service is required"),
    severity: z.enum(['SEV1', 'SEV2', 'SEV3', 'SEV4']),
    status: z.enum(['OPEN', 'MITIGATED', 'RESOLVED']),
    owner: z.string().optional(),
    summary: z.string().optional(),
});

const services = ['Auth', 'Payments', 'Backend', 'Frontend', 'Database', 'Search', 'Notifications'];

const CreateIncident = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(incidentSchema),
        defaultValues: {
            severity: 'SEV4',
            status: 'OPEN',
            service: ''
        }
    });

    const onSubmit = async (data) => {
        setError(null);
        try {
            await api.post('/incidents', data);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.errors || "Failed to create incident");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Incident</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-200 text-sm">
                        <AlertCircle size={16} />
                        <span>{typeof error === 'string' ? error : 'Validation failed'}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            {...register('title')}
                            placeholder="Brief description of the issue"
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
                                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.service ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <option value="">Select Service</option>
                                {services.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service.message}</p>}
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

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Severity
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {['SEV1', 'SEV2', 'SEV3', 'SEV4'].map((sev) => (
                                <label key={sev} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        value={sev}
                                        {...register('severity')}
                                        className="sr-only peer"
                                    />
                                    <div className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-400 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-200 dark:peer-checked:bg-blue-900/20 dark:peer-checked:text-blue-400 dark:peer-checked:border-blue-800 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                                        {sev}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Assigned To (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Assigned To <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            {...register('owner')}
                            placeholder="e.g. dev@team.com"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Summary
                        </label>
                        <textarea
                            {...register('summary')}
                            rows={4}
                            placeholder="Detailed description of the incident..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            Create Incident
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateIncident;
