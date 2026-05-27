"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { User, Users, FileText, Plus, LogOut, Award, Clock, AlertTriangle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  disciplineInterests?: string[];
}

interface Registration {
  id: string;
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
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  preferredState?: string | null;
}

// Visual mock data for testing or when database is empty
const mockParent = {
  name: "Avik Chattopadhyay",
  phone: "9830098300",
  address: "12/A Gariahat Road",
  city: "Kolkata",
  state: "West Bengal",
  postalCode: "700019",
  country: "India"
};

const mockStudents = [
  { id: "s1", name: "Bhaskar Chattopadhyay", dateOfBirth: "2015-05-12T00:00:00.000Z", gender: "Male" },
  { id: "s2", name: "Pooja Chattopadhyay", dateOfBirth: "2018-09-24T00:00:00.000Z", gender: "Female" }
];

const mockRegistrations = [
  {
    id: "r1",
    studentName: "Bhaskar Chattopadhyay",
    competitionTitle: "Borsha Bodhon 2026",
    categoryName: "Bengali Recitation",
    fbPostUrl: "https://facebook.com/groups/pratibha/posts/12345",
    paymentStatus: "SUCCESS",
    registrationId: "PP-2026-REC-0021",
    status: "VERIFIED",
    certificate: {
      id: "c1",
      certificateId: "CERT-PP-9901-2940",
      certificateUrl: "#"
    }
  },
  {
    id: "r2",
    studentName: "Pooja Chattopadhyay",
    competitionTitle: "Chitra Kala 2026",
    categoryName: "Drawing",
    fbPostUrl: "https://facebook.com/groups/pratibha/posts/54321",
    paymentStatus: "PENDING",
    registrationId: "PP-2026-ART-0098",
    status: "PENDING_VERIFICATION",
    certificate: null
  }
];

function ParentDashboardContent() {
  const { status: sessionStatus, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") || "students") as "students" | "entries";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState<{
    name: string;
    dateOfBirth: string;
    gender: string;
    disciplineInterests: string[];
  }>({ name: "", dateOfBirth: "", gender: "Male", disciplineInterests: [] });
  const [modalError, setModalError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/dashboard");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to load dashboard details");
      }
      
      setParent(data.parent);
      setStudents(data.students);
      setRegistrations(data.registrations);
      setCategories(data.categories || []);
      setIsUsingMock(false);
    } catch (err) {
      console.warn("Loading mock data fallback. Database connection could be unconfigured.", err);
      // Fail gracefully: load mock details for simulation
      setParent({ ...mockParent, preferredState: "West Bengal" });
      setStudents(mockStudents);
      setRegistrations(mockRegistrations);
      setCategories([
        { id: "c1", name: "Bengali Recitation", grouping: "PERFORMING_ARTS" },
        { id: "c2", name: "Drawing", grouping: "VISUAL_ARTS" },
        { id: "c3", name: "Singing", grouping: "PERFORMING_ARTS" }
      ]);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

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

    if (isUsingMock) {
      // Simulate adding locally
      const newStudent: Student = {
        id: "mock-" + Math.random().toString(),
        name: studentForm.name,
        dateOfBirth: studentForm.dateOfBirth,
        gender: studentForm.gender,
        disciplineInterests: studentForm.disciplineInterests
      };
      setStudents(prev => [...prev, newStudent]);
      setIsModalOpen(false);
      setStudentForm({ name: "", dateOfBirth: "", gender: "Male", disciplineInterests: [] });
      setIsAdding(false);
      return;
    }

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

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Mock alert indicator */}
          {isUsingMock && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-300 rounded-xl text-yellow-800 text-sm font-sans flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <strong>Preview Sandbox:</strong> Database connection is currently unconfigured. Showing simulated mock dashboard data.
              </span>
              <Button
                onClick={() => setIsUsingMock(false)}
                variant="ghost"
                size="sm"
              >
                Hide
              </Button>
            </div>
          )}

          {/* Profile Overview Header */}
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
                        <div key={student.id} className="bg-cream dark:bg-charcoal-light border border-terracotta/5 dark:border-terracotta/10 rounded-xl p-5 shadow-sm flex justify-between items-start">
                          <div>
                            <h4 className="font-sans text-base font-bold text-charcoal dark:text-cream">{student.name}</h4>
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
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: ENTRIES */}
              {activeTab === "entries" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">Registered Entries</h3>
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

                  {registrations.length === 0 ? (
                    <div className="bg-cream dark:bg-charcoal-light border border-dashed border-terracotta/20 rounded-2xl p-12 text-center text-charcoal/50 dark:text-cream/50 font-sans text-sm">
                      No competition entries submitted yet. Visit the competitions catalog to enter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((reg) => (
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
                            
                            {reg.certificate && (
                              <Link
                                href={`/verify/${reg.certificate.certificateId}`}
                                className="inline-flex items-center gap-1 text-terracotta dark:text-gold hover:text-terracotta-light dark:hover:text-gold-light font-bold uppercase tracking-wider"
                              >
                                <Award className="w-3.5 h-3.5" /> View Verified Certificate
                              </Link>
                            )}
                            {!reg.certificate && reg.paymentStatus === "SUCCESS" && (
                              <span className="text-charcoal/40 dark:text-cream/40 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-gold-dark dark:text-gold" /> Score Evaluation Pending
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* MODAL: ADD STUDENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 dark:bg-charcoal/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-cream dark:bg-charcoal-light rounded-2xl p-6 shadow-2xl space-y-4 relative border border-terracotta/10 dark:border-terracotta/20 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">Add Student Profile</h3>
            
            {modalError && (
              <p className="text-sm font-sans text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-200">{modalError}</p>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4 font-sans text-sm">
              <div className="space-y-1">
                <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase">Student&apos;s Full Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="Bhaskar Chattopadhyay"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={studentForm.dateOfBirth}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase block">Discipline Interests (Select Multiple)</label>
                <div className="max-h-36 overflow-y-auto border border-terracotta/20 dark:border-terracotta/40 rounded-lg p-3 bg-cream dark:bg-charcoal space-y-3">
                  {Array.from(new Set(categories.map(c => c.grouping))).map(group => {
                    const groupCats = categories.filter(c => c.grouping === group);
                    return (
                      <div key={group} className="space-y-1">
                        <span className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider block">
                          {group?.replace("_", " ")}
                        </span>
                        <div className="grid grid-cols-1 gap-2 pl-1">
                          {groupCats.map(cat => (
                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm text-charcoal/80 dark:text-cream-dark">
                              <input
                                type="checkbox"
                                checked={studentForm.disciplineInterests.includes(cat.name)}
                                onChange={() => handleDisciplineToggle(cat.name)}
                                className="rounded text-terracotta focus:ring-terracotta dark:text-gold dark:focus:ring-gold border-charcoal/20 dark:border-cream/20 bg-transparent"
                              />
                              <span>{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {categories.length === 0 && (
                    <span className="text-sm text-charcoal/40 dark:text-cream/40 italic">No categories loaded</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isAdding}
                >
                  {isAdding ? "Saving..." : "Add Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
