import React from 'react';
import { motion } from 'motion/react';
import { Video, Music } from 'lucide-react';

interface FormatSelectorProps {
  formats: any[];
  selectedFormat: string;
  onSelect: (formatId: string) => void;
}

export default function FormatSelector({ formats, selectedFormat, onSelect }: FormatSelectorProps) {
  if (!formats || formats.length === 0) return null;

  const videoFormats = formats.filter(f => f.type === 'video').sort((a, b) => {
    const resA = parseInt(a.resolution.split('x')[1] || '0');
    const resB = parseInt(b.resolution.split('x')[1] || '0');
    return resB - resA;
  });
  
  const audioFormats = formats.filter(f => f.type === 'audio').sort((a, b) => (b.abr || 0) - (a.abr || 0));

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col h-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Video size={20} className="text-[#00FF87]" />
        Video Formats
      </h3>
      <div className="space-y-2 mb-6">
        {videoFormats.slice(0, 5).map((f) => (
          <button
            key={f.format_id}
            onClick={() => onSelect(f.format_id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
              selectedFormat === f.format_id 
                ? 'bg-[#00FF87]/10 border-[#00FF87] text-white' 
                : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{f.resolution}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 uppercase">{f.ext}</span>
            </div>
            <span className="text-sm opacity-70">{formatSize(f.filesize)}</span>
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Music size={20} className="text-[#00FF87]" />
        Audio Formats
      </h3>
      <div className="space-y-2">
        {audioFormats.slice(0, 3).map((f) => (
          <button
            key={f.format_id}
            onClick={() => onSelect(f.format_id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
              selectedFormat === f.format_id 
                ? 'bg-[#00FF87]/10 border-[#00FF87] text-white' 
                : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{f.abr ? `${f.abr} kbps` : 'Audio'}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 uppercase">{f.ext}</span>
            </div>
            <span className="text-sm opacity-70">{formatSize(f.filesize)}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
