import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kaam with productivity — Maximize Your Daily Focus and Team Productivity",
  description: "Kaam with productivity is a high-end, full-stack personal task tracker, Kanban ideation pipeline, and team productivity contest, designed for peak professional focus.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/35">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
