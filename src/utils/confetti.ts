import confetti from 'canvas-confetti';
import { triggerHaptic } from '../services/storage';

export function fireWinCelebration() {
  triggerHaptic();

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10b981', '#34d399', '#eab308', '#6366f1'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#10b981', '#fbbf24', '#ffffff'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#eab308', '#f59e0b', '#3b82f6'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
