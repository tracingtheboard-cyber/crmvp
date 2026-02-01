'use client';

import { useEffect, useState } from 'react';
import { Enquiry } from '@/types';
import EnquiryForm from '@/components/EnquiryForm';
import EnquiryCard from '@/components/EnquiryCard';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries');
      const data = await res.json();
      
      // Check if response is an error or not an array
      if (!res.ok) {
        console.error('API error:', data.error);
        setEnquiries([]);
        return;
      }
      
      // Ensure data is an array
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

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEnquiry(null);
    fetchEnquiries();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Add Enquiry
        </button>
      </div>

      {showForm && (
        <EnquiryForm
          enquiry={editingEnquiry}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enquiries.map((enquiry) => (
          <EnquiryCard
            key={enquiry.id}
            enquiry={enquiry}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
