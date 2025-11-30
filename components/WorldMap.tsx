
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { WORLD_GEO_JSON_URL } from '../utils/geo';
import { Port, RouteResult } from '../types';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface WorldMapProps {
  ports: Port[];
  selectedRoute: RouteResult | null;
  selectedPort?: Port | null;
  onPortClick?: (port: Port) => void;
  onMapClick?: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ ports, selectedRoute, selectedPort, onPortClick, onMapClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [zoomK, setZoomK] = useState(1);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    fetch(WORLD_GEO_JSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setGeoData(data))
      .catch((err) => {
        console.error("Failed to load World GeoJSON:", err);
      });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const visibleNodes = useMemo(() => {
      if (selectedRoute || zoomK >= 2.5) {
          return ports.map(p => ({ ...p, clusterCount: 0 }));
      }
      const clusters = d3.rollups(ports, (v) => ({
              id: `cluster-${v[0].country}`, name: v[0].country, code: v[0].country.substring(0, 3).toUpperCase(),
              country: v[0].country, coordinates: [ d3.mean(v, d => d.coordinates[0]) || 0, d3.mean(v, d => d.coordinates[1]) || 0 ] as [number, number],
              type: 'cluster', clusterCount: v.length, ports: v
          }), (d) => d.country);
      return clusters.map(([key, data]) => data);
  }, [ports, zoomK, selectedRoute]);

  useEffect(() => {
    if (!geoData || !svgRef.current || !mapGroupRef.current) return;
    const svg = d3.select(svgRef.current);
    const mapGroup = d3.select(mapGroupRef.current);
    const { width, height } = dimensions;
    const projection = d3.geoMercator().scale(width / 6.5).center([0, 20]).translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 12])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
        .on("zoom", (event) => {
            const { transform } = event;
            setZoomK(transform.k);
            mapGroup.attr("transform", transform.toString());
            mapGroup.selectAll("path.country").attr("stroke-width", 0.5 / transform.k);
            mapGroup.selectAll("path.route-halo").attr("stroke-width", 8 / transform.k);
            mapGroup.selectAll("path.route-line").attr("stroke-width", (d: any) => (d.properties?.isInland ? 3 : 4) / transform.k);
            
            // Nodes sizing
            mapGroup.selectAll(".node-circle").attr("r", (d: any) => {
                     let baseR = 4;
                     if (d.type === 'cluster') baseR = 12 + Math.min(d.clusterCount, 5);
                     else if (d.type === 'INLAND') baseR = 5; // Smaller for Inland
                     else {
                         if (selectedPort?.id === d.id) baseR = 10;
                         else if (selectedRoute?.transshipmentPort?.id === d.id) baseR = 9;
                         else if (selectedRoute?.segments[0].origin.id === d.id) baseR = 7;
                     }
                     return baseR / transform.k;
                });
             mapGroup.selectAll(".node-label").attr("font-size", (10 / transform.k) + "px").attr("y", (d: any) => (d.type === 'cluster' ? 12 : 8) / transform.k + 8 / transform.k);
             mapGroup.selectAll(".node-flag").attr("width", 12 / transform.k).attr("height", 9 / transform.k).attr("x", -14 / transform.k).attr("y", (d: any) => (4 / transform.k) + (8 / transform.k) - (9 / transform.k));
        });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
    svg.on("click", (e) => { if (e.target === svgRef.current && onMapClick) onMapClick(); });

    // Drawing
    mapGroup.select(".countries-group").remove();
    const countriesG = mapGroup.insert("g", ":first-child").attr("class", "countries-group");
    countriesG.selectAll("path").data(geoData.features).join("path").attr("class", "country").attr("d", pathGenerator as any).attr("fill", "#e2e8f0").attr("stroke", "#cbd5e1").attr("stroke-width", 0.5 / zoomK);

    mapGroup.select(".routes-group").remove();
    const routesG = mapGroup.append("g").attr("class", "routes-group");

    if (selectedRoute) {
        // Draw Pre-Carriage
        if (selectedRoute.preCarriage) {
            drawLeg(routesG, projection, selectedRoute.preCarriage.origin, selectedRoute.preCarriage.destination, "#10b981", true);
        }
        // Draw Sea Segments
        selectedRoute.segments.forEach((segment, index) => {
            drawLeg(routesG, projection, segment.origin, segment.destination, index === 0 ? "#2563eb" : "#ea580c", false);
        });
        // Draw On-Carriage
        if (selectedRoute.onCarriage) {
            drawLeg(routesG, projection, selectedRoute.onCarriage.origin, selectedRoute.onCarriage.destination, "#ef4444", true);
        }
    }

    const nodesG = mapGroup.selectAll(".nodes-group").data([null]).join("g").attr("class", "nodes-group");
    // Cast visibleNodes to any[] to avoid strict type mismatch with D3 data binding of unions
    const nodes = nodesG.selectAll(".node-group").data(visibleNodes as any[], (d: any) => d.id);
    const nodesEnter = nodes.enter().append("g").attr("class", "node-group").attr("transform", (d: any) => `translate(${projection(d.coordinates)})`).attr("cursor", "pointer");

    // Differentiate Inland Hubs
    nodesEnter.append("path")
        .attr("class", "node-circle")
        .attr("d", (d: any) => {
            if (d.type === 'INLAND') return d3.symbol().type(d3.symbolSquare).size(100)();
            return d3.symbol().type(d3.symbolCircle).size(100)();
        })
        .on("click", (e, d: any) => { e.stopPropagation(); if (d.type === 'cluster') { const [x, y] = projection(d.coordinates)!; svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(4).translate(-x, -y)); } else { if (onPortClick) onPortClick(d); } });

    nodesEnter.filter((d: any) => d.type !== 'cluster').append("image").attr("class", "node-flag").attr("href", (d: any) => `https://flagcdn.com/24x18/${d.code.substring(0, 2).toLowerCase()}.png`).attr("opacity", 0);
    nodesEnter.filter((d: any) => d.type === 'cluster').append("text").attr("class", "cluster-count").attr("text-anchor", "middle").attr("dy", "0.35em").attr("fill", "white").text((d: any) => d.clusterCount);
    nodesEnter.append("text").attr("class", "node-label").attr("text-anchor", "middle").text((d: any) => d.name).attr("opacity", 0);

    nodes.exit().remove();
    // Update transforms/styles
    nodesG.selectAll(".node-group").attr("transform", (d: any) => { const coords = projection(d.coordinates); return coords ? `translate(${coords})` : null; });
    
    nodesG.selectAll(".node-circle")
        .attr("d", (d: any) => {
            // Re-calc size based on K
            let size = 64; 
            if (d.type === 'cluster') size = (12 + Math.min(d.clusterCount, 5)) ** 2; // Approximate area
            else if (d.type === 'INLAND') size = 64;
            else size = 100;
            const type = d.type === 'INLAND' ? d3.symbolSquare : d3.symbolCircle;
            return d3.symbol().type(type).size(size / (zoomK * 0.5))(); // Rough scaling logic
        })
        .attr("fill", (d: any) => {
            if (d.type === 'cluster') return "#3b82f6";
            if (d.type === 'INLAND') return "#d97706"; // Amber for Inland
            if (selectedPort?.id === d.id) return "#8b5cf6";
            return "#64748b";
        });

    function drawLeg(g: any, proj: any, p1: Port, p2: Port, color: string, isInland: boolean) {
        const source = proj(p1.coordinates);
        const target = proj(p2.coordinates);
        if (source && target) {
            const link = { type: "LineString", coordinates: [p1.coordinates, p2.coordinates], properties: { isInland } };
            g.append("path").datum(link).attr("class", "route-line")
                .attr("d", d3.geoPath().projection(proj))
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", (isInland ? 3 : 4) / zoomK)
                .attr("stroke-dasharray", isInland ? "5,5" : "none") // Dashed for Inland
                .attr("opacity", 0.9);
        }
    }

  }, [geoData, dimensions, visibleNodes, selectedRoute, selectedPort, zoomK]);
  
  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-50 relative overflow-hidden group">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full">
            <g ref={mapGroupRef} />
        </svg>
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex flex-col gap-1">
                <button onClick={() => d3.select(svgRef.current).call(zoomBehaviorRef.current!.scaleBy, 1.5)} className="p-2 hover:bg-slate-100"><Plus size={18}/></button>
                <button onClick={() => d3.select(svgRef.current).call(zoomBehaviorRef.current!.scaleBy, 0.66)} className="p-2 hover:bg-slate-100"><Minus size={18}/></button>
                <button onClick={() => d3.select(svgRef.current).call(zoomBehaviorRef.current!.transform, d3.zoomIdentity)} className="p-2 hover:bg-slate-100"><RotateCcw size={18}/></button>
            </div>
        </div>
        <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded text-xs text-slate-500 shadow border border-slate-200">
             <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Seaport</div>
             <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 bg-amber-500"></span> Inland Hub</div>
             <div className="flex items-center gap-2"><span className="w-4 h-0.5 bg-slate-400 border-t border-dashed border-slate-600"></span> Rail/Truck</div>
        </div>
    </div>
  );
};

export default WorldMap;
