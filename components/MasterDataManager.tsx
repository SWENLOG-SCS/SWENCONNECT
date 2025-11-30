
import React, { useState } from 'react';
import { Carrier, Port, InlandConnection, TransportMode } from '../types';
import { Anchor, Ship, Plus, Trash2, MapPin, Image as ImageIcon, Pencil, X, Save, Train, Truck } from 'lucide-react';

interface MasterDataManagerProps {
  ports: Port[];
  carriers: Carrier[];
  inlandConnections: InlandConnection[];
  onAddPort: (port: Port) => void;
  onUpdatePort: (port: Port) => void;
  onAddCarrier: (carrier: Carrier) => void;
  onUpdateCarrier: (carrier: Carrier) => void;
  onDeletePort: (id: string) => void;
  onDeleteCarrier: (id: string) => void;
  onAddInlandConnection: (conn: InlandConnection) => void;
  onDeleteInlandConnection: (id: string) => void;
}

const MasterDataManager: React.FC<MasterDataManagerProps> = ({ 
  ports, 
  carriers, 
  inlandConnections,
  onAddPort, 
  onUpdatePort,
  onAddCarrier, 
  onUpdateCarrier,
  onDeletePort, 
  onDeleteCarrier,
  onAddInlandConnection,
  onDeleteInlandConnection
}) => {
  const [activeTab, setActiveTab] = useState<'carriers' | 'ports' | 'inland'>('carriers');

  // Carrier Form State
  const [editingCarrierId, setEditingCarrierId] = useState<string | null>(null);
  const [carrierName, setCarrierName] = useState('');
  const [carrierCode, setCarrierCode] = useState('');
  const [carrierColor, setCarrierColor] = useState('#3b82f6');
  const [carrierLogo, setCarrierLogo] = useState('');

  // Port Form State
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [portName, setPortName] = useState('');
  const [portCode, setPortCode] = useState('');
  const [portCountry, setPortCountry] = useState('');
  const [portLat, setPortLat] = useState<string>('');
  const [portLng, setPortLng] = useState<string>('');
  const [portType, setPortType] = useState<'SEAPORT' | 'INLAND'>('SEAPORT');

  // Inland Connection Form
  const [inlandHubId, setInlandHubId] = useState('');
  const [inlandPortId, setInlandPortId] = useState('');
  const [inlandMode, setInlandMode] = useState<TransportMode>('RAIL');
  const [inlandDays, setInlandDays] = useState(1);

  const resetCarrierForm = () => {
    setCarrierName(''); setCarrierCode(''); setCarrierColor('#3b82f6'); setCarrierLogo(''); setEditingCarrierId(null);
  };

  const resetPortForm = () => {
    setPortName(''); setPortCode(''); setPortCountry(''); setPortLat(''); setPortLng(''); setPortType('SEAPORT'); setEditingPortId(null);
  };

  const startEditingCarrier = (carrier: Carrier) => {
    setEditingCarrierId(carrier.id); setCarrierName(carrier.name); setCarrierCode(carrier.code); setCarrierColor(carrier.color); setCarrierLogo(carrier.logo || ''); setActiveTab('carriers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditingPort = (port: Port) => {
    setEditingPortId(port.id); setPortName(port.name); setPortCode(port.code); setPortCountry(port.country);
    setPortLat(port.coordinates[1].toString()); setPortLng(port.coordinates[0].toString());
    setPortType(port.type);
    setActiveTab('ports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCarrier = () => {
    if (!carrierName || !carrierCode) return;
    const carrierData: Carrier = { id: editingCarrierId || Math.random().toString(36).substr(2, 9), name: carrierName, code: carrierCode, color: carrierColor, logo: carrierLogo || undefined };
    if (editingCarrierId) onUpdateCarrier(carrierData); else onAddCarrier(carrierData);
    resetCarrierForm();
  };

  const handleSavePort = () => {
    if (!portName || !portCode || !portCountry || !portLat || !portLng) return;
    const lat = parseFloat(portLat); const lng = parseFloat(portLng);
    if (isNaN(lat) || isNaN(lng)) return alert("Invalid coordinates");
    const portData: Port = { id: editingPortId || Math.random().toString(36).substr(2, 9), name: portName, code: portCode, country: portCountry, coordinates: [lng, lat], type: portType };
    if (editingPortId) onUpdatePort(portData); else onAddPort(portData);
    resetPortForm();
  };

  const handleAddConnection = () => {
      if (!inlandHubId || !inlandPortId) return;
      onAddInlandConnection({
          id: Math.random().toString(36).substr(2, 9),
          hubId: inlandHubId,
          portId: inlandPortId,
          mode: inlandMode,
          transitTimeDays: inlandDays
      });
      setInlandHubId(''); setInlandPortId(''); setInlandDays(1);
  };

  const inlandHubs = ports.filter(p => p.type === 'INLAND');
  const seaports = ports.filter(p => p.type === 'SEAPORT');

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Master Data Manager</h2>
            <p className="text-slate-500 text-sm">Configure Carriers, Ports, and Intermodal links.</p>
        </div>
        <div className="flex bg-slate-200 rounded-lg p-1">
            <button onClick={() => setActiveTab('carriers')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'carriers' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                <Ship size={16} /> Carriers
            </button>
            <button onClick={() => setActiveTab('ports')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'ports' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                <Anchor size={16} /> Ports
            </button>
            <button onClick={() => setActiveTab('inland')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'inland' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                <Train size={16} /> Inland
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
          {activeTab === 'carriers' && (
              <div className="space-y-6">
                   <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                       <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input className="w-full border p-2 rounded text-sm" value={carrierName} onChange={e=>setCarrierName(e.target.value)}/></div>
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Code</label><input className="w-full border p-2 rounded text-sm" value={carrierCode} onChange={e=>setCarrierCode(e.target.value)}/></div>
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Color</label><input type="color" className="w-full h-9 rounded" value={carrierColor} onChange={e=>setCarrierColor(e.target.value)}/></div>
                          <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Logo</label><input className="w-full border p-2 rounded text-sm" value={carrierLogo} onChange={e=>setCarrierLogo(e.target.value)}/></div>
                          <button onClick={handleSaveCarrier} className="bg-blue-600 text-white p-2 rounded text-sm font-bold md:col-span-1">{editingCarrierId ? 'Update' : 'Add'}</button>
                       </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {carriers.map(c => (
                           <div key={c.id} className="bg-white p-4 rounded shadow-sm border flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                   {c.logo && <img src={c.logo} className="w-8 h-8 object-contain"/>}
                                   <div><div className="font-bold text-sm">{c.name}</div><div className="text-xs text-slate-400">{c.code}</div></div>
                               </div>
                               <div className="flex gap-2">
                                   <button onClick={()=>startEditingCarrier(c)}><Pencil size={16} className="text-slate-400 hover:text-blue-500"/></button>
                                   <button onClick={()=>onDeleteCarrier(c.id)}><Trash2 size={16} className="text-slate-400 hover:text-red-500"/></button>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
          )}

          {activeTab === 'ports' && (
              <div className="space-y-6">
                  {/* Port Form */}
                  <div className={`bg-white p-5 rounded-xl shadow-sm border ${editingPortId ? 'border-blue-200' : 'border-slate-200'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input className="w-full border p-2 rounded text-sm" value={portName} onChange={e=>setPortName(e.target.value)}/></div>
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Code</label><input className="w-full border p-2 rounded text-sm" value={portCode} onChange={e=>setPortCode(e.target.value)}/></div>
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Country</label><input className="w-full border p-2 rounded text-sm" value={portCountry} onChange={e=>setPortCountry(e.target.value)}/></div>
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Lat</label><input type="number" className="w-full border p-2 rounded text-sm" value={portLat} onChange={e=>setPortLat(e.target.value)}/></div>
                          <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Lng</label><input type="number" className="w-full border p-2 rounded text-sm" value={portLng} onChange={e=>setPortLng(e.target.value)}/></div>
                          <div className="md:col-span-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                              <select className="w-full border p-2 rounded text-sm bg-white" value={portType} onChange={e=>setPortType(e.target.value as any)}>
                                  <option value="SEAPORT">Seaport</option>
                                  <option value="INLAND">Inland Hub</option>
                              </select>
                          </div>
                          <button onClick={handleSavePort} className="bg-blue-600 text-white p-2 rounded text-sm font-bold md:col-span-1">{editingPortId ? 'Update' : 'Add'}</button>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {ports.map(p => (
                           <div key={p.id} className="bg-white p-4 rounded shadow-sm border flex justify-between items-start relative overflow-hidden">
                               {p.type === 'INLAND' && <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-bl font-bold">INLAND</div>}
                               <div>
                                   <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                       {p.type === 'INLAND' ? <Train size={14} className="text-amber-500"/> : <Anchor size={14} className="text-blue-500"/>}
                                       {p.name}
                                   </div>
                                   <div className="text-xs text-slate-500">{p.country}</div>
                                   <div className="text-[10px] font-mono text-slate-400 mt-1">{p.code}</div>
                               </div>
                               <div className="flex flex-col gap-1 mt-4">
                                   <button onClick={()=>startEditingPort(p)}><Pencil size={14} className="text-slate-300 hover:text-blue-500"/></button>
                                   <button onClick={()=>onDeletePort(p.id)}><Trash2 size={14} className="text-slate-300 hover:text-red-500"/></button>
                               </div>
                           </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'inland' && (
              <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Train size={16}/> Link Inland Hub to Seaport</h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Inland Hub</label>
                              <select className="w-full border p-2 rounded text-sm bg-white" value={inlandHubId} onChange={e=>setInlandHubId(e.target.value)}>
                                  <option value="">Select Hub...</option>
                                  {inlandHubs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                          </div>
                          <div className="md:col-span-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Gateway Seaport</label>
                              <select className="w-full border p-2 rounded text-sm bg-white" value={inlandPortId} onChange={e=>setInlandPortId(e.target.value)}>
                                  <option value="">Select Port...</option>
                                  {seaports.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                          </div>
                          <div className="md:col-span-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Mode</label>
                              <select className="w-full border p-2 rounded text-sm bg-white" value={inlandMode} onChange={e=>setInlandMode(e.target.value as any)}>
                                  <option value="RAIL">Rail</option>
                                  <option value="TRUCK">Truck</option>
                                  <option value="BARGE">Barge</option>
                              </select>
                          </div>
                          <div className="md:col-span-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Transit Days</label>
                              <input type="number" className="w-full border p-2 rounded text-sm" value={inlandDays} onChange={e=>setInlandDays(parseInt(e.target.value))}/>
                          </div>
                          <button onClick={handleAddConnection} className="bg-emerald-600 text-white p-2 rounded text-sm font-bold md:col-span-1 hover:bg-emerald-700">Add Link</button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {inlandConnections.map(ic => {
                          const hub = ports.find(p => p.id === ic.hubId);
                          const port = ports.find(p => p.id === ic.portId);
                          if (!hub || !port) return null;
                          return (
                              <div key={ic.id} className="bg-white p-4 rounded shadow-sm border border-slate-200 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold text-sm text-slate-700">{hub.code}</span>
                                          <span className="text-[10px] text-slate-400">HUB</span>
                                      </div>
                                      <div className="flex flex-col items-center px-2">
                                          {ic.mode === 'RAIL' ? <Train size={16} className="text-slate-400"/> : <Truck size={16} className="text-slate-400"/>}
                                          <div className="h-0.5 w-8 bg-slate-300 my-0.5"></div>
                                          <span className="text-[10px] font-bold text-slate-500">{ic.transitTimeDays}d</span>
                                      </div>
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold text-sm text-slate-700">{port.code}</span>
                                          <span className="text-[10px] text-slate-400">PORT</span>
                                      </div>
                                  </div>
                                  <button onClick={()=>onDeleteInlandConnection(ic.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                          )
                      })}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default MasterDataManager;
