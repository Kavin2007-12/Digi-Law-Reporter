import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit3, Globe, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { MOCK_CASES } from '../../data/adminMockData';

export default function AdminDraftCases() {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState(MOCK_CASES.filter(c => c.status === 'Draft' || c.id === '3'));
  const [deleteModalCase, setDeleteModalCase] = useState(null);

  const handlePublishCase = (caseId) => {
    setCasesList(prev => prev.filter(c => c.id !== caseId));
  };

  const handleDeleteCase = () => {
    if (deleteModalCase) {
      setCasesList(prev => prev.filter(c => c.id !== deleteModalCase.id));
      setDeleteModalCase(null);
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

      {/* Editorial Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
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
                casesList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B1727] whitespace-nowrap">
                      {item.caseNumber}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#0B1727] max-w-[240px] truncate" title={item.title}>
                      {item.title}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-semibold max-w-[160px] truncate">
                      {item.citation || item.dlrNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{item.year}</td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {item.lastUpdated}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/cases/${item.id}`)}
                          className="text-slate-600 hover:text-primary-600"
                        >
                          Preview
                        </button>
                        <span className="text-slate-300">/</span>
                        <button
                          onClick={() => navigate(`/admin/cases/${item.id}/edit`)}
                          className="text-slate-600 hover:text-primary-600"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">/</span>
                        <button
                          onClick={() => handlePublishCase(item.id)}
                          className="text-emerald-700 hover:text-emerald-800"
                        >
                          Publish
                        </button>
                        <span className="text-slate-300">/</span>
                        <button
                          onClick={() => setDeleteModalCase(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle size={18} />
              <span>Delete Draft Case</span>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to delete draft <strong className="text-slate-900 font-bold">{deleteModalCase.caseNumber} ({deleteModalCase.title})</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteModalCase(null)}
                className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCase}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
