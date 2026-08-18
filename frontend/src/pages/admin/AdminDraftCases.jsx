import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit3, Globe, Trash2, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function AdminDraftCases() {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalCase, setDeleteModalCase] = useState(null);

  const fetchDraftCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cases?status=Draft`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const formatted = data.data.map(c => ({
          id: c.id,
          caseNumber: c.case_number || '',
          title: c.title || '',
          citation: Array.isArray(c.citations) && c.citations.length > 0
            ? `${c.citations[0].year} (${c.citations[0].month}) DLR (${c.citations[0].court}) #${c.citations[0].number}`
            : (c.case_number || 'Draft Precedent'),
          year: c.year || '',
          updatedAt: c.updated_at ? new Date(c.updated_at).toISOString().split('T')[0] : 'Today'
        }));
        setCasesList(formatted);
      } else {
        setCasesList([]);
      }
    } catch (err) {
      console.error('Error fetching draft cases:', err);
      setCasesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftCases();
  }, []);

  const handlePublishCase = async (caseId) => {
    try {
      await fetch(`${API_BASE_URL}/cases/${caseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' })
      });
      setCasesList(prev => prev.filter(c => c.id !== caseId));
    } catch (err) {
      console.error('Error publishing draft case:', err);
    }
  };

  const handleDeleteCase = async () => {
    if (deleteModalCase) {
      try {
        await fetch(`${API_BASE_URL}/cases/${deleteModalCase.id}`, { method: 'DELETE' });
        setCasesList(prev => prev.filter(c => c.id !== deleteModalCase.id));
      } catch (err) {
        console.error('Error deleting draft case:', err);
      } finally {
        setDeleteModalCase(null);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-jakarta text-[#0B1727]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-cinzel text-[#0B1727]">
            Draft Cases
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Cases saved but not yet published
          </p>
        </div>

        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded text-xs font-bold shrink-0">
          {casesList.length} Drafts Awaiting Publication
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            Loading draft cases from database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">S.No</th>
                  <th className="py-3 px-4">Case Number</th>
                  <th className="py-3 px-4">Case Title</th>
                  <th className="py-3 px-4">Citation / DLR</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {casesList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 font-semibold text-xs">
                      No draft cases pending publication.
                    </td>
                  </tr>
                ) : (
                  casesList.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">{c.caseNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-[#0B1727]">{c.title}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{c.citation}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{c.year}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">{c.updatedAt}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handlePublishCase(c.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Globe size={13} />
                            <span>Publish</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/admin/cases/edit/${c.id}`)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded"
                            title="Edit Draft"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModalCase(c)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Delete Draft"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-extrabold text-slate-900">Delete Draft Case</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to permanently delete draft case <strong className="text-slate-900">{deleteModalCase.title}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalCase(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCase}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Delete Draft
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
