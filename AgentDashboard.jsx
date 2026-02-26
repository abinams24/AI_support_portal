import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, ListOrdered, LogOut, Ticket, CheckCircle, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AgentQueue from './AgentQueue';

const AgentDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'queue'
    const [stats, setStats] = useState({ open: 0, closed: 0, queueSize: 0 });
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/tickets/all'); // Admin/Agent endpoint
            const open = res.data.filter(t => t.status === 'Open').length;
            const closed = res.data.filter(t => t.status === 'Completed').length;
            setStats({ open, closed, queueSize: open });
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchStats(); }, []);

    return (
        <div className="flex h-screen" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 text-slate-800 p-6 flex flex-col shadow-sm">
                <h2 className="text-xl font-bold mb-10 flex items-center gap-2">
                    Agent Dashboard
                </h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={() => {setActiveTab('overview'); fetchStats();}} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'overview' ? 'text-white' : 'text-slate-500'} bg-opacity-20`} style={{backgroundColor: activeTab === 'overview' ? '#bc9d6e' : 'transparent'}}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('queue')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'queue' ? 'text-white' : 'text-slate-500'} bg-opacity-20`} style={{backgroundColor: activeTab === 'queue' ? '#bc9d6e' : 'transparent'}}>
                        <ListOrdered size={20} /> View Queue
                    </button>
                </nav>
                <button onClick={() => { localStorage.clear(); navigate('/'); }} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl font-medium mt-auto transition-colors">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto" style={{background: 'transparent'}}>
                {activeTab === 'overview' ? (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-3xl font-bold text-slate-800 mb-8 text-left">Agent Services</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border" style={{border: '1px solid #bc9d6e'}}>
                                <Clock className="mb-4" size={32} style={{color: '#bc9d6e'}} />
                                <p className="text-sm font-bold text-slate-400 uppercase">Tickets Open</p>
                                <p className="text-4xl font-black text-slate-800">{stats.open}</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border" style={{border: '1px solid #bc9d6e'}}>
                                <CheckCircle className="mb-4" size={32} style={{color: '#bc9d6e'}} />
                                <p className="text-sm font-bold text-slate-400 uppercase">Tickets Closed</p>
                                <p className="text-4xl font-black text-slate-800">{stats.closed}</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border" style={{border: '1px solid #bc9d6e'}}>
                                <Ticket className="mb-4" size={32} style={{color: '#bc9d6e'}} />
                                <p className="text-sm font-bold text-slate-400 uppercase">Today's Queue</p>
                                <p className="text-4xl font-black text-slate-800">{stats.queueSize}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <AgentQueue />
                )}
            </main>
        </div>
    );
};

export default AgentDashboard;