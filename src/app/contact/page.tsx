"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import Button from "@/components/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/schemas/admin";
import FormError from "@/components/forms/FormError";

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const onSubmit = async (_data: ContactFormData) => {
    setStatus("submitting");
    
    // Simulate API delay
    setTimeout(() => {
      setStatus("success");
      reset();
    }, 1200);
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-cream py-16 alpana-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Title Section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold text-charcoal">
              Contact <span className="text-terracotta">Our Operations</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80">
              Have questions regarding competition rules, payment failures, or physical medal shipments? Get in touch with our Kolkata operations desk.
            </p>
            <div className="w-20 h-1 bg-gold mx-auto rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Information panel */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-cream border border-terracotta/10 rounded-2xl p-5 sm:p-8 shadow-md space-y-6">
                <h3 className="font-serif text-xl font-bold text-charcoal border-b border-terracotta/10 pb-3">
                  Reach Out Directly
                </h3>
                
                <div className="space-y-4 font-sans text-sm text-charcoal/80">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal">Email Support</h4>
                      <p className="text-sm text-charcoal/60 mt-0.5">For queries on certifications and logistics</p>
                      <a href="mailto:support@pratibhaparishad.org" className="font-semibold text-terracotta mt-1 block hover:underline">support@pratibhaparishad.org</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal">Operations Phone</h4>
                      <p className="text-sm text-charcoal/60 mt-0.5">Mon to Sat (10:00 AM - 6:00 PM)</p>
                      <a href="tel:+919830012345" className="font-semibold text-terracotta mt-1 block hover:underline">+91 98300 12345 / +91 33 2410 9999</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal">Logistics Hub</h4>
                      <p className="text-sm text-charcoal/60 mt-0.5">Physical award packing & courier origin</p>
                      <p className="mt-1 leading-relaxed">
                        Pratibha Parishad Council, Gariahat Road, Kolkata, West Bengal - 700019, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info card */}
              <div className="bg-cream-dark/30 border border-terracotta/5 rounded-2xl p-6 flex gap-4 items-center">
                <MessageSquare className="w-8 h-8 text-gold-dark shrink-0" />
                <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                  <strong>Looking to participate?</strong> Please check active contest schedules in the <Link href="/competitions" className="text-terracotta font-semibold hover:underline">Competitions page</Link> before submitting a query.
                </p>
              </div>
            </div>

            {/* Interactive Form Panel */}
            <div className="lg:col-span-7 bg-cream border border-terracotta/10 rounded-2xl p-5 sm:p-8 shadow-md">
              <h3 className="font-serif text-xl font-bold text-charcoal border-b border-terracotta/10 pb-3 mb-6">
                Send an Inquiry
              </h3>
              
              {status === "success" ? (
                <div className="bg-green-500/10 text-green-800 border border-green-200 rounded-xl p-6 text-center space-y-3">
                  <h4 className="font-sans text-base font-bold">Query Submitted Successfully!</h4>
                  <p className="font-sans text-sm text-green-700">
                    Thank you for contacting us. Our operations team in Kolkata will review your query and respond via email or WhatsApp within 24 to 48 hours.
                  </p>
                  <Button
                    onClick={() => setStatus("idle")}
                    variant="primary"
                    size="md"
                    className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Your Name</label>
                      <input
                        type="text"
                        {...register("name")}
                        className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                        placeholder="Avik Sen"
                      />
                      {errors.name && <FormError error={errors.name.message} />}
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Email Address</label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                        placeholder="avik@example.com"
                      />
                      {errors.email && <FormError error={errors.email.message} />}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Subject</label>
                    <input
                      type="text"
                      {...register("subject")}
                      className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="Payment issue / Certificate correction / Partnership request"
                    />
                    {errors.subject && <FormError error={errors.subject.message} />}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Message</label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className="w-full font-sans text-sm bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors resize-none"
                      placeholder="Please describe your query in detail..."
                    />
                    {errors.message && <FormError error={errors.message.message} />}
                  </div>

                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={status === "submitting"}
                  >
                    {status === "submitting" ? (
                      <span>Sending Query...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Query</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
