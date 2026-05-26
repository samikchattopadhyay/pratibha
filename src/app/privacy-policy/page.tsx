import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12">

          {/* Header Title Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Privacy <span className="text-terracotta">Policy</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Content Sections */}
          <div className="space-y-8">

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <Shield className="w-6 h-6 text-terracotta" />
                Your Privacy Matters
              </h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Pratibha Parishad (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <Eye className="w-6 h-6 text-terracotta" />
                Information We Collect
              </h2>
              <div className="space-y-4 pl-6 border-l-4 border-terracotta/20">
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Personal Information</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    We collect information you voluntarily provide including name, email address, phone number, address, and payment information when you register, create an account, or complete a registration form.
                  </p>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Performance Data</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    We collect information about your participation including competition entries, performance videos, submission dates, and evaluation scores for competition management purposes.
                  </p>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Technical Information</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    We automatically collect technical information such as IP address, browser type, device type, pages visited, and time spent on our platform to improve our services.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">How We Use Your Information</h2>
              <ul className="space-y-2 pl-6 border-l-4 border-terracotta/20">
                <li className="font-sans text-sm text-charcoal/70">To process your competition registrations and payments</li>
                <li className="font-sans text-sm text-charcoal/70">To manage and evaluate your performance submissions</li>
                <li className="font-sans text-sm text-charcoal/70">To issue digital certificates and credentials</li>
                <li className="font-sans text-sm text-charcoal/70">To communicate with you about competitions and results</li>
                <li className="font-sans text-sm text-charcoal/70">To improve our platform and user experience</li>
                <li className="font-sans text-sm text-charcoal/70">To comply with legal obligations and regulations</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <Lock className="w-6 h-6 text-terracotta" />
                Data Security
              </h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                We implement industry-standard security measures including SSL encryption, secure payment processing through Razorpay, and restricted access to personal information. However, no method of internet transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Third-Party Services</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                We may share your information with trusted third-party service providers who assist in our operations, including payment processors (Razorpay), shipping partners (Shiprocket), and analytics providers. These parties are bound by confidentiality agreements and use your information only as necessary to provide services.
              </p>
            </section>

            {/* User Rights */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Your Rights</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                You have the right to access, correct, or delete your personal information. You can update your account settings or contact us directly to exercise these rights. We will respond to your requests within 30 days as required by applicable privacy laws.
              </p>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Cookies and Tracking</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Our platform uses cookies and similar tracking technologies to enhance your experience. These help us remember your preferences, manage sessions, and understand how you use our platform. You can control cookie settings through your browser preferences.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-4 p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
              <h2 className="font-serif text-xl font-bold text-charcoal">Questions About Privacy?</h2>
              <p className="font-sans text-sm text-charcoal/70">
                If you have concerns or questions about our privacy practices, please contact us at:
              </p>
              <div className="font-sans text-sm text-charcoal/80 space-y-1">
                <p><strong>Email:</strong> support@pratibhaparishad.org</p>
                <p><strong>Phone:</strong> +91 98300 12345</p>
                <p><strong>Address:</strong> Kolkata Operations Base, India</p>
              </div>
            </section>

            {/* Last Updated */}
            <div className="text-center pt-4 border-t border-terracotta/10">
              <p className="font-sans text-sm text-charcoal/50">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
