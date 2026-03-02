import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, Trash2, FolderOpen, FileVideo, FileAudio } from 'lucide-react';
import { getHistory, deleteHistory } from '../api';
import toast from 'react-hot-toast';

export default function HistoryPanel() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Poll for updates
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteHistory(id);
      setHistory(history.filter(h => h.id !== id));
      toast.success('Removed from history');
    } catch (e) {
      toast.error('Failed to remove item');
    }
  };
  const openFile = async (path: string) => {
  try {
    await fetch(
      `http://127.0.0.1:8000/api/open-file?path=${encodeURIComponent(path)}`
    );
  } catch (error) {
    toast.error("Failed to open file");
  }
};

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <History size={20} className="text-[#00FF87]" />
          Recent Downloads
        </h3>
        <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-md">
          {history.length} items
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No downloads yet.
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <div key={item.id} className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  {item.format.includes('audio') || item.format === 'Audio' ? <FileAudio size={18} /> : <FileVideo size={18} />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate w-full" title={item.title}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{formatDate(item.date)}</span>
                    <span>•</span>
                    <span>{formatSize(item.filesize)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={() => openFile(item.path)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  title="Open File"
                >
                  <FolderOpen size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-400 hover:text-[#FF0000] hover:bg-[#FF0000]/10 rounded-md transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
