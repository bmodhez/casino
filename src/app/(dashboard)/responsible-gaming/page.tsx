'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function ResponsibleGamingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Responsible Gaming</h1>
            <p className="text-slate-400 text-sm">Play safe, stay in control</p>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-8 space-y-6 text-slate-300">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-200 font-semibold">
              ✅ MinesArena is a virtual casino simulator for entertainment only. No real money is involved.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Our Commitment</h2>
            <p className="leading-relaxed">
              At MinesArena, we are committed to providing a safe and enjoyable entertainment experience. 
              While our platform uses virtual currency with no real-world value, we recognize the importance 
              of promoting healthy gaming habits and responsible behavior.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Entertainment Only</h2>
            <p className="leading-relaxed mb-3">
              MinesArena is designed purely for entertainment purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">No Real Money:</strong> All coins are virtual and have no cash value</li>
              <li><strong className="text-white">No Deposits:</strong> You never need to deposit money to play</li>
              <li><strong className="text-white">No Withdrawals:</strong> Virtual coins cannot be converted to real money</li>
              <li><strong className="text-white">Free to Play:</strong> Everyone starts with 1,000 free coins</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Healthy Gaming Habits</h2>
            <p className="leading-relaxed mb-3">
              Even though no real money is involved, we encourage healthy gaming practices:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Set Time Limits:</strong> Take regular breaks and don't play for extended periods</li>
              <li><strong className="text-white">Balance Your Time:</strong> Maintain a healthy balance between gaming and other activities</li>
              <li><strong className="text-white">Play for Fun:</strong> Remember that this is entertainment, not a way to make money</li>
              <li><strong className="text-white">Stay in Control:</strong> If gaming stops being fun, take a break</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Age Restrictions</h2>
            <p className="leading-relaxed">
              Users must be at least 13 years of age to use MinesArena. While we don't involve real money, 
              we want to ensure our platform is used responsibly by age-appropriate audiences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Real Money Gambling</h2>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
              <p className="text-amber-200 font-semibold">
                ⚠️ Important Distinction: MinesArena is NOT real money gambling
              </p>
            </div>
            <p className="leading-relaxed mb-3">
              If you are interested in real money gambling, please be aware of the risks:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Real money gambling can lead to financial problems</li>
              <li>Gambling can be addictive</li>
              <li>Only gamble with money you can afford to lose</li>
              <li>Never chase your losses</li>
              <li>Set strict budgets and time limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Problem Gambling Resources</h2>
            <p className="leading-relaxed mb-3">
              If you or someone you know has a gambling problem with real money gambling, help is available:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-white mb-2">National Council on Problem Gambling</h3>
                <p className="text-sm">24/7 Helpline: <span className="text-blue-400">1-800-522-4700</span></p>
                <p className="text-sm">Website: <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ncpgambling.org</a></p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-white mb-2">Gamblers Anonymous</h3>
                <p className="text-sm">Website: <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">gamblersanonymous.org</a></p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-white mb-2">GamCare (UK)</h3>
                <p className="text-sm">Helpline: <span className="text-blue-400">0808 8020 133</span></p>
                <p className="text-sm">Website: <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">gamcare.org.uk</a></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Self-Assessment</h2>
            <p className="leading-relaxed mb-3">
              Ask yourself these questions about your gaming habits:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Do you spend more time gaming than you intended?</li>
              <li>Has gaming interfered with your work, school, or relationships?</li>
              <li>Do you feel anxious or irritable when not gaming?</li>
              <li>Have you neglected other activities to game?</li>
              <li>Do you game to escape problems or relieve negative feelings?</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              If you answered "yes" to several of these questions, consider taking a break or seeking support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Our Role</h2>
            <p className="leading-relaxed mb-3">
              As a virtual casino simulator, MinesArena serves as:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">A Safe Alternative:</strong> Practice and enjoy casino-style games without financial risk</li>
              <li><strong className="text-white">Educational Tool:</strong> Learn game mechanics and strategies in a risk-free environment</li>
              <li><strong className="text-white">Entertainment Platform:</strong> Compete on leaderboards and enjoy provably fair gaming</li>
              <li><strong className="text-white">Skill Development:</strong> Improve your understanding of probability and game theory</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact Us</h2>
            <p className="leading-relaxed">
              If you have concerns about your gaming habits or questions about our platform, please reach out:{' '}
              <a 
                href="https://www.instagram.com/bhavinmodhh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @bhavinmodhh
              </a>
            </p>
          </section>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Remember:</strong> MinesArena is for entertainment only. Play responsibly, take breaks, 
              and maintain balance in your life. Gaming should always be fun, never a source of stress.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
