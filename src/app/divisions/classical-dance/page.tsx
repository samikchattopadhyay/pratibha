import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Music, Play, Users, Award } from "lucide-react";
import Link from "next/link";

export default function ClassicalDancePage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">

          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Classical <span className="text-terracotta">Dance</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              The ancient art of Indian classical dance preserving centuries of tradition and cultural heritage
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Music className="w-6 h-6 text-terracotta" />
              What is Classical Dance?
            </h2>
            <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
              Indian Classical Dance encompasses various refined dance forms with roots in ancient temple traditions. These include Bharatanatyam (Tamil Nadu), Odissi (Odisha), Kathak (North India), Kathakali (Kerala), and Kuchipudi (Andhra Pradesh). Each form is a sophisticated blend of rigorous technical training, expressive storytelling, rhythmic precision, and artistic interpretation. Dancers train for years to master the intricate movements, mudras (hand gestures), facial expressions, and the synchronization between body and music.
            </p>
          </section>

          {/* Key Dance Forms */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Major Classical Dance Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Bharatanatyam</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  South Indian form known for intricate footwork, graceful movements, and storytelling. Features Nritta (pure dance) and Abhinaya (expression).
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Odissi</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Characterized by sinuous postures and fluid movements. The Tribhangi (three-bend) pose gives Odissi its distinctive wave-like quality.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Kathak</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  North Indian form emphasizing rapid footwork, spins, and storytelling. Uses Hindustani classical music framework.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Kathakali</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Kerala&apos;s elaborate form featuring dramatic costumes, makeup, and highly stylized movements depicting mythological narratives.
                </p>
              </div>
            </div>
          </section>

          {/* Characteristics */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Key Characteristics of Classical Dance</h2>
            <div className="space-y-4">
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Technical Mastery</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Rigorous training in body mechanics, footwork patterns (adavus), hand gestures (mudras), and precise synchronization with music and rhythm.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Expressive Storytelling</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Ability to convey complex narratives, emotions, and philosophical themes through facial expressions and body movements.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Rhythmic Precision</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Perfect coordination between body movements and the complex rhythmic cycles (talas) of classical music.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Spiritual Connection</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Deep connection to the philosophical and spiritual roots of classical dance traditions, often rooted in temple worship.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Training Levels */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Users className="w-6 h-6 text-terracotta" />
              Training and Skill Levels
            </h2>
            <div className="space-y-4">
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Beginner (Level 1-2)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Basic postures, simple footwork patterns (adavus), introductory hand gestures, and foundational movement techniques. Ages 4-8.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Intermediate (Level 3-4)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Complex footwork sequences, varied hand gestures, emotional expression in movement, and synchronized performance to music.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Advanced (Level 5-6)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Advanced choreography, complex storytelling through dance, mastery of rhythm and meter, and nuanced emotional interpretation.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Professional (Level 7-8)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Full recital capability, deep understanding of dance history and philosophy, ability to compose variations, and authentic artistic expression.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="space-y-6 p-8 bg-terracotta/5 dark:bg-gold/5 rounded-2xl border border-terracotta/20">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Award className="w-6 h-6 text-terracotta" />
              Get Started with Pratibha Parishad
            </h2>
            <p className="font-sans text-sm text-charcoal/70">
              Showcase your classical dance talent on a global stage and earn internationally recognized digital certificates.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Play className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Record Your Performance</p>
                  <p className="font-sans text-sm text-charcoal/70">Record your classical dance performance and upload it to our official Facebook Group</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Music className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Register & Submit</p>
                  <p className="font-sans text-sm text-charcoal/70">Create an account, select Classical Dance, and submit your video link with ₹50 entry fee</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Award className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Get Evaluated & Certified</p>
                  <p className="font-sans text-sm text-charcoal/70">Qualified judges evaluate your performance and provide detailed feedback. Earn your certificate</p>
                </div>
              </div>
            </div>
            <Link
              href="/competitions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-terracotta hover:bg-terracotta-light text-cream font-sans text-base font-bold shadow-lg hover:-translate-y-[1px] transition-all duration-300 dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal mt-4"
            >
              Explore Competitions
            </Link>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
