import { ArrowRight, Dumbbell, MessageCircle, Apple, BarChart, Trophy, Zap, Shield, Play, Bot } from 'lucide-react';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onQuickDashboard: () => void;
}

export function LandingPage({ onStartOnboarding, onQuickDashboard }: LandingPageProps) {
  return (
    <div className="bg-theme min-h-screen w-full flex flex-col justify-between theme-transition">
      {/* LANDING CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 transition-all grow text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 lg:pr-8">
            <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full bg-card border-2 border-theme text-xs font-black tracking-widest text-theme uppercase shadow-brutal-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse border border-theme" />
              FITSPHERE BIOMECHANICS 2.0
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-theme leading-[1.1] tracking-tight uppercase">
              Transform <br /> Your <br />
              <span className="relative inline-block mt-2">
                <span className="absolute inset-x-0 bottom-2 md:bottom-3 h-4 md:h-6 bg-secondary -z-10 translate-y-1 opacity-30"></span>
                <span className="text-gradient">Physique</span>
              </span>
            </h1>
            
            <p className="text-sm font-bold text-theme-muted leading-relaxed max-w-lg mt-6">
              Hyper-personalized training regimes, nutritional macro targets, interactive muscular resonance models, and custom 24/7 AI coaching feedback in one pristine workspace.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-6">
              <button
                id="btn-landing-get-started"
                onClick={onStartOnboarding}
                className="btn-cta text-xs font-black uppercase tracking-wider px-8 py-4 rounded-2xl flex items-center gap-2 text-lg"
                style={{ borderRadius: '12px', fontSize: '13px', padding: '18px 40px' }}
              >
                Start Training Free
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
              <button
                id="btn-landing-dashboard-sim"
                onClick={onQuickDashboard}
                className="bg-card text-theme hover:bg-theme-secondary text-xs font-black uppercase tracking-wider px-8 py-4 rounded-2xl border-2 border-theme shadow-brutal hover:shadow-brutal-sm active:translate-y-1 active:translate-x-1 transition-all cursor-pointer flex items-center gap-2"
              >
                Join or Sign In
              </button>
            </div>

            <div className="pt-10 grid grid-cols-3 gap-6 border-t-2 border-theme mt-8">
              <div>
                <h5 className="text-3xl font-black text-theme font-mono tracking-tighter">1M+</h5>
                <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mt-1">Workouts</p>
              </div>
              <div>
                <h5 className="text-3xl font-black text-theme font-mono tracking-tighter">98%</h5>
                <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mt-1">Goal Success</p>
              </div>
              <div>
                <h5 className="text-3xl font-black text-theme font-mono tracking-tighter">4.9</h5>
                <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mt-1">App Rating</p>
              </div>
            </div>
          </div>

          {/* Connected interactive presentation panel */}
          <div className="relative hidden md:flex justify-center items-center h-[400px] lg:h-[500px] border-2 border-theme rounded-[32px] bg-theme-secondary p-6 shadow-brutal-xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop" 
              alt="Athlete Training" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2E] via-[#0B1A2E]/60 to-transparent" />
            
            {/* Overlay UI Element */}
            <div className="absolute bottom-8 left-8 right-8 bg-card border-2 border-theme p-5 rounded-2xl shadow-brutal backdrop-blur-md bg-glass transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-primary">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h6 className="font-black text-theme text-sm uppercase tracking-wider">Workout Complete</h6>
                    <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">+450 XP Earned</p>
                  </div>
                </div>
                <div className="bg-primary border-2 border-primary px-3 py-1 rounded-full">
                  <span className="font-black text-white text-xs">PR!</span>
                </div>
              </div>
              <div className="w-full bg-theme-secondary h-2 rounded-full overflow-hidden border border-theme">
                <div className="bg-primary w-3/4 h-full relative">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20"></div>
                </div>
              </div>
              <p className="text-[9px] font-black text-theme-dim tracking-widest uppercase mt-2 text-right">Weekly Goal: 75%</p>
            </div>
          </div>

        </div>

        {/* Modules presentation section - aligned EXACTLY with Positivus Landing Card layout */}
        <section className="mt-20 py-12 border-t-2 border-theme bg-theme">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <h2 className="text-3xl font-black text-theme tracking-tight">
              Detailed Platform Architecture
            </h2>
            <p className="text-xs font-semibold text-theme-muted max-w-md">
              Every feature is engineered to provide precise, actionable feedback for your fitness journey.
            </p>
          </div>
          
          <div className="space-y-12">
            {/* Feature Slide 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12 bg-card p-8 rounded-[32px] border-2 border-theme shadow-brutal-xl transition-transform hover:translate-y-[-4px]">
              <div className="flex-1 space-y-6">
                <div className="inline-flex gap-2 items-center px-4 py-2 rounded-xl bg-theme-secondary border-2 border-theme text-xs font-black tracking-widest text-theme uppercase">
                  <BarChart className="w-4 h-4" />
                  Analytics & Tracking
                </div>
                <h3 className="text-4xl font-black text-theme leading-tight uppercase">
                  Precision <br /><span className="text-gradient" style={{ textShadow: "2px 2px 0px var(--card-border)" }}>Data Metrics</span>
                </h3>
                <p className="text-sm font-semibold text-theme-muted leading-relaxed max-w-md">
                  Monitor every heartbeat, calorie, and lifted pound in real-time. Our custom dashboard transforms raw data into comprehensive charts, helping you visualize weekly progress and avoid training plateaus. 
                </p>
              </div>
              <div className="flex-1 w-full bg-theme-secondary rounded-3xl p-6 border-2 border-theme relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity"></div>
                 <div className="relative z-10 flex gap-4 h-48 items-end justify-center">
                    {[40, 70, 45, 90, 65, 100, 80].map((height, i) => (
                      <div key={i} className="w-8 md:w-12 bg-primary border-2 border-white rounded-t-lg transition-all duration-500 hover:opacity-80" style={{ height: `${height}%` }}></div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Feature Slide 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 bg-card p-8 rounded-[32px] border-2 border-theme transition-transform hover:translate-y-[-4px]"
              style={{ boxShadow: '8px 8px 0px #D4AF37' }}
            >
              <div className="flex-1 space-y-6">
                <div className="inline-flex gap-2 items-center px-4 py-2 rounded-xl bg-theme-secondary border-2 border-theme text-xs font-black tracking-widest text-theme uppercase">
                  <Trophy className="w-4 h-4" />
                  Community & Gamification
                </div>
                <h3 className="text-4xl font-black text-theme leading-tight uppercase">
                  Compete to <br /><span className="bg-primary text-white px-3 py-1 rounded-xl">Dominate</span>
                </h3>
                <p className="text-sm font-semibold text-theme-muted leading-relaxed max-w-md">
                  Fitness is better together. Earn XP by completing tasks, unlock rare milestone badges, and climb the competitive global leaderboards. Turn your daily sweat into undeniable digital achievements.
                </p>
              </div>
              <div className="flex-1 w-full flex gap-4 flex-col justify-center bg-theme-secondary p-6 rounded-3xl border-2 border-theme">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className={`flex items-center justify-between p-4 rounded-xl border-2 border-theme ${rank === 1 ? 'bg-primary text-white' : 'bg-card text-theme'}`}>
                    <div className="flex items-center gap-4">
                       <span className="font-black text-xl w-6">{rank}</span>
                       <div className="w-10 h-10 rounded-full bg-theme-tertiary border-2 border-theme overflow-hidden">
                         <img src={`https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop&sig=${rank}`} alt="user" className="w-full h-full object-cover" />
                       </div>
                       <span className="font-black text-sm uppercase">Athlete {rank}</span>
                    </div>
                    <span className="font-mono font-bold text-sm tracking-wider">{1000 - rank * 120} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Slide 3 - Dark card */}
            <div className="flex flex-col lg:flex-row items-center gap-12 bg-theme-secondary text-theme p-8 rounded-[32px] border-2 border-theme shadow-brutal-xl transition-transform hover:translate-y-[-4px]">
              <div className="flex-1 space-y-6">
                <div className="inline-flex gap-2 items-center px-4 py-2 rounded-xl bg-card border-2 border-theme text-xs font-black tracking-widest text-theme uppercase">
                  <Shield className="w-4 h-4" />
                  AI Coaching
                </div>
                <h3 className="text-4xl font-black leading-tight uppercase">
                  Your Custom <br /><span className="text-primary">Fitness Oracle</span>
                </h3>
                <p className="text-sm font-semibold text-theme-muted leading-relaxed max-w-md">
                  Consult the AI neural coach anytime. Request alternative exercises for torn ligaments, get personalized meal recipes that hit your exact macros, and adapt your schedule dynamically when life happens.
                </p>
              </div>
              <div className="flex-1 w-full bg-theme rounded-3xl p-6 border-2 border-theme relative overflow-hidden">
                <div className="space-y-4">
                  <div className="bg-theme-secondary/50 p-4 rounded-2xl border border-theme rounded-bl-none max-w-[80%]">
                    <p className="text-xs font-medium text-theme">I have a minor shoulder pain today. How should I adjust my Push workout?</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-2xl border border-primary/30 rounded-br-none max-w-[80%] ml-auto">
                    <div className="flex items-center gap-2 mb-2">
                       <Bot className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black tracking-widest text-primary uppercase">Coach Sphere</span>
                    </div>
                    <p className="text-xs font-medium text-theme leading-relaxed">
                      Let's swap overhead presses for lateral raises and focus on lower-impact tricep pushdowns to avoid aggravating the joint. Rest and recover!
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
