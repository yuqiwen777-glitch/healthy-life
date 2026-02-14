
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HabitStats, HabitType } from './types';
import { HabitCard, ProgressBar } from './components/HabitCards';
import { AICoach } from './components/AICoach';
import { getDailyInspiration } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INITIAL_STATS: HabitStats = {
  waterCups: 0,
  waterGoal: 8,
  sleepHours: 0,
  sleepGoal: 8,
  exerciseMinutes: 0,
  exerciseGoal: 30,
  meals: { breakfast: false, lunch: false, dinner: false },
  quitSmokingDate: null,
  lastCigarette: null,
};

const App: React.FC = () => {
  const [stats, setStats] = useState<HabitStats>(() => {
    const saved = localStorage.getItem('habit_stats_v2');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  
  const [inspiration, setInspiration] = useState<string>('正在获取你的每日元气密令...');
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('habit_stats_v2', JSON.stringify(stats));
  }, [stats]);

  // 计算元气值 (Vitality Score)
  const vitalityScore = useMemo(() => {
    const waterScore = (Math.min(stats.waterCups, stats.waterGoal) / stats.waterGoal) * 25;
    const sleepScore = (Math.min(stats.sleepHours, stats.sleepGoal) / stats.sleepGoal) * 25;
    const exerciseScore = (Math.min(stats.exerciseMinutes, stats.exerciseGoal) / stats.exerciseGoal) * 25;
    const mealScore = (Object.values(stats.meals).filter(Boolean).length / 3) * 25;
    return Math.round(waterScore + sleepScore + exerciseScore + mealScore);
  }, [stats]);

  const loadInspiration = useCallback(async () => {
    const statsStr = `喝水: ${stats.waterCups}/${stats.waterGoal}, 运动: ${stats.exerciseMinutes}min, 戒烟: ${stats.quitSmokingDate ? '进行中' : '未开始'}`;
    const msg = await getDailyInspiration(statsStr);
    setInspiration(msg || "今天也是元气满满的一天！");
  }, [stats.waterCups, stats.waterGoal, stats.exerciseMinutes, stats.quitSmokingDate]);

  useEffect(() => {
    loadInspiration();
  }, []);

  const updateHabit = (type: HabitType, value: any) => {
    setStats(prev => {
      switch (type) {
        case HabitType.WATER:
          return { ...prev, waterCups: Math.max(0, prev.waterCups + value) };
        case HabitType.EXERCISE:
          return { ...prev, exerciseMinutes: Math.max(0, prev.exerciseMinutes + value) };
        case HabitType.SLEEP:
          return { ...prev, sleepHours: value };
        case HabitType.MEAL:
          return { ...prev, meals: { ...prev.meals, [value]: !prev.meals[value as keyof typeof prev.meals] } };
        default:
          return prev;
      }
    });
  };

  const startQuitting = () => {
    const now = new Date().toISOString();
    setStats(prev => ({ ...prev, quitSmokingDate: now, lastCigarette: now }));
    setShowQuitModal(false);
  };

  const relapse = () => {
    if (confirm("偶尔的挫折没关系！戒烟是一场马拉松，要重新开始倒计时吗？元气教练一直陪着你。")) {
      const now = new Date().toISOString();
      setStats(prev => ({ ...prev, lastCigarette: now }));
    }
  };

  const getDaysQuit = () => {
    if (!stats.lastCigarette) return 0;
    const start = new Date(stats.lastCigarette).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getHoursQuit = () => {
    if (!stats.lastCigarette) return 0;
    const start = new Date(stats.lastCigarette).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / (1000 * 60 * 60));
  };

  const chartData = [
    { name: '吨吨喝水', value: Math.round((stats.waterCups / stats.waterGoal) * 100) },
    { name: '呼呼大睡', value: Math.round((stats.sleepHours / stats.sleepGoal) * 100) },
    { name: '燃脂运动', value: Math.round((stats.exerciseMinutes / stats.exerciseGoal) * 100) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 顶部标题栏 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl text-xl shadow-indigo-200 shadow-lg">⚡</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">元气生活守护者</h1>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{inspiration}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs text-slate-400 font-bold uppercase">当前元气值</span>
             <span className="text-2xl font-black text-indigo-600">{vitalityScore}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 左侧习惯区域 */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 喝水 */}
            <HabitCard title="吨吨喝水" icon="💧" color="bg-blue-100 text-blue-600">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-slate-800">{stats.waterCups} <span className="text-sm font-normal text-slate-400">/ {stats.waterGoal} 杯</span></span>
                <div className="flex gap-2 mb-1">
                  <button onClick={() => updateHabit(HabitType.WATER, 1)} className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-md active:scale-95 transition-all">+</button>
                  <button onClick={() => updateHabit(HabitType.WATER, -1)} className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 active:scale-95 transition-all">-</button>
                </div>
              </div>
              <ProgressBar progress={(stats.waterCups / stats.waterGoal) * 100} colorClass="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              <p className="text-[10px] text-slate-400 mt-2 italic text-center">多喝水能让皮肤Q弹哦！</p>
            </HabitCard>

            {/* 运动 */}
            <HabitCard title="燃脂运动" icon="🔥" color="bg-orange-100 text-orange-600">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-slate-800">{stats.exerciseMinutes} <span className="text-sm font-normal text-slate-400">/ {stats.exerciseGoal} 分钟</span></span>
                <div className="flex gap-2 mb-1">
                  <button onClick={() => updateHabit(HabitType.EXERCISE, 10)} className="px-3 py-1 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 shadow-sm transition-all">+10分</button>
                  <button onClick={() => updateHabit(HabitType.EXERCISE, 30)} className="px-3 py-1 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 shadow-sm transition-all">+30分</button>
                </div>
              </div>
              <ProgressBar progress={(stats.exerciseMinutes / stats.exerciseGoal) * 100} colorClass="bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
              <p className="text-[10px] text-slate-400 mt-2 italic text-center">流的汗水是脂肪在哭泣~</p>
            </HabitCard>

            {/* 睡觉 */}
            <HabitCard title="呼呼大睡" icon="💤" color="bg-indigo-100 text-indigo-600">
              <div className="space-y-4">
                <input 
                  type="range" min="0" max="12" step="0.5" 
                  value={stats.sleepHours}
                  onChange={(e) => updateHabit(HabitType.SLEEP, parseFloat(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-800">昨晚睡了: <span className="text-indigo-600 text-lg">{stats.sleepHours}</span> 小时</span>
                  <span className="text-slate-400">目标: {stats.sleepGoal}</span>
                </div>
              </div>
            </HabitCard>

            {/* 饮食 */}
            <HabitCard title="能量补给" icon="🍱" color="bg-emerald-100 text-emerald-600">
              <div className="flex justify-around gap-2 mt-2">
                {[
                  { key: 'breakfast', label: '早餐' },
                  { key: 'lunch', label: '午餐' },
                  { key: 'dinner', label: '晚餐' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => updateHabit(HabitType.MEAL, item.key)}
                    className={`flex-1 py-3 px-1 rounded-2xl border-2 font-black text-xs transition-all ${
                      stats.meals[item.key as keyof typeof stats.meals] 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-300 hover:border-emerald-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic text-center">按时吃饭，身体才会有动力！</p>
            </HabitCard>
          </div>

          {/* 戒烟大作战部分 */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
             <div className="absolute top-[-20px] right-[-20px] p-4 opacity-10 pointer-events-none rotate-12">
               <span className="text-[12rem]">🚭</span>
             </div>
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black flex items-center gap-3">
                   <span className="bg-red-500 p-2 rounded-xl">🚭</span> 戒烟大作战
                 </h2>
                 {stats.quitSmokingDate && (
                   <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                     肺部修复中...
                   </span>
                 )}
               </div>

               {!stats.quitSmokingDate ? (
                 <div className="text-center py-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                   <p className="text-slate-300 mb-6 font-medium">想要更自由的呼吸和更健康的钱包吗？</p>
                   <button 
                     onClick={() => setShowQuitModal(true)}
                     className="bg-white text-slate-900 font-black py-4 px-10 rounded-full hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-white/10"
                   >
                     立即开启挑战
                   </button>
                 </div>
               ) : (
                 <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 border border-white/10 p-5 rounded-3xl text-center backdrop-blur-sm">
                       <div className="text-4xl font-black text-white">{getDaysQuit()}</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">已坚持天数</div>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-5 rounded-3xl text-center backdrop-blur-sm">
                       <div className="text-4xl font-black text-white">{getHoursQuit() % 24}</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">额外小时</div>
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                       <span>肺部清洁进度</span>
                       <span className="text-green-400">持续提升中</span>
                     </div>
                     <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                       <div className="h-full bg-gradient-to-r from-indigo-500 to-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.5)]" style={{width: '65%'}}></div>
                     </div>
                   </div>

                   <div className="flex justify-center">
                     <button 
                       onClick={relapse}
                       className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors underline underline-offset-4"
                     >
                       我不小心破戒了...
                     </button>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* 可视化图表 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2">
               <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
               我的健康雷达
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#f97316'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 右侧 AI 助手 & 状态 */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <h3 className="font-black text-slate-800 mb-6 flex items-center justify-between">
               今日简报
               <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-400">实时更新</span>
             </h3>
             <div className="space-y-5">
               <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">💧</div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">水分摄入</p>
                   <p className="text-sm font-black text-slate-800">{stats.waterCups} / {stats.waterGoal} 杯</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">🥗</div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">营养补给</p>
                   <p className="text-sm font-black text-slate-800">{Object.values(stats.meals).filter(Boolean).length} / 3 餐</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">⚡</div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">体能训练</p>
                   <p className="text-sm font-black text-slate-800">{stats.exerciseMinutes} 分钟</p>
                 </div>
               </div>
             </div>
          </div>

          <AICoach userContext={`用户元气值: ${vitalityScore}, 喝水: ${stats.waterCups}, 睡觉: ${stats.sleepHours}, 运动: ${stats.exerciseMinutes}, 戒烟状态: ${stats.quitSmokingDate ? '已开启' : '未开启'}`} />
        </div>
      </main>

      {/* 戒烟确认弹窗 */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">🚭</div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">决定好了吗？</h2>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                从现在开始，你的每一分钟都在变得更健康。这不仅仅是戒烟，更是重获自由的开始！
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={startQuitting}
                  className="bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                >
                  是的，我准备好了！
                </button>
                <button 
                  onClick={() => setShowQuitModal(false)}
                  className="text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors"
                >
                  我再想想...
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航 (移动端) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center z-40 md:hidden rounded-t-[2rem] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <button className="text-indigo-600"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></button>
        <button className="text-slate-300"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></button>
        <div className="relative -top-10">
           <button className="bg-indigo-600 text-white rounded-full p-5 shadow-2xl shadow-indigo-300 border-[6px] border-slate-50 transition-transform active:scale-90">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 4v16m8-8H4" /></svg>
           </button>
        </div>
        <button className="text-slate-300"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></button>
        <button className="text-slate-300"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></button>
      </nav>
    </div>
  );
};

export default App;
