import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '48,000+', label: 'Items listed' },
  { value: '17', label: 'Categories' },
  { value: '4.8 / 5', label: 'Average rating' },
  { value: '120+', label: 'Cities covered' },
];

export function TrustStats() {
  return (
    <section className="bg-paper py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, rotate: -4, scale: 0.9 }}
            whileInView={{ opacity: 1, rotate: -3, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-tag border-2 border-ink/15 px-4 py-5 text-center"
          >
            <p className="font-display text-3xl font-700 text-ink sm:text-4xl">{s.value}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-charcoal/50">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-ink py-24 text-paper">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-5xl font-700 sm:text-6xl"
        >
          Got a garage full of things
          <br />
          you use once a year?
        </motion.h2>
        <p className="mx-auto mt-4 max-w-lg font-body text-paper/60">
          List it on RentFusion in under five minutes. You set the price, the calendar,
          and the pickup terms — we handle payments, deposits, and the paperwork.
        </p>
        <Link
          to="/become-a-lender"
          className="mt-8 inline-flex items-center gap-2 rounded-tag bg-amber px-7 py-3 font-body font-medium text-ink shadow-tag transition-transform hover:-translate-y-0.5"
        >
          Become a Lender
        </Link>
      </div>
    </section>
  );
}
