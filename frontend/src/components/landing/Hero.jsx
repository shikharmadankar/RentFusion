import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import SwingTag from '../ui/SwingTag.jsx';

const QUICK_TAGS = ['Cameras', 'Bikes', 'Power Tools', 'Party Speakers', 'DSLRs', 'Tents'];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {/* faint index-line texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, transparent, transparent 38px, #F3EFE4 39px)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-amber"
          >
            Catalog No. 001 — Peer-to-Peer Rentals
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-[15vw] leading-[0.92] font-800 tracking-tight sm:text-7xl lg:text-8xl"
          >
            Rent
            <br />
            Anything.
            <br />
            <span className="text-amber">Anytime.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 max-w-md font-body text-lg text-paper/70"
          >
            Every camera, drone, tool, and tent in your city is already owned by someone.
            RentFusion puts it a few taps away — instead of buying, borrow it from a neighbor.
          </motion.p>

          {/* Search — styled like an index card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-col gap-3 rounded-xl border border-paper/15 bg-paper p-3 shadow-card sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 px-3 py-2 text-charcoal">
              <Search size={18} className="text-charcoal/50" />
              <input
                type="text"
                placeholder="Search for a DSLR, e-bike, drill..."
                className="w-full bg-transparent font-body text-sm outline-none placeholder:text-charcoal/40"
              />
            </div>
            <div className="hidden items-center gap-2 border-l border-charcoal/10 px-3 py-2 text-charcoal sm:flex">
              <MapPin size={18} className="text-charcoal/50" />
              <input
                type="text"
                placeholder="Nagpur, MH"
                className="w-32 bg-transparent font-body text-sm outline-none placeholder:text-charcoal/40"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper transition-transform hover:-translate-y-0.5">
              Search <ArrowRight size={16} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {QUICK_TAGS.map((t) => (
              <SwingTag key={t} tone="paper" className="cursor-pointer hover:-translate-y-0.5 transition-transform">
                {t}
              </SwingTag>
            ))}
          </motion.div>
        </div>

        {/* Right: rotating tag stack illustration made of real rental categories */}
        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative mx-auto mt-6 h-[420px] w-[320px]"
          >
            <TagCard rotate="-6deg" top="0" left="10%" label="DSLR Camera" price="₹399/day" />
            <TagCard rotate="4deg" top="120px" left="35%" label="E-Bike" price="₹249/day" accent />
            <TagCard rotate="-3deg" top="230px" left="4%" label="Party Speaker" price="₹599/day" />
            <TagCard rotate="8deg" top="300px" left="42%" label="Power Drill" price="₹99/day" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TagCard({ rotate, top, left, label, price, accent }) {
  return (
    <motion.div
      className={`absolute w-48 rounded-tag border p-4 shadow-tag ${
        accent ? 'bg-amber text-ink border-ink/10' : 'bg-paper text-charcoal border-charcoal/10'
      }`}
      style={{ top, left, rotate }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="absolute -top-1.5 left-5 h-3 w-3 rounded-full border-2 border-current bg-transparent opacity-40" />
      <p className="font-body text-sm font-medium">{label}</p>
      <p className="mt-1 font-mono text-xs opacity-70">{price}</p>
    </motion.div>
  );
}
