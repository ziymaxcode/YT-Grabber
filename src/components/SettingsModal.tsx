import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Folder, Save } from 'lucide-react';
import { getSettings, updateSettings } from '../api';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<any>({
    download_folder: '',
    max_concurrent: 3,
    auto_convert_mp3: false,
    filename_template: '%(title)s.%(ext)s',
    theme: 'dark'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      getSettings().then(data => {
        setSettings(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      toast.success('Settings saved successfully');
      onClose();
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Settings size={20} className="text-[#00FF87]" />
              Settings
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading settings...</div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Download Folder */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Folder size={16} /> Download Folder Path
                </label>
                <input 
                  type="text" 
                  value={settings.download_folder}
                  onChange={e => setSettings({...settings, download_folder: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00FF87] transition-colors"
                  placeholder="C:\Downloads\YT Grabber"
                />
              </div>

              {/* Max Concurrent */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex justify-between">
                  <span>Max Concurrent Downloads</span>
                  <span className="text-[#00FF87]">{settings.max_concurrent}</span>
                </label>
                <input 
                  type="range" 
                  min="1" max="5" step="1"
                  value={settings.max_concurrent}
                  onChange={e => setSettings({...settings, max_concurrent: parseInt(e.target.value)})}
                  className="w-full accent-[#00FF87]"
                />
              </div>

              {/* Auto Convert */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Auto-convert to MP3</p>
                  <p className="text-xs text-gray-400 mt-1">Always extract audio as MP3</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.auto_convert_mp3}
                    onChange={e => setSettings({...settings, auto_convert_mp3: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF87]"></div>
                </label>
              </div>

              {/* Filename Template */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Filename Template</label>
                <input 
                  type="text" 
                  value={settings.filename_template}
                  onChange={e => setSettings({...settings, filename_template: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00FF87] transition-colors font-mono"
                />
                <p className="text-xs text-gray-500">Available: %(title)s, %(id)s, %(uploader)s, %(ext)s</p>
              </div>
            </div>
          )}

          <div className="p-5 border-t border-white/10 bg-black/20 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-[#00FF87] hover:bg-[#00CC6A] text-black font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
