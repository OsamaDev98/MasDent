"use client";
import { createContext, useContext } from 'react';
import type { ISettings } from '@/models/Settings';

const SettingsContext = createContext<{ settings: Partial<ISettings> | null }>({ settings: null });

export function SettingsProvider({ children, settings }: { children: React.ReactNode, settings: Partial<ISettings> }) {
  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
