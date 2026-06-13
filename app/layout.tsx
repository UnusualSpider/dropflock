import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavMenu from "./nav-menu";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
        <header className="flex-none border-b-2 bg-[#F2EDE4] border-[#1A1A1A] px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="bebas text-[1.6rem] sm:text-[2rem] text-[#1A1A1A] leading-none tracking-[0.04em]">
              <a href="/">DROP<span className="text-[#C0392B]">FLOCK</span></a>
            </div>
            <div className="hidden sm:block text-[0.55rem] tracking-[0.18em] uppercase opacity-40 mt-0.5">
              Know your surveillance. Know your rights.
            </div>
          </div>
          <nav className="hidden md:flex gap-6 lg:gap-8 text-[0.7rem] tracking-[0.1em] uppercase">
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
          <NavMenu links={NAV_LINKS} />
        </header>
        {children}
        </body>
    </html>
  );
}
