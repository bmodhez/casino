'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const games = [
  {
    name: 'Mines',
    desc: 'Reveal gems, dodge the mines',
    href: '/games/mines',
    accent: '#10b981',
    accentDim: 'rgba(16, 185, 129, 0.08)',
    borderAccent: 'rgba(16, 185, 129, 0.15)',
    image: '/mines-removebg-preview.png',
    gradient: 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.02) 100%)',
  },
  {
    name: 'Dice',
    desc: 'Roll the dice, beat the odds',
    href: '/games/dice',
    accent: '#3b82f6',
    accentDim: 'rgba(59, 130, 246, 0.08)',
    borderAccent: 'rgba(59, 130, 246, 0.15)',
    image: '/dice-removebg-preview.png',
    gradient: 'linear-gradient(180deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.02) 100%)',
  },
  {
    name: 'Coinflip',
    desc: 'Heads or tails — 2x payout',
    href: '/games/coinflip',
    accent: '#f59e0b',
    accentDim: 'rgba(245, 158, 11, 0.08)',
    borderAccent: 'rgba(245, 158, 11, 0.15)',
    image: '/coins-removebg-preview.png',
    gradient: 'linear-gradient(180deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.02) 100%)',
  },
  {
    name: 'Plinko',
    desc: 'Drop the ball, win big',
    href: '/games/plinko',
    accent: '#ec4899',
    accentDim: 'rgba(236, 72, 153, 0.08)',
    borderAccent: 'rgba(236, 72, 153, 0.15)',
    image: '/plinko-removebg-preview.png',
    gradient: 'linear-gradient(180deg, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.02) 100%)',
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function HeroSection() {
  // Fixed star positions (no random, avoids hydration mismatch)
  const starPositions = [
    { left: 15, top: 25 }, { left: 85, top: 35 }, { left: 45, top: 15 },
    { left: 70, top: 60 }, { left: 25, top: 70 }, { left: 90, top: 20 },
    { left: 10, top: 55 }, { left: 60, top: 80 }, { left: 35, top: 40 },
    { left: 80, top: 50 }, { left: 50, top: 30 }, { left: 20, top: 85 },
    { left: 75, top: 45 }, { left: 40, top: 65 }, { left: 95, top: 75 },
    { left: 30, top: 20 }, { left: 65, top: 90 }, { left: 55, top: 10 },
    { left: 12, top: 42 }, { left: 88, top: 68 },
  ];

  return (
    <div className="mb-8 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center relative"
      >
        {/* Galaxy Background Effect */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="absolute w-[600px] h-[200px] opacity-30">
            {/* Animated stars with fixed positions */}
            {starPositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2 + (i % 3),
                  repeat: Infinity,
                  delay: (i % 5) * 0.4,
                }}
              />
            ))}
            
            {/* Glowing orbs */}
            <motion.div
              className="absolute w-40 h-40 rounded-full bg-blue-500/20 blur-3xl"
              style={{ left: '10%', top: '20%' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-purple-500/20 blur-3xl"
              style={{ right: '15%', top: '30%' }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-36 h-36 rounded-full bg-pink-500/20 blur-3xl"
              style={{ left: '50%', top: '40%' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* User-focused heading with animated gradient */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 relative z-10">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            The Modern Gaming Sandbox
          </span>
        </h1>
        <p className="text-[var(--muted-foreground)] text-base max-w-2xl mx-auto mb-8 relative z-10">
          Test strategies, compete on leaderboards and master provably fair games.
        </p>

        {/* Section title */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2 mt-6 relative z-10">
          Choose Your Game
        </h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-6 relative z-10">
          Pick your favorite and start winning
        </p>
      </motion.div>
    </div>
  );
}

function GameCard({ game }: { game: typeof games[0] }) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={game.href} className="block group">
        <div 
          className="game-card relative" 
          data-game={game.name.toLowerCase()}
        >
          <div className="game-card-art relative overflow-hidden">
            {/* Simple background accent */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <div className="absolute top-1/3 left-1/3 w-24 h-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-125" 
                style={{ backgroundColor: game.accent }} />
            </div>
            {/* Game Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
              <img 
                src={game.image} 
                alt={game.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          
          <div className="game-card-body">
            <div className="flex items-start justify-between mb-2">
              <h3 className="game-card-title">{game.name}</h3>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: game.accentDim,
                  border: `1px solid ${game.borderAccent}`
                }}
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: game.accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            <p className="game-card-desc">{game.desc}</p>
            <div className="game-card-action">
              <span className="text-[11px] font-bold tracking-wider">
                PLAY NOW
              </span>
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-200px)]">
      <HeroSection />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        {games.map((game) => (
          <GameCard key={game.name} game={game} />
        ))}
      </motion.div>

      {/* Bottom stats section */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-10 mt-8 bg-[var(--card)] border border-[var(--border)]">
        
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Ready to Start Your Journey?
            </h2>
            <p className="text-[var(--muted-foreground)] text-sm md:text-base max-w-xl mx-auto">
              Join thousands of players and experience the thrill of provably fair gaming
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Provably Fair', value: '100%', icon: '🔒' },
              { label: 'Free Starting Coins', value: '1,000', icon: '🪙' },
              { label: 'Real Money', value: 'None', icon: '🎮' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg p-5 bg-[var(--accent)] border border-[var(--border)] transition-transform duration-200 hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-[var(--foreground)] mb-1 font-mono">{stat.value}</div>
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Note */}
          <div className="text-center mt-6">
            <p className="text-[var(--muted-foreground)] text-xs flex items-center justify-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              No real money. Pure entertainment and fun!
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="mt-12 max-w-4xl mx-auto">
        <article className="prose prose-invert max-w-none">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to MinesArena - Free Social Gaming Platform</h2>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              Welcome to MinesArena, a premier <strong>social gaming platform</strong> where you can enjoy exciting games with virtual coins - 
              completely free and purely for entertainment. Play skill-based games, compete on leaderboards, and connect with players worldwide. 
              <strong>No real money, no deposits, no risk</strong> - just pure fun!
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Free Social Games for Everyone</h3>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              Experience exciting social games including Mines, Dice, Coinflip, and Plinko. All games use virtual coins that have 
              <strong> no monetary value</strong>. Start with 1,000 free coins and earn more through daily rewards and the wheel of fortune!
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Competitive Gaming with Global Leaderboards</h3>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              What sets MinesArena apart is our competitive focus. Compete against players worldwide on our real-time <strong>leaderboards</strong>. 
              Track your progress, climb the ranks, and prove your skills. Every game contributes to your position - will you reach the top?
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Our Social Games Collection</h3>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              Our collection of <strong>free social games</strong> includes:
            </p>
            
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li><strong>Mines</strong> - Strategic gameplay where you reveal gems while avoiding mines</li>
              <li><strong>Dice</strong> - Classic dice rolling with customizable multipliers</li>
              <li><strong>Coinflip</strong> - Simple yet thrilling 50/50 chance games</li>
              <li><strong>Plinko</strong> - Watch your ball bounce through pegs for exciting wins</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Mobile-Friendly Gaming Experience</h3>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              Access MinesArena anytime, anywhere with our mobile-optimized platform. 
              Our responsive design ensures smooth gameplay whether you're on desktop, tablet, or smartphone. 
              Play your favorite games on the go!
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Why Choose MinesArena?</h3>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              Unlike platforms that involve real money, MinesArena offers:
            </p>

            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>🎮 <strong>100% Free to Play</strong> - Start with 1,000 free virtual coins instantly</li>
              <li>🔒 <strong>Provably Fair Algorithms</strong> - Transparent gameplay you can verify</li>
              <li>🏆 <strong>Global Leaderboards</strong> - Compete worldwide and track your rank</li>
              <li>📊 <strong>Detailed Statistics</strong> - Monitor your performance and improve</li>
              <li>🎁 <strong>Daily Rewards</strong> - Free coins every day plus wheel of fortune</li>
              <li>📱 <strong>Mobile Optimized</strong> - Play seamlessly on any device</li>
              <li>⚡ <strong>Instant Access</strong> - No downloads, play in your browser</li>
              <li>👥 <strong>Social Features</strong> - Compete with friends and top players</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Safe & Legal Entertainment</h3>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              MinesArena is a <strong>social gaming platform</strong> providing legal entertainment without any financial risk. 
              Perfect for players who want to enjoy skill-based games, practice strategies, and compete with others - all for fun! 
              Our platform is designed for <strong>entertainment only</strong> - no real money is involved, won, or lost.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-6">
              <p className="text-amber-200 text-sm mb-0">
                <strong>⚠️ Legal Notice:</strong> MinesArena is a free social gaming platform for entertainment purposes only. 
                No real money gambling is involved. Virtual coins have NO MONETARY VALUE and cannot be exchanged for real currency or prizes. 
                This platform is designed as a safe, fun social gaming experience. Must be 18+ to play.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
