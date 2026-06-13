'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
            <p className="text-slate-400 text-sm">Last updated: December 12, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-8 space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using MinesArena, you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Service Description</h2>
            <p className="leading-relaxed mb-3">
              MinesArena is a <strong className="text-white">virtual casino simulator</strong> for entertainment purposes only. 
              Our service provides:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Virtual casino-style games including Mines, Dice, Coinflip, and Plinko</li>
              <li>Virtual currency (coins) with no real-world value</li>
              <li>Leaderboards and competitive gameplay</li>
              <li>Provably fair game mechanics</li>
            </ul>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-200 font-semibold">
                ⚠️ IMPORTANT: No real money is involved. Virtual coins cannot be exchanged for real currency. 
                This is NOT a real money gambling platform.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Accounts</h2>
            <p className="leading-relaxed mb-3">To use our service, you must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Virtual Currency</h2>
            <p className="leading-relaxed mb-3">
              All virtual coins on MinesArena:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Have <strong className="text-white">NO real-world monetary value</strong></li>
              <li>Cannot be exchanged, sold, or redeemed for real money</li>
              <li>Cannot be transferred between users</li>
              <li>Are provided for entertainment purposes only</li>
              <li>May be modified, reset, or removed at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Prohibited Activities</h2>
            <p className="leading-relaxed mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use bots, scripts, or automated tools to play games</li>
              <li>Attempt to manipulate or exploit game mechanics</li>
              <li>Create multiple accounts to gain unfair advantages</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Reverse engineer or decompile our software</li>
              <li>Use the service for any illegal purposes</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Provably Fair Gaming</h2>
            <p className="leading-relaxed">
              We implement provably fair algorithms to ensure game outcomes are random and verifiable. 
              Each game uses cryptographic hashing to generate results that can be independently verified by users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on MinesArena, including but not limited to text, graphics, logos, images, and software, 
              is the property of MinesArena and is protected by copyright and intellectual property laws. 
              You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p className="leading-relaxed">
              MinesArena is provided "as is" and "as available" without any warranties of any kind, either express or implied. 
              We do not guarantee that the service will be uninterrupted, secure, or error-free. Your use of the service is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, MinesArena shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
              or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Account Termination</h2>
            <p className="leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account if:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You violate these Terms of Service</li>
              <li>You engage in fraudulent or abusive behavior</li>
              <li>We are required to do so by law</li>
              <li>We decide to discontinue the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes by 
              posting a notice on our website. Your continued use of the service after changes constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising 
              from these terms or your use of the service shall be subject to the exclusive jurisdiction of the 
              appropriate courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our Instagram:{' '}
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

          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-300">
              By creating an account and using MinesArena, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
