import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Đà Lạt · Thành Phố Ngàn Hoa",
  description:
    "Khám phá Đà Lạt — thành phố sương mù, hoa anh đào và cà phê thơm. Trợ lý AI lên lịch trình miễn phí cho chuyến đi của bạn.",
  metadataBase: new URL("https://dalat-travel.vercel.app"),
  keywords: [
    "du lịch đà lạt",
    "lịch trình đà lạt",
    "khám phá đà lạt",
    "chatbot du lịch",
  ],
  openGraph: {
    title: "Đà Lạt · Thành Phố Ngàn Hoa",
    description:
      "Khám phá Đà Lạt — thành phố sương mù, hoa anh đào và cà phê thơm.",
    type: "website",
    locale: "vi_VN",
    url: "https://dalat-travel.vercel.app",
    images: [
      {
        url: "/images/dalat1.svg",
        width: 1200,
        height: 630,
        alt: "Đà Lạt - Thành phố ngàn hoa",
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
    <html lang="vi" className={`${jost.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream text-charcoal">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
