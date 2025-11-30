import React, { useMemo, useState } from 'react';
import { Service, Port, TransshipmentConnection, PotentialConnection } from '../types';
import { Link2, Anchor, Check, Unplug, ShieldAlert } from 'lucide-react';

interface ConnectionManagerProps {
  services: Service[];
  ports: Port[];
  connections: TransshipmentConnection[];
  onAddConnection: (conn: TransshipmentConnection) => void;
  onRemoveConnection: (id: string) => void;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ services, ports, connections, onAddConnection, onRemoveConnection }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'active'>('discover');

  // Logic to discover potential connections
  // ENHANCED: Only allows discovery if Carrier is the same.
  const potentialConnections = useMemo(() => {
    const potentials: PotentialConnection[] = [];
    
    // Naive O(N^2) comparison
    for (let i = 0; i < services.length; i++) {
        for (let j = i + 1; j < services.length; j++) {
            const sA = services[i];
            const sB = services[j];
            
            // STRICT CONSTRAINT: Same Carrier Only
            if (sA.carrierId !== sB.carrierId) continue;

            // Get all ports for sA
            const portsA = new Set<string>();
            sA.legs.forEach(l => { portsA.add(l.originPortId); portsA.add(l.destinationPortId); });
            
            // Get all ports for sB
            const portsB = new Set<string>();
            sB.legs.forEach(l => { portsB.add(l.originPortId); portsB.add(l.destinationPortId); });

            // Intersection
            const commonPortIds = [...portsA].filter(x => portsB.has(x));
            
            if (commonPortIds.length > 0) {
                const commonPorts = commonPortIds.map(id => ports.find(p => p.id === id)!);
                potentials.push({
                    serviceA: sA,
                    serviceB: sB,
                    commonPorts
                });
            }
        }
    }
    return potentials;
  }, [services, ports]);

  const handleConfirm = (sA: Service, sB: Service, portId: string) => {
      // Check if exists
      const exists = connections.some(c => 
          ((c.serviceAId === sA.id && c.serviceBId === sB.id) || (c.serviceAId === sB.id && c.serviceBId === sA.id))
          && c.portId === portId
      );

      if (exists) {
          alert("Connection already active.");
          return;
      }

      onAddConnection({
          id: Math.random().toString(36).substr(2, 9),
          serviceAId: sA.id,
          serviceBId: sB.id,
          portId: portId,
          isActive: true
      });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Transshipment Hub</h2>
            <p className="text-slate-500 text-sm">Manage connectivity between services to enable multi-leg routings.</p>
        </div>
        <div className="flex bg-slate-200 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'discover' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Discovery ({potentialConnections.length})
            </button>
            <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Active Connections ({connections.length})
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2">
          {activeTab === 'discover' && (
              <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 mb-4">
                      <ShieldAlert className="text-blue-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-xs text-blue-700">
                          <strong>Note:</strong> Automatic discovery is currently restricted to services operated by the <u>same carrier</u> to ensure operational feasibility.
                      </p>
                  </div>

                  {potentialConnections.length === 0 && <p className="text-slate-400 text-center py-10">No overlapping same-carrier services found.</p>}
                  
                  {potentialConnections.map((pot, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="flex-1 text-right">
                                  <div className="font-bold text-slate-700">{pot.serviceA.name}</div>
                                  <div className="text-xs text-slate-400">{pot.serviceA.code}</div>
                              </div>
                              <div className="text-slate-300 flex flex-col items-center">
                                  <Link2 size={24}/>
                              </div>
                              <div className="flex-1 text-left">
                                  <div className="font-bold text-slate-700">{pot.serviceB.name}</div>
                                  <div className="text-xs text-slate-400">{pot.serviceB.code}</div>
                              </div>
                          </div>
                          
                          <div className="bg-slate-50 rounded p-3">
                              <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Common Ports (Potential Hubs)</span>
                              <div className="flex flex-wrap gap-2">
                                  {pot.commonPorts.map(port => {
                                      const isConnected = connections.some(c => c.portId === port.id && ((c.serviceAId === pot.serviceA.id && c.serviceBId === pot.serviceB.id) || (c.serviceAId === pot.serviceB.id && c.serviceBId === pot.serviceA.id)));
                                      
                                      return (
                                          <button 
                                            key={port.id}
                                            disabled={isConnected}
                                            onClick={() => handleConfirm(pot.serviceA, pot.serviceB, port.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-50 cursor-default' : 'bg-white border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
                                          >
                                              <Anchor size={12} /> {port.name}
                                              {isConnected ? <Check size={12}/> : <span className="text-xs bg-slate-100 px-1 rounded text-slate-400">Connect</span>}
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {activeTab === 'active' && (
              <div className="space-y-4">
                  {connections.length === 0 && <p className="text-slate-400 text-center py-10">No active connections defined.</p>}
                  {connections.map(conn => {
                      const sA = services.find(s => s.id === conn.serviceAId);
                      const sB = services.find(s => s.id === conn.serviceBId);
                      const port = ports.find(p => p.id === conn.portId);
                      
                      if (!sA || !sB || !port) return null;

                      return (
                          <div key={conn.id} className="bg-white border border-emerald-100 rounded-lg p-4 shadow-sm flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                   <div className="flex flex-col items-center">
                                       <span className="font-bold text-slate-700">{sA.code}</span>
                                   </div>
                                   <div className="w-12 border-t-2 border-dashed border-slate-300"></div>
                                   <div className="flex flex-col items-center bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                                       <span className="text-xs text-emerald-600 font-bold uppercase mb-0.5">HUB</span>
                                       <span className="text-sm font-bold text-slate-800">{port.code}</span>
                                   </div>
                                   <div className="w-12 border-t-2 border-dashed border-slate-300"></div>
                                   <div className="flex flex-col items-center">
                                       <span className="font-bold text-slate-700">{sB.code}</span>
                                   </div>
                               </div>
                               <button 
                                onClick={() => onRemoveConnection(conn.id)}
                                className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                               >
                                   <Unplug size={18} />
                               </button>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
};

export default ConnectionManager;