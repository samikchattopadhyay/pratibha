import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Palette, Play, Users, Award } from "lucide-react";
import Link from "next/link";

export default function VisualArtsDrawingPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">

          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Visual Arts &<span className="text-terracotta"> Drawing</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              The timeless tradition of artistic expression through painting, drawing, and visual storytelling
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Overview */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
              <Palette className="w-6 h-6 text-terracotta" />
              What is Visual Arts & Drawing?
            </h2>
            <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
              Visual Arts and Drawing encompass the rich traditions of Indian artistic expression through painting and drawing. These art forms draw from ancestral techniques that have been passed down through generations, using natural materials like mineral pigments, plant-based dyes, and traditional papers. From the intricate Kerala murals to the bold strokes of Kalighat painting, from the precision of miniature paintings to the contemporary expressions of modern artists, this category celebrates the fusion of traditional techniques with individual creativity and interpretation.
            </p>
          </section>

          {/* Traditional Art Forms */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Traditional Indian Art Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Kerala Murals</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Ancient wall paintings featuring vivid colors and intricate details representing mythology. Uses natural pigments and mineral-based materials.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Kalighat Paintings</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  19th-century Kolkata tradition capturing urban life and mythology with bold strokes and expressive forms using earthy Indian colors.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Mughal Miniatures</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Intricate small-scale paintings blending Persian finesse with Indian themes, featuring detailed historical and royal narratives.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Warli Paintings</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Tribal art form using rice paste and twigs to create geometric designs on mud walls, celebrating harvest and celebration themes.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Aipan Art</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Sacred motif drawings with rice paste on ochre backgrounds, symbolizing auspiciousness during festivals and household rituals.
                </p>
              </div>
              <div className="p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
                <h3 className="font-sans font-bold text-charcoal mb-2">Sanjhi Art</h3>
                <p className="font-sans text-sm text-charcoal/70">
                  Devotional stencil art using paper cutouts or colored powders to depict scenes from Krishna&apos;s life and religious narratives.
                </p>
              </div>
            </div>
          </section>

          {/* Key Elements */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Key Elements of Visual Arts</h2>
            <div className="space-y-4">
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Technique Mastery</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Deep understanding of mediums (watercolor, acrylic, charcoal, pastels), brush control, composition, and color theory.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Creative Expression</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Ability to express emotions, ideas, and cultural narratives through visual composition and artistic vision.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Cultural Knowledge</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Understanding of traditional art forms, iconography, symbolism, and the historical and cultural context of artistic traditions.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Visual Storytelling</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Capability to narrate stories and convey messages through visual elements, composition, and artistic choices.
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
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Basic drawing skills, simple compositions, understanding of basic color theory and shading techniques. Ages 4-8.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Intermediate (Level 3-4)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">More complex compositions, varied mediums, perspective drawing, and introduction to traditional art forms and their characteristics.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Advanced (Level 5-6)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Advanced composition and color harmony, mastery of specific traditions, and ability to create culturally significant artwork with personal interpretation.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-cream rounded-xl border border-terracotta/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h3 className="font-sans font-bold text-charcoal">Professional (Level 7-8)</h3>
                    <p className="font-sans text-sm text-charcoal/70 mt-1">Complete artistic mastery, ability to execute complex traditional and contemporary works, and deep understanding of art history and theory.</p>
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
              Showcase your visual arts talent and earn internationally recognized digital certificates for your artwork.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Palette className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Create & Photograph Your Artwork</p>
                  <p className="font-sans text-sm text-charcoal/70">Create your visual art piece and photograph it clearly under good lighting</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Play className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Upload to Facebook</p>
                  <p className="font-sans text-sm text-charcoal/70">Post your artwork photo to our official Facebook Group and copy the link</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Award className="w-5 h-5 text-gold mt-1 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-charcoal">Register & Get Certified</p>
                  <p className="font-sans text-sm text-charcoal/70">Create an account, select Visual Arts & Drawing, submit your link with ₹50 fee, and get evaluated by expert judges</p>
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
