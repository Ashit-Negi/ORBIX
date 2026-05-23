import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Orbix",
  description: "Modern developer community platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f3f3f1] overflow-x-hidden">
        <Navbar />

        <main className="min-w-0">{children}</main>
      </body>
    </html>
  );
}
