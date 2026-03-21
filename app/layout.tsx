import type { Metadata } from "next";
import { Schibsted_Grotesk ,Martian_Mono} from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";

const schibstedGrotesk = Schibsted_Grotesk ({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "A platform for developers to share and discover events, workshops, and conferences in the tech industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} antialiased min-h-screen`}
      >
        <Navbar />
        <div className="absolute inset-0 top-0 z-[-1] min-h-screen " >
          {/* the above css (absoloute .. ) need for for the light rays to be on background etc . */}
        <LightRays
          raysOrigin="top-center-offset"
          raysColor="#5dfeca"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={2.2}
          pulsating={false}
          fadeDistance={1.7}
          saturation={1}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
        />
        </div>
        <main>
          {children}
        </main>
        
      </body>
    </html>
  );
}
