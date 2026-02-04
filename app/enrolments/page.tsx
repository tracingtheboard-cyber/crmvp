'use client';

import { useEffect, useState, useMemo } from 'react';
import { Enrolment } from '@/types';
import EnrolmentForm from '@/components/EnrolmentForm';
import EnrolmentCard from '@/components/EnrolmentCard';

interface IntakeSummary {
  intake: string;
  count: number;
  enrolments: Enrolment[];
}

export default function EnrolmentsPage() {
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEnrolment, setEditingEnrolment] = useState<Enrolment | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'cards'>('summary');
  const [selectedIntake, setSelectedIntake] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrolments();
  }, []);

  const fetchEnrolments = async () => {
    try {
      const res = await fetch('/api/enrolments');
      const data = await res.json();

      if (!res.ok) {
        console.error('API error:', data.error);
        setEnrolments([]);
        return;
      }

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

  // Group enrolments by intake
  const intakeSummary = useMemo(() => {
    const intakeMonths = ['February', 'May', 'August', 'November'];
    const summary: IntakeSummary[] = [];

    intakeMonths.forEach((intake) => {
      const intakeEnrolments = enrolments.filter((e) => e.intake === intake);
      summary.push({
        intake,
        count: intakeEnrolments.length,
        enrolments: intakeEnrolments,
      });
    });

    // Add "No Intake" category for enrolments without intake
    const noIntakeEnrolments = enrolments.filter((e) => !e.intake);
    if (noIntakeEnrolments.length > 0) {
      summary.push({
        intake: 'No Intake',
        count: noIntakeEnrolments.length,
        enrolments: noIntakeEnrolments,
      });
    }

    return summary;
  }, [enrolments]);

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
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'summary'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            📊 Summary
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'cards'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            📋 Cards
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            + Add Enrolment
          </button>
        </div>
      </div>

      {showForm && (
        <EnrolmentForm
          enrolment={editingEnrolment}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}

      {viewMode === 'summary' ? (
        <div className="space-y-6">
          {/* Summary Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intake Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Enrolments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intakeSummary.map((summary) => (
                  <tr key={summary.intake} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {summary.intake}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                        {summary.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedIntake(summary.intake)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full font-bold">
                      {enrolments.length}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Detailed View for Selected Intake */}
          {selectedIntake && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-bold">
                  {selectedIntake} Intake - Detailed List
                </h2>
                <button
                  onClick={() => setSelectedIntake(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {intakeSummary
                    .find((s) => s.intake === selectedIntake)
                    ?.enrolments.map((enrolment) => (
                      <tr key={enrolment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {enrolment.lead?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {enrolment.lead?.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {enrolment.lead?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {enrolment.course_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${enrolment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : enrolment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : enrolment.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {enrolment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(enrolment.created_at!).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(enrolment)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => enrolment.id && handleDelete(enrolment.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
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
      )}

      {enrolments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No enrolments yet. Click "Add Enrolment" to get started.
        </div>
      )}
    </div>
  );
}
