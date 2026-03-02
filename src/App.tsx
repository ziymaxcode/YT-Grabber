import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Youtube, Download as DownloadIcon } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import URLInput from './components/URLInput';
import VideoCard from './components/VideoCard';
import FormatSelector from './components/FormatSelector';
import DownloadButton from './components/DownloadButton';
import ProgressBar from './components/ProgressBar';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';

import { checkBackend, fetchVideoInfo, startDownload } from './api';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeDownloads, setActiveDownloads] = useState<string[]>([]);

  useEffect(() => {
    checkBackend();
    const savedFormat = localStorage.getItem('yt_grabber_format');
    if (savedFormat) setSelectedFormat(savedFormat);
  }, []);

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setVideoInfo(null);
    try {
      const info = await fetchVideoInfo(url);
      setVideoInfo(info);
      
      // Auto-select best video format if none selected or if previous selection isn't available
      if (info.formats && info.formats.length > 0) {
        const hasFormat = info.formats.some((f: any) => f.format_id === selectedFormat);
        if (!hasFormat) {
          const bestVideo = info.formats.find((f: any) => f.type === 'video');
          if (bestVideo) {
            setSelectedFormat(bestVideo.format_id);
          } else {
            setSelectedFormat(info.formats[0].format_id);
          }
        }
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to fetch video info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    localStorage.setItem('yt_grabber_format', formatId);
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) return;
    
    setIsDownloading(true);
    try {
      const format = videoInfo.formats.find((f: any) => f.format_id === selectedFormat);
      const isAudio = format?.type === 'audio';
      
      const res = await startDownload(`https://www.youtube.com/watch?v=${videoInfo.id}`, selectedFormat, isAudio);
      setActiveDownloads(prev => [...prev, res.download_id]);
      toast.success('Download started!');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to start download');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadComplete = (id: string) => {
    setTimeout(() => {
      setActiveDownloads(prev => prev.filter(d => d !== id));
    }, 3000); // Keep progress bar visible for 3s after completion
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#00FF87]/30 selection:text-[#00FF87]">
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1A1A1A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF0000] p-2 rounded-xl shadow-lg shadow-[#FF0000]/20">
              <Youtube size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                YT Grabber <span className="text-[#00FF87]">Pro</span>
              </h1>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-300 hover:text-white"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Info */}
          <div className="lg:col-span-7 space-y-6">
            <URLInput onSearch={handleSearch} isLoading={isLoading} />
            
            <AnimatePresence mode="wait">
              {videoInfo ? (
                <motion.div
                  key="video-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <VideoCard video={videoInfo} />
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[400px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500 bg-white/[0.02]"
                >
                  <DownloadIcon size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">Paste a URL to get started</p>
                  <p className="text-sm mt-2 opacity-70">Supports Videos, Shorts, and Playlists</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Downloads */}
            <div className="space-y-4">
              <AnimatePresence>
                {activeDownloads.map(id => (
                  <ProgressBar 
                    key={id} 
                    downloadId={id} 
                    onComplete={() => handleDownloadComplete(id)} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Formats & History */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {videoInfo && (
                <motion.div
                  key="format-selector"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <FormatSelector 
                    formats={videoInfo.formats} 
                    selectedFormat={selectedFormat} 
                    onSelect={handleFormatSelect} 
                  />
                  <DownloadButton 
                    onClick={handleDownload} 
                    disabled={!selectedFormat || isDownloading} 
                    isDownloading={isDownloading} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <HistoryPanel />
          </div>

        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}
