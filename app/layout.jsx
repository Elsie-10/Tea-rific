import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://tea-rific.vercel.app"),

  title: {
    default: "Tea-Terrific Treats | Cakes & Bakery Treats",
    template: "%s | Tea-Terrific Treats",
  },

  description:
    "Tea-Terrific Treats offers cakes, cupcakes, loaves, cookies and yoghurt.",

  keywords: [
    "Tea-Terrific Treats",
    "bakery",
    "cakes",
    "cupcakes",
    "cookies",
    "cakes Kenya",
  ],

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: "GOOGLE_VERIFICATION_CODE",
  },

  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <SessionWrapper>
          <CartProvider>{children}</CartProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
