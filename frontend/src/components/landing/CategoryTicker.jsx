const ITEMS = [
  'Bikes', 'Cars', 'Cameras', 'Laptops', 'DSLRs', 'Furniture', 'Gaming Consoles',
  'Gym Equipment', 'Drones', 'Power Tools', 'Books', 'Projectors', 'Tents',
  'Party Speakers', 'Washing Machines', 'Refrigerators', 'Musical Instruments',
];

export default function CategoryTicker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden border-y border-charcoal/10 bg-paper-dim py-3">
      <div className="flex w-max animate-ticker gap-8">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-charcoal/50"
          >
            {item}
            <span className="text-amber">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
