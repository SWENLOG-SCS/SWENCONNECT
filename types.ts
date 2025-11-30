
export interface Carrier {
  id: string;
  name: string;
  code: string;
  color: string;
  logo?: string;
}

export interface Port {
  id: string;
  name: string;
  code: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ServiceLeg {
  id: string;
  originPortId: string;
  destinationPortId: string;
  transitTimeDays: number;
  carrierId: string;
}

export interface Service {
  id: string;
  carrierId: string;
  name: string;
  code: string;
  legs: ServiceLeg[];
}

export interface TransshipmentConnection {
  id: string;
  serviceAId: string;
  serviceBId: string;
  portId: string;
  isActive: boolean;
}

export interface RouteSegment {
  service: Service;
  origin: Port;
  destination: Port;
  transitTime: number;
  legs: ServiceLeg[];
}

export interface RouteResult {
  id: string;
  segments: RouteSegment[];
  totalTransitTime: number;
  transshipmentPort?: Port;
  type: 'DIRECT' | 'TRANSSHIPMENT';
}

export interface PotentialConnection {
  serviceA: Service;
  serviceB: Service;
  commonPorts: Port[];
}

// --- Auth & Admin Types ---

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, never store plain text
  role: UserRole;
  fullName: string;
  lastLogin?: string;
}

export interface SearchLog {
  id: string;
  userId: string | null; // null for Guest
  timestamp: string;
  polId: string;
  podId: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface IssueReport {
  id: string;
  description: string;
  email: string;
  contactNumber: string;
  timestamp: string;
  status: 'OPEN' | 'RESOLVED';
}