import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Shield, Users, Landmark } from "lucide-react";

export default function AboutPage() {
  const grades = [
    { title: "Beginner Grade (Level 1-2)", desc: "Introduction to basic talas, ragas, strokes, or recitation breathing styles. Designed for young children (ages 4-8)." },
    { title: "Junior Grade (Level 3-4)", desc: "Intermediate compositions, basic improvisation, and preliminary theoretical knowledge. Focuses on performance accuracy." },
    { title: "Intermediate Grade (Level 5-6)", desc: "Complex ragas, speed adjustments, storytelling integration, and basic history of Indian art forms." },
    { title: "Senior Grade (Level 7-8)", desc: "Advanced performance level. Focuses on full recital capability, deep theory, and command over compositions." },
    { title: "Sangeet / Kala Visharad (Diploma)", desc: "Professional teaching level diploma. Requires extensive live viva examinations and thesis submission." }
  ];

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16">
          
          {/* Header Title Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              About <span className="text-terracotta">Pratibha Parishad</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              Building the digital infrastructure of Indian Fine Arts by marrying ancient heritage with modern operational integrity.
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Vision & Mission grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-cream-dark/30 rounded-2xl border border-terracotta/10 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-terracotta text-cream flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-charcoal">Our Heritage Vision</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                We believe that geography should never limit a child&apos;s access to qualified fine arts certification. Pratibha Parishad is envisioned as a globally accessible online Examination Board inspired by traditional institutions like Bangiya Sahitya Parishad and Prayag Sangeet Samiti, but run entirely on serverless cloud workflows.
              </p>
            </div>

            <div className="p-8 bg-cream-dark/30 rounded-2xl border border-terracotta/10 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-terracotta text-cream flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-charcoal">Our Operational Philosophy</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                By automating payments, registrations, double-blind grading assignments, and PDF certificates, we redirect operational savings toward physical prize upgrades and verifying credential authenticity, maintaining absolute trust for parents and teachers.
              </p>
            </div>
          </div>

          {/* Graded syllabus roadmap */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-terracotta/10 pb-3">
              <BookOpen className="w-6 h-6 text-terracotta" />
              <h2 className="font-serif text-2xl font-bold text-charcoal">Structured Graded Syllabus</h2>
            </div>
            
            <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
              While our primary acquisition channel is online social competitions, our long-term student retention relies on a rigorous, structured syllabus program divided into levels:
            </p>

            <div className="space-y-4 mt-6">
              {grades.map((grade, idx) => (
                <div key={idx} className="p-6 bg-cream rounded-xl border border-terracotta/5 shadow-sm flex flex-col sm:flex-row gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-charcoal">{grade.title}</h3>
                    <p className="font-sans text-sm text-charcoal/60 mt-1 leading-relaxed">{grade.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organizational Board */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-terracotta/10 pb-3">
              <Users className="w-6 h-6 text-terracotta" />
              <h2 className="font-serif text-2xl font-bold text-charcoal">Our Governing Board</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-cream border border-terracotta/5 rounded-xl">
                <h4 className="font-sans text-sm font-bold text-charcoal">Executive Council</h4>
                <p className="font-sans text-sm text-charcoal/50 mt-1">Supervises platform development, Razorpay invoicing reconciliation, and Shiprocket courier integration.</p>
              </div>
              <div className="text-center p-6 bg-cream border border-terracotta/5 rounded-xl">
                <h4 className="font-sans text-sm font-bold text-charcoal">Moderator Panels</h4>
                <p className="font-sans text-sm text-charcoal/50 mt-1">Manages entry approval, Facebook post verification, and handles client coordination.</p>
              </div>
              <div className="text-center p-6 bg-cream border border-terracotta/5 rounded-xl">
                <h4 className="font-sans text-sm font-bold text-charcoal">Examiners / Judges</h4>
                <p className="font-sans text-sm text-charcoal/50 mt-1">Independent cultural scholars who rate submissions blindly on structural criteria.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
