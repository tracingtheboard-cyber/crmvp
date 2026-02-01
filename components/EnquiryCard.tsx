'use client';

import { Enquiry } from '@/types';

interface EnquiryCardProps {
  enquiry: Enquiry;
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (id: number) => void;
}

export default function EnquiryCard({ enquiry, onEdit, onDelete }: EnquiryCardProps) {
  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{enquiry.subject}</h3>
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 text-xs rounded ${statusColors[enquiry.status] || ''}`}>
            {enquiry.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${priorityColors[enquiry.priority] || ''}`}>
            {enquiry.priority}
          </span>
        </div>
      </div>
      {enquiry.lead && (
        <div className="text-sm text-gray-600 mb-2">
          👤 Lead: {enquiry.lead.name}
        </div>
      )}
      {enquiry.message && (
        <div className="text-sm text-gray-600 mb-2 line-clamp-3">{enquiry.message}</div>
      )}
      {enquiry.assigned_to && (
        <div className="text-sm text-gray-500 mb-2">Assigned to: {enquiry.assigned_to}</div>
      )}
      <div className="text-xs text-gray-400 mb-3">
        Created: {new Date(enquiry.created_at!).toLocaleDateString()}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(enquiry)}
          className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => enquiry.id && onDelete(enquiry.id)}
          className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
