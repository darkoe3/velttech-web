import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/ui/ScrollToTop";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://velttech.com"),
  title: {
    default: "Velttech | Digital Skills, Software Solutions & IT Consulting",
    template: "%s | Velttech",
  },
  description:
    "Velttech delivers coding for kids, Microsoft Excel data analysis training, data analytics, software solutions, and IT consulting for individuals, teams, and organizations.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/images/velttech-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  keywords: [
    "Velttech",
    "coding for kids",
    "Microsoft Excel training",
    "data analytics",
    "software solutions",
    "IT consulting",
  ],
  openGraph: {
    title: "Velttech | Digital Skills, Software Solutions & IT Consulting",
    description:
      "Practical technology education, analytics, software delivery, and IT guidance for modern learners and organizations.",
    url: "https://velttech.com",
    siteName: "Velttech",
    images: [
      {
        url: "/images/velttech-hero.png",
        width: 1200,
        height: 900,
        alt: "Velttech technology learning workspace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-light text-dark">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
      </body>
    </html>
  );
}
