import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, History } from 'lucide-react';
import type { SecurityMetrics } from '@/types/dashboard';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 2000 }) => {
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

  return <span>{count.toLocaleString()}</span>;
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
      pulseColor: "rgba(96, 165, 250, 0.5)",
    },
    {
      title: "Unresolved Breaches",
      value: metrics.unresolved,
      icon: AlertTriangle,
      color: "red",
      pulseColor: "rgba(239, 68, 68, 0.5)",
      critical: true,
    },
    {
      title: "Resolved Issues",
      value: metrics.resolved,
      icon: CheckCircle,
      color: "green",
      pulseColor: "rgba(34, 197, 94, 0.5)",
    },
    {
      title: "Previously Breached",
      value: metrics.previouslyBreached,
      icon: History,
      color: "yellow",
      pulseColor: "rgba(234, 179, 8, 0.5)",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`
            relative overflow-hidden
            bg-gray-800 rounded-lg border p-4
            ${card.color === 'blue' && 'border-blue-500/30'}
            ${card.color === 'red' && 'border-red-500/30'}
            ${card.color === 'green' && 'border-green-500/30'}
            ${card.color === 'yellow' && 'border-yellow-500/30'}
          `}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <card.icon 
                className={`
                  w-4 h-4
                  ${card.color === 'blue' && 'text-blue-400'}
                  ${card.color === 'red' && 'text-red-400'}
                  ${card.color === 'green' && 'text-green-400'}
                  ${card.color === 'yellow' && 'text-yellow-400'}
                `} 
              />
              <h3 className={`
                text-xs font-medium
                ${card.color === 'blue' && 'text-blue-400'}
                ${card.color === 'red' && 'text-red-400'}
                ${card.color === 'green' && 'text-green-400'}
                ${card.color === 'yellow' && 'text-yellow-400'}
              `}>
                {card.title}
              </h3>
            </div>
            
            <div className={`
              text-xl font-bold mt-2 text-center
              ${card.color === 'blue' && 'text-blue-300'}
              ${card.color === 'red' && 'text-red-300'}
              ${card.color === 'green' && 'text-green-300'}
              ${card.color === 'yellow' && 'text-yellow-300'}
            `}>
              <AnimatedCounter value={card.value} />
            </div>

            {card.critical && (
              <div 
                className="absolute inset-0 animate-pulse"
                style={{
                  background: `radial-gradient(circle at center, ${card.pulseColor} 0%, transparent 70%)`
                }}
              />
            )}
            
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `
                  linear-gradient(90deg, 
                    transparent 0%, 
                    ${card.pulseColor} 50%,
                    transparent 100%
                  )
                `,
                animation: 'glow 2s linear infinite'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;