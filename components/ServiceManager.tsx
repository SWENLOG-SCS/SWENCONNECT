
import React, { useState } from 'react';
import { Carrier, Port, Service, ServiceLeg, TransshipmentConnection } from '../types';
import { Plus, Trash2, Save, X, Network, CheckSquare, Square, Pencil, Anchor, Ship } from 'lucide-react';

interface ServiceManagerProps {
  services: Service[];
  ports: Port[];
  carriers: Carrier[];
  connections: TransshipmentConnection[];
  onAddService: (service: Service) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onAddConnection: (conn: TransshipmentConnection) => void;
  onAddCarrier: (carrier: Carrier) => void;
  onAddPort: (port: Port) => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ 
    services, ports, carriers, connections, 
    onAddService, onUpdateService, onDeleteService, onAddConnection,
    onAddCarrier, onAddPort
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Connection Discovery Modal State
  const [discoveredPotentials, setDiscoveredPotentials] = useState<{service: Service, portId: string}[]>([]);
  const [pendingService, setPendingService] = useState<Service | null>(null);
  const [selectedPotentials, setSelectedPotentials] = useState<number[]>([]);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  // Quick Add Modals State
  const [showAddCarrierModal, setShowAddCarrierModal] = useState(false);
  const [showAddPortModal, setShowAddPortModal] = useState(false);

  // Quick Add Form Data
  const [quickCarrierName, setQuickCarrierName] = useState('');
  const [quickCarrierCode, setQuickCarrierCode] = useState('');
  const [quickCarrierColor, setQuickCarrierColor] = useState('#3b82f6');
  
  const [quickPortName, setQuickPortName] = useState('');
  const [quickPortCode, setQuickPortCode] = useState('');
  const [quickPortCountry, setQuickPortCountry] = useState('');
  const [quickPortLat, setQuickPortLat] = useState('');
  const [quickPortLng, setQuickPortLng] = useState('');

  // Service Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState(carriers[0]?.id || '');
  const [legs, setLegs] = useState<Partial<ServiceLeg>[]>([]);

  const handleAddLeg = () => {
    // Automatically set the origin of the new leg to the destination of the last leg
    const lastLeg = legs[legs.length - 1];
    const defaultOrigin = lastLeg ? lastLeg.destinationPortId : (ports[0]?.id || '');
    const defaultDest = ports[0]?.id || '';
    
    setLegs([...legs, { 
      id: Math.random().toString(36).substr(2, 9),
      originPortId: defaultOrigin, 
      destinationPortId: defaultDest, 
      transitTimeDays: 1,
      carrierId: selectedCarrier || carriers[0]?.id // Default to main service carrier
    }]);
  };

  const updateLeg = (index: number, field: keyof ServiceLeg, value: any) => {
    const updated = [...legs];
    updated[index] = { ...updated[index], [field]: value };
    setLegs(updated);
  };

  const removeLeg = (index: number) => {
    setLegs(legs.filter((_, i) => i !== index));
  };

  const startEditing = (service: Service) => {
    setEditingId(service.id);
    setNewName(service.name);
    setNewCode(service.code);
    setSelectedCarrier(service.carrierId);
    // Deep copy legs to avoid mutation issues
    setLegs(service.legs.map(l => ({ ...l })));
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setNewName('');
    setNewCode('');
    setLegs([]);
    setPendingService(null);
    setDiscoveredPotentials([]);
    setShowDiscoveryModal(false);
  };

  const handleSave = () => {
    if (!newName || !newCode || legs.length === 0) return alert("Please fill all fields and add at least one leg.");
    
    // Validate carrierIds on legs
    const invalidLegs = legs.some(l => !l.carrierId);
    if (invalidLegs) return alert("Please ensure all legs have a valid carrier selected.");

    const newService: Service = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: newName,
      code: newCode,
      carrierId: selectedCarrier,
      legs: legs as ServiceLeg[]
    };

