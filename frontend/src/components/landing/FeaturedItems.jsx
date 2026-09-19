import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import SwingTag from '../ui/SwingTag.jsx';

const ITEMS = [
  { name: 'Sony A7 IV Mirrorless', img: 'sony-camera-mirrorless', price: '₹899/day', rating: 4.9, city: 'Nagpur' },
  { name: 'Trek Mountain E-Bike', img: 'electric-mountain-bike', price: '₹349/day', rating: 4.8, city: 'Pune' },
  { name: 'DJI Mini 4 Pro Drone', img: 'drone-quadcopter', price: '₹699/day', rating: 5.0, city: 'Mumbai' },
  { name: 'Bosch Power Drill Set', img: 'power-drill-set', price: '₹129/day', rating: 4.7, city: 'Nagpur' },
  { name: 'JBL PartyBox 310', img: 'party-speaker-jbl', price: '₹549/day', rating: 4.9, city: 'Nashik' },
  { name: 'Coleman 6-Person Tent', img: 'camping-tent-outdoor', price: '₹299/day', rating: 4.6, city: 'Lonavala' },
];

export default function FeaturedItems() {
  return (
    <section className="bg-paper-dim py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber">
              This Week
            </span>
            <h2 className="mt-2 font-display text-5xl font-700 text-ink sm:text-6xl">
              Trending near you
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-tag border border-charcoal/10 bg-white shadow-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={`https://source.unsplash.com/500x375/?${item.img}`}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <SwingTag tone="amber" className="absolute left-3 top-3">
                  {item.price}
                </SwingTag>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-body text-base font-medium text-charcoal">{item.name}</h3>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-charcoal/60">
                    <Star size={12} className="fill-amber text-amber" /> {item.rating}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-charcoal/40">{item.city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
