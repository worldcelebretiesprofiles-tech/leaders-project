import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Layers,
  Search,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  CheckSquare,
  Square,
  Eye,
  Calendar,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  Trash2
} from "lucide-react";

interface AdminDirectoryProps {
  profiles: any[];
  categoriesList: any[];
  origin: string;
  handleCreateNew: () => void;
  handleEdit: (profile: any) => void;
  setAdminView: (view: string) => void;
  setSelectedCatId: (id: number | null) => void;
  setActiveQrModal: (modal: any) => void;
  isLoading?: boolean;
  handleDelete?: (id: number) => void;
}

export function AdminDirectory({
  profiles,
  categoriesList,
  origin,
  handleCreateNew,
  handleEdit,
  setAdminView,
  setSelectedCatId,
  setActiveQrModal,
  isLoading = false,
  handleDelete
}: AdminDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);

  // Widget calculations
  const totalLeaders = profiles.length;
  const pendingReviews = profiles.filter(p => p.status === "IN_REVIEW").length;
  const drafts = profiles.filter(p => p.status === "DRAFT" || !p.status).length;
  const changesRequested = profiles.filter(p => p.status === "CHANGES_REQUESTED").length;

  const publishedToday = profiles.filter(p => {
    if (p.status !== "PUBLISHED") return false;
    if (!p.published_at) return false;
    const pubDate = new Date(p.published_at);
    const today = new Date();
    return (
      pubDate.getDate() === today.getDate() &&
      pubDate.getMonth() === today.getMonth() &&
      pubDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const filteredAndSortedProfiles = useMemo(() => {
    let result = [...profiles];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter(p => {
        const status = p.status || "DRAFT";
        return status === statusFilter;
      });
    }

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.title && p.title.toLowerCase().includes(lower)) ||
          (p.slug && p.slug.toLowerCase().includes(lower))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "OLDEST") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "A-Z") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return result;
  }, [profiles, searchTerm, statusFilter, sortBy]);

  const toggleSelect = (id: number) => {
    if (selectedProfiles.includes(id)) {
      setSelectedProfiles(prev => prev.filter(pid => pid !== id));
    } else {
      setSelectedProfiles(prev => [...prev, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProfiles.length === filteredAndSortedProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(filteredAndSortedProfiles.map(p => p.id));
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Leader Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage, verify, and audit leader identity profiles published on the sphere.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAdminView("categories");
              if (categoriesList.length > 0) {
                setSelectedCatId(categoriesList[0].id);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
          >
            <Layers className="size-4 text-slate-500" /> Manage Categories
          </button>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="size-4" /> Create New Profile
          </button>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Card 1: Total */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Profiles</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">{totalLeaders}</h3>
            </div>
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold text-emerald-600 inline-flex items-center gap-0.5">
              <TrendingUp className="size-3" /> +12%
            </span>
            <span>vs last month</span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">{pendingReviews}</h3>
            </div>
            <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">Requires admin approval</p>
        </div>

        {/* Card 3: Published Today */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Today</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">{publishedToday}</h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">Successfully synced live</p>
        </div>

        {/* Card 4: Changes Req */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Changes Req</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">{changesRequested}</h3>
            </div>
            <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">Awaiting leader updates</p>
        </div>

        {/* Card 5: Drafts */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work Drafts</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">{drafts}</h3>
            </div>
            <div className="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">Unpublished profile drafts</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, slug, or headline..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <SlidersHorizontal className="size-3.5" /> Filters
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-gray-200/80 rounded-xl pl-4 pr-10 py-2 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 cursor-pointer h-9"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="DRAFT">Draft</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50 border border-gray-200/80 rounded-xl pl-4 pr-10 py-2 text-xs font-semibold outline-none focus:border-blue-500 transition-colors text-slate-700 cursor-pointer h-9"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="A-Z">Name A-Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded-lg w-full" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4 items-center">
              <div className="size-10 rounded-full bg-slate-100" />
              <div className="h-6 bg-slate-100 rounded-md flex-1" />
              <div className="h-6 bg-slate-100 rounded-md w-24" />
              <div className="h-6 bg-slate-100 rounded-md w-16" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedProfiles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-gray-100">
            <Search className="size-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No profiles matched your search</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Try adjusting your status filter or keyword queries.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {selectedProfiles.length === filteredAndSortedProfiles.length ? (
                        <CheckSquare className="size-4.5 text-blue-600" />
                      ) : (
                        <Square className="size-4.5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4">Leader</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedProfiles.map((p: any) => {
                  const isSelected = selectedProfiles.includes(p.id);
                  const status = p.status || "DRAFT";

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/50 transition-colors group ${
                        isSelected ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className={`transition-colors ${
                            isSelected ? "text-blue-600" : "text-slate-300 hover:text-slate-500"
                          }`}
                        >
                          {isSelected ? <CheckSquare className="size-4.5" /> : <Square className="size-4.5" />}
                        </button>
                      </td>

                      {/* Leader details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="size-11 rounded-xl overflow-hidden border border-gray-200 bg-slate-100 shrink-0">
                            <img
                              src={p.portrait}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition duration-150">
                              {p.name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[250px]">
                              {p.title || "No title declared"}
                            </p>
                            <span className="inline-block text-[10px] font-mono font-bold text-blue-500 bg-blue-50/60 px-1.5 py-0.5 rounded mt-1">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {p.category_name ? (
                          <div>
                            <span className="text-xs font-semibold text-slate-700">
                              {p.category_name}
                            </span>
                            {p.subcategory_name && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {p.subcategory_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                            status === "PUBLISHED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : status === "IN_REVIEW"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : status === "CHANGES_REQUESTED"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              status === "PUBLISHED"
                                ? "bg-emerald-500"
                                : status === "IN_REVIEW"
                                ? "bg-amber-500"
                                : status === "CHANGES_REQUESTED"
                                ? "bg-rose-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {new Date(p.updated_at || p.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/leader/$slug"
                            params={{ slug: p.slug }}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                            title="View Live Website"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </Link>

                          {origin && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveQrModal({
                                  name: p.name,
                                  url: `${origin}/leader/${p.slug}`
                                })
                              }
                              className="p-1.5 rounded-lg border border-gray-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shrink-0"
                              title="View Verification QR Code"
                            >
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(
                                  `${origin}/leader/${p.slug}`
                                )}`}
                                alt="QR"
                                className="size-3.5 object-contain grayscale"
                              />
                            </button>
                          )}

                          <button
                            onClick={() => handleEdit(p)}
                            className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs transition h-8"
                          >
                            Edit
                          </button>
                          
                          {handleDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${p.name}? This action cannot be undone.`)) {
                                  handleDelete(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors shrink-0"
                              title="Delete Portfolio"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
