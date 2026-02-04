'use client';

import { Lead } from '@/types';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: number) => void;
  onAddVisit?: (lead: Lead) => void;
}

export default function LeadCard({ lead, onEdit, onDelete, onAddVisit }: LeadCardProps) {
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    converted: 'bg-purple-100 text-purple-800',
    lost: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{lead.name}</h3>
        <span className={`px-2 py-1 text-xs rounded ${statusColors[lead.status] || ''}`}>
          {lead.status}
        </span>
      </div>
      {lead.email && (
        <div className="text-sm text-gray-600 mb-1">📧 {lead.email}</div>
      )}
      {lead.phone && (
        <div className="text-sm text-gray-600 mb-1">📞 {lead.phone}</div>
      )}
      {lead.company && (
        <div className="text-sm text-gray-600 mb-1">🏢 {lead.company}</div>
      )}
      {lead.source && (
        <div className="text-sm text-gray-500 mb-2">Source: {lead.source}</div>
      )}
      {lead.notes && (
        <div className="text-sm text-gray-600 mb-2 line-clamp-2">{lead.notes}</div>
      )}
      <div className="text-xs text-gray-400 mb-3">
        Created: {new Date(lead.created_at!).toLocaleDateString()}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onAddVisit && onAddVisit(lead)}
          className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
        >
          Add Visit
        </button>
        <button
          onClick={() => lead.id && onDelete(lead.id)}
          className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
