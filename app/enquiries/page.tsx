'use client';

import { useEffect, useState } from 'react';
import { Enquiry } from '@/types';
import EnquiryForm from '@/components/EnquiryForm';
import EnquiryCard from '@/components/EnquiryCard';
import ConversionModal from '@/components/ConversionModal';
import EnquiryImport from '@/components/EnquiryImport';
import VisitModal from '@/components/VisitModal';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [convertingEnquiry, setConvertingEnquiry] = useState<Enquiry | null>(null);
  const [visitingEnquiry, setVisitingEnquiry] = useState<Enquiry | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries');
      const data = await res.json();

      if (!res.ok) {
        console.error('API error:', data.error);
        setEnquiries([]);
        return;
      }

      if (Array.isArray(data)) {
        setEnquiries(data);
      } else {
        console.error('Invalid data format:', data);
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      fetchEnquiries();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
    }
  };

  const handleEdit = (enquiry: Enquiry) => {
    setEditingEnquiry(enquiry);
    setShowForm(true);
  };

  const handleConvert = (enquiry: Enquiry) => {
    setConvertingEnquiry(enquiry);
  };

  const handleAddVisit = (enquiry: Enquiry) => {
    setVisitingEnquiry(enquiry);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEnquiry(null);
    fetchEnquiries();
  };

  const handleConversionClose = () => {
    setConvertingEnquiry(null);
    fetchEnquiries();
  };

  const handleVisitClose = () => {
    setVisitingEnquiry(null);
    fetchEnquiries();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowImport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📥 Import CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Enquiry
          </button>
        </div>
      </div>

      {showImport && (
        <EnquiryImport
          onImportComplete={fetchEnquiries}
          onClose={() => setShowImport(false)}
        />
      )}

      {showForm && (
        <EnquiryForm
          enquiry={editingEnquiry}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}

      {convertingEnquiry && (
        <ConversionModal
          enquiry={convertingEnquiry}
          onClose={() => setConvertingEnquiry(null)}
          onConvert={handleConversionClose}
        />
      )}

      {visitingEnquiry && (
        <VisitModal
          enquiry={visitingEnquiry}
          onClose={() => setVisitingEnquiry(null)}
          onSave={handleVisitClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enquiries.map((enquiry) => (
          <EnquiryCard
            key={enquiry.id}
            enquiry={enquiry}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={handleConvert}
            onAddVisit={handleAddVisit}
          />
        ))}
      </div>

      {enquiries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No enquiries yet. Click "Add Enquiry" to get started.
        </div>
      )}
    </div>
  );
}
