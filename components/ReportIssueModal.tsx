import React, { useState } from 'react';
import { IssueReport } from '../types';
import { AlertTriangle, X, Send, Phone, Mail, FileText } from 'lucide-react';

interface ReportIssueModalProps {
  onSubmit: (report: Omit<IssueReport, 'id' | 'timestamp' | 'status'>) => void;
  onClose: () => void;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ onSubmit, onClose }) => {
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !email) return;
    
    onSubmit({
      description,
      email,
      contactNumber
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
            <h3 className="font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle size={20} /> Report an Issue
            </h3>
            <button onClick={onClose} className="text-red-400 hover:text-red-600">
                <X size={20} />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-500 mb-2">
            Found a wrong route, missing port, or incorrect transit time? Let us know so we can fix the data.
          </p>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue Description</label>
            <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm min-h-[100px]"
                    placeholder="Describe the routing error or mismatch..."
                    required
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                        placeholder="name@company.com"
                        required
                    />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact No.</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                        placeholder="+1 234..."
                    />
                </div>
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 mt-4 transition-colors"
          >
            <Send size={16} /> Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueModal;