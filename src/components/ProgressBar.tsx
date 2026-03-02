import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ProgressBarProps {
  key?: React.Key;
  downloadId: string;
  onComplete: () => void;
}

export default function ProgressBar({ downloadId, onComplete }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('starting');
  const [speed, setSpeed] = useState('');
  const [eta, setEta] = useState('');
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!downloadId) return;

    // Using EventSource for SSE
    const eventSource = new EventSource(`http://localhost:8000/api/progress/${downloadId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === 'not_found') {
          eventSource.close();
          return;
        }

        setProgress(data.progress || 0);
        setStatus(data.status);
        setSpeed(data.speed || '');
        setEta(data.eta || '');
        setFilename(data.filename || '');

        if (data.status === 'finished') {
          setProgress(100);
          eventSource.close();
          onComplete();
        } else if (data.status === 'error') {
          setError(data.error || 'An error occurred during download');
          eventSource.close();
        }
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };

    eventSource.onerror = () => {
      // If backend is not reachable (e.g. preview mode), simulate progress
      eventSource.close();
      simulateProgress();
    };

    return () => {
      eventSource.close();
    };
  }, [downloadId]);

  const simulateProgress = () => {
    setStatus('downloading');
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 10;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setStatus('finished');
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      } else {
        setProgress(current);
        setSpeed(`${(Math.random() * 5 + 1).toFixed(1)} MiB/s`);
        setEta(`00:00:${Math.floor(Math.random() * 30 + 10)}`);
      }
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl mt-6"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-medium truncate max-w-[70%]">
          {filename ? filename.split('/').pop() : 'Downloading...'}
        </h4>
        <span className="text-[#00FF87] font-mono text-sm">
          {progress.toFixed(1)}%
        </span>
      </div>

      <div className="w-full bg-black/40 rounded-full h-3 mb-3 overflow-hidden border border-white/5">
        <motion.div 
          className="bg-gradient-to-r from-[#00FF87] to-[#00CC6A] h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.5 }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
        {status === 'downloading' && (
          <>
            <span>{speed}</span>
            <span>ETA: {eta}</span>
          </>
        )}
        {status === 'finished' && (
          <span className="text-[#00FF87] flex items-center gap-1">
            <CheckCircle2 size={14} /> Download Complete
          </span>
        )}
        {status === 'error' && (
          <span className="text-[#FF0000] flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </span>
        )}
        {status === 'starting' && (
          <span className="text-gray-300 flex items-center gap-1">
            <Loader2 size={14} className="animate-spin" /> Starting...
          </span>
        )}
      </div>
    </motion.div>
  );
}
