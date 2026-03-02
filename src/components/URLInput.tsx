import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface URLInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export default function URLInput({ onSearch, isLoading }: URLInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="relative w-full"
    >
      <div className="relative flex items-center w-full">
        <div className="absolute left-4 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL here..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87] focus:border-transparent transition-all backdrop-blur-md shadow-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="absolute right-2 bg-[#FF0000] hover:bg-[#CC0000] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-xl transition-colors flex items-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Fetch'}
        </button>
      </div>
    </motion.form>
  );
}
