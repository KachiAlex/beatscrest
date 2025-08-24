import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Users, Music, TrendingUp, Star, ArrowRight, CheckCircle2, Menu,
} from "lucide-react";

/**
 * BeatCrest – Code-Based UI Mockups
 * --------------------------------------------------
 * A single-file React showcase of the core BeatCrest screens:
 *  - Landing (Hero, Features, Stats, Testimonials, CTA)
 *  - Explore (Beat grid)
 *  - Auth Modal (Sign In / Sign Up)
 *
 * Notes:
 *  - TailwindCSS classes are used for styling.
 *  - framer-motion handles subtle animations.
 *  - No external UI dependencies required; everything is self-contained.
 *  - This is a mockup: hooks are used to navigate between views.
 */

// -----------------------------------------
// Types
// -----------------------------------------
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
}

interface HeaderProps {
  onGoto: (view: string) => void;
  onOpenAuth: () => void;
}

interface HeroProps {
  onOpenAuth: () => void;
  onGotoExplore: () => void;
}

interface CTAProps {
  onOpenAuth: () => void;
}

interface BeatCardProps {
  beat: {
    id: number;
    title: string;
    producer: string;
    price: number;
    bpm: number;
    cover: string;
  };
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

// -----------------------------------------
// Mock Data
// -----------------------------------------
const features = [
  {
    icon: Music,
    title: "Upload & Sell Beats",
    description:
      "Upload your beats with previews and set your own prices. Automated delivery system ensures instant downloads after purchase.",
  },
  {
    icon: Users,
    title: "Social Community",
    description:
      "Connect with producers and artists. Follow, comment, like, and build your network in the music industry.",
  },
  {
    icon: TrendingUp,
    title: "Trending Beats",
    description:
      "Discover what's hot in the music scene. Our algorithm highlights the most popular and trending beats.",
  },
  {
    icon: Star,
    title: "Producer Dashboard",
    description:
      "Track your sales, manage your beats, and analyze your performance with comprehensive analytics.",
  },
];

const testimonials = [
  {
    name: "DJ ProBeat",
    role: "Music Producer",
    content:
      "BeatCrest has revolutionized how I sell my beats. The platform is intuitive and the community is amazing!",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Melody Queen",
    role: "R&B Artist",
    content:
      "I found my signature sound on BeatCrest. The quality of beats here is unmatched!",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    verified: false,
  },
  {
    name: "Afrobeats King",
    role: "Producer",
    content:
      "The social features help me connect with artists and grow my fan base. Love the platform!",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    verified: true,
  },
];

const mockBeats = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Midnight Groove ${i + 1}`,
  producer: i % 2 === 0 ? "DJ ProBeat" : "Afrobeats King",
  price: 45000,
  bpm: 112 + (i % 6) * 2,
  cover:
    `https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop`,
}));

// -----------------------------------------
// Primitives
// -----------------------------------------
function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 ${className}`}>{children}</div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, className = "" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-white shadow-lg hover:bg-purple-700 transition ${className}`}
    >
      <span className="font-medium">{children}</span>
      {Icon && <Icon className="ml-2 h-4 w-4" />}
    </button>
  );
}

function OutlineButton({ children, onClick, icon: Icon, className = "" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-2xl border border-gray-300 px-5 py-3 text-gray-800 hover:bg-gray-50 transition ${className}`}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span className="font-medium">{children}</span>
    </button>
  );
}

function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}

// -----------------------------------------
// Header / Nav
// -----------------------------------------
function Header({ onGoto, onOpenAuth }: HeaderProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => onGoto("landing")}
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600" />
          <span className="text-xl font-bold text-gray-900">BeatCrest</span>
        </div>
        <nav className="hidden gap-6 md:flex">
          <button className="text-gray-700 hover:text-purple-600" onClick={() => onGoto("landing")}>Home</button>
          <button className="text-gray-700 hover:text-purple-600" onClick={() => onGoto("explore")}>Explore</button>
          <button className="text-gray-700 hover:text-purple-600" onClick={() => onOpenAuth()}>Sign in</button>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <Menu className="h-6 w-6 text-gray-800" />
        </button>
      </Container>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-white md:hidden"
          >
            <Container className="flex flex-col gap-3 py-3">
              <button className="text-left" onClick={() => { onGoto("landing"); setOpen(false); }}>Home</button>
              <button className="text-left" onClick={() => { onGoto("explore"); setOpen(false); }}>Explore</button>
              <button className="text-left" onClick={() => { onOpenAuth(); setOpen(false); }}>Sign in</button>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// -----------------------------------------
