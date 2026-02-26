import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RaiseTicket from './RaiseTicket';
import { 
    Ticket, LogOut, User, LayoutDashboard, 
    LifeBuoy, List, Clock, CheckCircle, Send, Calendar, Bot, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); 
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ ongoing: 0, completed: 0 });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const navigate = useNavigate();

    const fetchMyTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await axios.get('http://127.0.0.1:8000/api/tickets/my-tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTickets(res.data);
            const ongoing = res.data.filter(t => t.status.toLowerCase() !== 'completed').length;
            const completed = res.data.filter(t => t.status.toLowerCase() === 'completed').length;
            setStats({ ongoing, completed });
        } catch (err) { console.error("History fetch error:", err); }
    };

    const handleViewTicket = async (ticketId) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/tickets/${ticketId}`);
            setSelectedTicket(res.data.ticket);
            setMessages(res.data.messages);
            setActiveTab('chat_details');
        } catch (err) { alert("Could not load details."); }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('text', replyText);

        try {
            await axios.post(`http://127.0.0.1:8000/api/tickets/${selectedTicket.id}/message`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReplyText('');
            handleViewTicket(selectedTicket.id); 
        } catch (err) { alert("Failed to send message. Ticket may be closed."); }
    };

    useEffect(() => { 
        fetchMyTickets(); 
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="flex h-screen" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-[#569296] p-1.5 rounded-lg text-white"><LifeBuoy size={20} /></div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">SupportHub</span>
                    </div>
                    <nav className="space-y-1">
                        <button onClick={() => {setActiveTab('overview'); fetchMyTickets();}} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'overview' ? 'text-white' : 'text-slate-500'} bg-opacity-20`} style={{backgroundColor: activeTab === 'overview' ? '#bc9d6e' : 'transparent'}}><LayoutDashboard size={20} /> Overview</button>
                        <button onClick={() => {setActiveTab('history'); fetchMyTickets();}} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'history' ? 'text-white' : 'text-slate-500'} bg-opacity-20`} style={{backgroundColor: activeTab === 'history' ? '#bc9d6e' : 'transparent'}}><List size={20} /> Ticket History</button>
                        <button onClick={() => setActiveTab('ticket')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'ticket' ? 'text-white' : 'text-slate-500'} bg-opacity-20`} style={{backgroundColor: activeTab === 'ticket' ? '#bc9d6e' : 'transparent'}}><Ticket size={20} /> Raise a Ticket</button>
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"><LogOut size={20} /> Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto" style={{background: 'transparent'}}>
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {activeTab === 'overview' ? 'Dashboard' : activeTab === 'history' ? 'My History' : activeTab === 'chat_details' ? 'Ticket Details' : 'New Ticket'}
                    </h1>
                </header>

                <div className="p-8 max-w-5xl mx-auto">
                    {activeTab !== 'chat_details' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-sm"><Ticket className="text-pink-500 mb-2" size={24} /><p className="text-xs font-bold text-slate-400 uppercase">Total</p><p className="text-2xl font-bold">{tickets.length}</p></div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Clock className="text-amber-500 mb-2" size={24} /><p className="text-xs font-bold text-slate-400 uppercase">Ongoing</p><p className="text-2xl font-bold">{stats.ongoing}</p></div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><CheckCircle className="text-emerald-500 mb-2" size={24} /><p className="text-xs font-bold text-slate-400 uppercase">Completed</p><p className="text-2xl font-bold">{stats.completed}</p></div>
                        </div>
                    )}

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'overview' && (
                            <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-slate-200 text-center">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4">How can we help today?</h2>
                                <button onClick={() => setActiveTab('ticket')} className="font-bold py-3 px-6 rounded-2xl" style={{backgroundColor: '#bc9d6e', color: 'white'}}>
                                    Start a New Support Request
                                </button>
                            </div>
                        )}

                        {activeTab === 'ticket' && <div className="max-w-2xl mx-auto"><RaiseTicket onFinish={() => { setActiveTab('history'); fetchMyTickets(); }} /></div>}

                        {activeTab === 'history' && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black tracking-widest">
                                        <tr><th className="p-6">ID</th><th className="p-6">Subject</th><th className="p-6">Status</th><th className="p-6 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tickets.length > 0 ? tickets.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-6 text-slate-400 font-medium">#TK-{t.id}</td>
                                                <td className="p-6 font-bold text-slate-700">{t.subject}</td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.status === 'Open' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                                                </td>
                                                <td className="p-6 text-right"><button onClick={() => handleViewTicket(t.id)} className="font-bold hover:underline" style={{color: '#bc9d6e'}}>View Chat</button></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="p-20 text-center text-slate-400 italic">No history found. Try raising a ticket first!</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'chat_details' && selectedTicket && (
                            <div className="max-w-4xl mx-auto flex flex-col h-[80vh] animate-in fade-in duration-500">
                                <button onClick={() => setActiveTab('history')} className="mb-4 text-slate-400 font-bold flex items-center gap-1">← Back to My History</button>
                                <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-slate-200 flex flex-col overflow-hidden">
                                    <header className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800">{selectedTicket.subject}</h2>
                                            <div className="flex gap-6 mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Bot size={14}/> AI Triage: {selectedTicket.category}</span>
                                            </div>
                                        </div>
                                        {selectedTicket.status === 'Completed' && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-2xl border border-green-100 font-bold text-xs uppercase">
                                                <CheckCircle size={16}/> Resolved
                                            </div>
                                        )}
                                    </header>

                                    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-white">
                                        <div className="bg-pink-50 border border-pink-100 p-6 rounded-3xl">
                                            <p className="text-[10px] font-black text-pink-400 uppercase mb-2 tracking-widest">AI Analysis Result</p>
                                            <p className="text-pink-700 italic text-sm leading-relaxed">"{selectedTicket.ai_summary}"</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="bg-pink-600 text-white p-5 rounded-3xl rounded-tr-none max-w-[80%] shadow-lg">
                                                <p className="text-[10px] font-black text-pink-200 mb-2 uppercase">Initial Request</p>
                                                <p className="text-sm font-medium leading-relaxed">{selectedTicket.message}</p>
                                            </div>
                                        </div>

                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-5 rounded-3xl max-w-[80%] shadow-sm ${msg.sender_role === 'customer' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                                                    <p className={`text-[10px] font-black mb-2 uppercase ${msg.sender_role === 'customer' ? 'text-white' : ''}`}>
                                                        {msg.sender_role === 'customer' ? 'You' : `Agent ${msg.sender_name}`}
                                                    </p>
                                                    <p className="text-sm font-medium">{msg.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CONDITIONAL FOOTER: LOCK IF COMPLETED */}
                                    <div className="p-8 border-t bg-white">
                                        {selectedTicket.status !== 'Completed' ? (
                                            <div className="flex gap-3">
                                                <textarea 
                                                    className="flex-1 p-4 rounded-2xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                                                    placeholder="Write a message..." rows="2"
                                                    value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <button onClick={handleSendReply} className="px-8 rounded-2xl font-bold flex items-center justify-center" style={{backgroundColor: '#bc9d6e', color: 'white'}}>
                                                    <Send size={20}/>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-dashed border-slate-200">
                                                <p className="text-slate-500 font-bold text-sm flex items-center justify-center gap-2">
                                                    <Lock size={16} className="text-slate-400" /> This ticket has been resolved. The conversation is now closed.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;