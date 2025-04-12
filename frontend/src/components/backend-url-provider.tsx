import { createContext, useContext, useEffect, useState } from 'react';
import { ReactNode } from 'react';

export interface BackendURLType {
  backend: string;
  setBackend: React.Dispatch<React.SetStateAction<string>>;
  status: 'idle' | 'loading' | 'success' | 'error';
}

const BackendURL = createContext<BackendURLType | null>(null);

export const BackendProvider = ({ children }: { children: ReactNode }) => {
  const [backend, setBackend] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchBackend = async () => {
      setStatus('loading');
      try {
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error("Failed to fetch /api/init");

        const data = await res.json();
        setBackend(data.backendURL);
        setStatus('success');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    fetchBackend();
  }, []);

  return (
    <BackendURL.Provider value={{ backend, setBackend, status }}>
      {children}
    </BackendURL.Provider>
  );
};

export const useBackendURL = (): BackendURLType => {
  const context = useContext(BackendURL);
  if (!context) {
    throw new Error("useBackendURL must be used within a BackendProvider");
  }
  return context;
};