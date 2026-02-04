'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lead, Enquiry, Enrolment } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    leads: 0,
    enquiries: 0,
    enrolments: 0,
    recentLeads: [] as Lead[],
    recentEnquiries: [] as Enquiry[],
    recentEnrolments: [] as Enrolment[],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [leadsRes, enquiriesRes, enrolmentsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/enquiries'),
        fetch('/api/enrolments'),
      ]);

      let leadsData: any[] = [];
      let enquiriesData: any[] = [];
      let enrolmentsData: any[] = [];

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        leadsData = Array.isArray(data) ? data : [];
      }

      if (enquiriesRes.ok) {
        const data = await enquiriesRes.json();
        enquiriesData = Array.isArray(data) ? data : [];
      }

      if (enrolmentsRes.ok) {
        const data = await enrolmentsRes.json();
        enrolmentsData = Array.isArray(data) ? data : [];
      }

      setStats({
        leads: leadsData.length,
        enquiries: enquiriesData.length,
        enrolments: enrolmentsData.length,
        recentLeads: leadsData.slice(0, 5),
        recentEnquiries: enquiriesData.slice(0, 5),
        recentEnrolments: enrolmentsData.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        leads: 0,
        enquiries: 0,
        enrolments: 0,
        recentLeads: [],
        recentEnquiries: [],
        recentEnrolments: [],
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.leads}</div>
          <div className="text-gray-600 mt-2">Total Enquiries (Imported)</div>
          <Link href="/leads" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.enquiries}</div>
          <div className="text-gray-600 mt-2">Total Enquiries</div>
          <Link href="/enquiries" className="text-green-600 text-sm mt-2 inline-block hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.enrolments}</div>
          <div className="text-gray-600 mt-2">Total Enrolments</div>
          <Link href="/enrolments" className="text-purple-600 text-sm mt-2 inline-block hover:underline">
            View all →
          </Link>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Enquiries (Imported)</h2>
          <div className="space-y-3">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="border-b pb-2">
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.email || lead.phone}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lead.status} • {new Date(lead.created_at!).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No leads yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Enquiries</h2>
          <div className="space-y-3">
            {stats.recentEnquiries.length > 0 ? (
              stats.recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="border-b pb-2">
                  <div className="font-medium">{enquiry.subject}</div>
                  <div className="text-sm text-gray-600">
                    {enquiry.lead ? enquiry.lead.name : 'No lead'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {enquiry.status} • {new Date(enquiry.created_at!).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No enquiries yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Enrolments</h2>
          <div className="space-y-3">
            {stats.recentEnrolments.length > 0 ? (
              stats.recentEnrolments.map((enrolment) => (
                <div key={enrolment.id} className="border-b pb-2">
                  <div className="font-medium">{enrolment.course_name}</div>
                  <div className="text-sm text-gray-600">
                    {enrolment.lead ? enrolment.lead.name : 'No lead'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {enrolment.status} • {new Date(enrolment.created_at!).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No enrolments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
