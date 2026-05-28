"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { User, Users, FileText, Plus, LogOut, Award, Clock } from "lucide-react";
import AddStudentWizard from "@/components/parent/AddStudentWizard";

interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  disciplineInterests?: string[];
}

interface Registration {
  id: string;
  studentId: string;
  studentName: string;
  competitionTitle: string;
  categoryName: string;
  fbPostUrl: string;
  paymentStatus: string;
  registrationId: string;
  status: string;
  certificate: {
    id: string;
    certificateId: string;
    certificateUrl: string;
  } | null;
}

interface ParentType {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  preferredState?: string | null;
}


function ParentDashboardContent() {
  const { status: sessionStatus, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") || "students") as "students" | "entries";
  const selectedStudentId = searchParams.get("student") || null;

  const activeTab = tabFromUrl;
  const [isValidRole, setIsValidRole] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (sessionStatus === "authenticated" && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole === "PARENT") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsValidRole(true);
      } else {
        router.push(userRole === "SUPER_ADMIN" || userRole === "MODERATOR" ? "/admin" : "/judge/dashboard");
      }
    }
  }, [sessionStatus, session, router]);

  const handleTabChange = (tab: "students" | "entries") => {
    router.push(`/parent/dashboard?tab=${tab}`);
  };

  const [parent, setParent] = useState<ParentType | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; grouping: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState<{
    name: string;
    dateOfBirth: string;
    gender: string;
    disciplineInterests: string[];
  }>({ name: "", dateOfBirth: "", gender: "Male", disciplineInterests: [] });
  const [modalError, setModalError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parent/dashboard");
      const data = await res.json();

      if (!res.ok) {
        // If setup is required, generate token and redirect to onboarding
        if (data.code === "SETUP_REQUIRED") {
          const tokenRes = await fetch("/api/parent/generate-setup-token", {
            method: "POST",
          });
          const tokenData = await tokenRes.json();
          if (tokenData.token) {
            router.push(`/onboarding?token=${tokenData.token}`);
          } else {
            throw new Error("Failed to generate setup link");
          }
          return;
        }
        throw new Error(data.error || "Failed to load dashboard details");
      }

      setParent(data.parent);
      setStudents(data.students);
      setRegistrations(data.registrations);
      setCategories(data.categories || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard";
      console.error("Dashboard error:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isValidRole && sessionStatus === "authenticated") {
      Promise.resolve().then(() => {
        fetchDashboardData();
      });
    }
  }, [isValidRole, sessionStatus, fetchDashboardData]);

  const handleDisciplineToggle = (name: string) => {
    setStudentForm(prev => {
      const exists = prev.disciplineInterests.includes(name);
      return {
        ...prev,
        disciplineInterests: exists
          ? prev.disciplineInterests.filter(d => d !== name)
          : [...prev.disciplineInterests, name]
      };
    });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setIsAdding(true);

    try {
      const res = await fetch("/api/parent/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Failed to add student profile");
      } else {
        setIsModalOpen(false);
        setStudentForm({ name: "", dateOfBirth: "", gender: "Male", disciplineInterests: [] });
        fetchDashboardData(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      setModalError("Server communication failed.");
    } finally {
      setIsAdding(false);
    }
  };

  const calculateAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (sessionStatus === "loading" || !isValidRole || loading) {
    return <Loading variant="screen" text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-500/10 border border-red-300 dark:border-red-700 rounded-xl p-6 text-red-800 dark:text-red-200">
              <h2 className="font-bold text-lg mb-2">Error Loading Dashboard</h2>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <>
            {/* Profile Overview Header & Dashboard Content */}
              <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-terracotta dark:bg-gold text-cream dark:text-charcoal flex items-center justify-center shadow">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-charcoal dark:text-cream">{parent?.name}</h1>
                    <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">Registered Parent | Phone: {parent?.phone}</p>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    variant="outline"
                    size="md"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Address / details */}
            <div className="lg:col-span-4 bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/5 dark:border-terracotta/10 pb-2">
                Address Details
              </h3>
              
              <div className="font-sans text-sm text-charcoal/80 dark:text-cream-dark space-y-3">
                <div>
                  <span className="text-sm text-charcoal/40 dark:text-cream/40 uppercase block font-bold">Street</span>
                  <span className="font-medium">{parent?.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-charcoal/40 dark:text-cream/40 uppercase block font-bold">City</span>
                    <span className="font-medium">{parent?.city}</span>
                  </div>
                  <div>
                    <span className="text-sm text-charcoal/40 dark:text-cream/40 uppercase block font-bold">State</span>
                    <span className="font-medium">{parent?.state}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-charcoal/40 dark:text-cream/40 uppercase block font-bold">PIN Code</span>
                    <span className="font-medium">{parent?.postalCode}</span>
                  </div>
                  <div>
                    <span className="text-sm text-charcoal/40 dark:text-cream/40 uppercase block font-bold">Preferred State</span>
                    <span className="font-medium text-terracotta dark:text-gold font-bold">{parent?.preferredState || parent?.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Students / Registrations Tabs */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Tab toggler */}
              <div className="flex border-b border-terracotta/10 dark:border-terracotta/20">
                <Button
                  onClick={() => handleTabChange("students")}
                  variant="ghost"
                  size="md"
                  className={`flex items-center gap-2 px-6 py-3.5 min-h-[44px] border-b-2 transition-colors duration-250 ${
                    activeTab === "students"
                      ? "border-terracotta dark:border-gold text-terracotta dark:text-gold"
                      : "border-transparent text-charcoal/60 dark:text-cream/60"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  My Students ({students.length})
                </Button>
                <Button
                  onClick={() => handleTabChange("entries")}
                  variant="ghost"
                  size="md"
                  className={`flex items-center gap-2 px-6 py-3.5 min-h-[44px] border-b-2 transition-colors duration-250 ${
                    activeTab === "entries"
                      ? "border-terracotta dark:border-gold text-terracotta dark:text-gold"
                      : "border-transparent text-charcoal/60 dark:text-cream/60"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Competition Entries ({registrations.length})
                </Button>
              </div>

              {/* TAB CONTENT: STUDENTS */}
              {activeTab === "students" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">Student Profiles</h3>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      variant="primary"
                      size="md"
                    >
                      <Plus className="w-4 h-4" /> Add Student
                    </Button>
                  </div>

                  {students.length === 0 ? (
                    <div className="bg-cream dark:bg-charcoal-light border border-dashed border-terracotta/20 rounded-2xl p-12 text-center text-charcoal/50 dark:text-cream/50 font-sans text-sm">
                      No student profiles registered yet. Add a profile above to begin entering competitions.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.map((student) => (
                        <div key={student.id} className="bg-cream dark:bg-charcoal-light border border-terracotta/5 dark:border-terracotta/10 rounded-xl p-5 shadow-sm hover:border-terracotta/20 dark:hover:border-terracotta/30 hover:shadow-md transition-all duration-250 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="cursor-pointer flex-1" onClick={() => router.push(`/parent/dashboard?tab=entries&student=${student.id}`)}>
                              <h4 className="font-sans text-base font-bold text-charcoal dark:text-cream hover:text-terracotta dark:hover:text-gold transition-colors">{student.name}</h4>
                              <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 mt-0.5">
                                {student.gender} | Age: {calculateAge(student.dateOfBirth)} years old
                              </p>
                              {student.disciplineInterests && student.disciplineInterests.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {student.disciplineInterests.map((interest) => (
                                    <span key={interest} className="inline-block px-2 py-0.5 text-sm font-sans font-semibold rounded bg-terracotta/10 text-terracotta dark:bg-gold/15 dark:text-gold">
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="w-8 h-8 rounded-full bg-gold/10 dark:bg-gold/20 text-gold-dark dark:text-gold flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {student.name.charAt(0)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-terracotta/5 dark:border-terracotta/10">
                            <Link href={`/parent/students/${student.id}`} className="text-xs font-bold text-terracotta dark:text-gold hover:underline flex items-center gap-1">
                              ✏️ Edit Profile
                            </Link>
                            <Link href={`/student/${student.id}`} className="text-xs font-bold text-charcoal/60 dark:text-cream/60 hover:underline flex items-center gap-1">
                              🌐 Public Profile
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: ENTRIES */}
              {activeTab === "entries" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
                        Registered Entries
                        {selectedStudentId && students.find(s => s.id === selectedStudentId) && (
                          <span className="text-terracotta dark:text-gold text-lg"> — {students.find(s => s.id === selectedStudentId)?.name}</span>
                        )}
                      </h3>
                      {selectedStudentId && (
                        <button
                          onClick={() => router.push("/parent/dashboard?tab=entries")}
                          className="mt-2 text-sm text-terracotta dark:text-gold hover:underline font-semibold"
                        >
                          ✕ Clear filter
                        </button>
                      )}
                    </div>
                    <Link
                      href="/competitions"
                      className="inline-flex"
                    >
                      <Button
                        variant="primary"
                        size="md"
                      >
                        <Plus className="w-4 h-4" /> Register New Entry
                      </Button>
                    </Link>
                  </div>

                  {(() => {
                    const filteredEntries = selectedStudentId
                      ? registrations.filter(reg => reg.studentId === selectedStudentId)
                      : registrations;

                    return filteredEntries.length === 0 ? (
                      <div className="bg-cream dark:bg-charcoal-light border border-dashed border-terracotta/20 rounded-2xl p-12 text-center text-charcoal/50 dark:text-cream/50 font-sans text-sm">
                        {selectedStudentId ? "No competition entries for this student yet." : "No competition entries submitted yet. Visit the competitions catalog to enter."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredEntries.map((reg) => (
                        <div key={reg.id} className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <span className="font-sans text-sm uppercase font-bold tracking-wider text-terracotta/60 dark:text-gold/60 block">
                                Roll No: {reg.registrationId}
                              </span>
                              <h4 className="font-serif text-base font-bold text-charcoal dark:text-cream leading-tight">
                                {reg.competitionTitle} — {reg.categoryName}
                              </h4>
                              <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 mt-1">
                                Participant: <strong className="text-charcoal/80 dark:text-cream-dark">{reg.studentName}</strong>
                              </p>
                            </div>

                            {/* Status badges */}
                            <div className="flex flex-wrap gap-2">
                              {reg.paymentStatus === "SUCCESS" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 font-sans text-sm font-bold uppercase">
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 font-sans text-sm font-bold uppercase">
                                  Payment Unpaid
                                </span>
                              )}

                              {reg.status === "VERIFIED" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 font-sans text-sm font-bold uppercase">
                                  Verified
                                </span>
                              )}
                              {reg.status === "PENDING_VERIFICATION" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-sans text-sm font-bold uppercase">
                                  Moderation Queue
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details & Actions */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-terracotta/5 dark:border-terracotta/10 text-sm font-sans">
                            <div className="text-charcoal/50 dark:text-cream/50">
                              FB Video: <a href={reg.fbPostUrl} target="_blank" rel="noopener noreferrer" className="text-terracotta dark:text-gold font-semibold hover:underline truncate">{reg.fbPostUrl}</a>
                            </div>

                            <div className="flex items-center gap-3">
                              <Link
                                href={`/parent/entries/${reg.id}?student=${reg.studentId}`}
                                className="inline-flex items-center gap-1 text-terracotta dark:text-gold hover:text-terracotta-light dark:hover:text-gold-light font-bold uppercase tracking-wider"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Details
                              </Link>

                              {reg.certificate && (
                                <Link
                                  href={`/verify/${reg.certificate.certificateId}`}
                                  className="inline-flex items-center gap-1 text-terracotta dark:text-gold hover:text-terracotta-light dark:hover:text-gold-light font-bold uppercase tracking-wider"
                                >
                                  <Award className="w-3.5 h-3.5" /> View Certificate
                                </Link>
                              )}
                              {!reg.certificate && reg.paymentStatus === "SUCCESS" && (
                                <span className="text-charcoal/40 dark:text-cream/40 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gold-dark dark:text-gold" /> Score Evaluation Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>
            </>
        </div>
      </main>

      {/* MODAL: ADD STUDENT */}
      <AddStudentWizard
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(id) => {
          setIsModalOpen(false);
          fetchDashboardData();
        }}
        categories={categories}
      />

      <Footer />
    </>
  );
}

export default function ParentDashboard() {
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <ParentDashboardContent />
    </Suspense>
  );
}
