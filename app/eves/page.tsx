'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Enquiry, Enrolment } from '@/types';
import * as XLSX from 'xlsx';

type MonthValue = string; // '2026-02'

interface EvesStats {
  month: MonthValue;
  enquiries: number;
  visits: number;
  enrolments: number;
  starters: number;
}

function getCurrentMonthValue(): MonthValue {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function isInMonth(dateString: string | undefined, month: MonthValue): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return false;
  const [year, monthPart] = month.split('-');
  return d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(monthPart);
}

export default function EvesReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<MonthValue>(getCurrentMonthValue);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [enqRes, enrRes] = await Promise.all([
          fetch('/api/enquiries'),
          fetch('/api/enrolments'),
        ]);

        const [enqJson, enrJson] = await Promise.all([enqRes.json(), enrRes.json()]);

        if (!enqRes.ok) {
          throw new Error(enqJson?.error || 'Failed to load enquiries');
        }
        if (!enrRes.ok) {
          throw new Error(enrJson?.error || 'Failed to load enrolments');
        }

        setEnquiries(Array.isArray(enqJson) ? enqJson : []);
        setEnrolments(Array.isArray(enrJson) ? enrJson : []);
      } catch (err: any) {
        console.error('Error loading EVES data:', err);
        setError(err.message || 'Failed to load data');
        setEnquiries([]);
        setEnrolments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats: EvesStats = useMemo(() => {
    const enquiriesInMonth = enquiries.filter((e) =>
      isInMonth(e.created_at, selectedMonth)
    ).length;

    // Count Visits: Enquiries with visit_date in selected month
    const visitsInMonth = enquiries.filter((e) =>
      isInMonth(e.visit_date, selectedMonth)
    ).length;

    const enrolmentsInMonth = enrolments.filter((e) =>
      isInMonth(e.created_at, selectedMonth)
    ).length;

    // Count Starters: Enrolments with intake matching the selected month
    const monthPart = selectedMonth.split('-')[1];
    let intakeTarget = '';
    if (monthPart === '02') intakeTarget = 'February';
    if (monthPart === '05') intakeTarget = 'May';
    if (monthPart === '08') intakeTarget = 'August';
    if (monthPart === '11') intakeTarget = 'November';

    const startersInMonth = intakeTarget
      ? enrolments.filter((e) => e.intake === intakeTarget).length
      : 0;

    return {
      month: selectedMonth,
      enquiries: enquiriesInMonth,
      visits: visitsInMonth,
      enrolments: enrolmentsInMonth,
      starters: startersInMonth,
    };
  }, [enquiries, enrolments, selectedMonth]);

  const monthLabel = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return `${y}-${m}`;
  }, [selectedMonth]);

  const handleExport = () => {
    const enquiriesCount = stats.enquiries;
    const visitsCount = stats.visits;
    const enrolmentsCount = stats.enrolments;
    const startersCount = stats.starters;

    const summaryData = [
      {
        Month: selectedMonth,
        'Enquiry (E)': enquiriesCount,
        'Visit (V)': visitsCount,
        'Enrollment (E)': enrolmentsCount,
        'Starters (S)': startersCount,
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(summaryData);

    // Adjust column widths for better readability
    const wscols = [
      { wch: 15 }, // Month
      { wch: 15 }, // Enquiry
      { wch: 15 }, // Visit
      { wch: 15 }, // Enrollment
      { wch: 15 }, // Starters
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "EVES Summary");
    XLSX.writeFile(wb, `EVES_Summary_${selectedMonth}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EVES 月报表</h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择月份
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
        </div>

        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition h-[42px]"
        >
          Export Summary to Excel
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">
          当前版本：按 {monthLabel} 统计。
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Enquiry (E)</div>
              <div className="text-3xl font-bold text-green-600">{stats.enquiries}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Visit (V)</div>
              <div className="text-3xl font-bold text-blue-600">{stats.visits}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Enrollment (E)</div>
              <div className="text-3xl font-bold text-purple-600">{stats.enrolments}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Starters (S)</div>
              <div className="text-3xl font-bold text-orange-600">{stats.starters}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-500 space-y-1">
            <div>
              说明：
              <br />
              <b>Enquiry (E)</b>: 创建时间在当月的 Enquiry 数量。
              <br />
              <b>Visit (V)</b>: 访问日期（Visit Date）在当月的 Enquiry 数量。
              <br />
              <b>Enrollment (E)</b>: 创建时间在当月的 Enrolment 数量。
              <br />
              <b>Starters (S)</b>: 入学月份（Intake）与当月匹配的 Enrollment 数量（仅限 2月、5月、8月、11月）。
            </div>
          </div>
        </>
      )}
    </div>
  );
}

