import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface Props {
  onNavigateHome: () => void;
}

export default function PrivacyPolicy({ onNavigateHome }: Props) {
  return (
    <section className="min-h-screen bg-[#FDF5E6] py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-5">
            <ShieldCheck className="w-7 h-7 text-[#C41E3A]" />
          </div>
          <h1 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wide leading-none mb-3">
            Privacy Policy
          </h1>
          <p className="font-handwritten text-xl text-[#FFB81C]">Last Updated: July 14, 2026</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-8 md:p-12 shadow-md space-y-8 text-sm md:text-base text-[#1A1A1A]/80 leading-relaxed"
        >
          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">1. Introduction</h2>
            <p>
              Sauce n' Cheese Restaurant Group ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our ordering services.
            </p>
            <p>
              By using our platform, you consent to the practices described in this policy. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">2. Information We Collect</h2>

            <h3 className="font-black text-sm uppercase tracking-wider text-[#C41E3A]">Personal Information</h3>
            <p>When you create an account or place an order, we collect:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Name</strong> — for order identification and delivery</li>
              <li><strong>Email address</strong> — for account management and order confirmation</li>
              <li><strong>Phone number</strong> — for delivery coordination</li>
              <li><strong>Delivery address</strong> — for order delivery</li>
              <li><strong>Order history</strong> — items ordered, preferences, and order status</li>
            </ul>

            <h3 className="font-black text-sm uppercase tracking-wider text-[#C41E3A] mt-4">Authentication Data</h3>
            <p>
              We use <strong>Clerk</strong> as our authentication provider. When you sign in via Clerk (including Google OAuth), Clerk may share your profile information (name, email, profile picture) with us. Clerk's privacy practices are governed by their own privacy policy.
            </p>

            <h3 className="font-black text-sm uppercase tracking-wider text-[#C41E3A] mt-4">Automatically Collected Information</h3>
            <p>
              When you visit our website, we may automatically collect certain information, including your IP address, browser type, device type, and usage patterns. This helps us improve our service and user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Processing and delivering your orders</li>
              <li>Communicating with you about your orders</li>
              <li>Managing your account and order history</li>
              <li>Improving our menu and services</li>
              <li>Responding to your inquiries via the contact form</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">4. Data Sharing & Disclosure</h2>
            <p>
              We do not sell your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Service Providers:</strong> We use Clerk for authentication and Railway for hosting. These providers process data according to their own security standards.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information. Your authentication is handled securely by Clerk, and all API communications use encrypted tokens. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you with our services. Order records are retained for business and legal purposes. You may request deletion of your data by contacting us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> any inaccurate or incomplete data</li>
              <li><strong>Delete</strong> your account and associated data</li>
              <li><strong>Object</strong> to the processing of your data</li>
              <li><strong>Export</strong> your data in a portable format</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us using the information below. You can also manage your account through your Clerk account settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">8. Cookies & Local Storage</h2>
            <p>
              Our website uses browser local storage to maintain your shopping cart between sessions. We do not use tracking cookies for advertising purposes. Clerk may use cookies for authentication session management.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">9. Third-Party Services</h2>
            <p>
              Our platform integrates with the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Clerk</strong> — Authentication and user management. See <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C41E3A] underline hover:text-[#FFB81C]">Clerk's Privacy Policy</a>.</li>
              <li><strong>Railway</strong> — Cloud hosting and PostgreSQL database. See <a href="https://railway.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C41E3A] underline hover:text-[#FFB81C]">Railway's Privacy Policy</a>.</li>
              <li><strong>Unsplash</strong> — Stock photography used for menu images.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or your data, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Address: 01, KAECHS Block 5, Karachi, Pakistan</li>
              <li>Phone: 03318025998</li>
              <li>Instagram: @saucencheese</li>
            </ul>
          </section>

          {/* Back button */}
          <div className="pt-4 text-center">
            <button
              onClick={onNavigateHome}
              className="bg-[#C41E3A] text-white px-10 py-3.5 rounded-full font-black uppercase tracking-wider text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              &larr; Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
