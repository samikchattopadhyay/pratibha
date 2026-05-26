import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Music, Play, Users, Award } from "lucide-react";
import Link from "next/link";

export default function RabindraSangeetPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">

          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Rabindra <span className="text-terracotta">Sangeet</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              The timeless musical legacy of Rabindranath Tagore blending poetry and melody
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Music className="w-6 h-6 text-terracotta" />
              What is Rabindra Sangeet?
            </h2>
            <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
              Rabindra Sangeet (music of Rabindranath Tagore) is an extraordinary body of over 2,000 songs created by Nobel Prize laureate Rabindranath Tagore. These songs form an emotional language that has been cherished by Bengalis across generations. Tagore&apos;s genius lay in his ability to borrow freely from Hindustani classical ragas, Baul music of Bengal, devotional kirtans, and even Western classical influences, while fearlessly modifying them to suit his lyrical needs and emotional intentions, creating a distinctive style now recognized as the Rabindrik Anga.
            </p>
          </section>

          {/* Musical Characteristics */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Musical Characteristics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Poetry-Music Harmony</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Lyrics and music hold almost equal importance. Each song is a perfect blend of poetic brilliance and melodic perfection.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Raga Innovation</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Tagore created new taals (rhythmic cycles) inspired by Carnatic talas to suit his narrative needs perfectly.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Emotional Expression</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Each composition is rich with philosophical depth and explores themes of love, nature, spirituality, and humanity.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Vocal Technique</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Requires sophisticated vocal control, breath management, and the ability to convey subtle emotional nuances.
                </p>
              </div>
            </div>
          </section>

          {/* Categories of Songs */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Types of Rabindra Sangeet</h2>
            <div className="space-y-4">
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Prem Sangeet (Love Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Romantic compositions exploring various facets of love, from passionate devotion to tender affection.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Bhakti Sangeet (Devotional Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Spiritual and devotional compositions reflecting philosophical contemplation and connection to the divine.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Samaj Sangeet (Social Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Songs addressing social themes, national consciousness, and human brotherhood with powerful messages.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Prakriti Sangeet (Nature Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Compositions celebrating the beauty of nature and seasons, filled with vivid imagery and natural metaphors.
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
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Basic Rabindra songs, proper pronunciation, simple melodies, and introductory vocal techniques. Suitable for ages 4-8.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Intermediate (Level 3-4)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">More complex compositions, understanding of ragas, emotional expression, and intermediate vocal control techniques.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Advanced (Level 5-6)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Complex songs from all categories, mastery of raga variations, nuanced emotional delivery, and interpretation skills.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Professional (Level 7-8)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Full concert capability, deep theoretical knowledge, ability to compose variations, and critical analysis of Tagore&apos;s philosophical intent.</p>
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
              Showcase your Rabindra Sangeet talent and earn internationally recognized digital certificates.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Play className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Record Your Performance</p>
                  <p className="font-sans text-sm text-charcoal/70">Record your Rabindra Sangeet performance and upload it to our official Facebook Group</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Music className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Register & Submit</p>
                  <p className="font-sans text-sm text-charcoal/70">Create an account, select Rabindra Sangeet, and submit your video link with ₹50 entry fee</p>
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
