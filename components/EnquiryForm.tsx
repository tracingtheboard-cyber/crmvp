'use client';

import { useState, useEffect } from 'react';
import { Enquiry, Lead } from '@/types';

interface EnquiryFormProps {
  enquiry?: Enquiry | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EnquiryForm({ enquiry, onClose, onSave }: EnquiryFormProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [formData, setFormData] = useState<Partial<Enquiry>>({
    lead_id: undefined,
    subject: '',
    message: '',
    status: 'open',
    priority: 'medium',
    assigned_to: '',
  });

  useEffect(() => {
    fetchLeads();
    if (enquiry) {
      setFormData(enquiry);
    }
  }, [enquiry]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = enquiry?.id ? `/api/enquiries/${enquiry.id}` : '/api/enquiries';
      const method = enquiry?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error saving enquiry:', error);
      alert('Error saving enquiry');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {enquiry ? 'Edit Enquiry' : 'Add New Enquiry'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lead</label>
            <select
              value={formData.lead_id || ''}
              onChange={(e) => setFormData({ ...formData, lead_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value as Enquiry['status'];
                const updates: Partial<Enquiry> = { status: newStatus };
                if (newStatus === 'visit' && !formData.visit_date) {
                  updates.visit_date = new Date().toISOString().split('T')[0]; // Default to today
                }
                setFormData({ ...formData, ...updates });
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="visit">Visit</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {formData.status === 'visit' && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-green-200">
              <div>
                <label className="block text-sm font-medium mb-1">Visit Date *</label>
                <input
                  type="date"
                  required={formData.status === 'visit'}
                  value={formData.visit_date ? new Date(formData.visit_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visit Type</label>
                <select
                  value={formData.visit_type || ''}
                  onChange={(e) => setFormData({ ...formData, visit_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Type...</option>
                  <option value="walkin">Walk-in</option>
                  <option value="call">Call</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Enquiry['priority'] })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To</label>
            <input
              type="text"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Staff name"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
