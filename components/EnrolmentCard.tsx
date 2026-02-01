'use client';

import { Enrolment } from '@/types';

interface EnrolmentCardProps {
  enrolment: Enrolment;
  onEdit: (enrolment: Enrolment) => void;
  onDelete: (id: number) => void;
}

export default function EnrolmentCard({ enrolment, onEdit, onDelete }: EnrolmentCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const paymentColors: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{enrolment.course_name}</h3>
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 text-xs rounded ${statusColors[enrolment.status] || ''}`}>
            {enrolment.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${paymentColors[enrolment.payment_status] || ''}`}>
            {enrolment.payment_status}
          </span>
        </div>
      </div>
      {enrolment.lead && (
        <div className="text-sm text-gray-600 mb-2">
          👤 Lead: {enrolment.lead.name}
        </div>
      )}
      {enrolment.course_date && (
        <div className="text-sm text-gray-600 mb-2">
          📅 Date: {new Date(enrolment.course_date).toLocaleDateString()}
        </div>
      )}
      {enrolment.amount && (
        <div className="text-sm text-gray-600 mb-2">
          💰 Amount: ${enrolment.amount.toFixed(2)}
        </div>
      )}
      {enrolment.notes && (
        <div className="text-sm text-gray-600 mb-2 line-clamp-2">{enrolment.notes}</div>
      )}
      <div className="text-xs text-gray-400 mb-3">
        Created: {new Date(enrolment.created_at!).toLocaleDateString()}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(enrolment)}
          className="flex-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => enrolment.id && onDelete(enrolment.id)}
          className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
