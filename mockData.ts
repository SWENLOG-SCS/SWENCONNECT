
import { Carrier, Port, Service, TransshipmentConnection, User, ActivityLog, SearchLog, InlandConnection } from './types';

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
  { id: 'p1', name: 'Shanghai', code: 'CNSHA', country: 'China', coordinates: [121.4737, 31.2304], type: 'SEAPORT' },
  { id: 'p2', name: 'Singapore', code: 'SGSIN', country: 'Singapore', coordinates: [103.8198, 1.3521], type: 'SEAPORT' },
  { id: 'p6', name: 'Busan', code: 'KRPUS', country: 'South Korea', coordinates: [129.0756, 35.1796], type: 'SEAPORT' },
  { id: 'p9', name: 'Tokyo', code: 'JPTYO', country: 'Japan', coordinates: [139.6917, 35.6895], type: 'SEAPORT' },
  { id: 'p11', name: 'Ningbo', code: 'CNNBG', country: 'China', coordinates: [121.6186, 29.8683], type: 'SEAPORT' },
  { id: 'p12', name: 'Shenzhen', code: 'CNSZX', country: 'China', coordinates: [114.1095, 22.5431], type: 'SEAPORT' },
  { id: 'p13', name: 'Hong Kong', code: 'HKHKG', country: 'Hong Kong', coordinates: [114.1694, 22.3193], type: 'SEAPORT' },
  { id: 'p14', name: 'Port Klang', code: 'MYPKG', country: 'Malaysia', coordinates: [101.3928, 3.0000], type: 'SEAPORT' },
  { id: 'p24', name: 'Kaohsiung', code: 'TWKHH', country: 'Taiwan', coordinates: [120.3120, 22.6273], type: 'SEAPORT' },

  // MIDDLE EAST
  { id: 'p7', name: 'Jebel Ali', code: 'AEJEA', country: 'UAE', coordinates: [55.0273, 25.0228], type: 'SEAPORT' },

  // EUROPE
  { id: 'p3', name: 'Rotterdam', code: 'NLRTM', country: 'Netherlands', coordinates: [4.47917, 51.9225], type: 'SEAPORT' },
  { id: 'p5', name: 'Hamburg', code: 'DEHAM', country: 'Germany', coordinates: [9.9937, 53.5511], type: 'SEAPORT' },
  { id: 'p15', name: 'Antwerp', code: 'BEANR', country: 'Belgium', coordinates: [4.4025, 51.2194], type: 'SEAPORT' },
  { id: 'p16', name: 'Felixstowe', code: 'GBFXT', country: 'UK', coordinates: [1.3513, 51.9614], type: 'SEAPORT' },
  { id: 'p17', name: 'Le Havre', code: 'FRLEH', country: 'France', coordinates: [0.1079, 49.4944], type: 'SEAPORT' },
  { id: 'p20', name: 'Valencia', code: 'ESVLC', country: 'Spain', coordinates: [-0.3763, 39.4699], type: 'SEAPORT' },
  { id: 'p22', name: 'Barcelona', code: 'ESBCN', country: 'Spain', coordinates: [2.1734, 41.3851], type: 'SEAPORT' },

  // NORTH AMERICA
  { id: 'p4', name: 'Los Angeles', code: 'USLAX', country: 'USA', coordinates: [-118.2437, 34.0522], type: 'SEAPORT' },
  { id: 'p8', name: 'New York', code: 'USNYC', country: 'USA', coordinates: [-74.006, 40.7128], type: 'SEAPORT' },
  { id: 'p18', name: 'Vancouver', code: 'CAVAN', country: 'Canada', coordinates: [-123.1207, 49.2827], type: 'SEAPORT' },
  { id: 'p19', name: 'Savannah', code: 'USSAV', country: 'USA', coordinates: [-81.0998, 32.0835], type: 'SEAPORT' },
  { id: 'p21', name: 'Oakland', code: 'USOAK', country: 'USA', coordinates: [-122.2711, 37.8044], type: 'SEAPORT' },
  { id: 'p23', name: 'Norfolk', code: 'USORF', country: 'USA', coordinates: [-76.2859, 36.8508], type: 'SEAPORT' },

  // SOUTH AMERICA
  { id: 'p10', name: 'Santos', code: 'BRSSZ', country: 'Brazil', coordinates: [-46.308, -23.961], type: 'SEAPORT' },

  // --- INLAND HUBS ---
  { id: 'p_chi', name: 'Chicago', code: 'USCHI', country: 'USA', coordinates: [-87.6298, 41.8781], type: 'INLAND' },
  { id: 'p_muc', name: 'Munich', code: 'DEMUC', country: 'Germany', coordinates: [11.5820, 48.1351], type: 'INLAND' },
  { id: 'p_yiw', name: 'Yiwu', code: 'CNYIW', country: 'China', coordinates: [120.0751, 29.3151], type: 'INLAND' },
  { id: 'p_del', name: 'New Delhi', code: 'INDEL', country: 'India', coordinates: [77.2090, 28.6139], type: 'INLAND' },
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
  // 1. Maersk Connection at Rotterdam
  { id: 'tc1', serviceAId: 's1', serviceBId: 's5', portId: 'p3', isActive: true },
  // 2. FAL1 -> AT1 at Rotterdam
  { id: 'tc2', serviceAId: 's3', serviceBId: 's4', portId: 'p3', isActive: true },
  // 3. MSC Connection at Antwerp
  { id: 'tc3', serviceAId: 's6', serviceBId: 's9', portId: 'p15', isActive: true },
  // 4. Maersk Connection at Singapore
  { id: 'tc4', serviceAId: 's1', serviceBId: 's8', portId: 'p2', isActive: true }
];

export const INITIAL_INLAND_CONNECTIONS: InlandConnection[] = [
    // US Rail
    { id: 'ic1', hubId: 'p_chi', portId: 'p8', mode: 'RAIL', transitTimeDays: 4 }, // Chicago <-> NYC
    { id: 'ic2', hubId: 'p_chi', portId: 'p4', mode: 'RAIL', transitTimeDays: 5 }, // Chicago <-> LAX
    { id: 'ic3', hubId: 'p_chi', portId: 'p23', mode: 'RAIL', transitTimeDays: 4 }, // Chicago <-> Norfolk
    
    // Europe Rail/Truck
    { id: 'ic4', hubId: 'p_muc', portId: 'p5', mode: 'RAIL', transitTimeDays: 1 }, // Munich <-> Hamburg
    { id: 'ic5', hubId: 'p_muc', portId: 'p3', mode: 'RAIL', transitTimeDays: 2 }, // Munich <-> Rotterdam
    
    // China Truck
    { id: 'ic6', hubId: 'p_yiw', portId: 'p11', mode: 'TRUCK', transitTimeDays: 1 }, // Yiwu <-> Ningbo
    { id: 'ic7', hubId: 'p_yiw', portId: 'p1', mode: 'TRUCK', transitTimeDays: 1 }, // Yiwu <-> Shanghai
];

export const INITIAL_USERS: User[] = [
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
  { id: 'log1', userId: 'u_sarath', timestamp: new Date(Date.now() - 100000).toISOString(), action: 'LOGIN', details: 'System Administrator logged in' },
];

export const INITIAL_SEARCH_LOGS: SearchLog[] = [];
