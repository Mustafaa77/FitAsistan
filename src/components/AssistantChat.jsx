import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaChevronDown, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';

const AssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Load history from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('asistanGecmisi');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initialMsg = {
        id: Date.now(),
        text: 'Merhaba! Ben FitAsistan zeka asistanın. Bugün sana nasıl yardımcı olabilirim?',
        sender: 'assistant'
      };
      setMessages([initialMsg]);
      localStorage.setItem('asistanGecmisi', JSON.stringify([initialMsg]));
    }
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    localStorage.setItem('asistanGecmisi', JSON.stringify(newMessages));

    // Simulated Bot Response
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        text: 'Entegrasyon haftaya yapılacak',
        sender: 'assistant'
      };
      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);
      localStorage.setItem('asistanGecmisi', JSON.stringify(finalMessages));
    }, 1000);
  };

  return (
    <>
      {/* FAB */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full bg-green-600 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ minWidth: '56px', minHeight: '56px' }}
        aria-label="Asistanı Aç"
      >
        <FaRobot size={28} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity animate-fade-in"
          onClick={() => {
            setIsOpen(false);
            setIsFullScreen(false);
          }}
        />
      )}

      {/* Bottom Sheet Chat */}
      <div 
        className={`fixed left-0 right-0 bottom-0 bg-white shadow-2xl z-[201] transition-all duration-500 ease-out flex flex-col rounded-t-[2.5rem] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ 
          height: isFullScreen ? '100vh' : '70vh',
          maxHeight: '100vh'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <FaRobot size={20} />
            </div>
            <h2 className="font-black text-gray-800">FitAsistan Bot</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isFullScreen ? "Küçült" : "Tam Ekran"}
            >
              {isFullScreen ? <FaCompressAlt size={18} /> : <FaExpandAlt size={18} /> }
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                setIsFullScreen(false);
              }}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Kapat"
            >
              <FaChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                msg.sender === 'user' 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-700 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-50 bg-white" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-green-500/20 transition-all"
              style={{ minHeight: '44px' }}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                inputValue.trim() ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default AssistantChat;
