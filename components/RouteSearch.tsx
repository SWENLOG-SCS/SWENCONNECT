
import React, { useState, useCallback, useMemo } from 'react';
import { Carrier, Port, Service, TransshipmentConnection, RouteResult } from '../types';
import { findRoutes } from '../utils/routeEngine';
import WorldMap from './WorldMap';
import { Search, Clock, ArrowRight, Anchor, Map as MapIcon, Ship, Calendar, X, MapPin, Globe, Network, ChevronDown, ChevronRight, Minimize2, Maximize2, SlidersHorizontal, Check, ChevronsDown, ChevronsUp } from 'lucide-react';

interface RouteSearchProps {
  services: Service[];
  ports: Port[];
  carriers: Carrier[];
  connections: TransshipmentConnection[];
  onSearch?: (polId: string, podId: string) => void;
}

const RouteSearch: React.FC<RouteSearchProps> = ({ services, ports, carriers, connections, onSearch }) => {
  const [pol, setPol] = useState<string>('');
  const [pod, setPod] = useState<string>('');
  const [results, setResults] = useState<RouteResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Selection State
  const [selectedResult, setSelectedResult] = useState<RouteResult | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);

  // UI State for Panels
  const [isDetailsPanelMinimized, setIsDetailsPanelMinimized] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Record<number, boolean>>({});

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'DIRECT' | 'TRANSSHIPMENT'>('ALL');
  const [filterMaxTime, setFilterMaxTime] = useState<number>(60);
  const [filterCarriers, setFilterCarriers] = useState<string[]>([]); // Empty means all

  const handleSearch = () => {
    if (!pol || !pod) return;
    if (pol === pod) return alert("POL and POD cannot be the same.");

    const routes = findRoutes(pol, pod, services, ports, connections);
    setResults(routes);
    setHasSearched(true);
    
    if (onSearch) {
        onSearch(pol, pod);
    }
    
    // Reset filters or keep them? Keeping them is usually better UX, 
    // but let's reset selection to avoid invalid states.
    setSelectedResult(null);
    setSelectedPort(null);
  };

  const filteredResults = useMemo(() => {
      return results.filter(route => {
          // 1. Filter by Type
          if (filterType !== 'ALL' && route.type !== filterType) return false;

          // 2. Filter by Max Transit Time
          if (route.totalTransitTime > filterMaxTime) return false;

          // 3. Filter by Carrier
          // Logic: If specific carriers are selected, the route must ONLY use those carriers.
          if (filterCarriers.length > 0) {
              const routeCarriers = route.segments.map(s => s.service.carrierId);
              const hasInvalidCarrier = routeCarriers.some(rc => !filterCarriers.includes(rc));
              if (hasInvalidCarrier) return false;
          }

          return true;
      });
  }, [results, filterType, filterMaxTime, filterCarriers]);

  const handleRouteSelect = useCallback((result: RouteResult) => {
      setSelectedResult(result);
      setSelectedPort(null);
      setIsDetailsPanelMinimized(false);
      // Default all segments to expanded
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
      setExpandedSegments(prev => ({
          ...prev,
          [index]: !prev[index]
      }));
  };

  const expandAllSegments = () => {
      if (!selectedResult) return;
      const all: Record<number, boolean> = {};
      selectedResult.segments.forEach((_, i) => all[i] = true);
      setExpandedSegments(all);
  };

  const collapseAllSegments = () => {
      setExpandedSegments({});
  };

  const toggleCarrierFilter = (carrierId: string) => {
      setFilterCarriers(prev => {
          if (prev.includes(carrierId)) return prev.filter(id => id !== carrierId);
          return [...prev, carrierId];
      });
  };

  const getCarrierName = (id: string) => carriers.find(c => c.id === id)?.name;
  const getCarrierColor = (id: string) => carriers.find(c => c.id === id)?.color || '#94a3b8';
  const getCarrierLogo = (id: string) => carriers.find(c => c.id === id)?.logo;
  const getCarrierCode = (id: string) => carriers.find(c => c.id === id)?.code || id;

  const getServicesForPort = (portId: string) => {
      return services.filter(service => 
          service.legs.some(leg => leg.originPortId === portId || leg.destinationPortId === portId)
      );
  };
  
  const getConnectionsForPort = (portId: string) => {
      return connections.filter(c => c.portId === portId && c.isActive);
  };

  const selectedPortServices = selectedPort ? getServicesForPort(selectedPort.id) : [];
  const selectedPortConnections = selectedPort ? getConnectionsForPort(selectedPort.id) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Search Bar & Filters */}
      <div className="bg-white shadow-sm border-b border-slate-200 z-30 relative">
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Port of Loading (POL)</label>
                        <select 
                            value={pol}
                            onChange={(e) => setPol(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Origin...</option>
                            {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Port of Discharge (POD)</label>
                        <select 
                            value={pod}
                            onChange={(e) => setPod(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Destination...</option>
                            {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 rounded-lg border flex items-center justify-center gap-2 font-medium transition-colors ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal size={18} /> Filters
                        {(filterCarriers.length > 0 || filterType !== 'ALL' || filterMaxTime < 60) && (
                            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                    </button>
                    <button 
                        onClick={handleSearch}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Search size={18} /> Find Routes
                    </button>
                </div>
            </div>

            {/* Collapsible Filters Panel */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Route Type */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Route Type</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['ALL', 'DIRECT', 'TRANSSHIPMENT'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type as any)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {type === 'TRANSSHIPMENT' ? 'Transship' : type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Max Transit Time */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase">Max Transit Time</label>
                                <span className="text-xs font-bold text-blue-600">{filterMaxTime} Days</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="90" 
                                value={filterMaxTime} 
                                onChange={(e) => setFilterMaxTime(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>1d</span>
                                <span>90d</span>
                            </div>
                        </div>

                        {/* 3. Carriers */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Preferred Carriers</label>
                            <div className="flex flex-wrap gap-2">
                                {carriers.map(carrier => {
                                    const isSelected = filterCarriers.includes(carrier.id);
                                    return (
                                        <button
                                            key={carrier.id}
                                            onClick={() => toggleCarrierFilter(carrier.id)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-all ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            <span 
                                                className="w-2 h-2 rounded-full" 
                                                style={{ backgroundColor: carrier.color }}
                                            ></span>
                                            {carrier.code}
                                            {isSelected && <Check size={10} />}
                                        </button>
                                    );
                                })}
                                {filterCarriers.length > 0 && (
                                    <button 
                                        onClick={() => setFilterCarriers([])}
                                        className="text-[10px] text-slate-400 hover:text-slate-600 underline px-1"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
         {/* Results List */}
         <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 overflow-y-auto z-10 shadow-lg">
            {!hasSearched && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <MapIcon size={48} className="mb-4 text-slate-200"/>
                    <p>Select ports above to visualize the shipping network.</p>
                </div>
            )}
            
            {hasSearched && results.length > 0 && filteredResults.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <div className="text-lg font-bold text-slate-300 mb-2">No Matches</div>
                    <p className="text-sm max-w-[200px]">Routes were found, but they don't match your current filter criteria.</p>
                    <button 
                        onClick={() => { setFilterType('ALL'); setFilterMaxTime(90); setFilterCarriers([]); }}
                        className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {hasSearched && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <div className="text-xl font-bold text-slate-300 mb-2">No Routes Found</div>
                    <p className="text-sm">Try checking your transshipment connections or selecting major hubs.</p>
                </div>
            )}

            {filteredResults.map((result, index) => (
                <div 
                    key={result.id}
                    onClick={() => handleRouteSelect(result)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${selectedResult?.id === result.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            {result.type === 'DIRECT' ? (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Direct</span>
                            ) : (
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Transshipment</span>
                            )}
                            <span className="text-slate-500 text-xs">Opt #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-700 font-bold">
                            <Clock size={14} className="text-slate-400"/>
                            {result.totalTransitTime} days
                        </div>
                    </div>

                    <div className="space-y-3">
                        {result.segments.map((seg, i) => {
                            const logo = getCarrierLogo(seg.service.carrierId);
                            return (
                                <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                                    <div className="text-xs text-slate-500 mb-0.5 flex items-center gap-2">
                                        {logo && <img src={logo} alt="logo" className="w-4 h-4 object-contain rounded-sm" />}
                                        {getCarrierName(seg.service.carrierId)}
                                    </div>
                                    <div className="font-semibold text-sm text-slate-800 flex items-center gap-1">
                                        {seg.service.name} 
                                        <span className="text-slate-400 text-xs font-normal">({seg.service.code})</span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        {seg.origin.code} <ArrowRight size={10}/> {seg.destination.code}
                                        <span className="text-slate-300 mx-1">|</span>
                                        {seg.transitTime} days
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
         </div>

         {/* Dedicated Route Details Panel - Middle Column */}
         {selectedResult && (
            <div 
                className={`bg-white border-r border-slate-200 z-20 flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none ${isDetailsPanelMinimized ? 'w-full lg:w-14 absolute lg:relative h-full' : 'w-full lg:w-96 absolute lg:relative h-full'}`}
            >
                {/* Header */}
                <div className={`p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center ${isDetailsPanelMinimized ? 'flex-col gap-4 p-2' : ''}`}>
                    {!isDetailsPanelMinimized && (
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Route Details</span>
                                <div className="flex items-center gap-1">
                                    {selectedResult.type === 'DIRECT' ? (
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2">Direct</span>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2">Transship</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-slate-800">{selectedResult.totalTransitTime}</span>
                                    <span className="text-sm font-medium text-slate-500">Days</span>
                                </div>
                                <div className="flex gap-1 text-slate-400">
                                    <button onClick={expandAllSegments} className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="Expand All">
                                        <ChevronsDown size={16}/>
                                    </button>
                                    <button onClick={collapseAllSegments} className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="Collapse All">
                                        <ChevronsUp size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`flex ${isDetailsPanelMinimized ? 'flex-col' : 'flex-row'} gap-2 ${!isDetailsPanelMinimized ? 'absolute top-4 right-4' : ''}`}>
                        <button 
                            onClick={() => setIsDetailsPanelMinimized(!isDetailsPanelMinimized)}
                            className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded"
                            title={isDetailsPanelMinimized ? "Expand Details" : "Minimize Details"}
                        >
                            {isDetailsPanelMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                        </button>
                        <button 
                            onClick={() => setSelectedResult(null)} 
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                            title="Close Selection"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {isDetailsPanelMinimized && (
                        <div className="text-xs font-bold text-slate-500 rotate-90 whitespace-nowrap mt-4 flex items-center gap-2">
                            <span>Details</span>
                            <ChevronDown size={12}/>
                        </div>
                    )}
                </div>

                {/* Segments Scrollable Area */}
                {!isDetailsPanelMinimized && (
                    <div className="overflow-y-auto p-5 space-y-6 flex-1">
                        {selectedResult.segments.map((segment, idx) => {
                            const isExpanded = !!expandedSegments[idx];
                            const logo = getCarrierLogo(segment.service.carrierId);
                            
                            return (
                                <div key={idx} className="relative group">
                                    {/* Vertical Connector Line for multiple segments */}
                                    {idx !== selectedResult.segments.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-200 -z-10 group-hover:bg-slate-300 transition-colors"></div>
                                    )}

                                    {/* Segment Header */}
                                    <button 
                                        className="w-full flex items-start gap-3 mb-3 cursor-pointer select-none text-left"
                                        onClick={() => toggleSegment(idx)}
                                    >
                                        <div 
                                            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm mt-0.5 overflow-hidden bg-slate-200"
                                        >
                                            {logo ? <img src={logo} className="w-full h-full object-cover" /> : (
                                                <div style={{ backgroundColor: getCarrierColor(segment.service.carrierId) }} className="w-full h-full flex items-center justify-center">
                                                    {idx + 1}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm leading-tight mb-0.5 flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                                        {segment.service.name}
                                                        {isExpanded ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronRight size={14} className="text-slate-400"/>}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Ship size={10} />
                                                        {getCarrierName(segment.service.carrierId)} 
                                                        <span className="bg-slate-100 px-1 rounded text-[10px] font-mono border border-slate-200">{segment.service.code}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block font-bold text-slate-700 text-sm">{segment.transitTime} d</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Segment Details Card - Collapsible */}
                                    {isExpanded && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs ml-9 shadow-sm relative animate-in slide-in-from-top-2 duration-200">
                                            {/* Little arrow pointing to card */}
                                            <div className="absolute top-3 -left-1.5 w-3 h-3 bg-slate-50 border-l border-b border-slate-200 transform rotate-45"></div>
                                            
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200/60 relative z-10">
                                                <span className="font-semibold text-slate-600 flex items-center gap-1">
                                                    <Calendar size={10} /> Route Schedule
                                                </span>
                                                <span className="text-slate-400 bg-white px-1.5 rounded border border-slate-100">{segment.legs.length} Legs</span>
                                            </div>
                                            <div className="space-y-3 relative z-10">
                                                {segment.legs.map((leg, lIdx) => (
                                                    <div key={lIdx} className="flex justify-between items-center text-slate-600">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                                <span className="font-mono font-bold text-slate-700">{ports.find(p => p.id === leg.originPortId)?.code}</span>
                                                                <ArrowRight size={10} className="text-slate-300" />
                                                                <span className="font-mono font-bold text-slate-700">{ports.find(p => p.id === leg.destinationPortId)?.code}</span>
                                                            </div>
                                                            <div className="pl-3 text-[10px] text-slate-400">
                                                                Carrier: {getCarrierCode(leg.carrierId)}
                                                            </div>
                                                        </div>
                                                        <span className="font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100">{leg.transitTimeDays}d</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Transshipment Indicator if not last */}
                                    {idx !== selectedResult.segments.length - 1 && selectedResult.transshipmentPort && (
                                        <div className="mt-4 mb-2 flex items-center gap-3 ml-[9px]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2)]"></div>
                                            <div className="bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center gap-2 flex-1 shadow-sm">
                                                <Anchor size={12} className="text-amber-600" />
                                                Transshipment at {selectedResult.transshipmentPort.name}
                                                <span className="ml-auto text-[10px] font-normal normal-case bg-white/50 px-1.5 rounded text-amber-700">
                                                    ~3 Days Buffer
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
         )}

         {/* Map View & Port Details Panel */}
         <div className="flex-1 bg-slate-100 relative p-4 flex flex-col overflow-hidden">
             <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <WorldMap 
                    ports={ports} 
                    selectedRoute={selectedResult}
                    selectedPort={selectedPort}
                    onPortClick={handlePortClick}
                    onMapClick={handleMapClick}
                />
                
                {/* Port Details Panel - Positioned Right (standard) */}
                {selectedPort && !selectedResult && (
                    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100%-2rem)] animate-in slide-in-from-right-4 fade-in duration-300 z-20">
                         {/* Header */}
                         <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <MapPin size={12}/> Port Profile
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight flex items-center gap-2">
                                        <img 
                                            src={`https://flagcdn.com/24x18/${selectedPort.code.substring(0, 2).toLowerCase()}.png`} 
                                            alt={selectedPort.country} 
                                            className="rounded-[2px]"
                                            onError={(e) => {
                                                // Fallback if country code derivation fails
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        {selectedPort.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-mono">{selectedPort.code}</span>
                                        <span className="text-sm text-slate-300 flex items-center gap-1"><Globe size={12}/> {selectedPort.country}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPort(null)} className="text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                         </div>

                         {/* Content */}
                         <div className="p-4 overflow-y-auto">
                             <div className="mb-4">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-200 pb-2">Calling Services ({selectedPortServices.length})</h4>
                                 
                                 {selectedPortServices.length === 0 ? (
                                     <div className="text-center py-6 text-slate-400 text-sm">
                                         No services scheduled for this port.
                                     </div>
                                 ) : (
                                     <div className="space-y-3">
                                         {selectedPortServices.map((service, idx) => {
                                             // Find legs related to this port
                                             const inboundLeg = service.legs.find(l => l.destinationPortId === selectedPort.id);
                                             const outboundLeg = service.legs.find(l => l.originPortId === selectedPort.id);
                                             
                                             return (
                                                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-slate-300 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm">{service.name}</div>
                                                            <div className="text-xs text-slate-500">{getCarrierName(service.carrierId)}</div>
                                                        </div>
                                                        <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                                                            {service.code}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {inboundLeg && (
                                                            <div className="bg-white p-1.5 rounded border border-slate-100">
                                                                <span className="text-[10px] text-slate-400 block uppercase">Inbound From</span>
                                                                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <ArrowRight size={10} className="rotate-180 text-emerald-500"/>
                                                                    {ports.find(p => p.id === inboundLeg.originPortId)?.code}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {outboundLeg && (
                                                            <div className="bg-white p-1.5 rounded border border-slate-100">
                                                                <span className="text-[10px] text-slate-400 block uppercase">Outbound To</span>
                                                                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                                    <ArrowRight size={10} className="text-blue-500"/>
                                                                    {ports.find(p => p.id === outboundLeg.destinationPortId)?.code}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                             )
                                         })}
                                     </div>
                                 )}
                             </div>

                             {/* Active Transshipment Connections */}
                             {selectedPortConnections.length > 0 && (
                                 <div className="mt-6">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-200 pb-2 flex items-center gap-2">
                                        <Network size={12}/> Hub Connections ({selectedPortConnections.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedPortConnections.map(conn => {
                                            const sA = services.find(s => s.id === conn.serviceAId);
                                            const sB = services.find(s => s.id === conn.serviceBId);
                                            if (!sA || !sB) return null;
                                            return (
                                                <div key={conn.id} className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                        <span className="bg-white px-1.5 rounded border border-emerald-200 text-xs">{sA.code}</span>
                                                        <ArrowRight size={12} className="text-emerald-500"/>
                                                        <span className="bg-white px-1.5 rounded border border-emerald-200 text-xs">{sB.code}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-white/50 px-1.5 py-0.5 rounded uppercase">Active</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                 </div>
                             )}
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
