'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-slate-400 text-sm">Last updated: December 12, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-8 space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to MinesArena. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we handle your personal data when you visit our website 
              and use our virtual casino simulator services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="leading-relaxed mb-3">We collect and process the following data about you:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Account Information:</strong> Username, email address, and encrypted password</li>
              <li><strong className="text-white">Game Data:</strong> Virtual coins balance, game statistics, wins, losses, and gameplay history</li>
              <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, and session data</li>
              <li><strong className="text-white">Usage Data:</strong> Information about how you use our website and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">We use your personal data for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our virtual casino simulator services</li>
              <li>To manage your account and verify your identity</li>
              <li>To track your game statistics and leaderboard rankings</li>
              <li>To improve our website and user experience</li>
              <li>To communicate with you about your account or our services</li>
              <li>To ensure fair play and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal data 
              against unauthorized access, alteration, disclosure, or destruction. Your password is encrypted using 
              industry-standard hashing algorithms, and we use secure HTTPS connections for all data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Virtual Currency</h2>
            <p className="leading-relaxed">
              <strong className="text-amber-400">Important:</strong> All coins and virtual currency on MinesArena have 
              no real-world value and cannot be exchanged for real money. Our platform is strictly for entertainment 
              purposes only. No real money gambling is involved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cookies and Tracking</h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              Cookies are files with small amounts of data that may include an anonymous unique identifier. You can instruct 
              your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Third-Party Services</h2>
            <p className="leading-relaxed">
              We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, 
              or assist us in analyzing how our service is used. These third parties have access to your personal data only to 
              perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Your Rights</h2>
            <p className="leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Children's Privacy</h2>
            <p className="leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personally 
              identifiable information from children under 13. If you are a parent or guardian and you are aware that 
              your child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our Instagram:{' '}
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
              <strong>Remember:</strong> MinesArena is a virtual casino simulator for entertainment only. 
              No real money is involved, won, or lost.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
