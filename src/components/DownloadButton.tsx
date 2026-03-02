import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DownloadButtonProps {
  onClick: () => void;
  disabled: boolean;
  isDownloading: boolean;
}

export default function DownloadButton({ onClick, disabled, isDownloading }: DownloadButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
        disabled 
          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
          : 'bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white hover:shadow-[#FF0000]/20 hover:shadow-2xl border border-[#FF0000]/50'
      }`}
    >
      {isDownloading ? (
        <>
          <Loader2 size={24} className="animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download size={24} />
          Download Now
        </>
      )}
    </motion.button>
  );
}
