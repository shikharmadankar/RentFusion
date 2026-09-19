import Hero from '../components/landing/Hero.jsx';
import CategoryTicker from '../components/landing/CategoryTicker.jsx';
import CategoryGrid from '../components/landing/CategoryGrid.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import FeaturedItems from '../components/landing/FeaturedItems.jsx';
import { TrustStats, CTASection } from '../components/landing/TrustAndCTA.jsx';

export default function Landing() {
  return (
    <>
      <Hero />
      <CategoryTicker />
      <CategoryGrid />
      <HowItWorks />
      <FeaturedItems />
      <TrustStats />
      <CTASection />
    </>
  );
}
