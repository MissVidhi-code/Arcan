import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {  name: "Notes", desc: "Quick notes saved locally", path: "/notes" },
    {  name: "Reminders", desc: "Time-based notifications", path: "/reminder" },
    {  name: "Calendar", desc: "Save & view your events", path: "/calendar" },
    {  name: "Timetable", desc: "AI task scheduler", path: "/timetable" },
    {  name: "AI Chat", desc: "Ask anything anytime", path: "/chatbot" },
  ];

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [heroHover, setHeroHover] = useState(false);

  const handleMouseMove = (e, cardIdx) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setHoveredCard(cardIdx);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
    setMousePosition({ x: 0, y: 0 });
  };

  const getCardTransform = (cardIdx) => {
    if (hoveredCard !== cardIdx) return "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    const centerX = 80;
    const centerY = 80;
    const rotateX = (mousePosition.y - centerY) / 10;
    const rotateY = -(mousePosition.x - centerX) / 10;
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const getHeroTransform = (e) => {
    if (!e) return "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = -(x - centerX) / 15;
    return `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const getStatsTransform = (e) => {
    if (!e) return "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = -(x - centerX) / 15;
    return `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  // Styles for animated dotted glow background
  const animatedBgStyle = `
    @keyframes dotGlowMove {
      0% { transform: translate(0, 0); }
      50% { transform: translate(10px, 10px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    .dotted-glow {
      position: relative;
      background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1), transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1), transparent 50%);
    }
    .dot-pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.15;
      animation: dotGlowMove 8s ease-in-out infinite;
    }
    .dot-pattern::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px);
      background-size: 25px 25px;
      animation: glowPulse 3s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{animatedBgStyle}</style>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 dotted-glow relative overflow-hidden">
        {/* Animated dotted background */}
        <div className="dot-pattern" />
        
        {/* Radial glow orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />

        {/* Hero Section with 3D Hover */}
        <div 
          className="relative w-full max-w-3xl mb-16 z-10"
          onMouseMove={(e) => setHeroHover(true) && setMousePosition({ x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setHeroHover(false)}
          style={{
            perspective: "1200px",
          }}
        >
          {/* Radial gradient glow background */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl -z-10" />

          {/* Main content card with 3D effect */}
          <div
            className="relative bg-white/5 border border-white/6 rounded-2xl p-12 shadow-2xl overflow-hidden transition-all duration-200 cursor-pointer group hover:shadow-cyan-500/20 hover:border-white/20"
            style={{
              transform: heroHover ? getHeroTransform({ currentTarget: { getBoundingClientRect: () => document.querySelector('.hero-card')?.getBoundingClientRect() || { width: 0, height: 0 } } }) : "perspective(1200px) rotateX(0deg) rotateY(0deg)",
              transformStyle: "preserve-3d",
              transition: "transform 0.1s linear, box-shadow 0.3s ease",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = (y - centerY) / 15;
              const rotateY = -(x - centerX) / 15;
              e.currentTarget.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
            }}
          >
            {/* Animated dotted pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full animate-pulse" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            <div className="relative z-10 text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4 group-hover:from-cyan-400 group-hover:to-indigo-400 transition-all">
                ARCHON
              </h1>
              <p className="text-lg text-gray-300 mb-2 group-hover:text-gray-100 transition-colors">
                Your all-in-one productivity companion
              </p>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                Plan. Track. Execute. Repeat.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid with 3D Effect */}
        <div className="w-full max-w-5xl z-10">
          <h2 className="text-2xl font-semibold text-center mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" style={{ perspective: "1000px" }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => navigate(feature.path)}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: getCardTransform(idx),
                  transformStyle: "preserve-3d",
                  transition: "transform 0.1s linear, box-shadow 0.3s ease",
                }}
                className="bg-white/5 border border-white/6 rounded-lg p-4 shadow hover:shadow-lg hover:shadow-purple-500/20 hover:border-white/20 duration-300 cursor-pointer relative group"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/15 group-hover:to-purple-600/15 rounded-lg transition-all duration-300" />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-2 text-center group-hover:scale-125 transition-transform duration-200">{feature.icon}</div>
                  <h3 className="font-semibold text-sm text-center">{feature.name}</h3>
                  <p className="text-xs text-gray-400 text-center mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section with 3D Hover */}
        <div className="w-full max-w-3xl mt-16 z-10">
          <div 
            className="grid grid-cols-3 gap-4"
            onMouseMove={(e) => {
              const cards = document.querySelectorAll('.stat-card');
              cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 12;
                const rotateY = -(x - centerX) / 12;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
              });
            }}
            onMouseLeave={() => {
              const cards = document.querySelectorAll('.stat-card');
              cards.forEach((card) => {
                card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
              });
            }}
          >
            <div className="stat-card bg-white/5 border border-white/6 rounded-lg p-6 text-center hover:bg-white/8 hover:shadow-cyan-500/20 transition-all duration-200 cursor-pointer" style={{ transformStyle: "preserve-3d", transition: "transform 0.1s linear, box-shadow 0.3s ease" }}>
              <div className="text-3xl font-bold text-indigo-400">∞</div>
              <div className="text-xs text-gray-400 mt-2">Notes Saved</div>
            </div>
            <div className="stat-card bg-white/5 border border-white/6 rounded-lg p-6 text-center hover:bg-white/8 hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer" style={{ transformStyle: "preserve-3d", transition: "transform 0.1s linear, box-shadow 0.3s ease" }}>
              <div className="text-3xl font-bold text-purple-400">24/7</div>
              <div className="text-xs text-gray-400 mt-2">Always Available</div>
            </div>
            <div className="stat-card bg-white/5 border border-white/6 rounded-lg p-6 text-center hover:bg-white/8 hover:shadow-cyan-500/20 transition-all duration-200 cursor-pointer" style={{ transformStyle: "preserve-3d", transition: "transform 0.1s linear, box-shadow 0.3s ease" }}>
              <div className="text-3xl font-bold text-cyan-400">100%</div>
              <div className="text-xs text-gray-400 mt-2">Local Storage</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
