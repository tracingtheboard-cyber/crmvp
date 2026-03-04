'use client';

import { useState, useEffect } from 'react';
import { Enquiry } from '@/types';

interface EnquiryFormProps {
  enquiry?: Enquiry | null;
  onClose: () => void;
  onSave: () => void;
}

const COURSE_OPTIONS = [
  'FCEEC',
  'FCMEC',
  'A3EEY',
  'H2EIC',
  'H2MIC',
  'P7EET',
  'P7MET',
  'SDESE',
  'SDMSE',
  'Y3BCU',
] as const;

const CONSULTANT_OPTIONS = ['Ashik', 'Mike', 'Nisha'];

interface SimpleFormData {
  name: string;
  phone: string;
  email: string;
  course_interest: string;
  consultant: string;
}

export default function EnquiryForm({ enquiry, onClose, onSave }: EnquiryFormProps) {
  const [formData, setFormData] = useState<SimpleFormData>({
    name: '',
    phone: '',
    email: '',
    course_interest: '',
    consultant: '',
  });

  const [customConsultant, setCustomConsultant] = useState(false);

  const courseOptions =
    formData.course_interest && !COURSE_OPTIONS.includes(formData.course_interest as any)
      ? [formData.course_interest, ...COURSE_OPTIONS]
      : COURSE_OPTIONS;

  const consultantOptions =
    formData.consultant && !CONSULTANT_OPTIONS.includes(formData.consultant)
      ? [formData.consultant, ...CONSULTANT_OPTIONS]
      : CONSULTANT_OPTIONS;

  useEffect(() => {
    if (enquiry) {
      setFormData({
        name: enquiry.lead?.name ?? '',
        phone: enquiry.lead?.phone ?? '',
        email: enquiry.lead?.email ?? '',
        course_interest: enquiry.subject ?? '',
        consultant: enquiry.assigned_to ?? '',
      });
      setCustomConsultant(false);
    }
  }, [enquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (enquiry?.id) {
        const leadId = enquiry.lead_id ?? enquiry.lead?.id;
        if (leadId) {
          await fetch(`/api/leads/${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name.trim(),
              phone: formData.phone.trim() || undefined,
              email: formData.email.trim() || undefined,
            }),
          });
        }
        await fetch(`/api/enquiries/${enquiry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: formData.course_interest.trim(),
            assigned_to: formData.consultant.trim(),
          }),
        });
      } else {
        const res = await fetch('/api/enquiries/quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim() || undefined,
            email: formData.email.trim() || undefined,
            course_interest: formData.course_interest.trim(),
            consultant: formData.consultant.trim(),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || 'Failed to add enquiry');
          return;
        }
      }
      onSave();
    } catch (error) {
      console.error('Error saving enquiry:', error);
      alert('Failed to save');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {enquiry ? 'Edit Enquiry' : 'Add Enquiry'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter phone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course code *</label>
            <select
              required
              value={formData.course_interest}
              onChange={(e) =>
                setFormData({ ...formData, course_interest: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Select a course code</option>
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Consultant *</label>
            <select
              required={!customConsultant}
              value={customConsultant ? '__other__' : formData.consultant}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__other__') {
                  setCustomConsultant(true);
                  setFormData({ ...formData, consultant: '' });
                } else {
                  setCustomConsultant(false);
                  setFormData({ ...formData, consultant: v });
                }
              }}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Select a consultant</option>
              {consultantOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__other__">Other...</option>
            </select>

            {customConsultant && (
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={formData.consultant}
                  onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter consultant name"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-2">
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
