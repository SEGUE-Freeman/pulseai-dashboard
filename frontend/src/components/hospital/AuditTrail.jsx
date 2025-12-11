'use client';
import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../lib/api';
export default function AuditTrail({ hospitalId }){
  const [logs, setLogs] = useState([]);
  useEffect(()=> { if (!hospitalId) return; getAuditLogs(hospitalId).then(r=> setLogs(r || [])); }, [hospitalId]);
  return (
    <div>
      <h4 className="text-sm font-medium text-pulsegreen mb-2">Historique</h4>
      <div className="space-y-2 max-h-72 overflow-auto">
        {logs.map(l=>(
          <div key={l.id} className="text-sm border rounded p-2 bg-white">
            <div className="text-xs text-gray-500">{new Date(l.ts).toLocaleString()}</div>
            <div>{l.change_type}</div>
            <pre className="text-xs text-gray-600">{JSON.stringify(l.new_value)}</pre>
          </div>
        ))}
        {logs.length===0 && <div className="text-sm text-gray-500">Aucun log</div>}
      </div>
    </div>
  );
}
