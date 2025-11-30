
import React, { useState, useCallback, useMemo } from 'react';
import { Carrier, Port, Service, TransshipmentConnection, RouteResult, InlandConnection } from '../types';
import { findRoutes } from '../utils/routeEngine';
import WorldMap from './WorldMap';
import { Search, Clock, ArrowRight, Anchor, Map as MapIcon, Ship, Calendar, X, MapPin, Globe, Network, ChevronDown, ChevronRight, Minimize2, Maximize2, SlidersHorizontal, Check, ChevronsDown, ChevronsUp, Train, Truck } from 'lucide-react';

interface RouteSearchProps {
  services: Service[];
  ports: Port[];
  carriers: Carrier[];
  connections: TransshipmentConnection[];
  inlandConnections: InlandConnection[];
  onSearch?: (polId: string, podId: string) => void;
}

const RouteSearch: React.FC<RouteSearchProps> = ({ services, ports, carriers, connections, inlandConnections, onSearch }) => {
  const [pol, setPol] = useState<string>('');
  const [pod, setPod] = useState<string>('');
  const [results, setResults] = useState<RouteResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedResult, setSelectedResult] = useState<RouteResult | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [isDetailsPanelMinimized, setIsDetailsPanelMinimized] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Record<number, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'DIRECT' | 'TRANSSHIPMENT'>('ALL');
  const [filterMaxTime, setFilterMaxTime] = useState<number>(60);
  const [filterCarriers, setFilterCarriers] = useState<string[]>([]);

  const handleSearch = () => {
    if (!pol || !pod) return;
    if (pol === pod) return alert("POL and POD cannot be the same.");

    const routes = findRoutes(pol, pod, services, ports, connections, inlandConnections);
    setResults(routes);
    setHasSearched(true);
    
    if (onSearch) onSearch(pol, pod);
    setSelectedResult(null);
    setSelectedPort(null);
  };

  const filteredResults = useMemo(() => {
      return results.filter(route => {
          if (filterType !== 'ALL' && filterType !== 'TRANSSHIPMENT') { 
             if (route.type !== filterType && route.type !== 'INTERMODAL') return false; 
          }
          if (route.totalTransitTime > filterMaxTime) return false;
          if (filterCarriers.length > 0) {
              const routeCarriers = route.segments.map(s => s.service.carrierId);
              if (routeCarriers.some(rc => !filterCarriers.includes(rc))) return false;
          }
          return true;
      });
  }, [results, filterType, filterMaxTime, filterCarriers]);

  const handleRouteSelect = useCallback((result: RouteResult) => {
      setSelectedResult(result);
      setSelectedPort(null);
      setIsDetailsPanelMinimized(false);
      const initialExpanded: Record<number, boolean> = {};
      result.segments.forEach((_, i) => initialExpanded[i] = true);
      setExpandedSegments(initialExpanded);
  }, []);

  const handlePortClick = useCallback((port: Port) => {
      setSelectedPort(port);
      setSelectedResult(null);
  }, []);
  
  const handleMapClick = useCallback(() => {
      if (selectedPort) setSelectedPort(null);
  }, [selectedPort]);

  const toggleSegment = (index: number) => {
      setExpandedSegments(prev => ({ ...prev, [index]: !prev[index] }));
  };
  const expandAllSegments = () => {
      if (!selectedResult) return;
      const all: Record<number, boolean> = {};
      selectedResult.segments.forEach((_, i) => all[i] = true);
      setExpandedSegments(all);
  };
  const collapseAllSegments = () => setExpandedSegments({});
  const toggleCarrierFilter = (carrierId: string) => {
      setFilterCarriers(prev => prev.includes(carrierId) ? prev.filter(id => id !== carrierId) : [...prev, carrierId]);
  };

  const getCarrierName = (id: string) => carriers.find(c => c.id === id)?.name;
  const getCarrierColor = (id: string) => carriers.find(c => c.id === id)?.color || '#94a3b8';
  const getCarrierLogo = (id: string) => carriers.find(c => c.id === id)?.logo;
  const getCarrierCode = (id: string) => carriers.find(c => c.id === id)?.code || id;
  const getServicesForPort = (portId: string) => services.filter(service => service.legs.some(leg => leg.originPortId === portId || leg.destinationPortId === portId));
  const getConnectionsForPort = (portId: string) => connections.filter(c => c.portId === portId && c.isActive);
  const selectedPortServices = selectedPort ? getServicesForPort(selectedPort.id) : [];
  const selectedPortConnections = selectedPort ? getConnectionsForPort(selectedPort.id) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="bg-white shadow-sm border-b border-slate-200 z-30 relative">
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Origin (POL / Hub)</label>
                        <select value={pol} onChange={(e) => setPol(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Select Origin...</option>
                            {ports.map(p => <option key={p.id} value={p.id}>{p.type === 'INLAND' ? `🚂 ${p.name}` : p.name} ({p.code})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Destination (POD / Hub)</label>
                        <select value={pod} onChange={(e) => setPod(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Select Destination...</option>
                            {ports.map(p => <option key={p.id} value={p.id}>{p.type === 'INLAND' ? `🚂 ${p.name}` : p.name} ({p.code})</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-lg border flex items-center justify-center gap-2 font-medium transition-colors ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <SlidersHorizontal size={18} /> Filters
                    </button>
                    <button onClick={handleSearch} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm">
                        <Search size={18} /> Find Routes
                    </button>
                </div>
            </div>
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Route Type</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['ALL', 'DIRECT', 'TRANSSHIPMENT'].map((type) => (
                                    <button key={type} onClick={() => setFilterType(type as any)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type === 'TRANSSHIPMENT' ? 'Transship' : type.charAt(0) + type.slice(1).toLowerCase()}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2"><label className="block text-xs font-semibold text-slate-500 uppercase">Max Transit Time</label><span className="text-xs font-bold text-blue-600">{filterMaxTime} Days</span></div>
                            <input type="range" min="1" max="90" value={filterMaxTime} onChange={(e) => setFilterMaxTime(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Preferred Carriers</label>
                            <div className="flex flex-wrap gap-2">{carriers.map(carrier => (<button key={carrier.id} onClick={() => toggleCarrierFilter(carrier.id)} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-all ${filterCarriers.includes(carrier.id) ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: carrier.color }}></span>{carrier.code}{filterCarriers.includes(carrier.id) && <Check size={10} />}</button>))}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
         <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 overflow-y-auto z-10 shadow-lg">
            {!hasSearched && <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center"><MapIcon size={48} className="mb-4 text-slate-200"/><p>Select locations to visualize the network.</p></div>}
            {filteredResults.map((result, index) => (
                <div key={result.id} onClick={() => handleRouteSelect(result)} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${selectedResult?.id === result.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            {result.type === 'DIRECT' ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Direct</span> : 
                             result.type === 'INTERMODAL' ? <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Intermodal</span> :
                             <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Transshipment</span>}
                            <span className="text-slate-500 text-xs">Opt #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-700 font-bold"><Clock size={14} className="text-slate-400"/> {result.totalTransitTime} days</div>
                    </div>
                    <div className="space-y-3">
                        {result.preCarriage && (
                             <div className="relative pl-4 border-l-2 border-dashed border-slate-300">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                                <div className="text-xs text-slate-500 mb-0.5 flex items-center gap-1 uppercase font-bold">{result.preCarriage.mode === 'RAIL' ? <Train size={10}/> : <Truck size={10}/>} {result.preCarriage.mode}</div>
                                <div className="font-semibold text-sm text-slate-800">{result.preCarriage.origin.name} → {result.preCarriage.destination.name}</div>
                             </div>
                        )}
                        {result.segments.map((seg, i) => (
                             <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                                <div className="text-xs text-slate-500 mb-0.5 flex items-center gap-2">{getCarrierLogo(seg.service.carrierId) && <img src={getCarrierLogo(seg.service.carrierId)} className="w-4 h-4 object-contain" />}{getCarrierName(seg.service.carrierId)}</div>
                                <div className="font-semibold text-sm text-slate-800">{seg.service.name}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">{seg.origin.code} <ArrowRight size={10}/> {seg.destination.code} <span className="text-slate-300 mx-1">|</span> {seg.transitTime} d</div>
                            </div>
                        ))}
                        {result.onCarriage && (
                             <div className="relative pl-4 border-l-2 border-dashed border-slate-300">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                                <div className="text-xs text-slate-500 mb-0.5 flex items-center gap-1 uppercase font-bold">{result.onCarriage.mode === 'RAIL' ? <Train size={10}/> : <Truck size={10}/>} {result.onCarriage.mode}</div>
                                <div className="font-semibold text-sm text-slate-800">{result.onCarriage.origin.name} → {result.onCarriage.destination.name}</div>
                             </div>
                        )}
                    </div>
                </div>
            ))}
         </div>

         {selectedResult && (
            <div className={`bg-white border-r border-slate-200 z-20 flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none ${isDetailsPanelMinimized ? 'w-full lg:w-14' : 'w-full lg:w-96'} h-full`}>
                <div className={`p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center ${isDetailsPanelMinimized ? 'flex-col gap-4 p-2' : ''}`}>
                    {!isDetailsPanelMinimized && (
                        <div className="w-full">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Route Details</div>
                            <div className="flex items-baseline gap-2"><span className="text-3xl font-bold text-slate-800">{selectedResult.totalTransitTime}</span><span className="text-sm font-medium text-slate-500">Days Total</span></div>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button onClick={() => setIsDetailsPanelMinimized(!isDetailsPanelMinimized)} className="text-slate-400 hover:text-slate-700 p-1">{isDetailsPanelMinimized ? <Maximize2 size={18}/> : <Minimize2 size={18}/>}</button>
                        <button onClick={() => setSelectedResult(null)} className="text-slate-400 hover:text-red-500 p-1"><X size={18}/></button>
                    </div>
                </div>

                {!isDetailsPanelMinimized && (
                    <div className="overflow-y-auto p-5 space-y-6 flex-1">
                        {selectedResult.preCarriage && (
                             <div className="relative group">
                                <div className="w-full flex items-start gap-3 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">{selectedResult.preCarriage.mode === 'RAIL' ? <Train size={14}/> : <Truck size={14}/>}</div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800 text-sm">Inland Transport</div>
                                        <div className="text-xs text-slate-500">{selectedResult.preCarriage.origin.name} to {selectedResult.preCarriage.destination.name}</div>
                                        <div className="mt-2 bg-slate-50 p-2 rounded text-xs font-mono flex justify-between"><span>Mode: {selectedResult.preCarriage.mode}</span><span>{selectedResult.preCarriage.transitTime} days</span></div>
                                    </div>
                                </div>
                                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-dashed border-l-2 border-slate-200 border-dashed -z-10"></div>
                             </div>
                        )}
                        {selectedResult.segments.map((segment, idx) => (
                             <div key={idx} className="relative group">
                                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-200 -z-10"></div>
                                <div className="w-full flex items-start gap-3 mb-3 cursor-pointer" onClick={() => toggleSegment(idx)}>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-white overflow-hidden">{getCarrierLogo(segment.service.carrierId) ? <img src={getCarrierLogo(segment.service.carrierId)} className="w-full h-full object-cover"/> : idx + 1}</div>
                                    <div className="flex-1"><div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">{segment.service.name} {expandedSegments[idx] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</div><div className="text-xs text-slate-500">{getCarrierName(segment.service.carrierId)}</div></div>
                                </div>
                                {expandedSegments[idx] && (
                                     <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs ml-9 mb-4"><div className="space-y-2">{segment.legs.map((leg, lIdx) => (<div key={lIdx} className="flex justify-between items-center text-slate-600"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div><span className="font-mono font-bold">{ports.find(p => p.id === leg.originPortId)?.code}</span><ArrowRight size={10}/><span className="font-mono font-bold">{ports.find(p => p.id === leg.destinationPortId)?.code}</span></div><span className="bg-white px-1 border rounded">{leg.transitTimeDays}d</span></div>))}</div></div>
                                )}
                             </div>
                        ))}
                        {selectedResult.onCarriage && (
                             <div className="relative group mt-4">
                                <div className="w-full flex items-start gap-3 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">{selectedResult.onCarriage.mode === 'RAIL' ? <Train size={14}/> : <Truck size={14}/>}</div>
                                    <div className="flex-1"><div className="font-bold text-slate-800 text-sm">On-Carriage Delivery</div><div className="text-xs text-slate-500">{selectedResult.onCarriage.origin.name} to {selectedResult.onCarriage.destination.name}</div><div className="mt-2 bg-slate-50 p-2 rounded text-xs font-mono flex justify-between"><span>Mode: {selectedResult.onCarriage.mode}</span><span>{selectedResult.onCarriage.transitTime} days</span></div></div>
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
         )}
         <div className="flex-1 bg-slate-100 relative p-4 flex flex-col overflow-hidden">
             <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <WorldMap ports={ports} selectedRoute={selectedResult} selectedPort={selectedPort} onPortClick={setSelectedPort} onMapClick={() => setSelectedPort(null)}/>
                {selectedPort && !selectedResult && (
                    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100%-2rem)] animate-in slide-in-from-right-4 fade-in duration-300 z-20">
                         <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                            <div className="flex justify-between items-start"><div><div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12}/> Port Profile</div><h3 className="text-xl font-bold leading-tight flex items-center gap-2"><img src={`https://flagcdn.com/24x18/${selectedPort.code.substring(0, 2).toLowerCase()}.png`} alt={selectedPort.country} className="rounded-[2px]" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}}/>{selectedPort.name}</h3><div className="flex items-center gap-2 mt-1"><span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-mono">{selectedPort.code}</span><span className="text-sm text-slate-300 flex items-center gap-1"><Globe size={12}/> {selectedPort.country}</span></div></div><button onClick={() => setSelectedPort(null)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button></div>
                         </div>
                         <div className="p-4 overflow-y-auto">
                             <div className="mb-4">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-200 pb-2">Calling Services ({selectedPortServices.length})</h4>
                                 {selectedPortServices.length === 0 ? (<div className="text-center py-6 text-slate-400 text-sm">No services scheduled for this port.</div>) : (<div className="space-y-3">{selectedPortServices.map((service, idx) => {const inboundLeg = service.legs.find(l => l.destinationPortId === selectedPort.id);const outboundLeg = service.legs.find(l => l.originPortId === selectedPort.id);return (<div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-slate-300 transition-colors"><div className="flex justify-between items-start mb-2"><div><div className="font-bold text-slate-800 text-sm">{service.name}</div><div className="text-xs text-slate-500">{getCarrierName(service.carrierId)}</div></div><span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{service.code}</span></div><div className="grid grid-cols-2 gap-2 mt-2">{inboundLeg && (<div className="bg-white p-1.5 rounded border border-slate-100"><span className="text-[10px] text-slate-400 block uppercase">Inbound From</span><div className="text-xs font-semibold text-slate-700 flex items-center gap-1"><ArrowRight size={10} className="rotate-180 text-emerald-500"/>{ports.find(p => p.id === inboundLeg.originPortId)?.code}</div></div>)}{outboundLeg && (<div className="bg-white p-1.5 rounded border border-slate-100"><span className="text-[10px] text-slate-400 block uppercase">Outbound To</span><div className="text-xs font-semibold text-slate-700 flex items-center gap-1"><ArrowRight size={10} className="text-blue-500"/>{ports.find(p => p.id === outboundLeg.destinationPortId)?.code}</div></div>)}</div></div>)})}</div>)}
                             </div>
                             {selectedPortConnections.length > 0 && (<div className="mt-6"><h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-200 pb-2 flex items-center gap-2"><Network size={12}/> Hub Connections ({selectedPortConnections.length})</h4><div className="space-y-2">{selectedPortConnections.map(conn => {const sA = services.find(s => s.id === conn.serviceAId);const sB = services.find(s => s.id === conn.serviceBId);if (!sA || !sB) return null;return (<div key={conn.id} className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between shadow-sm"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="bg-white px-1.5 rounded border border-emerald-200 text-xs">{sA.code}</span><ArrowRight size={12} className="text-emerald-500"/><span className="bg-white px-1.5 rounded border border-emerald-200 text-xs">{sB.code}</span></div><span className="text-[10px] font-bold text-emerald-700 bg-white/50 px-1.5 py-0.5 rounded uppercase">Active</span></div>);})}</div></div>)}
                         </div>
                    </div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default RouteSearch;
