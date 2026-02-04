'use client';

import { useState } from 'react';
import { Enquiry, Enrolment } from '@/types';

interface ConversionModalProps {
    enquiry: Enquiry;
    onClose: () => void;
    onConvert: () => void;
}

export default function ConversionModal({ enquiry, onClose, onConvert }: ConversionModalProps) {
    const [intake, setIntake] = useState<Enrolment['intake']>('February');
    const [courseName, setCourseName] = useState(enquiry.subject || '');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Enrolment
            const enrolmentData: Partial<Enrolment> = {
                lead_id: enquiry.lead_id,
                course_name: courseName,
                intake: intake,
                amount: amount ? Number(amount) : 0,
                status: 'pending', // Or confirmed? User said "paid application fee", usually 'confirmed' or 'pending' payment verification. I'll stick to pending or asking user. Stick to pending for now.
                payment_status: 'paid', // "if student paid application fee"
                notes: `Converted from Enquiry #${enquiry.id}: ${enquiry.subject}`,
            };

            const enrolRes = await fetch('/api/enrolments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrolmentData),
            });

            if (!enrolRes.ok) {
                throw new Error('Failed to create enrolment');
            }

            // 2. Update Enquiry Status to Closed/Converted
            // Note: User didn't specify what status Enquiry should become, but usually "Closed" or "Resolved".
            // I'll update it to 'closed' or 'resolved' to signify it's done. 
            // Actually, standard CRM flow might be 'converted' if available, but our Enquiry status only has 'closed'. 
            // Let's use 'closed' and add a note maybe? Or just 'closed'.
            const updateData: Partial<Enquiry> = {
                status: 'closed',
            };

            const updateRes = await fetch(`/api/enquiries/${enquiry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!updateRes.ok) {
                console.warn('Enrolment created but failed to update enquiry status');
            }

            onConvert();
        } catch (error: any) {
            console.error('Conversion error:', error);
            alert(error.message || 'Failed to convert');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Convert to Enrollment</h2>

                <div className="mb-4 text-sm text-gray-600">
                    Creating enrollment for <strong>{enquiry.lead?.name || 'Lead'}</strong>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Course Name</label>
                        <input
                            type="text"
                            required
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Select Starter Intake</label>
                        <select
                            value={intake}
                            onChange={(e) => setIntake(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="February">February</option>
                            <option value="May">May</option>
                            <option value="August">August</option>
                            <option value="November">November</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Application Fee / Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="0.00"
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
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Converting...' : 'Convert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
