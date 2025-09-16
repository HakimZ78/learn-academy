import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DataProvider } from "@/contexts/DataContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Learn Academy - Learning for a Changing World",
  description:
    "Innovative education that breaks down barriers between subjects. Join our semi-classroom tutoring and home schooling services led by a multi-talented professional educator.",
  keywords:
    "tutoring, home schooling, interdisciplinary education, innovative learning, personalised education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <DataProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </DataProvider>
      </body>
    </html>
  );
}
