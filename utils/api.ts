
import { Service, Port, Carrier, TransshipmentConnection, User, ActivityLog, SearchLog, IssueReport } from '../types';
import { 
  INITIAL_CARRIERS, 
  INITIAL_PORTS, 
  INITIAL_SERVICES, 
  INITIAL_CONNECTIONS, 
  INITIAL_USERS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_SEARCH_LOGS 
} from '../mockData';

const API_BASE_URL = 'http://localhost:3001/api';

const headers = {
  'Content-Type': 'application/json',
};

// --- INIT ---
export const fetchInitialData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/init`);
    if (!response.ok) throw new Error('Failed to fetch initial data');
    return await response.json();
  } catch (error) {
    console.warn("Backend API unavailable, falling back to mock data.", error);
    // Fallback to local mock data if backend is down
    return {
      ports: INITIAL_PORTS,
      carriers: INITIAL_CARRIERS,
      services: INITIAL_SERVICES,
      connections: INITIAL_CONNECTIONS
    };
  }
};

// --- AUTH ---
export const loginUser = async (credentials: Pick<User, 'username' | 'password'>): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return await response.json();
  } catch (error) {
    console.warn("Backend unavailable, checking mock users.");
    const user = INITIAL_USERS.find(u => u.username === credentials.username && u.password === credentials.password);
    if (user) return user;
    throw new Error('Invalid credentials');
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    return INITIAL_USERS;
  }
};

export const createUser = async (user: User) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(user)
    });
    return await response.json();
  } catch (e) { console.warn("Mock create user"); return user; }
};

export const deleteUser = async (id: string) => {
  try {
    await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
  } catch (e) { console.warn("Mock delete user"); }
};

// --- MASTER DATA ---
export const createCarrier = async (carrier: Carrier) => {
  try {
    const response = await fetch(`${API_BASE_URL}/carriers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(carrier)
    });
    return await response.json();
  } catch (e) { return carrier; }
};

export const updateCarrier = async (carrier: Carrier) => {
  try {
    const response = await fetch(`${API_BASE_URL}/carriers/${carrier.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(carrier)
    });
    return await response.json();
  } catch (e) { return carrier; }
};

export const deleteCarrier = async (id: string) => {
  try {
    await fetch(`${API_BASE_URL}/carriers/${id}`, { method: 'DELETE' });
  } catch (e) {}
};

export const createPort = async (port: Port) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ports`, {
        method: 'POST',
        headers,
        body: JSON.stringify(port)
    });
    return await response.json();
  } catch (e) { return port; }
};

export const updatePort = async (port: Port) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ports/${port.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(port)
    });
    return await response.json();
  } catch (e) { return port; }
};

export const deletePort = async (id: string) => {
  try {
    await fetch(`${API_BASE_URL}/ports/${id}`, { method: 'DELETE' });
  } catch (e) {}
};

// --- SERVICES ---
export const createService = async (service: Service) => {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers,
        body: JSON.stringify(service)
    });
    return await response.json();
  } catch (e) { return service; }
};

export const updateService = async (service: Service) => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${service.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(service)
    });
    return await response.json();
  } catch (e) { return service; }
};

export const deleteService = async (id: string) => {
  try {
    await fetch(`${API_BASE_URL}/services/${id}`, { method: 'DELETE' });
  } catch (e) {}
};

// --- CONNECTIONS ---
export const createConnection = async (connection: TransshipmentConnection) => {
  try {
    const response = await fetch(`${API_BASE_URL}/connections`, {
        method: 'POST',
        headers,
        body: JSON.stringify(connection)
    });
    return await response.json();
  } catch (e) { return connection; }
};

export const deleteConnection = async (id: string) => {
  try {
    await fetch(`${API_BASE_URL}/connections/${id}`, { method: 'DELETE' });
  } catch (e) {}
};

// --- LOGS & REPORTS ---
export const logActivity = async (userId: string, action: string, details: string) => {
  try {
    await fetch(`${API_BASE_URL}/logs/activity`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: Math.random().toString(36).substr(2,9), userId, action, details })
    });
  } catch (e) {}
};

export const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs/activity`);
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (e) { return INITIAL_ACTIVITY_LOGS; }
};

export const logSearch = async (userId: string | null, polId: string, podId: string) => {
  try {
    await fetch(`${API_BASE_URL}/logs/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: Math.random().toString(36).substr(2,9), userId, polId, podId })
    });
  } catch (e) {}
};

export const fetchSearchLogs = async (): Promise<SearchLog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs/search`);
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (e) { return INITIAL_SEARCH_LOGS; }
};

export const submitIssue = async (issue: any) => {
  try {
    await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: Math.random().toString(36).substr(2,9), ...issue })
    });
  } catch (e) {}
};

export const fetchIssues = async (): Promise<IssueReport[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues`);
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (e) { return []; }
};
