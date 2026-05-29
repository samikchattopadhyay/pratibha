"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import FormError from "@/components/forms/FormError";
import { entryRegistrationSchema, type EntryRegistrationFormData } from "@/schemas/entries";
import { Video, User, List, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface CompetitionCategory {
  id: string;
  categoryName: string;
  minAge: number;
  maxAge: number;
}

interface Competition {
  id: string;
  title: string;
  entryFeeINR: number;
  bannerUrl?: string | null;
  categories: CompetitionCategory[];
}

// Fallback mock details for simulation
const mockCompetition: Competition = {
  id: "comp-rec-01",
  title: "Borsha Bodhon 2026",
  entryFeeINR: 50.0,
  categories: [
    { id: "cat-1", categoryName: "Bengali Recitation (Ages 4-8)", minAge: 4, maxAge: 8 },
    { id: "cat-2", categoryName: "Bengali Recitation (Ages 9-14)", minAge: 9, maxAge: 14 },
    { id: "cat-3", categoryName: "Singing (Rabindra Sangeet)", minAge: 6, maxAge: 18 }
  ]
};

const mockStudents: Student[] = [
  { id: "s1", name: "Bhaskar Chattopadhyay" },
  { id: "s2", name: "Pooja Chattopadhyay" }
];

function RegisterEntryForm() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const competitionId = searchParams.get("competitionId");

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<{ orderId: string; registrationId: string; amount: number } | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<EntryRegistrationFormData>({
    resolver: zodResolver(entryRegistrationSchema),
    mode: "onBlur",
  });

  const loadRegistrationData = useCallback(async () => {
    setLoading(true);
    try {
      const studentsRes = await fetch("/api/account/dashboard");
      const dashboardData = await studentsRes.json();

      if (!studentsRes.ok) throw new Error(dashboardData.error || "Failed to load details");

      setStudents(dashboardData.students);

      // Fetch competition from database if ID is provided
      if (competitionId) {
        const compRes = await fetch(`/api/competitions?id=${competitionId}`);
        const compData = await compRes.json();
        if (compRes.ok) {
          setCompetition(compData);
          setIsUsingMock(false);
        } else {
          throw new Error(compData.error || "Failed to load competition details");
        }
      } else {
        setCompetition(mockCompetition);
        setIsUsingMock(true);
      }
    } catch (err) {
      console.warn("Loading mock data fallback. Database connection could be unconfigured.", err);
      setStudents(mockStudents);
      setCompetition(mockCompetition);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/register-entry?competitionId=${competitionId}`);
    } else if (sessionStatus === "authenticated") {
      const timer = setTimeout(() => {
        loadRegistrationData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sessionStatus, competitionId, loadRegistrationData, router]);

  const onSubmit = async (data: EntryRegistrationFormData) => {
    if (isUsingMock) {
      setTimeout(() => {
        setSuccess(true);
      }, 1500);
      return;
    }

    try {
      const res = await fetch("/api/registrations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: data.studentId,
          competitionCategoryId: data.categoryId,
          fbPostUrl: data.fbUrl,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError("root", {
          message: responseData.error || "Failed to initiate registration",
        });
      } else {
        triggerRazorpay(responseData.orderId, responseData.registrationId, responseData.amount);
      }
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "Server connection issue. Failed to connect.",
      });
    }
  };

  const handlePaymentSuccess = async () => {
    if (!checkoutDetails) return;
    setPaymentError("");
    setPaymentSubmitting(true);
    const orderId = checkoutDetails.orderId;
    setCheckoutDetails(null);

    try {
      const res = await fetch("/api/registrations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: "pay_sim_" + Math.random().toString(36).slice(2, 9),
          razorpaySignature: "sig_sim_" + Math.random().toString(36).slice(2, 9),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error || "Payment verification failed");
        setPaymentSubmitting(false);
      } else {
        setSuccess(true);
        setPaymentSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Network error. Verification failed.");
      setPaymentSubmitting(false);
    }
  };

  const handlePaymentFailure = async () => {
    if (!checkoutDetails) return;
    setPaymentError("Payment simulation failed or cancelled by user");
    const orderId = checkoutDetails.orderId;
    setCheckoutDetails(null);
    setPaymentSubmitting(true);

    try {
      await fetch("/api/registrations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpayOrderId: orderId }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const triggerRazorpay = (orderId: string, registrationId: string, amount: number) => {
    setCheckoutDetails({ orderId, registrationId, amount });
  };

  if (sessionStatus === "loading" || loading) {
    return <Loading variant="screen" text="Loading registration form..." />;
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream dark:bg-charcoal py-16 alpana-pattern">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
            
            {/* Top Mini Banner Graphic */}
            <div className="relative w-full h-32 overflow-hidden bg-charcoal/10 border-b border-terracotta/10 dark:border-terracotta/20 shrink-0">
              <img
                src={competition?.bannerUrl || "/images/general.jpg"}
                alt=""
                className="w-full h-full object-cover filter brightness-[0.75] dark:brightness-[0.55]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="p-5 sm:p-8">
              {success ? (
                <div className="text-center space-y-6 py-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-cream">Registration Success!</h2>
                    <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70 max-w-sm mx-auto leading-relaxed">
                      Your entry has been registered successfully. We have queued your Facebook video for examiner evaluation.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-terracotta/5 flex flex-col gap-3">
                    <Button
                      onClick={() => router.push("/account/dashboard")}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      Go to Parent Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setSuccess(false);
                        reset();
                      }}
                      variant="outline"
                      size="md"
                      className="w-full"
                    >
                      Register Another Entry
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2 mb-8">
                    <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
                      Register <span className="text-terracotta dark:text-gold">Entry</span>
                    </h1>
                    <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
                      {competition?.title}
                    </p>
                  </div>

                  {errors.root && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-sm font-sans flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{errors.root.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-sans text-sm">
                    {/* Select Student */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-terracotta" /> Select Student (Child)
                      </label>
                      {students.length === 0 ? (
                        <div className="p-3 bg-cream border border-dashed border-terracotta/20 rounded-lg text-center text-sm text-charcoal/50">
                          No students registered. Please add a student in your{" "}
                          <a href="/account/dashboard" className="text-terracotta font-bold underline">Dashboard</a> first.
                        </div>
                      ) : (
                        <>
                          <select
                            {...register("studentId")}
                            className={`w-full bg-white dark:bg-charcoal-light border rounded-lg px-3 py-2.5 text-charcoal dark:text-cream focus:outline-none transition-colors ${
                              errors.studentId
                                ? "border-red-300 focus:border-red-400"
                                : "border-charcoal/10 dark:border-terracotta/30 focus:border-terracotta dark:focus:border-gold"
                            }`}
                          >
                            <option value="">-- Choose Student profile --</option>
                            {students.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          {errors.studentId && <FormError error={errors.studentId.message} />}
                        </>
                      )}
                    </div>

                    {/* Select Category */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase flex items-center gap-1.5">
                        <List className="w-3.5 h-3.5 text-terracotta" /> Select Division Category
                      </label>
                      <>
                        <select
                          {...register("categoryId")}
                          className={`w-full bg-white dark:bg-charcoal-light border rounded-lg px-3 py-2.5 text-charcoal dark:text-cream focus:outline-none transition-colors ${
                            errors.categoryId
                              ? "border-red-300 focus:border-red-400"
                              : "border-charcoal/10 dark:border-terracotta/30 focus:border-terracotta dark:focus:border-gold"
                          }`}
                        >
                          <option value="">-- Choose Fine Arts Division --</option>
                          {competition?.categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.categoryName}
                            </option>
                          ))}
                        </select>
                        {errors.categoryId && <FormError error={errors.categoryId.message} />}
                      </>
                    </div>

                    {/* Paste Facebook URL */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-terracotta" /> Facebook Video Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.facebook.com/groups/id/posts/id"
                        className={`w-full bg-white dark:bg-charcoal-light border rounded-lg px-3 py-2.5 text-charcoal dark:text-cream focus:outline-none transition-colors ${
                          errors.fbUrl
                            ? "border-red-300 focus:border-red-400"
                            : "border-charcoal/10 dark:border-terracotta/30 focus:border-terracotta dark:focus:border-gold"
                        }`}
                        {...register("fbUrl")}
                      />
                      {errors.fbUrl && <FormError error={errors.fbUrl.message} />}
                      <p className="text-sm text-charcoal/50 dark:text-cream/50 leading-relaxed">
                        Make sure you upload your child&apos;s video inside our Facebook Group and set the privacy setting of the post to public. Copy and paste the post link here.
                      </p>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-cream-dark/20 dark:bg-charcoal/40 border border-terracotta/5 dark:border-terracotta/10 rounded-xl p-5 flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-charcoal dark:text-cream">Competition Entry Fee</h4>
                        <p className="text-sm text-charcoal/50 dark:text-cream/50 font-sans">Includes digital certificates with QR validation</p>
                      </div>
                      <span className="font-serif text-xl font-bold text-terracotta dark:text-gold">₹{competition?.entryFeeINR}.00</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || students.length === 0}
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Processing Checkout...</span>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Proceed to Pay (₹{competition?.entryFeeINR})</span>
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* MOCK CHECKOUT MODAL */}
      {checkoutDetails && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-cream dark:bg-charcoal-light rounded-2xl p-6 shadow-2xl space-y-6 text-charcoal dark:text-cream border border-terracotta/20">
            <div className="flex justify-between items-center border-b border-terracotta/10 pb-3">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-terracotta dark:text-gold" />
                Secure Payment Checkout
              </h3>
              <button
                onClick={() => { setCheckoutDetails(null); setPaymentSubmitting(false); }}
                className="text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-cream-dark/10 dark:bg-charcoal p-4 rounded-xl text-sm border border-terracotta/5">
              <div className="flex justify-between">
                <span className="text-charcoal/50 dark:text-cream/50">Merchant</span>
                <span className="font-semibold text-terracotta dark:text-gold">Pratibha Parishad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50 dark:text-cream/50">Registration ID</span>
                <span className="font-mono text-xs">{checkoutDetails.registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50 dark:text-cream/50">Order ID</span>
                <span className="font-mono text-xs text-charcoal/70 dark:text-cream/70">{checkoutDetails.orderId}</span>
              </div>
              <div className="flex justify-between border-t border-terracotta/10 pt-2 mt-2">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-terracotta dark:text-gold text-base">₹{checkoutDetails.amount}.00</span>
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-400 leading-relaxed">
              <strong>Razorpay Simulation Mode:</strong> Since live gateway credentials are not configured in this sandbox environment, you can complete the flow by choosing either outcome below to verify database status tracking.
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                onClick={handlePaymentSuccess}
                variant="primary"
                size="md"
                className="w-full bg-green-600 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600"
              >
                Simulate Successful Payment
              </Button>
              <Button
                onClick={handlePaymentFailure}
                variant="outline"
                size="md"
                className="w-full border-red-500/30 text-red-700 dark:text-red-400 hover:border-red-500"
              >
                Simulate Failed Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function RegisterEntryPage() {
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <RegisterEntryForm />
    </Suspense>
  );
}
