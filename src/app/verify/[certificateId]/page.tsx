import prisma from "@/lib/db";
import Link from "next/link";
import QRCode from "qrcode";
import CertificateHeader from "@/components/CertificateDisplay";
import { ShieldAlert, Award } from "lucide-react";
import { Metadata } from "next";

// Dynamic route data fetching
async function getCertificateDetails(certId: string) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId: certId },
      include: {
        registration: {
          include: {
            student: true,
            competitionCategory: {
              include: {
                competition: true,
                category: true,
              },
            },
          },
        },
      },
    });
    return certificate;
  } catch (error) {
    console.warn("DB check failed for certificate, using sandbox mock fallback:", error);
    return null;
  }
}

// Fallback mock details for demonstration
const mockCertificateData = {
  certificateId: "CERT-PP-9901-2940",
  type: "MERIT_1", // 1st Place
  issuedAt: new Date("2026-05-24"),
  registration: {
    registrationId: "PP-2026-REC-0021",
    student: {
      name: "Bhaskar Chattopadhyay",
    },
    competitionCategory: {
      competition: {
        title: "Borsha Bodhon 2026",
      },
      category: {
        name: "Bengali Recitation",
      },
    },
  },
};

interface CertDataDetails {
  certificateId: string;
  type: string;
  issuedAt: Date;
  registration: {
    registrationId: string;
    student: {
      name: string;
    };
    competitionCategory: {
      competition: {
        title: string;
      };
      category: {
        name: string;
      };
    };
  };
}

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const certIdDecoded = decodeURIComponent(certificateId);

  const certData = await getCertificateDetails(certIdDecoded);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const certificateUrl = `${baseUrl}/verify/${encodeURIComponent(certIdDecoded)}`;

  if (!certData) {
    return {
      title: "Certificate Verification | Pratibha Parishad",
      description: "Verify the authenticity of your Pratibha Parishad certificate.",
      openGraph: {
        title: "Certificate Verification | Pratibha Parishad",
        description: "Verify the authenticity of your Pratibha Parishad certificate.",
        url: certificateUrl,
        type: "website",
      },
    };
  }

  const studentName = certData.registration.student.name;
  const competitionTitle = certData.registration.competitionCategory.competition.title;
  const categoryName = certData.registration.competitionCategory.category.name;
  const awardTitle = getAwardTitleForMetadata(certData.type);

  return {
    title: `${studentName}'s Certificate | Pratibha Parishad`,
    description: `${studentName} earned a ${awardTitle} in ${categoryName} at ${competitionTitle}. Verify this achievement on Pratibha Parishad.`,
    openGraph: {
      title: `🎓 ${studentName} - ${awardTitle}`,
      description: `${studentName} earned a ${awardTitle} in ${categoryName} at ${competitionTitle}. Verify this fine arts achievement!`,
      url: certificateUrl,
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/pp-certificate-og.png`,
          width: 1200,
          height: 630,
          alt: `${studentName}'s Certificate from Pratibha Parishad`,
        },
      ],
    },
  };
}

