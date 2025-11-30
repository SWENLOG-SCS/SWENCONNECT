
import React, { useState, useEffect } from 'react';
import { Service, TransshipmentConnection, Port, Carrier, User, ActivityLog, SearchLog, IssueReport, InlandConnection } from './types';
import ServiceManager from './components/ServiceManager';
import ConnectionManager from './components/ConnectionManager';
import RouteSearch from './components/RouteSearch';
import MasterDataManager from './components/MasterDataManager';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import ReportIssueModal from './components/ReportIssueModal';
import { Ship, Network, Map, Database, LogIn, LogOut, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import * as api from './utils/api';
import { INITIAL_INLAND_CONNECTIONS } from './mockData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'services' | 'connections' | 'master-data' | 'admin'>('search');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [ports, setPorts] = useState<Port[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [connections, setConnections] = useState<TransshipmentConnection[]>([]);
  const [inlandConnections, setInlandConnections] = useState<InlandConnection[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchInitialData();
        setPorts(data.ports);
        setCarriers(data.carriers);
        setServices(data.services);
        setConnections(data.connections);
        setInlandConnections(INITIAL_INLAND_CONNECTIONS);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role === 'ADMIN') {
        Promise.all([api.fetchUsers(), api.fetchActivityLogs(), api.fetchSearchLogs(), api.fetchIssues()]).then(([fetchedUsers, fetchedActivity, fetchedSearch, fetchedIssues]) => {
            setUsers(fetchedUsers); setActivityLogs(fetchedActivity); setSearchLogs(fetchedSearch); setIssueReports(fetchedIssues);
        });
    }
  }, [activeTab, currentUser]);

  const handleLogin = async (credentials: Pick<User, 'username' | 'password'>) => {
    try {
        const user = await api.loginUser(credentials);
        setCurrentUser(user);
        await api.logActivity(user.id, 'LOGIN', `User ${user.username} logged in.`);
    } catch (e) { alert("Invalid Login Credentials"); }
  };
  const handleLogout = async () => {
    if (currentUser) await api.logActivity(currentUser.id, 'LOGOUT', `User ${currentUser.username} logged out.`);
    setCurrentUser(null); setActiveTab('search');
  };
  const handleSearchLog = async (polId: string, podId: string) => {
      const userId = currentUser?.id || 'guest';
      await api.logSearch(userId === 'guest' ? null : userId, polId, podId);
  };
  const handleSubmitReport = async (report: Omit<IssueReport, 'id' | 'timestamp' | 'status'>) => {
    try { await api.submitIssue(report); if (currentUser) await api.logActivity(currentUser.id, 'ISSUE_REPORTED', `New issue reported by ${report.email}`); alert("Report submitted successfully."); } catch (e) { console.error(e); }
  };
  const handleAddUser = async (user: User) => { await api.createUser(user); setUsers([...users, user]); await api.logActivity(currentUser!.id, 'CREATE_USER', `Created new user ${user.username}`); };
  const handleDeleteUser = async (userId: string) => { await api.deleteUser(userId); const userToDelete = users.find(u => u.id === userId); setUsers(users.filter(u => u.id !== userId)); await api.logActivity(currentUser!.id, 'DELETE_USER', `Deleted user ${userToDelete?.username}`); };
  const handleAddService = async (newService: Service) => { try { await api.createService(newService); setServices([...services, newService]); await api.logActivity(currentUser!.id, 'ADD_SERVICE', `Added service ${newService.code}`); } catch (e) { console.error(e); } };
  const handleUpdateService = async (updatedService: Service) => { try { await api.updateService(updatedService); setServices(services.map(s => s.id === updatedService.id ? updatedService : s)); await api.logActivity(currentUser!.id, 'UPDATE_SERVICE', `Updated service ${updatedService.code}`); } catch (e) { console.error(e); } };
  const handleDeleteService = async (id: string) => { try { await api.deleteService(id); const s = services.find(x => x.id === id); setServices(services.filter(s => s.id !== id)); setConnections(connections.filter(c => c.serviceAId !== id && c.serviceBId !== id)); await api.logActivity(currentUser!.id, 'DELETE_SERVICE', `Deleted service ${s?.code}`); } catch (e) { console.error(e); } };
  const handleAddConnection = async (newConn: TransshipmentConnection) => { try { await api.createConnection(newConn); setConnections([...connections, newConn]); await api.logActivity(currentUser!.id, 'ADD_CONNECTION', `Added connection at port ${newConn.portId}`); } catch (e) { console.error(e); } };
  const handleRemoveConnection = async (id: string) => { try { await api.deleteConnection(id); setConnections(connections.filter(c => c.id !== id)); await api.logActivity(currentUser!.id, 'REMOVE_CONNECTION', `Removed connection ${id}`); } catch (e) { console.error(e); } };
  const handleAddPort = async (newPort: Port) => { try { await api.createPort(newPort); setPorts([...ports, newPort]); await api.logActivity(currentUser!.id, 'ADD_PORT', `Added port ${newPort.code}`); } catch (e) { console.error(e); } };
  const handleUpdatePort = async (updatedPort: Port) => { try { await api.updatePort(updatedPort); setPorts(ports.map(p => p.id === updatedPort.id ? updatedPort : p)); await api.logActivity(currentUser!.id, 'UPDATE_PORT', `Updated port ${updatedPort.code}`); } catch (e) { console.error(e); } };
  const handleDeletePort = async (id: string) => { const isUsed = services.some(s => s.legs.some(l => l.originPortId === id || l.destinationPortId === id)); if (isUsed) { alert("Cannot delete this port because it is used in existing service legs."); return; } try { await api.deletePort(id); setPorts(ports.filter(p => p.id !== id)); await api.logActivity(currentUser!.id, 'DELETE_PORT', `Deleted port ${id}`); } catch (e) { console.error(e); } };
  const handleAddCarrier = async (newCarrier: Carrier) => { try { await api.createCarrier(newCarrier); setCarriers([...carriers, newCarrier]); await api.logActivity(currentUser!.id, 'ADD_CARRIER', `Added carrier ${newCarrier.code}`); } catch (e) { console.error(e); } };
  const handleUpdateCarrier = async (updatedCarrier: Carrier) => { try { await api.updateCarrier(updatedCarrier); setCarriers(carriers.map(c => c.id === updatedCarrier.id ? updatedCarrier : c)); await api.logActivity(currentUser!.id, 'UPDATE_CARRIER', `Updated carrier ${updatedCarrier.code}`); } catch (e) { console.error(e); } };
  const handleDeleteCarrier = async (id: string) => { const isUsed = services.some(s => s.carrierId === id) || services.some(s => s.legs.some(l => l.carrierId === id)); if (isUsed) { alert("Cannot delete this carrier because it is assigned to services or legs."); return; } try { await api.deleteCarrier(id); setCarriers(carriers.filter(c => c.id !== id)); await api.logActivity(currentUser!.id, 'DELETE_CARRIER', `Deleted carrier ${id}`); } catch (e) { console.error(e); } };
  
  // Inland Handlers
  const handleAddInlandConnection = (ic: InlandConnection) => {
      setInlandConnections([...inlandConnections, ic]);
      if (currentUser) api.logActivity(currentUser.id, 'ADD_INLAND', `Added inland link from ${ic.hubId} to ${ic.portId}`);
  };
  const handleDeleteInlandConnection = (id: string) => {
      setInlandConnections(inlandConnections.filter(c => c.id !== id));
      if (currentUser) api.logActivity(currentUser.id, 'DELETE_INLAND', `Deleted inland link ${id}`);
  };

  const canManageData = currentUser?.role === 'ADMIN' || currentUser?.role === 'USER';
  const isAdmin = currentUser?.role === 'ADMIN';

  if (isLoading) {
      return (<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3"><Loader2 className="animate-spin text-blue-600" size={48} /><p className="font-medium animate-pulse">Initializing Global Shipping Network...</p></div>);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 relative">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Ship size={24} className="text-white" /></div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">SWEN<span className="text-blue-400">CONNECT</span></h1>
          </div>
          <nav className="flex gap-1">
            <button onClick={() => setActiveTab('search')} className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'search' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Map size={16} /> <span className="hidden md:inline">Route Finder</span></button>
            {canManageData && (<><button onClick={() => setActiveTab('services')} className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'services' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Ship size={16} /> <span className="hidden md:inline">Services</span></button><button onClick={() => setActiveTab('connections')} className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'connections' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Network size={16} /> <span className="hidden md:inline">Connections</span></button><button onClick={() => setActiveTab('master-data')} className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'master-data' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Database size={16} /> <span className="hidden md:inline">Master Data</span></button></>)}
            {isAdmin && (<button onClick={() => setActiveTab('admin')} className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'admin' ? 'bg-indigo-900 text-indigo-100 ring-1 ring-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Shield size={16} /> <span className="hidden md:inline">Admin</span></button>)}
          </nav>
          <div className="flex items-center ml-2 border-l border-slate-700 pl-4">
              {currentUser ? (<div className="flex items-center gap-3"><div className="text-right hidden md:block"><div className="text-sm font-bold leading-none">{currentUser.fullName}</div><div className="text-[10px] text-slate-400 uppercase tracking-wider">{currentUser.role}</div></div><button onClick={handleLogout} className="p-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 rounded-lg transition-colors" title="Logout"><LogOut size={18} /></button></div>) : (<button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20"><LogIn size={16} /> Login</button>)}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {activeTab === 'search' && (<RouteSearch services={services} ports={ports} carriers={carriers} connections={connections} inlandConnections={inlandConnections} onSearch={handleSearchLog}/>)}
        {activeTab === 'services' && canManageData && (<div className="h-full overflow-y-auto"><ServiceManager services={services} ports={ports} carriers={carriers} connections={connections} onAddService={handleAddService} onUpdateService={handleUpdateService} onDeleteService={handleDeleteService} onAddConnection={handleAddConnection} onAddCarrier={handleAddCarrier} onAddPort={handleAddPort}/></div>)}
        {activeTab === 'connections' && canManageData && (<div className="h-full overflow-y-auto"><ConnectionManager services={services} ports={ports} connections={connections} onAddConnection={handleAddConnection} onRemoveConnection={handleRemoveConnection}/></div>)}
        {activeTab === 'master-data' && canManageData && (<div className="h-full overflow-y-auto"><MasterDataManager ports={ports} carriers={carriers} inlandConnections={inlandConnections} onAddPort={handleAddPort} onUpdatePort={handleUpdatePort} onAddCarrier={handleAddCarrier} onUpdateCarrier={handleUpdateCarrier} onDeletePort={handleDeletePort} onDeleteCarrier={handleDeleteCarrier} onAddInlandConnection={handleAddInlandConnection} onDeleteInlandConnection={handleDeleteInlandConnection}/></div>)}
        {activeTab === 'admin' && isAdmin && (<div className="h-full overflow-y-auto"><AdminDashboard users={users} activityLogs={activityLogs} searchLogs={searchLogs} issueReports={issueReports} ports={ports} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser}/></div>)}
      </main>
      <button onClick={() => setShowReportModal(true)} className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg shadow-red-900/30 transition-transform hover:scale-110 z-40 group flex items-center gap-0 hover:px-4" title="Report an Issue"><AlertTriangle size={24} /><span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold pl-0 group-hover:pl-2">Report Issue</span></button>
      {showLoginModal && (<LoginModal users={[]} onLogin={(u) => { handleLogin(u); setShowLoginModal(false); }} onClose={() => setShowLoginModal(false)}/>)}
      {showReportModal && (<ReportIssueModal onSubmit={handleSubmitReport} onClose={() => setShowReportModal(false)}/>)}
    </div>
  );
};

export default App;