    if (editingId) {
        // Update existing service
        onUpdateService(newService);
        resetForm();
    } else {
        // Create new service with connection discovery logic
        // 1. Identify Potential Connections (Same Carrier Only)
        const potentials: {service: Service, portId: string}[] = [];
        const newServicePorts = new Set<string>();
        newService.legs.forEach(l => { newServicePorts.add(l.originPortId); newServicePorts.add(l.destinationPortId); });

        services.forEach(existingService => {
            if (existingService.carrierId === newService.carrierId) {
                const existingPorts = new Set<string>();
                existingService.legs.forEach(l => { existingPorts.add(l.originPortId); existingPorts.add(l.destinationPortId); });
                
                // Find intersection
                const common = [...newServicePorts].filter(p => existingPorts.has(p));
                common.forEach(portId => {
                    potentials.push({ service: existingService, portId });
                });
            }
        });

        if (potentials.length > 0) {
            setPendingService(newService);
            setDiscoveredPotentials(potentials);
            setSelectedPotentials(potentials.map((_, i) => i)); // Select all by default
            setShowDiscoveryModal(true);
        } else {
            // No connections found, just save
            finalizeSave(newService);
        }
    }
  };

  const finalizeSave = (service: Service, connectionsToCreate: {service: Service, portId: string}[] = []) => {
      onAddService(service);
      
      // Create connections if any
      connectionsToCreate.forEach(pot => {
          onAddConnection({
            id: Math.random().toString(36).substr(2, 9),
            serviceAId: service.id,
            serviceBId: pot.service.id,
            portId: pot.portId,
            isActive: true
          });
      });

      resetForm();
  };

  const togglePotential = (index: number) => {
      if (selectedPotentials.includes(index)) {
          setSelectedPotentials(selectedPotentials.filter(i => i !== index));
      } else {
          setSelectedPotentials([...selectedPotentials, index]);
      }
  };

  const handleQuickAddCarrier = () => {
    if(!quickCarrierName || !quickCarrierCode) return;
    const newCarrier = {
        id: Math.random().toString(36).substr(2, 9),
        name: quickCarrierName,
        code: quickCarrierCode,
        color: quickCarrierColor
    };
    onAddCarrier(newCarrier);
    setSelectedCarrier(newCarrier.id); // Auto-select the new carrier
    setShowAddCarrierModal(false);
    setQuickCarrierName('');
    setQuickCarrierCode('');
  };

  const handleQuickAddPort = () => {
    if(!quickPortName || !quickPortCode || !quickPortLat || !quickPortLng) return;
    const newPort = {
        id: Math.random().toString(36).substr(2, 9),
        name: quickPortName,
        code: quickPortCode,
        country: quickPortCountry,
        coordinates: [parseFloat(quickPortLng), parseFloat(quickPortLat)] as [number, number]
    };
    onAddPort(newPort);
    setShowAddPortModal(false);
    setQuickPortName('');
    setQuickPortCode('');
    setQuickPortCountry('');
    setQuickPortLat('');
    setQuickPortLng('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Service Management</h2>
        {!isCreating && (
            <button 
            onClick={() => {
                setEditingId(null);
                setNewName('');
                setNewCode('');
                setLegs([]);
                setIsCreating(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
            >
            <Plus size={18} /> Add New Service
            </button>
        )}
      </div>

      {isCreating && !showDiscoveryModal && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4 relative z-0">
          <div className="flex justify-between mb-4">
             <h3 className="text-lg font-semibold text-slate-700">{editingId ? 'Edit Service' : 'Create New Service Loop'}</h3>
             <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Service Carrier</label>
                 <button 
                   onClick={() => setShowAddCarrierModal(true)}
                   className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-100 flex items-center gap-1"
                 >
                    <Plus size={10} /> New
                 </button>
              </div>
              <select 
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service Name</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Asia-Europe Loop 5"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Service Code</label>
              <input 
                type="text" 
                value={newCode} 
                onChange={e => setNewCode(e.target.value)}
                placeholder="e.g. AE5"
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-slate-600">Route Definition (Legs)</h4>
                <div className="flex gap-2">
                     <button 
                       onClick={() => setShowAddPortModal(true)}
                       className="text-xs bg-white border border-slate-300 px-2 py-1 rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                     >
                        <Plus size={12}/> New Port
                     </button>
                    <button onClick={handleAddLeg} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                        <Plus size={14}/> Add Leg
                    </button>
                </div>
             </div>
             
             {legs.length === 0 ? (
                <div className="text-center text-slate-400 py-4 text-sm italic">No legs added yet. Start building the route.</div>
             ) : (
                <div className="space-y-2">
                   {legs.map((leg, idx) => (
                      <div key={idx} className="flex gap-2 items-end bg-white p-3 rounded border border-slate-200 shadow-sm">
                         <div className="flex-1">
                            <span className="text-xs text-slate-400 block mb-1">Port of Loading</span>
                            <select 
                                value={leg.originPortId} 
                                onChange={e => updateLeg(idx, 'originPortId', e.target.value)}
                                className="w-full text-sm border-b border-slate-300 pb-1 outline-none bg-transparent"
                            >
                                {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                            </select>
                         </div>
                         <div className="flex items-center justify-center pb-2 px-2 text-slate-300">→</div>
                         <div className="flex-1">
                            <span className="text-xs text-slate-400 block mb-1">Port of Discharge</span>
                            <select 
                                value={leg.destinationPortId} 
                                onChange={e => updateLeg(idx, 'destinationPortId', e.target.value)}
                                className="w-full text-sm border-b border-slate-300 pb-1 outline-none bg-transparent"
                            >
                                {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                            </select>
                         </div>
                         <div className="w-32">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-400 block">Leg Carrier</span>
                                <button onClick={() => setShowAddCarrierModal(true)} className="text-[10px] text-blue-500 hover:underline">New</button>
                            </div>
                            <select 
                                value={leg.carrierId}
                                onChange={e => updateLeg(idx, 'carrierId', e.target.value)}
                                className="w-full text-sm border-b border-slate-300 pb-1 outline-none bg-transparent"
                            >
                                {carriers.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                            </select>
                         </div>
                         <div className="w-24">
                            <span className="text-xs text-slate-400 block mb-1">Days</span>
                            <input 
                                type="number" 
                                value={leg.transitTimeDays}
                                onChange={e => updateLeg(idx, 'transitTimeDays', parseInt(e.target.value))}
                                className="w-full text-sm border-b border-slate-300 pb-1 outline-none bg-transparent"
                            />
                         </div>
                         <button onClick={() => removeLeg(idx)} className="text-red-400 hover:text-red-600 p-2">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
             <button onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
             <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                <Save size={18} /> {editingId ? 'Update Service' : 'Save Service'}
             </button>
          </div>
        </div>
      )}

      {/* Quick Add Carrier Modal */}
      {showAddCarrierModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><Ship size={16} className="text-blue-500"/> Add Carrier</h3>
                      <button onClick={() => setShowAddCarrierModal(false)}><X size={18} className="text-slate-400"/></button>
                  </div>
                  <div className="p-4 space-y-3">
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                          <input type="text" value={quickCarrierName} onChange={e => setQuickCarrierName(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Code</label>
                          <input type="text" value={quickCarrierCode} onChange={e => setQuickCarrierCode(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Color</label>
                          <input type="color" value={quickCarrierColor} onChange={e => setQuickCarrierColor(e.target.value)} className="w-full h-8 cursor-pointer"/>
                      </div>
                      <button onClick={handleQuickAddCarrier} className="w-full bg-blue-600 text-white py-2 rounded font-medium mt-2">Add Carrier</button>
                  </div>
              </div>
          </div>
      )}

      {/* Quick Add Port Modal */}
      {showAddPortModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><Anchor size={16} className="text-blue-500"/> Add Port</h3>
                      <button onClick={() => setShowAddPortModal(false)}><X size={18} className="text-slate-400"/></button>
                  </div>
                  <div className="p-4 space-y-3">
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                          <input type="text" value={quickPortName} onChange={e => setQuickPortName(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Code</label>
                            <input type="text" value={quickPortCode} onChange={e => setQuickPortCode(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Country</label>
                            <input type="text" value={quickPortCountry} onChange={e => setQuickPortCountry(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Lat</label>
                            <input type="number" value={quickPortLat} onChange={e => setQuickPortLat(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Lng</label>
                            <input type="number" value={quickPortLng} onChange={e => setQuickPortLng(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm"/>
                        </div>
                      </div>
                      <button onClick={handleQuickAddPort} className="w-full bg-blue-600 text-white py-2 rounded font-medium mt-2">Add Port</button>
                  </div>
              </div>
          </div>
      )}

      {/* Discovery Modal */}
      {showDiscoveryModal && pendingService && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 mb-1">
                          <Network className="text-blue-500" size={24}/>
                          <h3 className="text-lg font-bold text-slate-800">Connections Discovered</h3>
                      </div>
                      <p className="text-sm text-slate-500">
                          We found {discoveredPotentials.length} potential connections for <strong>{pendingService.code}</strong> with existing <strong>{carriers.find(c => c.id === pendingService.carrierId)?.name}</strong> services.
                      </p>
                  </div>
                  
                  <div className="p-0 max-h-[60vh] overflow-y-auto">
                      {discoveredPotentials.map((pot, idx) => {
                          const portName = ports.find(p => p.id === pot.portId)?.name;
                          const isSelected = selectedPotentials.includes(idx);
                          return (
                              <div 
                                key={idx} 
                                onClick={() => togglePotential(idx)}
                                className={`p-4 border-b border-slate-100 cursor-pointer flex items-center gap-4 transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                              >
                                  <div className={`shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                                      {isSelected ? <CheckSquare size={20}/> : <Square size={20}/>}
                                  </div>
                                  <div>
                                      <div className="text-sm font-semibold text-slate-700">Connect to {pot.service.name}</div>
                                      <div className="text-xs text-slate-500">at Port: <strong>{portName}</strong></div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                      <button 
                        onClick={() => finalizeSave(pendingService, [])}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
                      >
                          Skip Connections
                      </button>
                      <button 
                        onClick={() => finalizeSave(pendingService, discoveredPotentials.filter((_, i) => selectedPotentials.includes(i)))}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                      >
                          Save & Connect ({selectedPotentials.length})
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => {
            const carrier = carriers.find(c => c.id === service.carrierId);
            const connectionCount = connections.filter(c => c.serviceAId === service.id || c.serviceBId === service.id).length;
            
            return (
                <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-10 w-14 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 overflow-hidden shadow-sm">
                                     {carrier?.logo ? (
                                         <img src={carrier.logo} alt={carrier.name} className="w-full h-full object-contain" />
                                     ) : (
                                         <div className="w-full h-full rounded-sm" style={{ backgroundColor: carrier?.color || '#cbd5e1' }}></div>
                                     )}
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    {carrier?.name}
                                </span>
                            </div>
                            <h4 className="font-bold text-lg text-slate-800 leading-tight">{service.name}</h4>
                            <p className="text-sm text-slate-500 font-mono mt-0.5">{service.code}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(service)} className="text-slate-300 hover:text-blue-500 p-1.5 rounded hover:bg-blue-50" title="Edit Service">
                                <Pencil size={18} />
                            </button>
                            <button onClick={() => onDeleteService(service.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50" title="Delete Service">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <div className="flex justify-between mb-1">
                            <span>Ports of Call:</span>
                            <span className="font-medium text-slate-700">{service.legs.length + 1}</span>
                        </div>
                         <div className="flex justify-between mb-1">
                            <span>Active Connections:</span>
                            <span className={`font-medium ${connectionCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{connectionCount}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                             {service.legs.map((leg, i) => {
                                 const portCode = ports.find(p => p.id === leg.originPortId)?.code;
                                 return (
                                     <span key={i} className="flex items-center gap-1">
                                         {portCode} <span className="text-slate-300">→</span>
                                     </span>
                                 )
                             })}
                             <span>{ports.find(p => p.id === service.legs[service.legs.length-1]?.destinationPortId)?.code}</span>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ServiceManager;
