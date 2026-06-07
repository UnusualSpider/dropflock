import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DropFlock",
	description:
		"A project to expose and fight back against Flock Safety's pervasive license plate surveillance.",
};

const NAV_LINKS = [
	{ label: "The Issues", href: "/issues" },
	{ label: "Security", href: "/security" },
	{ label: "Find Groups", href: "/groups" },
	{ label: "Take Action", href: "/act" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} $geistMono.variableh-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
        <header className="flex-none border-b-2 bg-[#F2EDE4] border-[#1A1A1A] px-8 py-4 flex items-center justify-between">
          <div>
            <div className="bebas text-[2rem] text-[#1A1A1A] leading-none tracking-[0.04em]">
              DROP<span className="text-[#C0392B]">FLOCK</span>
            </div>
            <div className="text-[0.55rem] tracking-[0.18em] uppercase opacity-40 mt-0.5">
              Know your surveillance. Know your rights.
            </div>
          </div>
          <nav className="flex gap-8 text-[0.7rem] tracking-[0.1em] uppercase">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav-link opacity-70 hover:opacity-100 transition-opacity no-underline text-[#1A1A1A]"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </header>
        {children}
        </body>
    </html>
  );
}
