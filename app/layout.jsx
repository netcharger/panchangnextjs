import "../styles/globals.css";
import Providers from "../components/Providers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Panchangam",
  description: "Calendar Panchangam app"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <Header />
          <div className="container pb-24" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 1rem)' }}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
