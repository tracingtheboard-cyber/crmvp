'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface EnquiryImportProps {
    onImportComplete: () => void;
    onClose: () => void;
}

interface CSVRow {
    subject?: string;
    message?: string;
    status?: string;
    priority?: string;
    assigned_to?: string;
    // Optional lead info if we want to create/link leads on the fly, 
    // but for now let's assume we might just want to import Enquiries?
    // Actually, Enquiries usually need a Lead ID. 
    // If the user wants to import Enquiries, they likely also have Lead info in the CSV.
    // We might need to handle looking up or creating leads.
    // For MVP simplification, let's assume the CSV contains basic Enquiry fields + Lead Email to match/create?
    // Or just basic fields like: subject, message, lead_email (optional), priority
    lead_email?: string;
    lead_name?: string;
}

export default function EnquiryImport({ onImportComplete, onClose }: EnquiryImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<CSVRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ imported: number; total: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setError('Please select a CSV file');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setPreview([]);

        // Parse CSV for preview
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as CSVRow[];
                setPreview(data.slice(0, 5)); // Show first 5 rows as preview
            },
            error: (error) => {
                setError('Error parsing CSV: ' + error.message);
            },
        });
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const enquiries = results.data as CSVRow[];

                        // We need a specific API route for importing enquiries because logic might be slightly complex 
                        // (e.g. finding lead by email or creating one).
                        // Let's reuse a similar pattern to Leads import but point to a new/modified endpoint.
                        const res = await fetch('/api/enquiries/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ enquiries }),
                        });

                        const contentType = res.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            const text = await res.text();
                            setError(`Server returned non-JSON response. Status: ${res.status}.`);
                            setLoading(false);
                            return;
                        }

                        const data = await res.json();

                        if (res.ok && data.success) {
                            setSuccess({
                                imported: data.imported,
                                total: data.total,
                            });
                            setTimeout(() => {
                                onImportComplete();
                                onClose();
                            }, 2000);
                        } else {
                            const errorMsg = data.message || data.error || 'Failed to import enquiries';
                            if (data.errors && data.errors.length > 0) {
                                setError(`${errorMsg}\n\nErrors:\n${data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join('\n')}`);
                            } else {
                                setError(errorMsg);
                            }
                        }
                    } catch (err: any) {
                        setError('Error importing enquiries: ' + err.message);
                    } finally {
                        setLoading(false);
                    }
                },
                error: (error) => {
                    setError('Error parsing CSV: ' + error.message);
                    setLoading(false);
                },
            });
        } catch (err: any) {
            setError('Error reading file: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Import Enquiries from CSV</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Select CSV File
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        CSV should have headers like: subject, message, status (e.g. open), priority (e.g. medium), lead_email (to link to lead)
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg whitespace-pre-wrap text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                        Successfully imported {success.imported} out of {success.total} enquiries!
                    </div>
                )}

                {preview.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Preview (first 5 rows):</h3>
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(preview[0] || {}).map((key) => (
                                            <th key={key} className="px-2 py-2 text-left border-b">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.values(row).map((value, cellIdx) => (
                                                <td key={cellIdx} className="px-2 py-2 border-b">
                                                    {String(value || '').slice(0, 30)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}
