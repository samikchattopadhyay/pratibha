import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, AlertCircle, Users } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-10 md:py-16 alpana-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12">

          {/* Header Title Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
              Terms of <span className="text-terracotta">Use</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 max-w-2xl mx-auto">
              Understand the terms and conditions governing your use of Pratibha Parishad
            </p>
            <div className="w-24 h-1 bg-gold mx-auto rounded-full mt-6" />
          </div>

          {/* Content Sections */}
          <div className="space-y-8">

            {/* Acceptance of Terms */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <FileText className="w-6 h-6 text-terracotta" />
                Acceptance of Terms
              </h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                By accessing and using the Pratibha Parishad website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Use License */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Use License</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Pratibha Parishad for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 pl-6 border-l-4 border-terracotta/20">
                <li className="font-sans text-sm text-charcoal/70">Modifying or copying the materials</li>
                <li className="font-sans text-sm text-charcoal/70">Using the materials for any commercial purpose or for any public display</li>
                <li className="font-sans text-sm text-charcoal/70">Attempting to decompile or reverse engineer any software</li>
                <li className="font-sans text-sm text-charcoal/70">Removing any copyright or other proprietary notations</li>
                <li className="font-sans text-sm text-charcoal/70">Transferring the materials to another person or &quot;mirroring&quot; on any other server</li>
                <li className="font-sans text-sm text-charcoal/70">Violating any applicable laws or regulations</li>
              </ul>
            </section>
 
            {/* User Responsibilities */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <Users className="w-6 h-6 text-terracotta" />
                User Responsibilities
              </h2>
              <div className="space-y-4 pl-6 border-l-4 border-terracotta/20">
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Account Information</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must ensure that the information you provide is accurate, complete, and current.
                  </p>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Submission Content</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    You retain all rights to any performance content you submit. By submitting your performance videos, you grant Pratibha Parishad the right to use them solely for evaluation and certification purposes. You warrant that you have all necessary permissions to submit such content.
                  </p>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Prohibited Conduct</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    You agree not to engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the website. Prohibited behavior includes harassing, threatening, embarrassing, or causing distress or discomfort.
                  </p>
                </div>
              </div>
            </section>

            {/* Competition Rules */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Competition Rules</h2>
              <div className="space-y-4 pl-6 border-l-4 border-terracotta/20">
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Eligibility</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Participants must be appropriately categorized by age and skill level. False representation of participant age or skill may result in disqualification and forfeiture of fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Video Submissions</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Videos must be submitted through approved channels (Facebook Group links). Participants are responsible for ensuring video quality, clarity, and proper framing for evaluation.
                  </p>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-charcoal">Evaluation Process</h3>
                  <p className="font-sans text-sm text-charcoal/70 mt-1">
                    Evaluations are conducted by qualified judges using standardized criteria. Decisions of the judges are final and binding. No appeals or reevaluations will be entertained.
                  </p>
                </div>
              </div>
            </section>

            {/* Fees and Payments */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Fees and Payments</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Entry fees are non-refundable once payment is processed. Fees are calculated per entry and must be paid via approved payment methods. We use secure payment processing through Razorpay. All prices are in Indian Rupees (INR) unless otherwise stated. Taxes may apply depending on your location.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-terracotta" />
                Limitation of Liability
              </h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Pratibha Parishad and its suppliers assume no responsibility for error, omission, interruption, deletion, defect, delay in operation or transmission, communications line failure, theft or destruction or unauthorized access to, or alteration of user communications. We are not responsible for any technical malfunctions or failures of telephone lines, computer systems, servers, or providers, transmission problems, traffic congestion on the internet, or your internet service provider.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Intellectual Property Rights</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of Pratibha Parishad or its content suppliers and is protected by international copyright laws. You may not reproduce or transmit any content without prior written permission.
              </p>
            </section>

            {/* Certificates */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Digital Certificates</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Digital certificates issued by Pratibha Parishad are valid representations of achievement and can be verified through our website. Certificates are non-transferable and remain the property of Pratibha Parishad. Any misuse or fraudulent representation of certificates will result in revocation and legal action.
              </p>
            </section>

            {/* Modifications */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Modifications to Terms</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                Pratibha Parishad reserves the right to modify these terms at any time. We will notify users of material changes by posting the modified terms on our website. Your continued use of the site following the posting of modifications constitutes acceptance of these changes.
              </p>
            </section>

            {/* Governing Law */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-charcoal">Governing Law</h2>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts located in Kolkata, India.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-4 p-6 bg-cream-dark/20 rounded-xl border border-terracotta/10">
              <h2 className="font-serif text-xl font-bold text-charcoal">Questions About These Terms?</h2>
              <p className="font-sans text-sm text-charcoal/70">
                If you have any questions about these terms of use, please contact us:
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
