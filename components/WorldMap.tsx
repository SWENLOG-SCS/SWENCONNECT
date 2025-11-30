
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

  // Keep track of D3 Zoom Behavior to call it programmatically
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    fetch(WORLD_GEO_JSON_URL)
      .then((res) => res.json())
      .then((data) => setGeoData(data));
      
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Compute Clusters vs Ports based on Zoom Level & Selection
  const visibleNodes = useMemo(() => {
      // If a route is selected, or we are zoomed in, show all individual ports
      if (selectedRoute || zoomK >= 2.5) {
          return ports.map(p => ({ ...p, type: 'port', clusterCount: 0 }));
      }

      // Otherwise, group by Country
      const clusters = d3.rollups(
          ports,
          (v) => ({
              id: `cluster-${v[0].country}`,
              name: v[0].country,
              code: v[0].country.substring(0, 3).toUpperCase(),
              country: v[0].country,
              // Centroid of the cluster
              coordinates: [
                  d3.mean(v, d => d.coordinates[0]) || 0,
                  d3.mean(v, d => d.coordinates[1]) || 0
              ] as [number, number],
              type: 'cluster',
              clusterCount: v.length,
              ports: v
          }),
          (d) => d.country
      );

      // Flatten to array
      return clusters.map(([key, data]) => data);
  }, [ports, zoomK, selectedRoute]);

  useEffect(() => {
    if (!geoData || !svgRef.current || !mapGroupRef.current) return;

    const svg = d3.select(svgRef.current);
    const mapGroup = d3.select(mapGroupRef.current);
    
    const { width, height } = dimensions;

    // Projection
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .center([0, 20])
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // 1. Initialize Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 12]) // Max zoom 12x
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
        .on("zoom", (event) => {
            const { transform } = event;
            setZoomK(transform.k); // Sync state for React logic
            
            // Apply Transform
            mapGroup.attr("transform", transform.toString());

            // Semantic Zoom: Scale strokes and sizes inversely to zoom level
            mapGroup.selectAll("path.country")
                .attr("stroke-width", 0.5 / transform.k);
            
            mapGroup.selectAll("path.route-halo")
                .attr("stroke-width", 8 / transform.k);
            
            mapGroup.selectAll("path.route-line")
                .attr("stroke-width", 4 / transform.k);

            // Update Nodes (Ports/Clusters) radius
            mapGroup.selectAll(".node-circle")
                .attr("r", (d: any) => {
                     let baseR = 4;
                     if (d.type === 'cluster') baseR = 12 + Math.min(d.clusterCount, 5); // Cluster size depends on count
                     else {
                         if (selectedPort?.id === d.id) baseR = 10;
                         else if (selectedRoute?.transshipmentPort?.id === d.id) baseR = 9;
                         else if (selectedRoute?.segments[0].origin.id === d.id || selectedRoute?.segments[selectedRoute?.segments.length-1].destination.id === d.id) baseR = 7;
                     }
                     return baseR / transform.k;
                })
                .attr("stroke-width", (d: any) => {
                     const isSelected = selectedPort?.id === d.id || selectedRoute?.transshipmentPort?.id === d.id;
                     return (isSelected ? 3 : 1.5) / transform.k;
                });
            
            // Update Flags (Size & Position)
            mapGroup.selectAll(".node-flag")
                .attr("width", 12 / transform.k)
                .attr("height", 9 / transform.k)
                .attr("x", -14 / transform.k) // Shift left of center
                .attr("y", (d: any) => {
                    const r = 4;
                    // Align vertically with the text baseline approximately
                    return (r / transform.k) + (12 / transform.k) - (9 / transform.k); 
                });

            // Update Text Labels (Size & Position)
            mapGroup.selectAll(".node-label")
                .attr("font-size", (10 / transform.k) + "px")
                .attr("dx", (d: any) => d.type === 'cluster' ? 0 : (6 / transform.k)) // Shift text right for ports to make room for flag
                .attr("y", (d: any) => {
                    const r = d.type === 'cluster' ? (12 + Math.min(d.clusterCount, 5)) : 4;
                    return (r / transform.k) + (12 / transform.k); // Offset below circle
                });

            // Update Cluster Count Text
            mapGroup.selectAll(".cluster-count")
                .attr("font-size", (10 / transform.k) + "px");

            // Hide tooltips on zoom
            svg.selectAll(".map-tooltip").remove();
        });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Background Click
    svg.on("click", (e) => {
        if (e.target === svgRef.current && onMapClick) {
             onMapClick();
        }
    });

    // --- DRAWING LOGIC ---

    // 2. Draw Countries
    mapGroup.select(".countries-group").remove(); // Re-draw countries if dim change
    const countriesG = mapGroup.insert("g", ":first-child").attr("class", "countries-group");
    
    countriesG.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("class", "country")
      .attr("d", pathGenerator as any)
      .attr("fill", "#e2e8f0")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 0.5 / zoomK); // Apply current scale

    // 3. Draw Routes
    mapGroup.select(".routes-group").remove();
    const routesG = mapGroup.append("g").attr("class", "routes-group");

    if (selectedRoute) {
        selectedRoute.segments.forEach((segment, index) => {
            const source = projection(segment.origin.coordinates);
            const target = projection(segment.destination.coordinates);

            if (source && target) {
                const link = { type: "LineString", coordinates: [segment.origin.coordinates, segment.destination.coordinates] };
                
                // Halo
                routesG.append("path")
                    .datum(link)
                    .attr("class", "route-halo")
                    .attr("d", d3.geoPath().projection(projection) as any)
                    .attr("fill", "none")
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 8 / zoomK)
                    .attr("stroke-linecap", "round")
                    .attr("opacity", 0.8);

                // Line
                routesG.append("path")
                    .datum(link)
                    .attr("class", "route-line")
                    .attr("d", d3.geoPath().projection(projection) as any)
                    .attr("fill", "none")
                    .attr("stroke", index === 0 ? "#2563eb" : "#ea580c")
                    .attr("stroke-width", 4 / zoomK)
                    .attr("stroke-linecap", "round")
                    .attr("stroke-dasharray", "1000")
                    .attr("stroke-dashoffset", "1000")
                    .transition()
                    .duration(1500)
                    .delay(index * 500)
                    .attr("stroke-dashoffset", "0");
            }
        });
    }

    // 4. Draw Nodes (Ports OR Clusters)
    const nodesG = mapGroup.selectAll(".nodes-group").data([null]).join("g").attr("class", "nodes-group");

    const nodes = nodesG.selectAll(".node-group")
        .data(visibleNodes, (d: any) => d.id);

    const nodesEnter = nodes.enter().append("g")
        .attr("class", "node-group")
        .attr("transform", (d: any) => `translate(${projection(d.coordinates)})`)
        .attr("cursor", "pointer");

    // Circle
    nodesEnter.append("circle")
        .attr("class", "node-circle")
        .on("click", (e, d: any) => {
            e.stopPropagation();
            if (d.type === 'cluster') {
                // Zoom into cluster
                const [x, y] = projection(d.coordinates)!;
                // Transition to zoom level 4 centered on cluster
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity.translate(width / 2, height / 2).scale(4).translate(-x, -y)
                );
            } else {
                if (onPortClick) onPortClick(d);
            }
        });
    
    // Country Flag (for Ports only)
    nodesEnter.filter((d: any) => d.type !== 'cluster')
        .append("image")
        .attr("class", "node-flag")
        .attr("href", (d: any) => `https://flagcdn.com/24x18/${d.code.substring(0, 2).toLowerCase()}.png`)
        .attr("opacity", 0)
        .attr("pointer-events", "none");

    // Cluster Count Text (centered in circle)
    nodesEnter.filter((d: any) => d.type === 'cluster')
        .append("text")
        .attr("class", "cluster-count")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .text((d: any) => d.clusterCount);

    // Label Text (below)
    nodesEnter.append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "middle")
        .attr("fill", "#1e293b")
        .attr("font-weight", "bold")
        .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff")
        .attr("pointer-events", "none")
        .attr("opacity", 0) // Hidden by default, shown on hover or for clusters
        .text((d: any) => d.name);

    nodes.exit().remove();

    // UPDATE Attributes for existing + new nodes
    nodesG.selectAll(".node-group")
        .attr("transform", (d: any) => {
             const coords = projection(d.coordinates);
             return coords ? `translate(${coords})` : null;
        });

    nodesG.selectAll(".node-circle")
        .attr("fill", (d: any) => {
            if (d.type === 'cluster') return "#3b82f6"; // Blue for clusters
            if (selectedPort?.id === d.id) return "#8b5cf6"; // Purple selected
            const isStart = selectedRoute?.segments[0].origin.id === d.id;
            const isEnd = selectedRoute?.segments[selectedRoute.segments.length - 1].destination.id === d.id;
            const isTransfer = selectedRoute?.transshipmentPort?.id === d.id;
            if (isStart) return "#10b981";
            if (isEnd) return "#ef4444";
            if (isTransfer) return "#f59e0b";
            return "#64748b";
        })
        .attr("stroke", (d: any) => {
             if (d.type === 'cluster') return "#2563eb";
             const isTransfer = selectedRoute?.transshipmentPort?.id === d.id;
             return isTransfer ? "#fff" : "#ffffff";
        })
        // Apply current K scaling immediately to prevent jump
        .attr("r", (d: any) => {
             let baseR = 4;
             if (d.type === 'cluster') baseR = 12 + Math.min(d.clusterCount, 5);
             else {
                 if (selectedPort?.id === d.id) baseR = 10;
                 else if (selectedRoute?.transshipmentPort?.id === d.id) baseR = 9;
                 else if (selectedRoute?.segments[0].origin.id === d.id || selectedRoute?.segments[selectedRoute?.segments.length-1].destination.id === d.id) baseR = 7;
             }
             return baseR / zoomK;
        })
        .attr("stroke-width", (d: any) => {
             const isSelected = selectedPort?.id === d.id || selectedRoute?.transshipmentPort?.id === d.id;
             return (isSelected ? 3 : 1.5) / zoomK;
        });

    // Initial update for flags
    nodesG.selectAll(".node-flag")
        .attr("width", 12 / zoomK)
        .attr("height", 9 / zoomK)
        .attr("x", -14 / zoomK)
        .attr("y", (d: any) => (4 / zoomK) + (12 / zoomK) - (9 / zoomK))
        .attr("opacity", (d: any) => {
            if (selectedPort?.id === d.id) return 1;
            if (zoomK > 4) return 1;
            return 0;
        });

    nodesG.selectAll(".node-label")
        .text((d: any) => d.type === 'cluster' ? d.name : d.code) // Full name for cluster, code for port
        .attr("font-size", (10 / zoomK) + "px")
        .attr("dx", (d: any) => d.type === 'cluster' ? 0 : (6 / zoomK))
        .attr("y", (d: any) => {
            const r = d.type === 'cluster' ? (12 + Math.min(d.clusterCount, 5)) : 4;
            return (r / zoomK) + (12 / zoomK);
        })
        .attr("opacity", (d: any) => {
            if (d.type === 'cluster') return 1; // Always show cluster name
            if (selectedPort?.id === d.id) return 1;
            if (zoomK > 4) return 1; // Show labels when zoomed in deep
            return 0;
        });
    
    // Hover interactions
    nodesG.selectAll(".node-group")
        .on("mouseover", function(event, d: any) {
             d3.select(this).select(".node-label").attr("opacity", 1);
             d3.select(this).select(".node-flag").attr("opacity", 1);
             
             if (d.type !== 'cluster') {
                 d3.select(this).select("circle").transition().duration(200).attr("fill", "#3b82f6");
             }
        })
        .on("mouseout", function(event, d: any) {
             const isSelected = selectedPort?.id === d.id;
             // Revert opacity logic
             const shouldShow = d.type === 'cluster' || isSelected || zoomK > 4;
             d3.select(this).select(".node-label").attr("opacity", shouldShow ? 1 : 0);
             d3.select(this).select(".node-flag").attr("opacity", (isSelected || zoomK > 4) ? 1 : 0);
             
             // Revert color logic
             if (d.type !== 'cluster') {
                 let fill = "#64748b";
                 if (isSelected) fill = "#8b5cf6";
                 else if (selectedRoute?.segments[0].origin.id === d.id) fill = "#10b981";
                 else if (selectedRoute?.segments[selectedRoute.segments.length - 1].destination.id === d.id) fill = "#ef4444";
                 else if (selectedRoute?.transshipmentPort?.id === d.id) fill = "#f59e0b";
                 
                 d3.select(this).select("circle").transition().duration(200).attr("fill", fill);
             }
        });

  }, [geoData, dimensions, visibleNodes, selectedRoute, selectedPort, onPortClick, onMapClick]);

  // Zoom Control Handlers
  const handleZoomIn = () => {
      if (svgRef.current && zoomBehaviorRef.current) {
          d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.5);
      }
  };

  const handleZoomOut = () => {
      if (svgRef.current && zoomBehaviorRef.current) {
          d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.66);
      }
  };

  const handleResetZoom = () => {
      if (svgRef.current && zoomBehaviorRef.current) {
          d3.select(svgRef.current).transition().duration(750).call(
              zoomBehaviorRef.current.transform, 
              d3.zoomIdentity
          );
      }
  };

  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-50 relative overflow-hidden group">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full">
            <g ref={mapGroupRef} />
        </svg>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex flex-col gap-1">
                <button onClick={handleZoomIn} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Zoom In">
                    <Plus size={18} />
                </button>
                <button onClick={handleZoomOut} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out">
                    <Minus size={18} />
                </button>
                <div className="h-px bg-slate-200 mx-1"></div>
                <button onClick={handleResetZoom} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Reset View">
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded text-xs text-slate-500 shadow backdrop-blur-sm pointer-events-none border border-slate-200">
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Origin</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white"></span> Transshipment</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Destination</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Port</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-600"></span> Country Cluster</div>
        </div>
    </div>
  );
};

export default WorldMap;
