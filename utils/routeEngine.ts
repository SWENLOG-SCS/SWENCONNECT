
import { Service, Port, TransshipmentConnection, RouteResult, ServiceLeg, InlandConnection, InlandLeg } from '../types';

export const findRoutes = (
  originId: string,
  destinationId: string,
  services: Service[],
  ports: Port[],
  connections: TransshipmentConnection[],
  inlandConnections: InlandConnection[]
): RouteResult[] => {
  const results: RouteResult[] = [];
  const getPort = (id: string) => ports.find((p) => p.id === id)!;

  const originPort = getPort(originId);
  const destPort = getPort(destinationId);

  // Determine potential Sea Start/End Points
  let seaStartPoints: { portId: string, leg: InlandLeg | null }[] = [];
  let seaEndPoints: { portId: string, leg: InlandLeg | null }[] = [];

  // --- PRE-CARRIAGE LOGIC ---
  if (originPort.type === 'INLAND') {
      const links = inlandConnections.filter(ic => ic.hubId === originId);
      links.forEach(link => {
          seaStartPoints.push({
              portId: link.portId,
              leg: {
                  origin: originPort,
                  destination: getPort(link.portId),
                  mode: link.mode,
                  transitTime: link.transitTimeDays
              }
          });
      });
  } else {
      seaStartPoints.push({ portId: originId, leg: null });
  }

  // --- ON-CARRIAGE LOGIC ---
  if (destPort.type === 'INLAND') {
      const links = inlandConnections.filter(ic => ic.hubId === destinationId);
      links.forEach(link => {
          seaEndPoints.push({
              portId: link.portId,
              leg: {
                  origin: getPort(link.portId),
                  destination: destPort,
                  mode: link.mode,
                  transitTime: link.transitTimeDays
              }
          });
      });
  } else {
      seaEndPoints.push({ portId: destinationId, leg: null });
  }

  // --- SEA ROUTE FINDER ---
  // Iterate through all combinations of Sea Origin -> Sea Destination
  seaStartPoints.forEach(start => {
      seaEndPoints.forEach(end => {
          if (start.portId === end.portId) return; // Skip if mapped to same port

          const seaRoutes = findSeaRoutes(start.portId, end.portId, services, connections, getPort);
          
          seaRoutes.forEach(seaRoute => {
              const totalTime = (start.leg?.transitTime || 0) + seaRoute.transitTime + (end.leg?.transitTime || 0);
              const resultId = `${start.leg ? 'in-' : ''}${seaRoute.id}${end.leg ? '-out' : ''}`;
              
              const routeType = (start.leg || end.leg) ? 'INTERMODAL' : seaRoute.type;

              results.push({
                  id: resultId,
                  type: routeType,
                  totalTransitTime: totalTime,
                  preCarriage: start.leg || undefined,
                  segments: seaRoute.segments,
                  onCarriage: end.leg || undefined,
                  transshipmentPort: seaRoute.transshipmentPort
              });
          });
      });
  });

  return results.sort((a, b) => a.totalTransitTime - b.totalTransitTime);
};

// Helper: Standard Sea Route Logic (Direct + 1 Hop)
const findSeaRoutes = (
    originId: string, 
    destinationId: string, 
    services: Service[], 
    connections: TransshipmentConnection[],
    getPort: (id: string) => Port
) => {
    const seaResults: { 
        id: string, 
        type: 'DIRECT' | 'TRANSSHIPMENT', 
        transitTime: number, 
        segments: any[], 
        transshipmentPort?: Port 
    }[] = [];

    // 1. Direct Routes
    services.forEach((service) => {
        let currentLegTime = 0;
        let foundOrigin = false;
        let pathLegs: ServiceLeg[] = [];
        let destIndex = -1;

        for (let i = 0; i < service.legs.length; i++) {
            const leg = service.legs[i];
            if (leg.originPortId === originId) foundOrigin = true;
            if (foundOrigin) {
                pathLegs.push(leg);
                currentLegTime += leg.transitTimeDays;
                if (leg.destinationPortId === destinationId) {
                    destIndex = i;
                    break;
                }
            }
        }

        if (foundOrigin && destIndex !== -1) {
            seaResults.push({
                id: `direct-${service.id}`,
                type: 'DIRECT',
                transitTime: currentLegTime,
                segments: [{
                    service,
                    origin: getPort(originId),
                    destination: getPort(destinationId),
                    transitTime: currentLegTime,
                    legs: [...pathLegs]
                }]
            });
        }
    });

    // 2. Transshipment (1-Hop)
    connections.filter(c => c.isActive).forEach(conn => {
        const serviceA = services.find(s => s.id === conn.serviceAId);
        const serviceB = services.find(s => s.id === conn.serviceBId);
        const transferPort = getPort(conn.portId);

        if (!serviceA || !serviceB || !transferPort) return;

        // Leg 1
        let leg1Time = 0;
        let leg1Valid = false;
        let legsA: ServiceLeg[] = [];
        let foundOriginA = false;
        for (const leg of serviceA.legs) {
            if (leg.originPortId === originId) foundOriginA = true;
            if (foundOriginA) {
                legsA.push(leg);
                leg1Time += leg.transitTimeDays;
                if (leg.destinationPortId === conn.portId) {
                    leg1Valid = true;
                    break;
                }
            }
        }

        // Leg 2
        let leg2Time = 0;
        let leg2Valid = false;
        let legsB: ServiceLeg[] = [];
        let foundOriginB = false;
        for (const leg of serviceB.legs) {
            if (leg.originPortId === conn.portId) foundOriginB = true;
            if (foundOriginB) {
                legsB.push(leg);
                leg2Time += leg.transitTimeDays;
                if (leg.destinationPortId === destinationId) {
                    leg2Valid = true;
                    break;
                }
            }
        }

        if (leg1Valid && leg2Valid) {
            const bufferTime = 3; 
            seaResults.push({
                id: `trans-${conn.id}`,
                type: 'TRANSSHIPMENT',
                transitTime: leg1Time + leg2Time + bufferTime,
                transshipmentPort: transferPort,
                segments: [
                    { service: serviceA, origin: getPort(originId), destination: transferPort, transitTime: leg1Time, legs: legsA },
                    { service: serviceB, origin: transferPort, destination: getPort(destinationId), transitTime: leg2Time, legs: legsB }
                ]
            });
        }
    });

    return seaResults;
};
