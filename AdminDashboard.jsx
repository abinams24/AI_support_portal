import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Upload, Users, BookOpen, UserPlus, Trash2, 
    Edit, FileText, X, CheckCircle, LayoutDashboard, LogOut,
    Database, ShieldCheck, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [agents, setAgents] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [kbFiles, setKbFiles] = useState([]);
    const [faqFiles, setFaqFiles] = useState([]);
    
    // Ensure this state is correctly updated by the modal inputs
    const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    // --- DATA FETCHING ---
    const fetchAgents = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/auth/agents');
            setAgents(res.data);
        } catch (err) { console.error("Error fetching agents", err); }
    };

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/auth/users/customer');
            setCustomers(res.data);
        } catch (err) { console.error("Error fetching customers", err); }
    };

    const fetchFiles = async () => {
        try {
            const kbRes = await axios.get('http://127.0.0.1:8000/api/ai/files/kb');
            const faqRes = await axios.get('http://127.0.0.1:8000/api/ai/files/faq');
            setKbFiles(kbRes.data.files || []);
            setFaqFiles(faqRes.data.files || []);
        } catch (err) { console.error("Error fetching files", err); }
    };

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchAgents();
            fetchFiles();
        }
        if (activeTab === 'agents') fetchAgents();
        if (activeTab === 'customers') fetchCustomers();
        if (activeTab === 'ai') fetchFiles();
    }, [activeTab]);

    // --- FILE HANDLERS ---
    const handleFileUpload = async (endpoint) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            try {
                await axios.post(`http://127.0.0.1:8000/api/ai/admin/${endpoint}`, formData);
                alert("Upload Successful!");
                fetchFiles();
            } catch (err) { alert("Upload Failed"); }
        };
        fileInput.click();
    };

    const handleDeleteFile = async (type, filename) => {
        if (window.confirm(`Delete ${filename} from ${type.toUpperCase()}?`)) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/ai/files/${type}/${filename}`);
                fetchFiles();
            } catch (err) { alert("Delete failed"); }
        }
    };

    // --- AGENT HANDLERS ---
    const handleAddAgent = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newAgent.name);
        formData.append('email', newAgent.email);
        formData.append('password', newAgent.password);

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/auth/register/agent', formData);
            if (res.data.status === "success") {
                setShowModal(false);
                setNewAgent({ name: '', email: '', password: '' });
                fetchAgents();
            }
        } catch (err) {
            alert(err.response?.data?.detail || "Registration failed.");
        }
    };

    const handleDeleteAgent = async (id) => {
        if (window.confirm("Delete this agent?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/auth/agent/${id}`);
                fetchAgents();
            } catch (err) { alert("Delete failed."); }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            {/* SIDEBAR */}
            <div className="w-64 bg-white border-r border-slate-200 text-slate-800 p-6 hidden md:flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-10 px-2">
                    {/* <div className="p-1.5 rounded-lg shadow-lg" style={{backgroundColor: '#bc9d6e'}}><ShieldCheck size={20} className="text-white" /></div> */}
                    <span className="text-xl font-bold tracking-tight text-slate-800">Admin Dashboard</span>
                </div>
                <nav className="space-y-2 flex-1">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'text-white' : 'text-slate-500'}`} style={{backgroundColor: activeTab === 'overview' ? '#bc9d6e' : 'transparent'}}><LayoutDashboard size={18} /> Overview</button>
                    <button onClick={() => setActiveTab('ai')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'ai' ? 'text-white' : 'text-slate-500'}`} style={{backgroundColor: activeTab === 'ai' ? '#bc9d6e' : 'transparent'}}><Database size={18} />FAQ & KB</button>
                    <button onClick={() => setActiveTab('agents')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'agents' ? 'text-white' : 'text-slate-500'}`} style={{backgroundColor: activeTab === 'agents' ? '#bc9d6e' : 'transparent'}}><Users size={18} /> Agent Management</button>
                    <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'customers' ? 'text-white' : 'text-slate-500'}`} style={{backgroundColor: activeTab === 'customers' ? '#bc9d6e' : 'transparent'}}><UserPlus size={18} /> User Management</button>
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all mt-auto"><LogOut size={18} /> Logout</button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Admin Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-sm"><Users className="text-pink-500 mb-2" size={24} /><p className="text-sm font-bold text-slate-400 uppercase">Total Agents</p><p className="text-3xl font-bold text-slate-800">{agents.length}</p></div>
                            <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm"><FileText className="text-rose-500 mb-2" size={24} /><p className="text-sm font-bold text-slate-400 uppercase">KB Documents</p><p className="text-3xl font-bold text-slate-800">{kbFiles.length}</p></div>
                            <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-sm"><BookOpen className="text-pink-500 mb-2" size={24} /><p className="text-sm font-bold text-slate-400 uppercase">FAQ Files</p><p className="text-3xl font-bold text-slate-800">{faqFiles.length}</p></div>
                            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm bg-pink-50/20"><Activity className="text-pink-600 mb-2" size={24} /><p className="text-sm font-bold text-slate-400 uppercase">Service Status</p><p className="text-3xl font-bold text-black-600">Online</p></div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">FAQ & KB FILES MANAGEMENT</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <FileText className="text-rose-600 mb-4" size={28} />
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Knowledge Base Content</h3>
                                <button onClick={() => handleFileUpload('upload-knowledge')} className="px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg font-semibold" style={{backgroundColor: '#bc9d6e', color: 'white'}}><Upload size={16} /> Update KB</button>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <BookOpen className="text-pink-600 mb-4" size={28} />
                                <h3 className="text-lg font-bold text-slate-800 mb-2">FAQ Contents</h3>
                                <button onClick={() => handleFileUpload('upload-faq')} className="px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg font-semibold" style={{backgroundColor: '#bc9d6e', color: 'white'}}><Upload size={16} /> Update FAQs</button>
                            </div>
                        </div>

                        {/* --- NEW FILE LIST SECTION --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl shadow-sm border p-8">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg"><CheckCircle size={20} className="text-rose-500"/> Current KB Files</h4>
                                <div className="space-y-3">
                                    {kbFiles.length > 0 ? kbFiles.map(file => (
                                        <div key={file} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 group">
                                            <span className="font-medium text-slate-700 truncate max-w-[220px]">{file}</span>
                                            <button onClick={() => handleDeleteFile('kb', file)} className="text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    )) : <p className="text-sm text-slate-400 italic">No KB documents found.</p>}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border p-8">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg"><CheckCircle size={20} className="text-pink-500"/> Current FAQ Files</h4>
                                <div className="space-y-3">
                                    {faqFiles.length > 0 ? faqFiles.map(file => (
                                        <div key={file} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 group">
                                            <span className="font-medium text-slate-700 truncate max-w-[220px]">{file}</span>
                                            <button onClick={() => handleDeleteFile('faq', file)} className="text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    )) : <p className="text-sm text-slate-400 italic">No FAQ documents found.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'agents' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div><h3 className="font-bold text-xl text-slate-800">Support Agents</h3><p className="text-sm text-slate-500">Manage active team</p></div>
                            <button onClick={() => setShowModal(true)} className="px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg" style={{backgroundColor: '#bc9d6e', color: 'white'}}><UserPlus size={18} /> Add New Agent</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                    <tr><th className="p-6">Name</th><th className="p-6">Email</th><th className="p-6 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {agents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-6 font-semibold text-slate-700">{agent.name}</td>
                                            <td className="p-6 text-slate-500">{agent.email}</td>
                                            <td className="p-6 text-right"><button onClick={() => handleDeleteAgent(agent.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"><Trash2 size={20}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white"><h3 className="font-bold text-xl text-slate-800"> Support Customers</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                    <tr><th className="p-6">Name</th><th className="p-6">Email</th><th className="p-6 text-right">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {customers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-6 font-semibold text-slate-700">{user.name}</td>
                                            <td className="p-6 text-slate-500">{user.email}</td>
                                            <td className="p-6 text-right text-green-500 font-bold">Active</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL - FIXED INPUTS */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl border border-white">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-all"><X size={20} /></button>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Register Agent</h2>
                        <form onSubmit={handleAddAgent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full p-4 border-none rounded-2xl outline-none transition-all"
                                    style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                                    value={newAgent.name}
                                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Email</label>
                                <input 
                                    type="email" required
                                    className="w-full p-4 border-none rounded-2xl outline-none transition-all"
                                    style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                                    value={newAgent.email}
                                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Password</label>
                                <input 
                                    type="password" required
                                    className="w-full p-4 border-none rounded-2xl outline-none transition-all"
                                    style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                                    value={newAgent.password}
                                    onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                                />
                            </div>
                            <button className="w-full py-4 rounded-2xl font-bold mt-4 shadow-lg transition-all" style={{backgroundColor: '#bc9d6e', color: 'white'}}>Create Agent</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;