import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Play, Users, Award } from "lucide-react";
import Link from "next/link";

export default function BengaliRecitationPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">

          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Bengali <span className="text-terracotta">Recitation</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              The art of spoken word performance bringing poetry and literature to life
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-terracotta" />
              What is Bengali Recitation?
            </h2>
            <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
              Bengali Recitation is the traditional art of oral expression through which masterpieces of Bengali literature come alive. Rooted in the rich oral traditions of Bengal, this art form combines poetic interpretation, emotive delivery, and technical mastery to captivate audiences. The tradition traces back through centuries of Bengali poetry, from the Charyapad (10th-12th century) to the works of Rabindranath Tagore and Kazi Nazrul Islam.
            </p>
          </section>

          {/* Characteristics */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Key Characteristics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Vocal Technique</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Mastery of breath control, intonation, modulation, and pacing to deliver text with clarity and emotional depth.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Emotional Expression</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  The ability to convey complex emotions and nuanced meanings through facial expressions and body movements.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Literary Understanding</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Deep comprehension of the text&apos;s meaning, context, and cultural significance to authentically interpret the poet&apos;s intent.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Stage Presence</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Confidence and command on stage, engaging the audience and maintaining their attention throughout the performance.
                </p>
              </div>
            </div>
          </section>

          {/* Training and Skill Levels */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Users className="w-6 h-6 text-terracotta" />
              Training and Skill Levels
            </h2>
            <div className="space-y-4">
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Beginner (Level 1-2)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Foundation in basic recitation, learning pronunciation, simple poems, and introductory performance techniques. Suitable for ages 4-8.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Intermediate (Level 3-4)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Advanced poem selections, emotional expression techniques, and understanding of different poetic styles and meters.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Advanced (Level 5-6)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Complex literary works, interpretation of classical Bengali poets, and mastery of nuanced emotional delivery.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Professional (Level 7-8)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Full recital capability, deep theoretical knowledge, and ability to critically analyze and interpret literature.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Notable Poets */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Important Bengali Poets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-cream-dark/10 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Rabindranath Tagore</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Nobel Prize-winning poet whose works form the cornerstone of Bengali literature and recitation tradition.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/10 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Kazi Nazrul Islam</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Rebel poet known for revolutionary and spiritual works that showcase diverse themes and emotional ranges.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/10 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Sarat Chandra Chattopadhyay</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Celebrated author whose works explore human relationships and societal issues with lyrical depth.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/10 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Jibanananda Das</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Modern poet known for imagery-rich verses that celebrate nature and human emotion.
                </p>
              </div>
            </div>
          </section>

          {/* How to Get Started */}
          <section className="space-y-6 p-8 bg-terracotta/5 dark:bg-gold/5 rounded-2xl border border-terracotta/20">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Award className="w-6 h-6 text-terracotta" />
              Get Started with Pratibha Parishad
            </h2>
            <p className="font-sans text-sm text-charcoal/70">
              Showcase your Bengali Recitation talent on a global stage and earn internationally recognized digital certificates.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Play className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Record Your Performance</p>
                  <p className="font-sans text-sm text-charcoal/70">Record your Bengali recitation and upload it to our official Facebook Group</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <BookOpen className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Register & Submit</p>
                  <p className="font-sans text-sm text-charcoal/70">Create an account, select the Bengali Recitation category, and submit your Facebook video link along with ₹50 entry fee</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Award className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Get Evaluated & Certified</p>
                  <p className="font-sans text-sm text-charcoal/70">Qualified judges evaluate your performance blind and provide detailed feedback. Earn your verified digital certificate</p>
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
