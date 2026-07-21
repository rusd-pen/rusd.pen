import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Mail } from 'lucide-react';

interface ContactViewProps {
  prefilledSubject?: string;
  onSubmitRequest: (name: string, email: string, subject: string, message: string) => void;
}

export default function ContactView({ prefilledSubject = '', onSubmitRequest }: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(prefilledSubject);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sync prefilled subject if it changes from parent props
  useEffect(() => {
    if (prefilledSubject) {
      setSubject(prefilledSubject);
      setMessage(`Hello, I would like to request materials regarding "${prefilledSubject}". Thank you!`);
    }
  }, [prefilledSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    onSubmitRequest(name, email, subject, message);
    
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 6000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-12 space-y-8" id="contact-view-container">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#1e4646]/80 uppercase tracking-widest font-sans">
          CONTACT
        </span>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#1a2e26] tracking-tight">
          Say something.
        </h1>
        <p className="text-[#446257] text-sm sm:text-base max-w-xl">
          Need a specific lecture, spotted a typo, or just want to chat? Drop a note — I read every one.
        </p>
      </div>      {/* Form or success message */}
      {submitted ? (
        <div className="neumorph-sunken rounded-2xl p-8 text-center border border-emerald-100 space-y-4" id="contact-success-panel">
          <div className="w-12 h-12 rounded-full bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle size={24} />
          </div>
          <h3 className="font-sans font-bold text-xl text-[#1a2e26]">Message sent!</h3>
          <p className="text-sm text-[#446257] max-w-sm mx-auto">
            Your message has been logged successfully. The administrator will review your lecture request/note shortly!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="neumorph-raised rounded-2xl p-8 border border-white/40 space-y-6" id="contact-form">
          
          {/* Grid fields for Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact-name-input" className="block text-xs font-bold text-[#1e4646]/80 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                id="contact-name-input"
                type="text"
                required
                placeholder="e.g. Fulan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl neumorph-input text-sm text-[#1a2e26]"
              />
            </div>

            <div>
              <label htmlFor="contact-email-input" className="block text-xs font-bold text-[#1e4646]/80 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="contact-email-input"
                type="email"
                required
                placeholder="e.g. fulan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl neumorph-input text-sm text-[#1a2e26]"
              />
            </div>
          </div>

          {/* Optional Subject Field */}
          <div>
            <label htmlFor="contact-subject-input" className="block text-xs font-bold text-[#1e4646]/80 uppercase tracking-wider mb-2">
              Subject (optional)
              {prefilledSubject && <span className="text-[10px] text-amber-700 bg-amber-500/10 shadow-[inset_1px_1px_2px_rgba(245,158,11,0.15)] px-2 py-0.5 rounded-full ml-2 lowercase">Requested material</span>}
            </label>
            <input
              id="contact-subject-input"
              type="text"
              placeholder="e.g. Request: Semester 3 - Data Structures midterm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl neumorph-input text-sm text-[#1a2e26]"
            />
          </div>

          {/* Message text area */}
          <div>
            <label htmlFor="contact-message-input" className="block text-xs font-bold text-[#1e4646]/80 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              id="contact-message-input"
              required
              rows={6}
              placeholder="Write your note, question, or detail what lecture files you need..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl neumorph-input text-sm text-[#1a2e26] resize-none"
            />
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full neumorph-btn-teal font-bold text-sm cursor-pointer"
            id="contact-submit-btn"
          >
            <Send size={14} />
            <span>Send message</span>
          </button>
        </form>
      )}

    </div>
  );
}
