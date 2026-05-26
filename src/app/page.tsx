import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Award, ShieldCheck, Zap, MessageSquare, Video, ArrowRight, Play, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-cream-dark/40 pt-8 lg:pt-16 pb-20 lg:pb-28 overflow-hidden alpana-pattern">
        {/* Alpana background ornament left top */}
        <div className="absolute -left-20 -top-20 opacity-5 pointer-events-none select-none text-terracotta">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M 50 10 C 20 40, 20 60, 50 90 C 80 60, 80 40, 50 10 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M 10 50 C 40 20, 60 20, 90 50 C 60 80, 40 80, 10 50 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta font-sans text-sm font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" /> Traditional Arts, Modern Credentials
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                Where Indian Heritage Meets <span className="text-terracotta">Digital Recognition</span>
              </h1>
              <p className="font-sans text-lg text-charcoal/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Pratibha Parishad is the premier digital certification board for Indian fine arts. Show off your talent in singing, dance, recitation, and visual arts to win global verification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/competitions"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-terracotta hover:bg-terracotta-light text-cream font-sans text-base font-bold shadow-lg hover:-translate-y-[1px] transition-all duration-300 dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal"
                >
                  Explore Competitions
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-terracotta/20 hover:border-terracotta text-terracotta font-sans text-base font-bold transition-all duration-300 dark:border-gold/30 dark:hover:border-gold dark:text-gold"
                >
                  Access Student Portal
                </Link>
              </div>
            </div>

            {/* Visual highlight box */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md p-8 bg-cream border-2 border-gold/30 rounded-3xl shadow-xl dark:bg-charcoal dark:border-gold/30 relative">
                {/* Visual design seal */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gold text-charcoal flex items-center justify-center font-serif font-bold text-lg shadow-md animate-bounce">
                  PP
                </div>
                
                <h3 className="font-serif text-xl font-bold text-terracotta dark:text-gold border-b border-terracotta/10 dark:border-gold/10 pb-4 mb-4">
                  Phase 1 MVP Launching Now
                </h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mt-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-bold text-charcoal dark:text-cream">Facebook Submission Check</h4>
                      <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">Submit direct links of your performance videos.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mt-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-bold text-charcoal dark:text-cream">Double Blind Evaluation</h4>
                      <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">Judges grade performace blindly with strict conflict checks.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mt-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-bold text-charcoal dark:text-cream">QR Verified Certificates</h4>
                      <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">Instantly shareable PDF certificates with static authenticity IDs.</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 pt-4 border-t border-terracotta/10 dark:border-gold/10 flex justify-between items-center text-sm font-sans text-charcoal/60 dark:text-cream/60">
                  <span>Entry Fee: ₹50 / entry</span>
                  <span className="font-semibold text-terracotta dark:text-gold flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 fill-current" /> Live in India & Abroad
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Features Grid */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Digital Infrastructure for Indian Fine Arts
            </h2>
            <p className="font-sans text-base text-charcoal/80">
              Unlike traditional arts boards that require months of paperwork, we automate operations so that students receive high-quality feedback and credentials seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-cream-dark/30 rounded-2xl border border-terracotta/5 hover:border-terracotta/20 hover:shadow-lg transition-all duration-300 space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-terracotta text-cream flex items-center justify-center shadow-md mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Authentic Verification
              </h3>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Every certificate contains a unique QR code linked directly to our global database. Universities, schools, and teachers can verify achievements instantly online.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-cream-dark/30 rounded-2xl border border-terracotta/5 hover:border-terracotta/20 hover:shadow-lg transition-all duration-300 space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-terracotta text-cream flex items-center justify-center shadow-md mx-auto sm:mx-0">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Automated Operations
              </h3>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Payments, ranking calculations, certificate generation, and results dispatch are completely automated, ensuring speed and transparency at every step.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-cream-dark/30 rounded-2xl border border-terracotta/5 hover:border-terracotta/20 hover:shadow-lg transition-all duration-300 space-y-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-terracotta text-cream flex items-center justify-center shadow-md mx-auto sm:mx-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Social Growth Loop
              </h3>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Integrated with Facebook Groups to encourage natural community support and parent-driven viral shares, growing our community organically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="py-20 bg-cream-dark/20 border-t border-b border-terracotta/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              How Participation Works
            </h2>
            <p className="font-sans text-sm text-charcoal/60 mt-2">
              Three simple steps to submit entries and receive your council credentials
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream border-2 border-terracotta text-terracotta flex items-center justify-center font-serif text-xl font-bold shadow-md">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">1. Upload to Facebook</h3>
              <p className="font-sans text-sm text-charcoal/70 max-w-xs">
                Upload your child&apos;s performance video inside our official Facebook Group and copy the post URL.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream border-2 border-terracotta text-terracotta flex items-center justify-center font-serif text-xl font-bold shadow-md">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">2. Register & Pay</h3>
              <p className="font-sans text-sm text-charcoal/70 max-w-xs">
                Log into our portal, enter student details, select category, paste the Facebook URL, and complete the ₹50 entry fee.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream border-2 border-terracotta text-terracotta flex items-center justify-center font-serif text-xl font-bold shadow-md">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">3. Review & Certify</h3>
              <p className="font-sans text-sm text-charcoal/70 max-w-xs">
                Judges score entries blindly. After result publication, your verified digital certificate is automatically sent to your WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
