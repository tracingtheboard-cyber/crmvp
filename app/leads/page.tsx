'use client';

import { useEffect, useState, useMemo } from 'react';
import { Lead } from '@/types';
import LeadForm from '@/components/LeadForm';
import LeadCard from '@/components/LeadCard';
import CSVImport from '@/components/CSVImport';
import LeadVisitModal from '@/components/LeadVisitModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [visitingLead, setVisitingLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();

      if (!res.ok) {
        console.error('API error:', data.error);
        setLeads([]);
        return;
      }

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

  // Filter leads based on search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) {
      return leads;
    }

    const query = searchQuery.toLowerCase().trim();
    return leads.filter((lead) => {
      const nameMatch = lead.name?.toLowerCase().includes(query);
      const phoneMatch = lead.phone?.toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    });
  }, [leads, searchQuery]);

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

  const handleAddVisit = (lead: Lead) => {
    setVisitingLead(lead);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLead(null);
    fetchLeads();
  };

  const handleVisitClose = () => {
    setVisitingLead(null);
    fetchLeads();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enquiries (Imported)</h1>
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredLeads.length} result{filteredLeads.length !== 1 ? 's' : ''}
          </p>
        )}
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

      {visitingLead && (
        <LeadVisitModal
          lead={visitingLead}
          onClose={() => setVisitingLead(null)}
          onSave={handleVisitClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddVisit={handleAddVisit}
          />
        ))}
      </div>

      {filteredLeads.length === 0 && !searchQuery && (
        <div className="text-center py-12 text-gray-500">
          No enquiries yet. Click "Add Enquiry" to get started.
        </div>
      )}

      {filteredLeads.length === 0 && searchQuery && (
        <div className="text-center py-12 text-gray-500">
          No results found for "{searchQuery}". Try a different search term.
        </div>
      )}
    </div>
  );
}
