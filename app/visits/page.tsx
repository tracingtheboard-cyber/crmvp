'use client';

import { useEffect, useState, useMemo } from 'react';
import { Enquiry } from '@/types';
import ConversionModal from '@/components/ConversionModal';

export default function VisitsPage() {
    const [visits, setVisits] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'walkin' | 'call'>('all');
    const [convertingVisit, setConvertingVisit] = useState<Enquiry | null>(null);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await fetch('/api/enquiries');
            const data = await res.json();

            if (!res.ok) {
                console.error('API error:', data.error);
                setVisits([]);
                return;
            }

            if (Array.isArray(data)) {
                // Filter only enquiries with status 'visit'
                const visitEnquiries = data.filter((e: Enquiry) => e.status === 'visit');
                setVisits(visitEnquiries);
            } else {
                console.error('Invalid data format:', data);
                setVisits([]);
            }
        } catch (error) {
            console.error('Error fetching visits:', error);
            setVisits([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter visits based on search query and type
    const filteredVisits = useMemo(() => {
        let result = visits;

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter((v) => v.visit_type === filterType);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((v) => {
                const leadName = v.lead?.name?.toLowerCase() || '';
                const leadPhone = v.lead?.phone?.toLowerCase() || '';
                const subject = v.subject?.toLowerCase() || '';
                return leadName.includes(query) || leadPhone.includes(query) || subject.includes(query);
            });
        }

        return result;
    }, [visits, searchQuery, filterType]);

    const handleConvert = (visit: Enquiry) => {
        setConvertingVisit(visit);
    };

    const handleConversionClose = () => {
        setConvertingVisit(null);
        fetchVisits();
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Visits</h1>
                <div className="text-sm text-gray-600">
                    Total: {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by lead name, phone, or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Type Filter */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg ${filterType === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('walkin')}
                        className={`px-4 py-2 rounded-lg ${filterType === 'walkin'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        🚶 Walk-in
                    </button>
                    <button
                        onClick={() => setFilterType('call')}
                        className={`px-4 py-2 rounded-lg ${filterType === 'call'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        📞 Call
                    </button>
                </div>
            </div>

            {/* Conversion Modal */}
            {convertingVisit && (
                <ConversionModal
                    enquiry={convertingVisit}
                    onClose={() => setConvertingVisit(null)}
                    onConvert={handleConversionClose}
                />
            )}

            {/* Visits Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Visit Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lead
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Message
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVisits.map((visit) => (
                            <tr key={visit.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {visit.visit_date
                                        ? new Date(visit.visit_date).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {visit.visit_type === 'walkin' ? (
                                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                            🚶 Walk-in
                                        </span>
                                    ) : visit.visit_type === 'call' ? (
                                        <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                                            📞 Call
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                        <div className="font-medium">{visit.lead?.name || 'Unknown'}</div>
                                        {visit.lead?.phone && (
                                            <div className="text-xs text-gray-500">{visit.lead.phone}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {visit.subject}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {visit.message || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(visit.created_at!).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleConvert(visit)}
                                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
                                    >
                                        Convert to Enrollment
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredVisits.length === 0 && !searchQuery && filterType === 'all' && (
                <div className="text-center py-12 text-gray-500">
                    No visits yet. Add visits from the Leads or Enquiries page.
                </div>
            )}

            {filteredVisits.length === 0 && (searchQuery || filterType !== 'all') && (
                <div className="text-center py-12 text-gray-500">
                    No visits found matching your filters.
                </div>
            )}
        </div>
    );
}
