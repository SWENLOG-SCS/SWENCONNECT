
import React, { useState } from 'react';
import { Carrier, Port } from '../types';
import { Anchor, Ship, Plus, Trash2, MapPin, Image as ImageIcon, Pencil, X, Save } from 'lucide-react';

interface MasterDataManagerProps {
  ports: Port[];
  carriers: Carrier[];
  onAddPort: (port: Port) => void;
  onUpdatePort: (port: Port) => void;
  onAddCarrier: (carrier: Carrier) => void;
  onUpdateCarrier: (carrier: Carrier) => void;
  onDeletePort: (id: string) => void;
  onDeleteCarrier: (id: string) => void;
}

const MasterDataManager: React.FC<MasterDataManagerProps> = ({ 
  ports, 
  carriers, 
  onAddPort, 
  onUpdatePort,
  onAddCarrier, 
  onUpdateCarrier,
  onDeletePort, 
  onDeleteCarrier 
}) => {
  const [activeTab, setActiveTab] = useState<'carriers' | 'ports'>('carriers');

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

  const resetCarrierForm = () => {
    setCarrierName('');
    setCarrierCode('');
    setCarrierColor('#3b82f6');
    setCarrierLogo('');
    setEditingCarrierId(null);
  };

  const resetPortForm = () => {
    setPortName('');
    setPortCode('');
    setPortCountry('');
    setPortLat('');
    setPortLng('');
    setEditingPortId(null);
  };

  const startEditingCarrier = (carrier: Carrier) => {
    setEditingCarrierId(carrier.id);
    setCarrierName(carrier.name);
    setCarrierCode(carrier.code);
    setCarrierColor(carrier.color);
    setCarrierLogo(carrier.logo || '');
    setActiveTab('carriers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditingPort = (port: Port) => {
    setEditingPortId(port.id);
    setPortName(port.name);
    setPortCode(port.code);
    setPortCountry(port.country);
    // Coordinates are [lng, lat]
    setPortLat(port.coordinates[1].toString());
    setPortLng(port.coordinates[0].toString());
    setActiveTab('ports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCarrier = () => {
    if (!carrierName || !carrierCode) return;
    
    const carrierData: Carrier = {
      id: editingCarrierId || Math.random().toString(36).substr(2, 9),
      name: carrierName,
      code: carrierCode,
      color: carrierColor,
      logo: carrierLogo || undefined
    };

    if (editingCarrierId) {
      onUpdateCarrier(carrierData);
    } else {
      onAddCarrier(carrierData);
    }
    resetCarrierForm();
  };

  const handleSavePort = () => {
    if (!portName || !portCode || !portCountry || !portLat || !portLng) return;
    
    const lat = parseFloat(portLat);
    const lng = parseFloat(portLng);

    if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid numeric coordinates for Latitude and Longitude.");
        return;
    }
    
    const portData: Port = {
      id: editingPortId || Math.random().toString(36).substr(2, 9),
      name: portName,
      code: portCode,
      country: portCountry,
      coordinates: [lng, lat]
    };

    if (editingPortId) {
      onUpdatePort(portData);
    } else {
      onAddPort(portData);
    }
    resetPortForm();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Master Data Manager</h2>
            <p className="text-slate-500 text-sm">Configure the global network entities: Carriers and Ports.</p>
        </div>
        <div className="flex bg-slate-200 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('carriers')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'carriers' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Ship size={16} /> Carriers ({carriers.length})
            </button>
            <button 
                onClick={() => setActiveTab('ports')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'ports' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Anchor size={16} /> Ports ({ports.length})
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
          {activeTab === 'carriers' && (
              <div className="space-y-6">
                  {/* Add/Edit Carrier Form */}
                  <div className={`bg-white p-5 rounded-xl shadow-sm border ${editingCarrierId ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                            {editingCarrierId ? <Pencil size={16} className="text-blue-500"/> : <Plus size={16} className="text-blue-500"/>} 
                            {editingCarrierId ? 'Edit Carrier' : 'Add New Carrier'}
                        </h3>
                        {editingCarrierId && (
                           <button onClick={resetCarrierForm} className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1">
                             <X size={14}/> Cancel Edit
                           </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                              <input 
                                  type="text" 
                                  value={carrierName}
                                  onChange={e => setCarrierName(e.target.value)}
                                  placeholder="e.g. Evergreen"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                          <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Code</label>
                              <input 
                                  type="text" 
                                  value={carrierCode}
                                  onChange={e => setCarrierCode(e.target.value)}
                                  placeholder="e.g. EMC"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                          <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Color</label>
                              <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={carrierColor}
                                    onChange={e => setCarrierColor(e.target.value)}
                                    className="w-8 h-9 p-0 border-0 rounded cursor-pointer"
                                />
                                <span className="text-xs text-slate-400 font-mono">{carrierColor}</span>
                              </div>
                          </div>
                          <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Logo URL</label>
                              <div className="flex items-center gap-2">
                                  {/* Logo Preview */}
                                  <div className="w-10 h-10 border border-slate-200 rounded flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                                      {carrierLogo ? (
                                          <img 
                                            src={carrierLogo} 
                                            alt="Preview" 
                                            className="w-full h-full object-contain" 
                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                          />
                                      ) : (
                                          <ImageIcon size={20} className="text-slate-300"/>
                                      )}
                                  </div>
                                  <div className="flex-1 flex items-center gap-2 border border-slate-300 rounded p-2 bg-white">
                                      <input 
                                          type="text" 
                                          value={carrierLogo}
                                          onChange={e => setCarrierLogo(e.target.value)}
                                          placeholder="https://example.com/logo.png"
                                          className="w-full outline-none text-sm bg-transparent"
                                      />
                                  </div>
                              </div>
                          </div>
                          <div className="md:col-span-1">
                              <button 
                                onClick={handleSaveCarrier}
                                className={`w-full text-white py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${editingCarrierId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-800'}`}
                              >
                                  {editingCarrierId ? <Save size={16}/> : <Plus size={16}/>}
                                  {editingCarrierId ? 'Update' : 'Add'}
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Carriers List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {carriers.map(carrier => (
                          <div key={carrier.id} className={`bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 transition-colors ${editingCarrierId === carrier.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 p-1"
                              >
                                  {carrier.logo ? (
                                      <img src={carrier.logo} alt={carrier.name} className="w-full h-full object-contain" />
                                  ) : (
                                      <span 
                                        className="w-full h-full rounded flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: carrier.color }}
                                      >
                                          {carrier.code[0]}
                                      </span>
                                  )}
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-800">{carrier.name}</h4>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{carrier.code}</span>
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: carrier.color }}></div>
                                  </div>
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => startEditingCarrier(carrier)}
                                  className={`p-2 rounded ${editingCarrierId === carrier.id ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                  title="Edit Carrier"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button 
                                  onClick={() => onDeleteCarrier(carrier.id)}
                                  className="text-slate-300 hover:text-red-500 p-2 rounded hover:bg-red-50"
                                  title="Delete Carrier"
                                >
                                    <Trash2 size={18} />
                                </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'ports' && (
              <div className="space-y-6">
                  {/* Add/Edit Port Form */}
                  <div className={`bg-white p-5 rounded-xl shadow-sm border ${editingPortId ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                            {editingPortId ? <Pencil size={16} className="text-blue-500"/> : <Plus size={16} className="text-blue-500"/>} 
                            {editingPortId ? 'Edit Port' : 'Add New Port'}
                        </h3>
                         {editingPortId && (
                           <button onClick={resetPortForm} className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1">
                             <X size={14}/> Cancel Edit
                           </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                              <input 
                                  type="text" 
                                  value={portName}
                                  onChange={e => setPortName(e.target.value)}
                                  placeholder="e.g. Barcelona"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                          <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Code</label>
                              <input 
                                  type="text" 
                                  value={portCode}
                                  onChange={e => setPortCode(e.target.value)}
                                  placeholder="e.g. ESBCN"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                           <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Country</label>
                              <input 
                                  type="text" 
                                  value={portCountry}
                                  onChange={e => setPortCountry(e.target.value)}
                                  placeholder="e.g. Spain"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                           <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Latitude</label>
                              <input 
                                  type="number" 
                                  value={portLat}
                                  onChange={e => setPortLat(e.target.value)}
                                  placeholder="41.38"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                           <div className="md:col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Longitude</label>
                              <input 
                                  type="number" 
                                  value={portLng}
                                  onChange={e => setPortLng(e.target.value)}
                                  placeholder="2.17"
                                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                          </div>
                          <div className="md:col-span-1">
                              <button 
                                onClick={handleSavePort}
                                className={`w-full text-white py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${editingPortId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-800'}`}
                              >
                                  {editingPortId ? <Save size={16}/> : <Plus size={16}/>}
                                  {editingPortId ? 'Update Port' : 'Add Port'}
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Ports List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {ports.map(port => (
                          <div key={port.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-start transition-colors ${editingPortId === port.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <MapPin size={14} className="text-slate-400"/>
                                      <h4 className="font-bold text-slate-800 text-sm">{port.name}</h4>
                                  </div>
                                  <div className="text-xs text-slate-500 pl-5 mb-1">{port.country}</div>
                                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200 ml-5 block w-fit">
                                      {port.code}
                                  </span>
                                  <div className="text-[10px] text-slate-300 pl-5 mt-1 font-mono">
                                      {port.coordinates[1].toFixed(2)}, {port.coordinates[0].toFixed(2)}
                                  </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button 
                                    onClick={() => startEditingPort(port)}
                                    className={`p-1.5 rounded ${editingPortId === port.id ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                    title="Edit Port"
                                  >
                                      <Pencil size={16} />
                                  </button>
                                <button 
                                  onClick={() => onDeletePort(port.id)}
                                  className="text-slate-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50"
                                  title="Delete Port"
                                >
                                    <Trash2 size={16} />
                                </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default MasterDataManager;
