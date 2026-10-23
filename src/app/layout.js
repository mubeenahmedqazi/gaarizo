import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Gaarizo - Pakistan ki gaariyan, aik jagah",
  description: "Buy and sell used cars in Pakistan. Browse verified listings from Lahore, Karachi, Islamabad and more.",
};

// Runs before first paint so the saved theme is applied without a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('gaarizo_theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <div className="bg-glow" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <Providers>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--fg)",
                border: "1px solid var(--card-border)",
                backdropFilter: "blur(16px)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
