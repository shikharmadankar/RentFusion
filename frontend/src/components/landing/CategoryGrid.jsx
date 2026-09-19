import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "/categories/electronics.jpg"
  },
  {
    name: "Vehicles",
    slug: "vehicles",
    image: "/categories/vehicles.jpg"
  },
  {
    name: "Furniture",
    slug: "furniture",
    image: "/categories/furniture.jpg"
  },
  {
    name: "Cameras",
    slug: "cameras",
    image: "/categories/cameras.jpg"
  },
  {
    name: "Laptops",
    slug: "laptops",
    image: "/categories/laptops.jpg"
  },
  {
    name: "Mobile Phones",
    slug: "mobile-phones",
    image: "/categories/mobile-phones.jpg"
  },
  {
    name: "Books",
    slug: "books",
    image: "/categories/books.jpg"
  },
  {
    name: "Appliances",
    slug: "appliances",
    image: "/categories/appliances.jpg"
  },
  {
    name: "Gaming",
    slug: "gaming",
    image: "/categories/gaming.jpg"
  },
  {
    name: "Musical Instruments",
    slug: "musical-instruments",
    image: "/categories/musical-instruments.jpg"
  },
  {
    name: "Fashion",
    slug: "fashion",
    image: "/categories/fashion.jpg"
  },
  {
    name: "Sports Equipment",
    slug: "sports-equipment",
    image: "/categories/sports-equipment.jpg"
  },
  {
    name: "Fitness Equipment",
    slug: "fitness-equipment",
    image: "/categories/fitness-equipment.jpg"
  },
  {
    name: "Photography Equipment",
    slug: "photography-equipment",
    image: "/categories/photography-equipment.jpg"
  },
  {
    name: "Tools",
    slug: "tools",
    image: "/categories/tools.jpg"
  },
  {
    name: "Party Supplies",
    slug: "party-supplies",
    image: "/categories/party-supplies.jpg"
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    image: "/categories/home-decor.jpg"
  },
  {
    name: "Camping Gear",
    slug: "camping-gear",
    image: "/categories/camping-gear.jpg"
  },
  {
    name: "Office Equipment",
    slug: "office-equipment",
    image: "/categories/office-equipment.jpg"
  },
  {
    name: "Baby Products",
    slug: "baby-products",
    image: "/categories/baby-products.jpg"
  }
];

function CategoryImage({ src, alt }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  return (
    <div className="relative w-full h-full bg-charcoal/5 flex items-center justify-center overflow-hidden">
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/5 via-charcoal/10 to-charcoal/5 animate-pulse" />
      )}
      {status === 'error' ? (
        <div className="flex flex-col items-center justify-center text-charcoal/30 p-4 text-center">
          <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-mono uppercase tracking-wider">Image Offline</span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          variants={{
            hover: { scale: 1.05 }
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -6,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const arrowVariants = {
  initial: { x: 0 },
  hover: { x: 4 },
};

export default function CategoryGrid() {
  return (
    <section id="categories" className="bg-paper py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber">
            Index
          </span>
          <h2 className="mt-2 font-display text-4xl font-700 text-ink sm:text-5xl max-w-3xl leading-tight">
            Everything You Need. Rent It When You Need It.
          </h2>
          <p className="mt-4 font-body text-charcoal/70 text-base max-w-2xl">
            Explore a wide range of rental categories and get what you need without buying things you'll only use once.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.slug}
              variants={cardVariants}
              whileHover="hover"
              className="flex flex-col h-full rounded-2xl border border-charcoal/10 bg-white shadow-md overflow-hidden"
            >
              <Link 
                to={`/categories/${cat.slug}`}
                className="flex flex-col h-full"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-charcoal/5 relative">
                  {/* Subtle dark gradient overlay during hover */}
                  <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
                  <CategoryImage src={cat.image} alt={cat.name} />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-t border-charcoal/5">
                  <span className="font-body text-sm font-semibold text-charcoal">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
                      Browse
                    </span>
                    <motion.span 
                      variants={arrowVariants}
                      className="font-mono text-[10px] text-charcoal/50"
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

