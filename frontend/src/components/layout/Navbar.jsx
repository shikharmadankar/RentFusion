import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'Browse', to: '/browse' },
  { label: 'Become a Lender', to: '/become-a-lender' },
  { label: 'How it Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-700 tracking-tight text-paper">
          Rent<span className="text-amber">Fusion</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `font-body text-sm transition-colors ${
                  isActive ? 'text-amber' : 'text-paper/75 hover:text-paper'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-tag px-4 py-2 font-body text-sm text-paper/85 hover:text-paper"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-tag bg-amber px-4 py-2 font-body text-sm font-medium text-ink shadow-tag transition-transform hover:-translate-y-0.5"
          >
            Register
          </Link>
        </div>

        <button
          className="lg:hidden text-paper"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-paper/10 bg-ink px-6"
          >
            <div className="flex flex-col gap-4 py-5">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="font-body text-paper/85" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 rounded-tag border border-paper/20 px-4 py-2 text-center text-sm text-paper">
                  Log In
                </Link>
                <Link to="/register" className="flex-1 rounded-tag bg-amber px-4 py-2 text-center text-sm font-medium text-ink">
                  Register
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
