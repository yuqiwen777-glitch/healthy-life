
import React, { useState } from 'react';
import { getHealthAdvice } from '../services/geminiService';

interface AICoachProps {
  userContext: string;
}

export const AICoach: React.FC<AICoachProps> = ({ userContext }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const advice = await getHealthAdvice(userMsg, userContext);
    setMessages(prev => [...prev, { role: 'ai', text: advice }]);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[450px]">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-indigo-50 rounded-t-2xl">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <span className="text-xl">🤖</span> 元气教练
        </h3>
        <span className="text-xs text-indigo-400 font-medium">在线激励中...</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p className="mb-2">想聊聊健康或者戒烟的烦恼吗？</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => setInput('现在想抽烟怎么办？')} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors">"想抽烟怎么办？"</button>
              <button onClick={() => setInput('不想运动，给我点动力')} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors">"不想运动了..."</button>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-3 rounded-tl-none animate-pulse text-slate-400 text-xs italic">
              教练正在组织语言...( •̀ ω •́ )y
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="问点什么吧..."
          className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
