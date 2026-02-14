
import React from 'react';

interface CardProps {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}

export const HabitCard: React.FC<CardProps> = ({ title, icon, color, children }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl shadow-inner`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);

export const ProgressBar: React.FC<{ progress: number, colorClass: string }> = ({ progress, colorClass }) => (
  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
    <div 
      className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} 
      style={{ width: `${Math.min(100, progress)}%` }}
    />
  </div>
);
