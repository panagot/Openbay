import React from 'react';
import { usePersona } from '../context/PersonaContext.jsx';

export function PersonaToggle({ idPrefix = 'persona' }) {
  const { persona, setPersona } = usePersona();
  const labelId = `${idPrefix}-label`;
  return (
    <div className="persona-toggle-wrap" role="group" aria-labelledby={labelId}>
      <span className="persona-toggle-label" id={labelId}>
        View
      </span>
      <div className="persona-toggle" role="radiogroup" aria-label="Audience mode">
        <button
          type="button"
          role="radio"
          aria-checked={persona === 'host'}
          className={`persona-tab ${persona === 'host' ? 'active' : ''}`}
          onClick={() => setPersona('host')}
        >
          Host
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={persona === 'oem'}
          className={`persona-tab ${persona === 'oem' ? 'active' : ''}`}
          onClick={() => setPersona('oem')}
        >
          OEM / integrator
        </button>
      </div>
    </div>
  );
}
