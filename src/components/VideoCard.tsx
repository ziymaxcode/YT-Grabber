import React from 'react';
import { motion } from 'motion/react';
import { Clock, Eye, User } from 'lucide-react';

interface VideoCardProps {
  video: any;
}

export default function VideoCard({ video }: VideoCardProps) {
  if (!video) return null;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl"
    >
      <div className="relative aspect-video w-full">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <div className="p-5">
        <h2 className="text-xl font-semibold text-white line-clamp-2 mb-3 leading-tight">
          {video.title}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <User size={16} className="text-[#00FF87]" />
            <span className="truncate max-w-[150px]">{video.uploader}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye size={16} className="text-[#00FF87]" />
            <span>{formatViews(video.view_count)} views</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
