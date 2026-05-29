import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Music, Play, Users, Award } from "lucide-react";
import Link from "next/link";

export default function NazrulGeetiPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">

          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Nazrul <span className="text-terracotta">Geeti</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              The revolutionary musical compositions of Kazi Nazrul Islam, the rebel poet
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Music className="w-6 h-6 text-terracotta" />
              What is Nazrul Geeti?
            </h2>
            <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
              Nazrul-geeti (music of Nazrul) refers to the thousands of songs written and composed by Kazi Nazrul Islam, the national poet of Bangladesh and one of Bengal&apos;s greatest musicians. Nazrul Islam (1899-1976) created between 2,000 and 4,000 musical compositions, blending folk elements with classical and devotional music traditions. His songs incorporate revolutionary notions alongside spiritual, philosophical, and romantic themes, making them a powerful voice for equality, justice, anti-imperialism, and the celebration of human potential.
            </p>
          </section>

          {/* Musical Characteristics */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Musical Characteristics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Musical Innovation</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Blends classical ragas, folk music, and contemporary themes. Brought Islamic music traditions into mainstream Bengali music.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Bengali Ghazal</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Nazrul invented Bengali Ghazal, a revolutionary fusion that brought Persian musical traditions to Bengali audiences.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Thematic Diversity</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Songs range from revolutionary anthems to devotional pieces, love songs to patriotic compositions and social critique.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Emotional Depth</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Requires powerful vocal expression to convey the rebel spirit and philosophical depth of Nazrul&apos;s compositions.
                </p>
              </div>
            </div>
          </section>

          {/* Categories of Songs */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Types of Nazrul Geeti</h2>
            <div className="space-y-4">
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Bidroh Sangeet (Revolutionary Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Powerful compositions calling for equality, justice, and rebellion against oppression. These are Nazrul&apos;s most celebrated works.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Bhakti Sangeet (Devotional Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Spiritual compositions expressing faith and connection to the divine, blending Islamic and Hindu traditions harmoniously.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Prem Sangeet (Love Songs)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Romantic and passionate compositions exploring human love and connection with Nazrul&apos;s characteristic intensity.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Baul Sangeet (Folk Fusion)</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Songs inspired by Bengali folk tradition, bringing the earthy wisdom of Baul music to broader audiences.
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
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Basic Nazrul songs, proper diction, simple compositions, and introductory performance techniques. Suitable for ages 4-8.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Intermediate (Level 3-4)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">More complex compositions, understanding of different song categories, emotional expression, and intermediate vocal techniques.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Advanced (Level 5-6)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Complex revolutionary and devotional songs, mastery of Nazrul&apos;s unique musical innovations, and interpretive depth.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Professional (Level 7-8)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Full recital capability, complete understanding of Nazrul&apos;s philosophical vision, and ability to convey revolutionary spirit authentically.</p>
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
              Celebrate Nazrul&apos;s revolutionary spirit and earn internationally recognized digital certificates for your performance.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Play className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Record Your Performance</p>
                  <p className="font-sans text-sm text-charcoal/70">Record your Nazrul Geeti performance and upload it to our official Facebook Group</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Music className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Register & Submit</p>
                  <p className="font-sans text-sm text-charcoal/70">Create an account, select Nazrul Geeti, and submit your video link with ₹50 entry fee</p>
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
