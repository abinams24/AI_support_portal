import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Edit2, Save, X, Bot, Send, User, 
    Clock, Calendar, FileText, Hash, Eye, Lock 
} from 'lucide-react';

const AgentQueue = () => {
    const [tickets, setTickets] = useState([]);
    const [filter, setFilter] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ category: '', priority: '', status: '' });
    const [response, setResponse] = useState('');
    const [chatHistory, setChatHistory] = useState([]); 
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // --- DATA FETCHING ---
    const fetchQueue = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:8000/api/tickets/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (err) { console.error("Error fetching queue", err); }
    };

    const fetchMessages = async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://127.0.0.1:8000/api/tickets/${ticketId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setChatHistory(res.data || []); 
        } catch (err) { 
            console.error("Error fetching messages", err);
            setChatHistory([]); 
        }
    };

    useEffect(() => { fetchQueue(); }, []);

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
        }
    }, [selectedTicket]);

    // --- HANDLERS ---
    const handleSelectTicket = (ticket) => {
        console.log('Selecting ticket:', ticket); // Debug log
        setSelectedTicket(ticket);
        setEditData({ category: ticket.category, priority: ticket.priority, status: ticket.status });
        setEditMode(false);
        setActiveTab('chat');
    };

    const handleSendResponse = async () => {
        if (!response.trim()) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('text', response);

        try {
            await axios.post(`http://127.0.0.1:8000/api/tickets/${selectedTicket.id}/message`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setResponse('');
            fetchMessages(selectedTicket.id);
            fetchQueue();
        } catch (err) { alert("Failed to send response. The ticket might be closed."); }
    };

    const handleSaveEdit = async () => {
        const formData = new FormData();
        formData.append('category', editData.category);
        formData.append('priority', editData.priority);
        formData.append('status', editData.status);
        const token = localStorage.getItem('token');

        try {
            await axios.put(`http://127.0.0.1:8000/api/tickets/update/${selectedTicket.id}`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEditMode(false);
            fetchQueue();
            setSelectedTicket({ ...selectedTicket, ...editData });
            alert("Triage updated!");
        } catch (err) { alert("Failed to update ticket. Completed tickets cannot be edited."); }
    };

    const filteredTickets = filter === 'All' ? tickets : tickets.filter(t => t.category === filter);

    // --- DETAIL VIEW ---
    if (selectedTicket) { 
        return (
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-500 relative">
                
                {/* TASK: FILE PREVIEW OVERLAY */}
                {isPreviewOpen && (
                    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md p-12 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold flex items-center gap-2" style={{color: '#bc9d6e'}}><FileText/> Document Preview</h3>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-2 rounded-full transition-colors" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white'}}><X size={24}/></button>
                        </div>
                        <iframe 
                            src={`http://127.0.0.1:8000/api/tickets/file/${selectedTicket.id}`} 
                            className="flex-1 w-full rounded-2xl border-none shadow-2xl" style={{backgroundColor: 'white'}}
                            title="Ticket Attachment Preview"
                        />
                    </div>
                )}

                <header className="p-6 border-b bg-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setSelectedTicket(null); setEditMode(false); }} className="text-indigo-600 font-bold flex items-center gap-1">← Back</button>
                        <div className="h-6 w-[1px] bg-slate-200"></div>
                        <span className="flex items-center gap-1 text-slate-400 font-bold"><Hash size={16}/> TK-{selectedTicket.id}</span>
                    </div>
                    
                    {/* HIDE EDIT BUTTON IF COMPLETED */}
                    {selectedTicket.status !== 'Completed' && (
                        <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                            {editMode ? <><X size={18}/> Cancel</> : <><Edit2 size={18}/> Edit Triage</>}
                        </button>
                    )}
                </header>

                <div className="flex-1 p-8 overflow-y-auto space-y-6" style={{background: 'transparent'}}>
                    {/* CUSTOMER METADATA */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><User size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                <p className="font-bold text-slate-700">{selectedTicket.customer_name || "Standard User"}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><Calendar size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raised On</p>
                                <p className="font-bold text-slate-700">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI SUMMARY */}
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold text-sm uppercase tracking-wider"><Bot size={20} /> AI Analysis Summary</div>
                        <p className="text-slate-700 italic leading-relaxed">"{selectedTicket.ai_summary}"</p>
                    </div>

                    {/* TRIAGE STATUS GRID */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-2xl border" style={{border: '1px solid #bc9d6e'}} text-center>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                            {editMode ? (
                                <select className="w-full bg-slate-50 p-1 rounded text-sm outline-none ring-1 ring-slate-200" value={editData.category} onChange={(e) => setEditData({...editData, category: e.target.value})} style={{border: '1px solid #bc9d6e'}}>
                                    <option>IT</option><option>HR</option><option>Facilities</option>
                                </select>
                            ) : <p className="font-bold text-slate-700">{selectedTicket.category}</p>}
                        </div>
                        <div className="bg-white p-4 rounded-2xl border" style={{border: '1px solid #bc9d6e'}} text-center>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</p>
                            {editMode ? (
                                <select className="w-full bg-slate-50 p-1 rounded text-sm outline-none ring-1 ring-slate-200" value={editData.priority} onChange={(e) => setEditData({...editData, priority: e.target.value})} style={{border: '1px solid #bc9d6e'}}>
                                    <option>High</option><option>Medium</option><option>Low</option>
                                </select>
                            ) : <p className={`font-bold ${selectedTicket.priority === 'High' ? 'text-red-500' : 'text-blue-500'}`}>{selectedTicket.priority}</p>}
                        </div>
                        <div className="bg-white p-4 rounded-2xl border" style={{border: '1px solid #bc9d6e'}} text-center>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                            {editMode ? (
                                <select className="w-full bg-slate-50 p-1 rounded text-sm outline-none ring-1 ring-slate-200" value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})} style={{border: '1px solid #bc9d6e'}}>
                                    <option>Open</option><option>In Progress</option><option>Completed</option>
                                </select>
                            ) : <p className="font-bold text-amber-600">{selectedTicket.status}</p>}
                        </div>
                    </div>

                    {editMode && <button onClick={handleSaveEdit} className="w-full py-3 rounded-2xl font-bold shadow-lg" style={{backgroundColor: '#bc9d6e', color: 'white'}}>Save Triage Changes</button>}

                    {/* ATTACHMENT SECTION */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><FileText size={14}/> Attachment View</p>
                        <div className="p-4 bg-slate-50 border border-dashed rounded-2xl flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 italic">
                                {selectedTicket.file_path ? "Attachment ready for preview" : "No file uploaded"}
                            </span>
                            {selectedTicket.file_path && (
                                <button 
                                    onClick={() => setIsPreviewOpen(true)} 
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                                >
                                    <Eye size={14}/> Preview File
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CONVERSATION HISTORY */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Clock size={14}/> Conversation Thread</h4>
                        
                        {/* Initial Request */}
                        <div className="flex flex-col items-start mb-2">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border max-w-[90%] " style={{border: '1px solid #bc9d6e'}} >
                                <p className="text-[10px] font-black text-indigo-600 mb-2 uppercase tracking-wide">Subject: {selectedTicket.subject}</p>
                                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                            </div>
                        </div>

                        {/* Threaded Replies */}
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'agent' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-3xl shadow-sm max-w-[85%] ${
                                    msg.sender_role === 'agent' 
                                    ? 'bg-[#bc9d6e] text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                }`}>
                                    <p className={`text-[10px] font-black mb-1 uppercase ${msg.sender_role === 'agent' ? 'text-[#bc9d6e]' : 'text-[#bc9d6e]'}`}>
                                        {msg.sender_role === 'agent' ? 'You' : msg.sender_name}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONDITIONAL RESPONSE AREA: HIDE IF COMPLETED */}
                <div className="p-6 border-t" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
                    {selectedTicket.status !== 'Completed' ? (
                        <div className="flex gap-2">
                            <textarea 
                                className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-100 text-sm h-20 resize-none" 
                                placeholder="Type response to customer..." 
                                value={response} 
                                onChange={(e) => setResponse(e.target.value)} 
                            />
                            <button 
                                onClick={handleSendResponse} 
                                className="bg-[#bc9d6e] text-white px-6 py-2 rounded-2xl font-bold flex flex-col items-center justify-center shadow-md transition-colors hover:bg-[#a0855a]"
                            >
                                <Send size={20} /><span className="text-[10px] mt-1">Send</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl text-center border border-dashed border-slate-200">
                            <p className="text-slate-500 font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-tight">
                                <Lock size={16} className="text-slate-400" /> This ticket is resolved and closed.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-bold text-slate-800">Support Queue</h2>
                <div className="flex gap-2">
                    {['All', 'IT', 'HR', 'Facilities'].map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === cat ? 'text-white' : 'text-slate-600'}`} style={{backgroundColor: filter === cat ? '#bc9d6e' : 'transparent'}}>{cat}</button>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="p-6">Ticket ID</th>
                            <th className="p-6">Department</th>
                            <th className="p-6">Priority</th>
                            <th className="p-6">Subject</th>
                            <th className="p-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTickets.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-6 font-bold text-slate-400 text-xs tracking-tighter">#TK-{t.id}</td>
                                <td className="p-6 font-bold text-slate-700 text-sm">{t.category}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{t.priority}</span>
                                </td>
                                <td className="p-6 text-slate-600 text-sm font-medium">{t.subject}</td>
                                <td className="p-6 text-center">
                                    <button onClick={() => handleSelectTicket(t)} className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-lg" style={{backgroundColor: '#bc9d6e', color: 'white'}}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentQueue;