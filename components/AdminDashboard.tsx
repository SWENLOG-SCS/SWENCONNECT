
import React, { useState } from 'react';
import { User, ActivityLog, SearchLog, Port, IssueReport } from '../types';
import { Shield, UserPlus, Trash2, Search, History, Users, Activity, Clock, AlertTriangle, Mail, Phone, FileText } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  activityLogs: ActivityLog[];
  searchLogs: SearchLog[];
  issueReports: IssueReport[];
  ports: Port[];
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  activityLogs, 
  searchLogs,
  issueReports,
  ports, 
  onAddUser, 
  onDeleteUser 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'search' | 'issues'>('users');
  
  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newFullName) return;
    
    onAddUser({
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      role: newRole,
      lastLogin: undefined
    });
    
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getPortCode = (id: string) => ports.find(p => p.id === id)?.code || id;

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Shield className="text-indigo-600" /> Admin Dashboard
           </h2>
           <p className="text-slate-500 text-sm">System controls, user management, and audit logs.</p>
        </div>
        <div className="flex bg-slate-200 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Users size={16} /> Users
            </button>
            <button 
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'search' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Search size={16} /> Search History
            </button>
            <button 
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'activity' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Activity size={16} /> Visitor Log
            </button>
            <button 
                onClick={() => setActiveTab('issues')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'issues' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <AlertTriangle size={16} className={issueReports.some(i => i.status === 'OPEN') ? 'text-red-500' : ''}/> Issues
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                 <UserPlus size={16} className="text-indigo-500"/> Add New User
               </h3>
               <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Username</label>
                      <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500" placeholder="jdoe" />
                  </div>
                  <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                      <input type="text" value={newFullName} onChange={e => setNewFullName(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500" placeholder="John Doe" />
                  </div>
                  <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500" placeholder="*****" />
                  </div>
                  <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role</label>
                      <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-indigo-500 bg-white">
                        <option value="USER">User (Standard)</option>
                        <option value="ADMIN">Admin (Full Access)</option>
                      </select>
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium">Create User</button>
                  </div>
               </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-3">User</th>
                     <th className="px-6 py-3">Role</th>
                     <th className="px-6 py-3">Last Login</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {users.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50/50">
                       <td className="px-6 py-3">
                         <div className="font-medium text-slate-900">{user.fullName}</div>
                         <div className="text-xs text-slate-400">@{user.username}</div>
                       </td>
                       <td className="px-6 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                           {user.role}
                         </span>
                       </td>
                       <td className="px-6 py-3 text-slate-500">
                         {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                       </td>
                       <td className="px-6 py-3 text-right">
                         <button 
                           onClick={() => onDeleteUser(user.id)}
                           className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50"
                           title="Delete User"
                         >
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> Search Log</h3>
                <span className="text-xs text-slate-400">{searchLogs.length} Records</span>
             </div>
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-3">Time</th>
                     <th className="px-6 py-3">User</th>
                     <th className="px-6 py-3">Search Query</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {searchLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => {
                     const user = users.find(u => u.id === log.userId);
                     return (
                       <tr key={log.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                           {formatDate(log.timestamp)}
                         </td>
                         <td className="px-6 py-3">
                           {user ? (
                             <span className="font-medium text-slate-700">{user.username}</span>
                           ) : (
                             <span className="text-slate-400 italic">Guest</span>
                           )}
                         </td>
                         <td className="px-6 py-3">
                           <div className="flex items-center gap-2">
                             <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-600">{getPortCode(log.polId)}</span>
                             <span className="text-slate-300">→</span>
                             <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-600">{getPortCode(log.podId)}</span>
                           </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
              </table>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Clock size={18}/> Activity / Visitor Log</h3>
                <span className="text-xs text-slate-400">{activityLogs.length} Records</span>
             </div>
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-3">Time</th>
                     <th className="px-6 py-3">User</th>
                     <th className="px-6 py-3">Action</th>
                     <th className="px-6 py-3">Details</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {activityLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => {
                     const user = users.find(u => u.id === log.userId);
                     return (
                       <tr key={log.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                           {formatDate(log.timestamp)}
                         </td>
                         <td className="px-6 py-3 font-medium text-slate-700">
                           {user?.username || 'Unknown'}
                         </td>
                         <td className="px-6 py-3">
                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase border border-blue-100">{log.action}</span>
                         </td>
                         <td className="px-6 py-3 text-slate-600">
                           {log.details}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
              </table>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><AlertTriangle size={18}/> Reported Issues</h3>
                <span className="text-xs text-slate-400">{issueReports.length} Reports</span>
             </div>
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-3 w-32">Date</th>
                     <th className="px-6 py-3 w-48">Contact</th>
                     <th className="px-6 py-3">Issue Description</th>
                     <th className="px-6 py-3 w-24">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {issueReports.length === 0 ? (
                       <tr><td colSpan={4} className="p-8 text-center text-slate-400">No issues reported yet.</td></tr>
                   ) : (
                       issueReports.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(report => (
                         <tr key={report.id} className="hover:bg-slate-50/50 align-top">
                           <td className="px-6 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                             {formatDate(report.timestamp)}
                           </td>
                           <td className="px-6 py-3">
                             <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                     <Mail size={12} className="text-slate-400"/> {report.email}
                                 </div>
                                 {report.contactNumber && (
                                     <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                         <Phone size={12} className="text-slate-400"/> {report.contactNumber}
                                     </div>
                                 )}
                             </div>
                           </td>
                           <td className="px-6 py-3 text-slate-700">
                             <div className="flex items-start gap-2">
                                 <FileText size={16} className="text-slate-400 shrink-0 mt-0.5"/>
                                 <p className="text-sm leading-relaxed">{report.description}</p>
                             </div>
                           </td>
                           <td className="px-6 py-3">
                             <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${report.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                               {report.status}
                             </span>
                           </td>
                         </tr>
                       ))
                   )}
                 </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
