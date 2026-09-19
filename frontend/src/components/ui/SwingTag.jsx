import { motion } from 'framer-motion';

/**
 * SwingTag — RentFusion's signature element.
 * A physical rental price tag, rendered in UI form: punched hole + string notch,
 * used everywhere something is "tagged" — a category, a price, a status.
 */
export default function SwingTag({
  children,
  tone = 'paper', // 'paper' | 'ink' | 'amber'
  swinging = false,
  className = '',
  as: Component = 'div',
  ...rest
}) {
  const tones = {
    paper: 'bg-paper text-charcoal border-charcoal/15',
    ink: 'bg-ink text-paper border-paper/20',
    amber: 'bg-amber text-ink border-ink/20',
  };

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      className={`relative inline-flex items-center gap-2 rounded-tag border pl-7 pr-4 py-1.5 font-mono text-sm shadow-tag ${tones[tone]} ${swinging ? 'animate-swing origin-top-left' : ''} ${className}`}
      {...rest}
    >
      <span className="absolute left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-current opacity-40" />
      {children}
    </MotionComponent>
  );
}
