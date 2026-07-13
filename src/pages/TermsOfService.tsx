import { motion } from 'motion/react';
import { Scale } from 'lucide-react';

interface Props {
  onNavigateHome: () => void;
}

export default function TermsOfService({ onNavigateHome }: Props) {
  return (
    <section className="min-h-screen bg-[#FDF5E6] py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A] mb-5">
            <Scale className="w-7 h-7 text-[#C41E3A]" />
          </div>
          <h1 className="font-retro text-5xl md:text-6xl text-[#C41E3A] uppercase tracking-wide leading-none mb-3">
            Terms of Service
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
              Welcome to Sauce n' Cheese ("we," "our," or "us"). By accessing or using our website and ordering service, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
            </p>
            <p>
              Sauce n' Cheese Restaurant Group operates from KAECHS Block 5, Karachi, Pakistan. These terms apply to all visitors, users, and customers of our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">2. Accounts & Registration</h2>
            <p>
              To place an order, you must create an account via our authentication provider (Clerk). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p>
              You must provide accurate, current, and complete information during the registration process. We reserve the right to suspend or terminate accounts that violate these terms or provide false information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">3. Ordering & Payments</h2>
            <p>
              All orders placed through our platform are subject to availability and confirmation. We reserve the right to refuse or cancel any order at our discretion.
            </p>
            <p>
              Prices are listed in Pakistani Rupees (Rs.) and include all applicable taxes unless stated otherwise. Payment is processed at the time of delivery. Currently, we do not process online payments — payment is collected upon delivery.
            </p>
            <p>
              We reserve the right to modify prices at any time without prior notice. However, changes will not affect orders that have already been confirmed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">4. Delivery</h2>
            <p>
              Delivery times are estimates and not guaranteed. We strive to deliver within the promised timeframe but are not liable for delays caused by factors beyond our control, including traffic, weather, or high order volumes.
            </p>
            <p>
              You must provide an accurate delivery address and phone number. We are not responsible for orders delivered to incorrect addresses provided by the customer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">5. User Conduct</h2>
            <p>
              You agree not to use our platform for any unlawful purpose or in violation of these terms. Prohibited activities include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Attempting to interfere with the proper functioning of our website</li>
              <li>Submitting false or fraudulent orders</li>
              <li>Engaging in any activity that could damage, disable, or impair our servers</li>
              <li>Using automated systems (bots, scrapers) to access our platform without permission</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">6. Intellectual Property</h2>
            <p>
              All content on this website — including text, graphics, logos, images, and software — is the property of Sauce n' Cheese Restaurant Group and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">7. Limitation of Liability</h2>
            <p>
              Sauce n' Cheese shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability for any claim arising from these terms shall not exceed the value of the order in question.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">8. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">9. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify users of any material changes by posting the updated terms on this page and updating the "Last Updated" date. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-retro text-2xl md:text-3xl text-[#C41E3A] uppercase tracking-wide">10. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
