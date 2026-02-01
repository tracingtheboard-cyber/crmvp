'use client';

import { useEffect, useState } from 'react';
import { Lead } from '@/types';
import LeadForm from '@/components/LeadForm';
import LeadCard from '@/components/LeadCard';
import CSVImport from '@/components/CSVImport';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      
      // Check if response is an error or not an array
      if (!res.ok) {
        console.error('API error:', data.error);
        setLeads([]);
        return;
      }
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        console.error('Invalid data format:', data);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLead(null);
    fetchLeads();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
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
            + Add Lead
          </button>
        </div>
      </div>

      {showImport && (
        <CSVImport
          onImportComplete={fetchLeads}
          onClose={() => setShowImport(false)}
        />
      )}

      {showForm && (
        <LeadForm
          lead={editingLead}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No leads yet. Click "Add Lead" to get started.
        </div>
      )}
    </div>
  );
}
