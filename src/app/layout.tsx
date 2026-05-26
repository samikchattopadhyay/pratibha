import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pratibha Parishad | Global Council for Indian Fine Arts",
  description:
    "Earning verified digital fine arts certifications and participating in global Indian fine arts competitions online. Join Recitation, Singing, Dance, Drawing, and Instrumental contests.",
  keywords: [
    "Indian Fine Arts",
    "Digital Arts Certification",
    "Bengali Recitation Competition",
    "Rabindra Sangeet online exam",
    "Nazrul Geeti certification",
    "Indian Classical Dance",
    "Online Drawing Competition",
    "Pratibha Parishad",
  ],
  authors: [{ name: "Pratibha Parishad Board" }],
  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    title: "Pratibha Parishad | Global Council for Indian Fine Arts",
    description:
      "Global online platform for Indian fine arts competitions and digital certifications. Empowering students worldwide to showcase traditional arts.",
    type: "website",
    images: [
      {
        url: "/images/pp-logo.png",
        width: 1200,
        height: 630,
        alt: "Pratibha Parishad Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head></head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


