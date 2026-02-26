import React, { useState } from 'react';
import axios from 'axios';
import { Send, Paperclip, X, Ticket } from 'lucide-react';

const RaiseTicket = ({ onFinish }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('message', message);
        if (file) formData.append('file', file);

        try {
            await axios.post('http://127.0.0.1:8000/api/tickets/raise', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Ticket raised! AI is performing triage.");
            if(onFinish) onFinish();
        } catch (err) {
            alert("Submission failed. Check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Ticket size={24} /></div>
                <h2 className="text-xl font-bold text-gray-800">New Support Ticket</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input 
                        type="text" required placeholder="Brief summary of the issue"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={subject} onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Message</label>
                    <textarea 
                        required placeholder="What happened? Include error codes..." rows="5"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={message} onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-slate-100 p-4 rounded-2xl hover:bg-slate-200 transition-colors flex items-center gap-2 text-slate-600">
                            <Paperclip size={20} />
                            <span className="text-sm font-medium">{file ? file.name : "Choose File"}</span>
                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                        {file && <button type="button" onClick={() => setFile(null)} className="text-red-500"><X size={20}/></button>}
                    </div>
                </div>
                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{backgroundColor: '#bc9d6e', color: 'white'}}
                >
                    {isSubmitting ? "AI Analyzing..." : <><Send size={18} /> Submit Ticket</>}
                </button>
            </form>
        </div>
    );
};

export default RaiseTicket;