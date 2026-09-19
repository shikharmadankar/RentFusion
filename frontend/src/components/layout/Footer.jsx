import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/10 bg-paper py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="font-display text-2xl font-700 text-ink">
              Rent<span className="text-amber">Fusion</span>
            </Link>
            <p className="mt-3 font-body text-sm text-charcoal/50">
              Rent Anything. Anytime. Anywhere.
            </p>
          </div>

          <FooterCol title="Company" links={['About', 'Contact', 'Careers']} />
          <FooterCol title="Rentals" links={['Categories', 'Browse', 'Become a Lender']} />
          <FooterCol title="Support" links={['Help Center', 'Terms', 'Privacy Policy']} />
        </div>

        <div className="mt-10 border-t border-charcoal/10 pt-6 font-mono text-xs text-charcoal/40">
          © {new Date().getFullYear()} RentFusion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-charcoal/40">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="font-body text-sm text-charcoal/70 hover:text-ink">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
