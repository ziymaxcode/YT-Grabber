import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Helper to check if backend is reachable, if not use mock data
let useMock = false;

export const checkBackend = async () => {
  try {
    await axios.get(`${API_BASE}/settings`, { timeout: 1000 });
    useMock = false;
  } catch (e) {
    console.warn("Backend not reachable. Using mock data for preview.");
    useMock = true;
  }
};

export const fetchVideoInfo = async (url: string) => {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: "video",
          id: "dQw4w9WgXcQ",
          title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          uploader: "Rick Astley",
          duration: 212,
          view_count: 1400000000,
          formats: [
            { format_id: "137", ext: "mp4", resolution: "1920x1080", filesize: 45000000, type: "video" },
            { format_id: "136", ext: "mp4", resolution: "1280x720", filesize: 22000000, type: "video" },
            { format_id: "140", ext: "m4a", abr: 128, filesize: 3000000, type: "audio" },
          ]
        });
      }, 1000);
    });
  }
  const res = await axios.post(`${API_BASE}/info`, { url });
  return res.data;
};

export const startDownload = async (url: string, format_id: string, is_audio: boolean) => {
  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ download_id: "mock-download-" + Date.now() });
      }, 500);
    });
  }
  const res = await axios.post(`${API_BASE}/download`, { url, format_id, is_audio });
  return res.data;
};

export const getHistory = async () => {
  if (useMock) {
    return [
      { id: "1", title: "Sample Video 1.mp4", format: "1080p", date: new Date().toISOString(), filesize: 15000000 },
      { id: "2", title: "Sample Audio.mp3", format: "Audio", date: new Date(Date.now() - 86400000).toISOString(), filesize: 4000000 },
    ];
  }
  const res = await axios.get(`${API_BASE}/history`);
  return res.data;
};

export const deleteHistory = async (id: string) => {
  if (useMock) return { status: "success" };
  const res = await axios.delete(`${API_BASE}/history/${id}`);
  return res.data;
};

export const getSettings = async () => {
  if (useMock) {
    return {
      download_folder: "/Downloads/YT Grabber",
      max_concurrent: 3,
      auto_convert_mp3: false,
      filename_template: "%(title)s.%(ext)s",
      theme: "dark"
    };
  }
  const res = await axios.get(`${API_BASE}/settings`);
  return res.data;
};

export const updateSettings = async (settings: any) => {
  if (useMock) return { status: "success" };
  const res = await axios.post(`${API_BASE}/settings`, settings);
  return res.data;
};
