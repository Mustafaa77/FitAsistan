import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaChevronDown, FaExpandAlt, FaCompressAlt, FaSpinner, FaHistory } from 'react-icons/fa';
import { sendMessage } from '../services/aiService';
import { AI_PERSONALITY } from '../services/aiService';

const AssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('asistanGecmisi');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initialMsg = {
        id: Date.now(),
        text: `Merhaba! Ben ${AI_PERSONALITY.name}, senin elit fitness ve beslenme koçunum. \n\nBugün sana nasıl yardımcı olabilirim? Senin için kalori hesaplayabilir, kişiselleştirilmiş diyet planları oluşturabilir veya antrenman tavsiyeleri verebilirim.`,
        sender: 'assistant'
      };
      setMessages([initialMsg]);
      localStorage.setItem('asistanGecmisi', JSON.stringify([initialMsg]));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user'
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    localStorage.setItem('asistanGecmisi', JSON.stringify(newMessages));

    setIsLoading(true);

    // Mevcut mesajları (yeni kullanıcı mesajı hariç) geçmiş olarak gönderiyoruz
    const conversationHistory = messages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));

    const result = await sendMessage(inputValue.trim(), conversationHistory);

    setIsLoading(false);

    if (result.success) {
      const botMsg = {
        id: Date.now() + 1,
        text: result.text,
        sender: 'assistant'
      };
      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);
      localStorage.setItem('asistanGecmisi', JSON.stringify(finalMessages));
    } else {
      const errorMsg = {
        id: Date.now() + 1,
        text: 'Üzgünüm, şu an bir hata oluştu. Lütfen tekrar deneyin.',
        sender: 'assistant'
      };
      const errorMessages = [...newMessages, errorMsg];
      setMessages(errorMessages);
      localStorage.setItem('asistanGecmisi', JSON.stringify(errorMessages));
    }
  };

  const handleClearHistory = () => {
    const initialMsg = {
      id: Date.now(),
      text: 'Merhaba! Ben FitAsistan, senin yapay zeka fitness koçun. Geçmişi temizledim. Sana nasıl yardımcı olabilirim?',
      sender: 'assistant'
    };
    setMessages([initialMsg]);
    localStorage.setItem('asistanGecmisi', JSON.stringify([initialMsg]));
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full bg-green-600 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ minWidth: '56px', minHeight: '56px' }}
        aria-label="Asistanı Aç"
      >
        <FaRobot size={28} />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] transition-opacity animate-fade-in"
          onClick={() => {
            setIsOpen(false);
            setIsFullScreen(false);
          }}
        />
      )}

      <div 
        className={`fixed left-0 right-0 bottom-0 bg-white shadow-2xl z-[10001] transition-all duration-500 ease-out flex flex-col rounded-t-[2.5rem] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ 
          height: isFullScreen ? '100vh' : '70vh',
          maxHeight: '100vh'
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <FaRobot size={20} />
            </div>
            <div>
              <h2 className="font-black text-gray-800">{AI_PERSONALITY.name}</h2>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{AI_PERSONALITY.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleClearHistory}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Sohbeti Temizle"
            >
              <FaHistory size={14} />
            </button>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                msg.sender === 'user' 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-700 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FaSpinner className="animate-spin" size={16} />
                  <span className="text-sm">Asistan düşünüyor...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-gray-50 bg-white" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-green-500/20 transition-all"
              style={{ minHeight: '44px' }}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                (inputValue.trim() && !isLoading) 
                ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' 
                : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isLoading ? <FaSpinner className="animate-spin" size={18} /> : <FaPaperPlane size={18} />}
            </button>
          </form>
          
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setInputValue('1 tabak makarna kaç kalori?')}
              className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
            >
              🍝 Kalori Hesapla
            </button>
            <button 
              onClick={() => setInputValue('Bana diyet oluştur')}
              className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
            >
              📋 Diyet Oluştur
            </button>
            <button 
              onClick={() => setInputValue('Günlük su ihtiyacım nedir?')}
              className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
            >
              💧 Su İhtiyacı
            </button>
          </div>
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
