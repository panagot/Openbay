import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'vdw_persona';

const PersonaContext = createContext(null);

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'host' || v === 'oem') return v;
  } catch {
    /* ignore */
  }
  return 'oem';
}

export function PersonaProvider({ children }) {
  const [persona, setPersonaState] = useState(() => readStored());

  const setPersona = useCallback(next => {
    setPersonaState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ persona, setPersona }), [persona, setPersona]);

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return ctx;
}
