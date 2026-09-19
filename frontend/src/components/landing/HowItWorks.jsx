import { motion } from 'framer-motion';
import { ListPlus, Handshake, PackageCheck, RotateCcw } from 'lucide-react';

const STEPS = [
  {
    n: '01',
    icon: ListPlus,
    title: 'List it',
    body: 'Photograph what you own, set a daily, weekly or monthly rate, and mark your calendar.',
  },
  {
    n: '02',
    icon: Handshake,
    title: 'Someone rents it',
    body: 'A renter nearby sends a request. You accept, they pay — deposit and rent held securely.',
  },
  {
    n: '03',
    icon: PackageCheck,
    title: 'It changes hands',
    body: 'Condition photos on both ends. Pickup or delivery, whichever you both agreed on.',
  },
  {
    n: '04',
    icon: RotateCcw,
    title: 'It comes back',
    body: 'Inspection, deposit released, both sides leave a review. The item is free to rent again.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-ink py-24 text-paper">
      <div className="mx-auto max-w-7xl px-6">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber">
          The Loop
        </span>
        <h2 className="mt-2 max-w-xl font-display text-5xl font-700 sm:text-6xl">
          One item, many owners over its lifetime.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative border-t border-paper/15 pt-6"
            >
              <span className="font-mono text-sm text-amber">{step.n}</span>
              <step.icon className="my-4 h-7 w-7 text-paper/80" strokeWidth={1.5} />
              <h3 className="font-display text-2xl font-600">{step.title}</h3>
              <p className="mt-2 font-body text-sm text-paper/60">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
