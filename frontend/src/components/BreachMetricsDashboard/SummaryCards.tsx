import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import type { SecurityMetrics } from '@/types/dashboard';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 2000,
  formatter = (val) => val.toLocaleString()
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(value * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{formatter(count)}</span>;
};

interface SummaryCardsProps {
  metrics: SecurityMetrics;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Total Breaches",
      value: metrics.total,
      icon: Shield,
      color: "blue",
    },
    {
      title: "Active Threats",
      value: metrics.unresolved,
      icon: AlertTriangle,
      color: "red",
      critical: true,
    },
    {
      title: "Secured Systems",
      value: metrics.resolved,
      icon: CheckCircle,
      color: "blue",
    },
    {
      title: "Protected Services",
      value: metrics.loginForms,
      icon: Lock,
      color: "blue",
    },
  ];

  return (
    <div className="flex flex-nowrap gap-4 w-full overflow-x-auto my-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`
            relative flex-1 min-w-[250px]
            bg-gray-800 rounded-lg border p-6
            ${card.critical 
              ? 'border-cyan-400 shadow-lg shadow-cyan-500/50 animate-pulseGlow' 
              : `border-${card.color}-500/30`}
            transition-all duration-300
            hover:scale-105
          `}
        >
          {/* Background Gradient */}
          <div
            className={`
              absolute inset-0 opacity-20 rounded-lg
              bg-gradient-to-br from-${card.color}-600/20 to-${card.color}-400/20
            `}
          />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              <h3 className={`text-sm font-medium text-${card.color}-400`}>
                {card.title}
              </h3>
            </div>

            {/* Value */}
            <div className={`text-2xl font-bold text-${card.color}-400 text-center mb-2`}>
              <AnimatedCounter value={card.value} />
            </div>

            {/* Subtitle */}
            <div className="text-xs text-center text-blue-300 opacity-80">
              Last 30 days
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-700">
            <div 
              className={`h-full bg-${card.color}-400/50 transition-all duration-1000`}
              style={{ width: '60%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;