// Landing Sections
// -----------------------------------------
function Hero({ onOpenAuth, onGotoExplore }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white py-24 text-center">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-4xl font-bold md:text-7xl">
            <span className="text-purple-600">BeatCrest</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 md:text-2xl">
            The ultimate social media and marketplace platform for beat producers and music entertainers across Africa and beyond.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PrimaryButton onClick={onOpenAuth} icon={ArrowRight}>
              Get Started
            </PrimaryButton>
            <OutlineButton onClick={onGotoExplore} icon={Play}>
              Explore Beats
            </OutlineButton>
          </div>
        </motion.div>
      </Container>
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-purple-200 to-blue-200"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
    </section>
  );
}

function Features() {
  return (
    <section className="py-20">
      <Container>
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-5xl">Everything You Need to Succeed</h2>
          <p className="text-xl text-gray-600">
            Powerful tools for producers and artists to create, share, and monetize their music
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border bg-white p-6 text-center shadow-sm hover:shadow-md"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                  <Icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  return (
    <section className="bg-gray-50 py-20">
      <Container>
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
          <div>
            <h3 className="text-4xl font-bold text-purple-600">50K+</h3>
            <p className="text-xl text-gray-600">Active Producers</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600">200K+</h3>
            <p className="text-xl text-gray-600">Beats Available</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-green-600">₦2M+</h3>
            <p className="text-xl text-gray-600">Earned by Producers</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-20">
      <Container>
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-5xl">What Our Community Says</h2>
          <p className="text-xl text-gray-600">Join thousands of satisfied producers and artists</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <p className="italic text-gray-600">"{t.content}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{t.name}</p>
                    {t.verified && <Badge>Verified</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTA({ onOpenAuth }: CTAProps) {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20 text-white">
      <Container className="text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-5xl">Ready to Start Your Music Journey?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
          Join BeatCrest today and connect with a community of talented producers and artists
        </p>
        <PrimaryButton
          onClick={onOpenAuth}
          icon={ArrowRight}
          className="bg-white text-purple-600 hover:bg-gray-100"
        >
          Join BeatCrest Now
        </PrimaryButton>
      </Container>
    </section>
  );
}

// -----------------------------------------
// Explore Grid (Mock)
// -----------------------------------------
function BeatCard({ beat }: BeatCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={beat.cover} alt={beat.title} className="h-44 w-full object-cover" />
      <div className="space-y-1 p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{beat.title}</h4>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
            ₦{beat.price.toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-gray-500">{beat.producer} • {beat.bpm} BPM</p>
      </div>
      <AnimatePresence>
        {hover && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white"
          >
            <span className="mr-2">Preview</span>
            <Play className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function Explore() {
  return (
    <section className="py-16">
      <Container>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Explore Beats</h2>
            <p className="text-gray-600">Discover trending instrumentals from top producers</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <OutlineButton>All Genres</OutlineButton>
            <OutlineButton>Trending</OutlineButton>
            <OutlineButton>Newest</OutlineButton>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockBeats.map((b) => (
            <BeatCard key={b.id} beat={b} />
          ))}
        </div>
      </Container>
    </section>
  );
}

// -----------------------------------------
// Auth Modal (Mock)
// -----------------------------------------
function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState("signin");
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold">Welcome to BeatCrest</h3>
            <button onClick={onClose} className="rounded-xl px-3 py-1 text-sm text-gray-500 hover:bg-gray-100">Close</button>
          </div>
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
            <button
              onClick={() => setTab("signin")}
              className={`rounded-lg px-3 py-2 font-medium ${tab === "signin" ? "bg-white shadow" : "text-gray-600"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`rounded-lg px-3 py-2 font-medium ${tab === "signup" ? "bg-white shadow" : "text-gray-600"}`}
            >
              Create Account
            </button>
          </div>

          <form className="space-y-3">
            {tab === "signup" && (
              <div>
                <label className="mb-1 block text-sm font-medium">Username</label>
                <input className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="melodyqueen" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input type="password" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
            </div>
            <PrimaryButton className="w-full justify-center">{tab === "signin" ? "Sign In" : "Create Account"}</PrimaryButton>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>By continuing, you agree to our Terms & Privacy.</span>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------
// Footer
// -----------------------------------------
function Footer() {
  return (
    <footer className="border-t bg-white py-10 text-sm">
      <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
          <span className="font-semibold">BeatCrest</span>
        </div>
        <div className="text-gray-500">© {new Date().getFullYear()} BeatCrest. All rights reserved.</div>
      </Container>
    </footer>
  );
}

// -----------------------------------------
// App Wrapper (Single-file mock router)
// -----------------------------------------
export default function BeatCrestMockups() {
  const [view, setView] = useState("landing");
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header onGoto={setView} onOpenAuth={() => setAuthOpen(true)} />

      {view === "landing" && (
        <>
          <Hero onOpenAuth={() => setAuthOpen(true)} onGotoExplore={() => setView("explore")} />
          <Features />
          <Stats />
          <Testimonials />
          <CTA onOpenAuth={() => setAuthOpen(true)} />
        </>
      )}

      {view === "explore" && <Explore />}

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
} 