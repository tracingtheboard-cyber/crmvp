'use client';

import { useState } from 'react';
import { Lead } from '@/types';

interface LeadVisitModalProps {
    lead: Lead;
    onClose: () => void;
    onSave: () => void;
}

export default function LeadVisitModal({ lead, onClose, onSave }: LeadVisitModalProps) {
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [visitType, setVisitType] = useState<'walkin' | 'call'>('walkin');
    const [subject, setSubject] = useState(`Visit from ${lead.name}`);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create an Enquiry with visit status
            const enquiryData = {
                lead_id: lead.id,
                subject: subject,
                message: message,
                status: 'visit',
                visit_date: visitDate,
                visit_type: visitType,
                priority: 'medium',
            };

            const res = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enquiryData),
            });

            if (!res.ok) {
                throw new Error('Failed to create visit enquiry');
            }

            alert('✅ Visit added successfully!');
            onSave();
        } catch (error: any) {
            console.error('Error adding visit:', error);
            alert('❌ Error adding visit: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Visit for {lead.name}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Visit Date</label>
                        <input
                            type="date"
                            required
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Visit Type</label>
                        <div className="flex space-x-4 mt-1">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="visitType"
                                    value="walkin"
                                    checked={visitType === 'walkin'}
                                    onChange={() => setVisitType('walkin')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span>Walk-in</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="visitType"
                                    value="call"
                                    checked={visitType === 'call'}
                                    onChange={() => setVisitType('call')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span>Call</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes / Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                            placeholder="Optional notes about the visit..."
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Add Visit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