function getAwardTitleForMetadata(type: string): string {
  switch (type) {
    case "MERIT_1":
      return "Certificate of Merit - 1st Place";
    case "MERIT_2":
      return "Certificate of Merit - 2nd Place";
    case "MERIT_3":
      return "Certificate of Merit - 3rd Place";
    case "SPECIAL_MENTION":
      return "Special Mention Certificate";
    default:
      return "Certificate of Participation";
  }
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificateId } = await params;
  const certIdDecoded = decodeURIComponent(certificateId);

  // 1. Fetch certificate from database
  let certData: CertDataDetails | null = (await getCertificateDetails(certIdDecoded)) as unknown as CertDataDetails | null;
  let isDemo = false;

  // 2. Fall back to mock if not found in DB
  if (!certData) {
    if (certIdDecoded === "CERT-PP-9901-2940" || certIdDecoded.startsWith("CERT-")) {
      certData = mockCertificateData;
      isDemo = true;
    }
  }

  // 3. Generate QR code
  let qrCodeDataUrl = "";
  if (certData) {
    try {
      const origin = process.env.NEXT_PUBLIC_API_URL || `http://localhost:3000`;
      const verifyUrl = `${origin}/verify/${encodeURIComponent(certData.certificateId)}`;
      qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });
    } catch (qrErr) {
      console.error("Failed to generate QR code:", qrErr);
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getAwardTitle = (type: string) => {
    switch (type) {
      case "MERIT_1":
        return "Certificate of Merit - 1st Place";
      case "MERIT_2":
        return "Certificate of Merit - 2nd Place";
      case "MERIT_3":
        return "Certificate of Merit - 3rd Place";
      case "SPECIAL_MENTION":
        return "Special Mention Certificate";
      default:
        return "Certificate of Participation";
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      {/* Share Header (Client Component) */}
      {certData && <CertificateHeader certificateId={certData.certificateId} isDemo={isDemo} />}

      {/* Invalid Certificate Notice */}
      {!certData && (
        <div className="bg-red-500/10 border-b border-red-500/20 py-3 px-6 print:hidden">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-400 text-sm font-bold">
            <ShieldAlert className="w-4 h-4" /> Unverified Serial Number
          </div>
        </div>
      )}

      {/* Main Certificate Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12">
        {!certData ? (
          <div className="max-w-md w-full bg-cream border border-terracotta/20 rounded-2xl p-8 text-center space-y-6 shadow-xl">
            <ShieldAlert className="w-16 h-16 text-terracotta mx-auto animate-bounce" />
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-charcoal">Invalid Certificate ID</h1>
              <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                The certificate serial number <strong>&quot;{certificateId}&quot;</strong> does not match any official credentials issued by the council database.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-full justify-center py-3 bg-charcoal text-cream font-bold rounded-xl text-sm"
            >
              Back to Homepage
            </Link>
          </div>
        ) : (
          /* High-Fidelity Printable Traditional Certificate Frame */
          <div className="max-w-4xl w-full bg-cream border-[16px] border-double border-terracotta rounded-lg p-8 sm:p-16 relative shadow-2xl overflow-hidden print:border-[10px] print:shadow-none print:my-0">
            {/* Traditional Corner Accents using background-image details or decorative elements */}
            <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-gold-dark" />
            <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-gold-dark" />
            <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-gold-dark" />
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-gold-dark" />

            <div className="flex flex-col items-center text-center space-y-6">
              
              {/* Emblem Logo */}
              <div className="w-16 h-16 rounded-full bg-terracotta text-gold flex items-center justify-center shadow-md">
                <Award className="w-9 h-9" />
              </div>

              {/* Council Title */}
              <div className="space-y-1">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-terracotta tracking-wider">
                  प्रतिभा परिषद
                </h2>
                <h3 className="font-sans text-sm font-bold tracking-widest text-charcoal/80 uppercase">
                  Pratibha Parishad Council for Indian Fine Arts
                </h3>
              </div>

              {/* Award Type Banner */}
              <div className="py-2.5 px-8 bg-gold/10 border-y border-gold/30 w-full max-w-xl">
                <h4 className="font-serif text-xl sm:text-2xl font-semibold text-gold-dark tracking-wide italic">
                  {getAwardTitle(certData.type)}
                </h4>
              </div>

              {/* Certificate Text details */}
              <div className="space-y-4 max-w-2xl text-charcoal leading-relaxed">
                <p className="font-sans text-sm tracking-wide italic">This is to certify that</p>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal underline decoration-gold decoration-2 underline-offset-4">
                  {certData.registration.student.name}
                </h1>
                <p className="font-sans text-sm leading-relaxed px-4">
                  has successfully participated in the fine arts division of{" "}
                  <strong>{certData.registration.competitionCategory.category.name}</strong> at the online cultural competition{" "}
                  <strong>{certData.registration.competitionCategory.competition.title}</strong>, earning verified credentials for performance submission under Roll ID{" "}
                  <strong>{certData.registration.registrationId}</strong>.
                </p>
              </div>

              {/* Signatures and QR Verification Block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-end w-full pt-10 border-t border-terracotta/10 mt-6">
                
                {/* Board signature 1 */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-serif text-sm font-bold italic text-charcoal/70">Swapna Sen</div>
                  <div className="w-32 h-[1px] bg-charcoal/20" />
                  <div className="text-sm text-charcoal/40 font-bold uppercase">Academic Examiner</div>
                </div>

                {/* QR code verification emblem */}
                <div className="flex flex-col items-center space-y-2">
                  {qrCodeDataUrl && (
                    <img
                      src={qrCodeDataUrl}
                      alt="Verify QR Code"
                      width={100}
                      height={100}
                      className="border border-charcoal/10 rounded p-1"
                    />
                  )}
                  <span className="text-sm font-mono text-charcoal/40 font-bold uppercase">
                    ID: {certData.certificateId}
                  </span>
                </div>

                {/* Board signature 2 */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-serif text-sm font-bold italic text-charcoal/70">A. Chattopadhyay</div>
                  <div className="w-32 h-[1px] bg-charcoal/20" />
                  <div className="text-sm text-charcoal/40 font-bold uppercase">Registrar of Council</div>
                </div>

              </div>

              {/* Date Issued */}
              <div className="text-sm text-charcoal/40 font-sans font-semibold uppercase tracking-wider">
                Issued on: {formatDate(certData.issuedAt)}
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
