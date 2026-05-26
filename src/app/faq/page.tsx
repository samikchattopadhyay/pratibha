"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const faqCategories = [
    {
      title: "Submissions & Facebook Groups",
      questions: [
        {
          q: "Why do you use Facebook Groups for video hosting?",
          a: "Hosting video files directly requires expensive server bandwidth and dedicated storage infrastructure. By using our official Facebook Group, we leverage Facebook's free content delivery network, reduce server operating costs, and encourage organic viral sharing as parents share their children's entries."
        },
        {
          q: "How do I get my Facebook post URL?",
          a: "Upload the performance video in our official group. Once posted, click on the three dots (...) at the top right of your post and select 'Copy Link'. Paste this link into our portal when registering."
        },
        {
          q: "My Facebook post link shows validation error. What should I do?",
          a: "Ensure the post is uploaded inside the correct official Facebook Group, and that the privacy setting of your post is set to 'Public' so our examiners can view it. If validation still fails, you can submit the link and select the fallback manual verification option."
        }
      ]
    },
    {
      title: "Payments & Pricing",
      questions: [
        {
          q: "What is the entry fee for competitions?",
          a: "The standard entry fee is ₹50 per participant/category. This helps cover admin costs, judge honorariums, and digital server upkeep. Pricing for international students is $10 USD."
        },
        {
          q: "How do I pay? Is it secure?",
          a: "We integrate with Razorpay, India's leading secure payment gateway. You can pay using UPI (GPay, PhonePe), credit/debit cards, or net banking. All payment info is encrypted."
        },
        {
          q: "Can I get a refund if I change my mind?",
          a: "Once an entry is successfully validated and queued for judging, we are unable to process refunds as resources and examiner hours are pre-allocated."
        }
      ]
    },
    {
      title: "Judging & Results",
      questions: [
        {
          q: "How does the blind judging system work?",
          a: "To ensure absolute fairness, we hide participant names, parents' profiles, and locations from our judges. Judges are presented only with the performance video, category, age group, and a scoring form with sliders for Technique, Expression, and Rhythm."
        },
        {
          q: "What is the formula for calculating results?",
          a: "We calculate the final score using a weighted average: 70% from the official examiner evaluation, and 30% from the public engagement metrics (likes, comments, shares) compiled from the Facebook post. This balances professional technical quality with community support."
        },
        {
          q: "Who are the judges?",
          a: "Our panel consists of independent academic scholars, renowned artists, and certified teachers from institutions like Rabindra Bharati University and Prayag Sangeet Samiti."
        }
      ]
    },
    {
      title: "Certificates & Physical Prizes",
      questions: [
        {
          q: "When and how will I receive my certificate?",
          a: "Once results are officially calculated and published, your digital certificate will be compiled as a PDF. You will receive an automated WhatsApp notification and email containing the secure download link."
        },
        {
          q: "What is the QR Code verification portal?",
          a: "Every certificate has a unique serial number and QR code. Anyone (schools, organizations, teachers) scanning the QR code is redirected to verify.pratibhaparishad.org/verify/[certificateId], showing live verification of the student's achievement."
        },
        {
          q: "How do I upgrade to a physical medal or trophy?",
          a: "After results are published, parents of participants can log into their dashboard and request a physical award upgrade. You only pay for the custom trophy packaging and Shiprocket courier charges."
        }
      ]
    }
  ];

  // Track which questions are expanded
  // Key format: categoryIdx-questionIdx
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (catIdx: number, qIdx: number) => {
    const key = `${catIdx}-${qIdx}`;
    setExpandedKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-cream py-16 alpana-pattern">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Title Section */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl font-bold text-charcoal flex flex-col sm:flex-row items-center justify-center gap-3">
              <HelpCircle className="w-10 h-10 text-terracotta" /> Help & <span className="text-terracotta">FAQs</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80">
              Find answers to commonly asked questions about video submissions, payments, judging workflows, and awards.
            </p>
            <div className="w-20 h-1 bg-gold mx-auto rounded-full mt-4" />
          </div>

          {/* Accordion Categories */}
          <div className="space-y-10">
            {faqCategories.map((category, catIdx) => (
              <div key={catIdx} className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-terracotta border-b border-terracotta/10 pb-2">
                  {category.title}
                </h2>
                
                <div className="space-y-3">
                  {category.questions.map((faq, qIdx) => {
                    const key = `${catIdx}-${qIdx}`;
                    const isExpanded = expandedKeys[key];
                    
                    return (
                      <div
                        key={qIdx}
                        className="bg-cream border border-terracotta/5 rounded-xl shadow-sm overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleExpand(catIdx, qIdx)}
                          className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-cream-dark/20 transition-colors duration-200 bg-transparent border-0 font-sans text-sm font-bold text-charcoal rounded-none"
                        >
                          <span className="font-sans text-sm font-bold text-charcoal">
                            {faq.q}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-terracotta shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-terracotta shrink-0" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="p-5 bg-cream-dark/10 border-t border-terracotta/5 font-sans text-base text-charcoal/70 leading-relaxed transition-all duration-300">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
