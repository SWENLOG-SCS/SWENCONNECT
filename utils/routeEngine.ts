import { Service, Port, TransshipmentConnection, RouteResult, ServiceLeg } from '../types';

export const findRoutes = (
  originId: string,
  destinationId: string,
  services: Service[],
  ports: Port[],
  connections: TransshipmentConnection[]
): RouteResult[] => {
  const results: RouteResult[] = [];

  const getPort = (id: string) => ports.find((p) => p.id === id)!;

  // 1. Direct Routes
  services.forEach((service) => {
    let originIndex = -1;
    let destIndex = -1;
    let accumulatedTime = 0;
    const pathLegs: ServiceLeg[] = [];

    // Simple ordered traversal to check if both ports exist in sequence
    // A service is a chain of legs.
    // Leg 1: A -> B
    // Leg 2: B -> C
    // Leg 3: C -> D
    
    // We need to reconstruct the full port sequence to check indices
    // However, the `legs` array might not be sorted in the raw data, but for our MockData they are.
    // Let's assume sequential legs for simplicity of this prototype.
    
    let currentLegTime = 0;
    let foundOrigin = false;

    // We scan through the legs
    for (let i = 0; i < service.legs.length; i++) {
        const leg = service.legs[i];
        
        if (leg.originPortId === originId) {
            foundOrigin = true;
            originIndex = i;
        }

        if (foundOrigin) {
            pathLegs.push(leg);
            currentLegTime += leg.transitTimeDays;

            if (leg.destinationPortId === destinationId) {
                destIndex = i;
                break; // Found destination
            }
        }
    }

    if (foundOrigin && destIndex !== -1) {
        results.push({
            id: `direct-${service.id}`,
            type: 'DIRECT',
            totalTransitTime: currentLegTime,
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

  // 2. Transshipment Routes (1-Hop)
  // Logic: Find Service A containing Origin -> X. Find Service B containing X -> Dest.
  // Verify X is a valid Transshipment Connection.
  
  connections.filter(c => c.isActive).forEach(conn => {
      const serviceA = services.find(s => s.id === conn.serviceAId);
      const serviceB = services.find(s => s.id === conn.serviceBId);
      const transferPort = getPort(conn.portId);

      if (!serviceA || !serviceB || !transferPort) return;

      // Check Leg 1: Origin -> Transfer
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

      // Check Leg 2: Transfer -> Destination
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
          const bufferTime = 3; // Standard 3 days for transshipment buffer
          results.push({
              id: `trans-${conn.id}`,
              type: 'TRANSSHIPMENT',
              totalTransitTime: leg1Time + leg2Time + bufferTime,
              transshipmentPort: transferPort,
              segments: [
                  {
                      service: serviceA,
                      origin: getPort(originId),
                      destination: transferPort,
                      transitTime: leg1Time,
                      legs: legsA
                  },
                  {
                      service: serviceB,
                      origin: transferPort,
                      destination: getPort(destinationId),
                      transitTime: leg2Time,
                      legs: legsB
                  }
              ]
          });
      }
  });

  return results.sort((a, b) => a.totalTransitTime - b.totalTransitTime);
};