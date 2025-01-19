import { useEffect, useState } from "react";

type Shape = {
  x: number; // Horizontal position
  y: number; // Vertical position
  size: number; // Shape size
  speed: number; // Movement speed
  directionX: number; // Horizontal direction
  directionY: number; // Vertical direction
};

const generateShapes = (count: number): Shape[] => {
  return Array.from({ length: count }).map(() => ({
    x: Math.random() * 100, // Random X position
    y: Math.random() * 100, // Random Y position
    size: Math.random() * 50 + 10, // Random size (between 10px and 60px)
    speed: Math.random() * 0.5 + 0.2, // Random speed (between 0.2s and 0.7s)
    directionX: Math.random() * 2 - 1, // Random horizontal direction (-1 to 1)
    directionY: Math.random() * 2 - 1, // Random vertical direction (-1 to 1)
  }));
};

const DynamicBackground: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>(generateShapes(15));
  const [scanLines, setScanLines] = useState<number[]>([]);

  // Update shapes' floating positions
  useEffect(() => {
    const interval = setInterval(() => {
      setShapes((prevShapes) =>
        prevShapes.map((shape) => ({
          ...shape,
          x: (shape.x + shape.directionX * shape.speed + 100) % 100, // Horizontal wrapping
          y: (shape.y + shape.directionY * shape.speed + 100) % 100, // Vertical wrapping
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Add random scan lines at random intervals
  useEffect(() => {
    const addLine = () => {
      setScanLines((prev) => [...prev, 0]); // Initialize scan line at the top (0%)
      const randomInterval = Math.random() * 2000 + 1000; // Random interval between 1s and 3s
      setTimeout(addLine, randomInterval); // Call addLine again after random interval
    };

    // Start the first scan line
    addLine();

    return () => {}; // No cleanup necessary for this as it self-cleans
  }, []);

  // Move scan lines downward
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLines((prev) =>
        prev
          .map((position) => position + 1) // Move each line downward
          .filter((position) => position <= 100) // Remove lines past the bottom
      );
    }, 50); // Smooth downward movement

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-gray-900 overflow-hidden">
      {/* Scanning lines */}
      {scanLines.map((position, index) => (
        <div
          key={index}
          className="absolute w-full h-px bg-blue-400 opacity-50"
          style={{
            top: `${position}%`,
            boxShadow: "0 0 10px #60A5FA, 0 0 20px #60A5FA",
          }}
        />
      ))}

      {/* Glowing floating shapes */}
      {shapes.map((shape, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-blue-500 opacity-30 blur-lg"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            top: `${shape.y}%`,
            left: `${shape.x}%`,
            animationDuration: `${shape.speed}s`,
          }}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500 to-transparent opacity-20" />
    </div>
  );
};

export default DynamicBackground;
