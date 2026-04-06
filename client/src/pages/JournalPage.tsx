import { useState, useEffect } from "react";
import JournalTable from "../components/JournalTable";
import JournalEntryForm from "../components/JournalEntryForm";
import { JournalEntry, JournalFormData, JournalStats } from "../types/journal";

const API_URL = "http://localhost:5000/api/journal";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Fetch entries
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "ALL" 
        ? `${API_URL}/entries` 
        : `${API_URL}/entries?status=${filterStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.entries);
      } else {
        setError(data.error || "Failed to fetch entries");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [filterStatus]);

  // Handle save (create or update)
  const handleSave = async (formData: Partial<JournalFormData>) => {
    try {
      const url = editingEntry 
        ? `${API_URL}/entries/${editingEntry._id}` 
        : `${API_URL}/entries`;
      
      const method = editingEntry ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingEntry(null);
        fetchEntries();
        fetchStats();
      } else {
        alert(data.error || "Failed to save entry");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/entries/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchEntries();
        fetchStats();
      } else {
        alert(data.error || "Failed to delete entry");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle edit
  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#131722] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading Journal</h1>
            <p className="text-gray-400">Track and analyze your trades</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            + New Entry
          </button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1E222D] rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total Trades</div>
              <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
            </div>
            
            <div className="bg-[#1E222D] rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.winningTrades}W / {stats.losingTrades}L
              </div>
            </div>
            
            <div className="bg-[#1E222D] rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total PnL</div>
              <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-[#1E222D] rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Avg PnL</div>
              <div className={`text-2xl font-bold ${stats.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.avgPnL >= 0 ? '+' : ''}${stats.avgPnL.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#1E222D] rounded-lg p-4 mb-6 flex items-center gap-4">
          <span className="text-gray-400 text-sm font-medium">Filter:</span>
          <div className="flex gap-2">
            {["ALL", "OPEN", "CLOSED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-[#131722] text-gray-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <span className="ml-auto text-gray-400 text-sm">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <JournalTable
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <JournalEntryForm
            entry={editingEntry}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
