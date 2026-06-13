'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Contact Us</h1>
            <p className="text-slate-400 text-sm">Get in touch with the MinesArena team</p>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">We'd Love to Hear From You!</h2>
            <p className="text-slate-300 leading-relaxed">
              Have a question, feedback, or need support? We're here to help! 
              Reach out to us through any of the channels below.
            </p>
          </section>

          {/* Contact Methods */}
          <div className="grid gap-6 mt-8">
            {/* Instagram */}
            <motion.a
              href="https://www.instagram.com/bhavinmodhh/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <div className="glass rounded-xl p-6 border-2 border-transparent hover:border-pink-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-pink-500/50 transition-shadow">
                    <img 
                      src="/myinsta.png" 
                      alt="Instagram" 
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Instagram</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Follow us and send a DM for quick responses
                    </p>
                    <p className="text-pink-400 font-medium">@bhavinmodhh</p>
                  </div>
                </div>
              </div>
            </motion.a>

            {/* General Inquiries */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    For general questions, feedback, or partnership opportunities.
                  </p>
                  <a 
                    href="mailto:modhbhavin05@gmail.com"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    modhbhavin05@gmail.com
                  </a>
                  <p className="text-slate-400 text-xs mt-2">
                    Response time: Within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="glass rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">Is MinesArena real money gambling?</h3>
                <p className="text-slate-300 text-sm">
                  No. MinesArena is a virtual casino simulator for entertainment only. 
                  All coins are virtual and have no real-world value. No deposits or withdrawals are possible.
                </p>
              </div>

              <div className="glass rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">How do I get more coins?</h3>
                <p className="text-slate-300 text-sm">
                  You receive 1,000 free coins when you register. You can earn more by playing games, 
                  claiming daily rewards, and spinning the wheel of fortune.
                </p>
              </div>

              <div className="glass rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">Are the games fair?</h3>
                <p className="text-slate-300 text-sm">
                  Yes! All our games use provably fair algorithms with cryptographic hashing. 
                  You can verify the fairness of each game result independently.
                </p>
              </div>

              <div className="glass rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">Can I reset my account?</h3>
                <p className="text-slate-300 text-sm">
                  Please contact us through Instagram if you need help with your account. 
                  We'll assist you with account-related requests.
                </p>
              </div>

              <div className="glass rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">Is my data safe?</h3>
                <p className="text-slate-300 text-sm">
                  Yes. We use industry-standard encryption and security measures to protect your data. 
                  Read our <a href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a> for more details.
                </p>
              </div>

              <div className="glass rounded-lg p-5">
                <h3 className="font-semibold text-white mb-2">How do leaderboards work?</h3>
                <p className="text-slate-300 text-sm">
                  Leaderboards rank players based on their total winnings. Compete with players worldwide 
                  and climb the ranks to reach the top!
                </p>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-3">About MinesArena</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              MinesArena is the premier virtual casino simulator of 2026, offering provably fair games 
              in a safe, entertaining environment. We provide the best Stake alternative with no deposits 
              required and completely free to play.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our mission is to offer competitive, skill-based gaming with global leaderboards, 
              all while ensuring a 100% safe experience with no real money involvement.
            </p>
          </section>

          {/* Important Notice */}
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-200">
              <strong>⚠️ Important:</strong> MinesArena is for entertainment purposes only. 
              Virtual coins have no cash value and cannot be exchanged for real money. 
              No real money gambling is involved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
