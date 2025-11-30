
import { Carrier, Port, Service, TransshipmentConnection, User, ActivityLog, SearchLog } from './types';

export const INITIAL_CARRIERS: Carrier[] = [
  { id: 'c1', name: 'Maersk Line', code: 'MSK', color: '#3b82f6', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Maersk_Group_Logo.svg/1024px-Maersk_Group_Logo.svg.png' }, // Blue
  { id: 'c2', name: 'MSC', code: 'MSC', color: '#fbbf24', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/MSC_Crociere_Logo.svg/2560px-MSC_Crociere_Logo.svg.png' }, // Yellow
  { id: 'c3', name: 'CMA CGM', code: 'CMA', color: '#ef4444', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/CMA_CGM_logo.svg/1280px-CMA_CGM_logo.svg.png' }, // Red
  { id: 'c4', name: 'Hapag-Lloyd', code: 'HPL', color: '#f97316', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Hapag-Lloyd_Logo.svg/1200px-Hapag-Lloyd_Logo.svg.png' }, // Orange
  { id: 'c5', name: 'Evergreen', code: 'EMC', color: '#10b981', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Evergreen_Line_Logo.svg/1200px-Evergreen_Line_Logo.svg.png' }, // Green
  { id: 'c6', name: 'ONE', code: 'ONE', color: '#ec4899', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Ocean_Network_Express_Logo.svg/1200px-Ocean_Network_Express_Logo.svg.png' }, // Pink
];

export const INITIAL_PORTS: Port[] = [
  // ASIA
  { id: 'p1', name: 'Shanghai', code: 'CNSHA', country: 'China', coordinates: [121.4737, 31.2304] },
  { id: 'p2', name: 'Singapore', code: 'SGSIN', country: 'Singapore', coordinates: [103.8198, 1.3521] },
  { id: 'p6', name: 'Busan', code: 'KRPUS', country: 'South Korea', coordinates: [129.0756, 35.1796] },
  { id: 'p9', name: 'Tokyo', code: 'JPTYO', country: 'Japan', coordinates: [139.6917, 35.6895] },
  { id: 'p11', name: 'Ningbo', code: 'CNNBG', country: 'China', coordinates: [121.6186, 29.8683] },
  { id: 'p12', name: 'Shenzhen', code: 'CNSZX', country: 'China', coordinates: [114.1095, 22.5431] },
  { id: 'p13', name: 'Hong Kong', code: 'HKHKG', country: 'Hong Kong', coordinates: [114.1694, 22.3193] },
  { id: 'p14', name: 'Port Klang', code: 'MYPKG', country: 'Malaysia', coordinates: [101.3928, 3.0000] },
  { id: 'p24', name: 'Kaohsiung', code: 'TWKHH', country: 'Taiwan', coordinates: [120.3120, 22.6273] },

  // MIDDLE EAST
  { id: 'p7', name: 'Jebel Ali', code: 'AEJEA', country: 'UAE', coordinates: [55.0273, 25.0228] },

  // EUROPE
  { id: 'p3', name: 'Rotterdam', code: 'NLRTM', country: 'Netherlands', coordinates: [4.47917, 51.9225] },
  { id: 'p5', name: 'Hamburg', code: 'DEHAM', country: 'Germany', coordinates: [9.9937, 53.5511] },
  { id: 'p15', name: 'Antwerp', code: 'BEANR', country: 'Belgium', coordinates: [4.4025, 51.2194] },
  { id: 'p16', name: 'Felixstowe', code: 'GBFXT', country: 'UK', coordinates: [1.3513, 51.9614] },
  { id: 'p17', name: 'Le Havre', code: 'FRLEH', country: 'France', coordinates: [0.1079, 49.4944] },
  { id: 'p20', name: 'Valencia', code: 'ESVLC', country: 'Spain', coordinates: [-0.3763, 39.4699] },
  { id: 'p22', name: 'Barcelona', code: 'ESBCN', country: 'Spain', coordinates: [2.1734, 41.3851] },

  // NORTH AMERICA
  { id: 'p4', name: 'Los Angeles', code: 'USLAX', country: 'USA', coordinates: [-118.2437, 34.0522] },
  { id: 'p8', name: 'New York', code: 'USNYC', country: 'USA', coordinates: [-74.006, 40.7128] },
  { id: 'p18', name: 'Vancouver', code: 'CAVAN', country: 'Canada', coordinates: [-123.1207, 49.2827] },
  { id: 'p19', name: 'Savannah', code: 'USSAV', country: 'USA', coordinates: [-81.0998, 32.0835] },
  { id: 'p21', name: 'Oakland', code: 'USOAK', country: 'USA', coordinates: [-122.2711, 37.8044] },
  { id: 'p23', name: 'Norfolk', code: 'USORF', country: 'USA', coordinates: [-76.2859, 36.8508] },

  // SOUTH AMERICA
  { id: 'p10', name: 'Santos', code: 'BRSSZ', country: 'Brazil', coordinates: [-46.308, -23.961] },
];

export const INITIAL_SERVICES: Service[] = [
  // 1. AE1 (Maersk) - Asia North Europe
  {
    id: 's1',
    carrierId: 'c1',
    name: 'AE1 (Asia-Europe 1)',
    code: 'AE1',
    legs: [
      { id: 'l1', originPortId: 'p1', destinationPortId: 'p2', transitTimeDays: 6, carrierId: 'c1' }, // SHA -> SIN
      { id: 'l2', originPortId: 'p2', destinationPortId: 'p3', transitTimeDays: 23, carrierId: 'c1' }, // SIN -> RTM
      { id: 'l3', originPortId: 'p3', destinationPortId: 'p5', transitTimeDays: 2, carrierId: 'c1' }, // RTM -> HAM
    ],
  },
  // 2. TP1 (MSC) - Transpacific
  {
    id: 's2',
    carrierId: 'c2',
    name: 'TP1 (Transpacific 1)',
    code: 'TP1',
    legs: [
      { id: 'l4', originPortId: 'p1', destinationPortId: 'p6', transitTimeDays: 3, carrierId: 'c2' }, // SHA -> PUS
      { id: 'l5', originPortId: 'p6', destinationPortId: 'p4', transitTimeDays: 12, carrierId: 'c2' }, // PUS -> LAX
    ],
  },
  // 3. FAL1 (CMA) - French Asia Line
  {
    id: 's3',
    carrierId: 'c3',
    name: 'FAL1 (French Asia Line)',
    code: 'FAL1',
    legs: [
      { id: 'l6', originPortId: 'p9', destinationPortId: 'p1', transitTimeDays: 4, carrierId: 'c3' }, // TYO -> SHA
      { id: 'l7', originPortId: 'p1', destinationPortId: 'p2', transitTimeDays: 6, carrierId: 'c3' }, // SHA -> SIN
      { id: 'l8', originPortId: 'p2', destinationPortId: 'p7', transitTimeDays: 10, carrierId: 'c3' }, // SIN -> JEA
      { id: 'l9', originPortId: 'p7', destinationPortId: 'p3', transitTimeDays: 18, carrierId: 'c3' }, // JEA -> RTM
    ],
  },
  // 4. AT1 (Hapag) - Atlantic
  {
    id: 's4',
    carrierId: 'c4',
    name: 'AT1 (Atlantic 1)',
    code: 'AT1',
    legs: [
      { id: 'l10', originPortId: 'p3', destinationPortId: 'p8', transitTimeDays: 9, carrierId: 'c4' }, // RTM -> NYC
      { id: 'l11', originPortId: 'p5', destinationPortId: 'p8', transitTimeDays: 11, carrierId: 'c4' }, // HAM -> NYC
    ],
  },
  // 5. SA1 (Maersk) - South America
  {
     id: 's5',
     carrierId: 'c1',
     name: 'SA1 (South America 1)',
     code: 'SA1',
     legs: [
        { id: 'l12', originPortId: 'p3', destinationPortId: 'p10', transitTimeDays: 18, carrierId: 'c1'}, // RTM -> SSZ
     ]
  },
  // 6. AE2 (MSC) - Asia Europe Loop 2
  {
    id: 's6',
    carrierId: 'c2',
    name: 'AE2 (Lion Service)',
    code: 'AE2',
    legs: [
        { id: 'l13', originPortId: 'p11', destinationPortId: 'p12', transitTimeDays: 2, carrierId: 'c2' }, // NBG -> SZX
        { id: 'l14', originPortId: 'p12', destinationPortId: 'p14', transitTimeDays: 4, carrierId: 'c2' }, // SZX -> PKG
        { id: 'l15', originPortId: 'p14', destinationPortId: 'p15', transitTimeDays: 22, carrierId: 'c2' }, // PKG -> ANR
        { id: 'l16', originPortId: 'p15', destinationPortId: 'p17', transitTimeDays: 2, carrierId: 'c2' }, // ANR -> LEH
    ]
  },
  // 7. TP2 (CMA) - Transpacific North West
  {
    id: 's7',
    carrierId: 'c3',
    name: 'TP2 (Pearl River Express)',
    code: 'TP2',
    legs: [
        { id: 'l17', originPortId: 'p13', destinationPortId: 'p12', transitTimeDays: 1, carrierId: 'c3' }, // HKG -> SZX
        { id: 'l18', originPortId: 'p12', destinationPortId: 'p18', transitTimeDays: 16, carrierId: 'c3' }, // SZX -> VAN
        { id: 'l19', originPortId: 'p18', destinationPortId: 'p21', transitTimeDays: 4, carrierId: 'c3' }, // VAN -> OAK
    ]
  },
  // 8. MED1 (Maersk) - Mediterranean Loop
  {
    id: 's8',
    carrierId: 'c1',
    name: 'MED1 (AE12)',
    code: 'MED1',
    legs: [
        { id: 'l20', originPortId: 'p2', destinationPortId: 'p7', transitTimeDays: 9, carrierId: 'c1' }, // SIN -> JEA
        { id: 'l21', originPortId: 'p7', destinationPortId: 'p22', transitTimeDays: 14, carrierId: 'c1' }, // JEA -> BCN
        { id: 'l22', originPortId: 'p22', destinationPortId: 'p20', transitTimeDays: 2, carrierId: 'c1' }, // BCN -> VLC
    ]
  },
  // 9. AX1 (Hapag) - Atlantic Express
  {
      id: 's9',
      carrierId: 'c4',
      name: 'AX1 (Atlantic Express)',
      code: 'AX1',
      legs: [
          { id: 'l23', originPortId: 'p15', destinationPortId: 'p23', transitTimeDays: 11, carrierId: 'c4' }, // ANR -> ORF
          { id: 'l24', originPortId: 'p23', destinationPortId: 'p19', transitTimeDays: 3, carrierId: 'c4' }, // ORF -> SAV
      ]
  }
];

export const INITIAL_CONNECTIONS: TransshipmentConnection[] = [
  // 1. Maersk Connection at Rotterdam (AE1 -> AT1 is diff carrier but valid in our model if user sets it)
  // Let's connect AE1 (Maersk) to SA1 (Maersk) at Rotterdam
  {
    id: 'tc1',
    serviceAId: 's1', // AE1 (goes to RTM)
    serviceBId: 's5', // SA1 (starts at RTM)
    portId: 'p3',   // Rotterdam
    isActive: true,
  },
  // 2. CMA Connection at Singapore (FAL1 <-> Others) - Not defined yet
  // 3. FAL1 (CMA) -> AT1 (Hapag) at Rotterdam
  {
    id: 'tc2',
    serviceAId: 's3', // FAL1
    serviceBId: 's4', // AT1
    portId: 'p3',   // RTM
    isActive: true,
  },
  // 4. MSC Connection at Antwerp: AE2 -> AX1 (Hapag) - Diff carrier
  {
      id: 'tc3',
      serviceAId: 's6', // AE2 (MSC) Ends at LEH/ANR
      serviceBId: 's9', // AX1 (Hapag) Starts at ANR
      portId: 'p15', // Antwerp
      isActive: true
  },
  // 5. Maersk Connection at Singapore: AE1 -> MED1
  {
      id: 'tc4',
      serviceAId: 's1', // AE1
      serviceBId: 's8', // MED1
      portId: 'p2', // Singapore
      isActive: true
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'password', // Mock
    role: 'ADMIN',
    fullName: 'System Administrator',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'u2',
    username: 'user',
    password: 'password',
    role: 'USER',
    fullName: 'Logistics Planner',
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'u_sarath',
    username: 'sarath@swenlog.com',
    password: 'Sarath@250988',
    role: 'ADMIN',
    fullName: 'Sarath Admin',
    lastLogin: new Date().toISOString()
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log1', userId: 'u1', timestamp: new Date(Date.now() - 100000).toISOString(), action: 'LOGIN', details: 'System Administrator logged in' },
  { id: 'log2', userId: 'u1', timestamp: new Date(Date.now() - 80000).toISOString(), action: 'UPDATE_SERVICE', details: 'Updated Service AE1' },
];

export const INITIAL_SEARCH_LOGS: SearchLog[] = [
  { id: 'slog1', userId: 'u2', timestamp: new Date(Date.now() - 200000).toISOString(), polId: 'p1', podId: 'p3' },
  { id: 'slog2', userId: null, timestamp: new Date(Date.now() - 500000).toISOString(), polId: 'p2', podId: 'p4' },
];
