import { useState, useEffect } from "react";

const DynamicParallaxBackground: React.FC = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Handle mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;

    setPosition({
      x: 50 - (x - 50) * 0.1,
      y: 50 - (y - 50) * 0.1,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 bg-gray-900 overflow-hidden"
      style={{ 
        pointerEvents: "none",
        isolation: "isolate" // Ensures proper stacking context
      }}
    >
      {/* Base Layer */}
      <div className="absolute inset-0 bg-gray-900" />
      
      {/* Animated Gradient Layers */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"
        style={{
          transform: `translate(${position.x}%, ${position.y}%) scale(1.1)`,
          transition: "transform 0.05s ease-out",
        }}
      />

      <div
        className="absolute inset-0 bg-gradient-to-bl from-indigo-800/20 via-transparent to-red-600/20"
        style={{
          transform: `translate(${-position.x}%, ${-position.y}%) scale(1.2)`,
          transition: "transform 0.05s ease-out",
        }}
      />

      {/* Glowing Dots */}
      <div
        className="absolute rounded-full bg-blue-300/30 blur-lg"
        style={{
          width: "150px",
          height: "150px",
          top: `${position.y + 10}%`,
          left: `${position.x + 10}%`,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.1s ease-out",
        }}
      />
      <div
        className="absolute rounded-full bg-red-400/20 blur-lg"
        style={{
          width: "200px",
          height: "200px",
          top: `${position.y - 10}%`,
          left: `${position.x - 10}%`,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.1s ease-out",
        }}
      />
    </div>
  );
};

export default DynamicParallaxBackground;