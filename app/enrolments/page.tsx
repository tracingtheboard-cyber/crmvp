'use client';

import { useEffect, useState } from 'react';
import { Enrolment } from '@/types';
import EnrolmentForm from '@/components/EnrolmentForm';
import EnrolmentCard from '@/components/EnrolmentCard';

export default function EnrolmentsPage() {
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEnrolment, setEditingEnrolment] = useState<Enrolment | null>(null);

  useEffect(() => {
    fetchEnrolments();
  }, []);

  const fetchEnrolments = async () => {
    try {
      const res = await fetch('/api/enrolments');
      const data = await res.json();
      
      // Check if response is an error or not an array
      if (!res.ok) {
        console.error('API error:', data.error);
        setEnrolments([]);
        return;
      }
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setEnrolments(data);
      } else {
        console.error('Invalid data format:', data);
        setEnrolments([]);
      }
    } catch (error) {
      console.error('Error fetching enrolments:', error);
      setEnrolments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enrolment?')) return;
    try {
      await fetch(`/api/enrolments/${id}`, { method: 'DELETE' });
      fetchEnrolments();
    } catch (error) {
      console.error('Error deleting enrolment:', error);
    }
  };

  const handleEdit = (enrolment: Enrolment) => {
    setEditingEnrolment(enrolment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEnrolment(null);
    fetchEnrolments();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enrolments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          + Add Enrolment
        </button>
      </div>

      {showForm && (
        <EnrolmentForm
          enrolment={editingEnrolment}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolments.map((enrolment) => (
          <EnrolmentCard
            key={enrolment.id}
            enrolment={enrolment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {enrolments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No enrolments yet. Click "Add Enrolment" to get started.
        </div>
      )}
    </div>
  );
}
