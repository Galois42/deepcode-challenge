import { useState, useEffect } from "react";

const DynamicParallaxBackground: React.FC = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Handle mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const x = (clientX / window.innerWidth) * 100; // X position as a percentage
    const y = (clientY / window.innerHeight) * 100; // Y position as a percentage

    // Invert the movement for the parallax effect
    setPosition({
      x: 50 - (x - 50) * 0.1, // Shift 10% in the opposite direction
      y: 50 - (y - 50) * 0.1, // Shift 10% in the opposite direction
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-gray-900 overflow-hidden z-[-10]"
      style={{ pointerEvents: "none" }} // Ensures it doesn't interfere with user interaction
    >
      {/* Layered background with parallax effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"
        style={{
          transform: `translate(${position.x}%, ${position.y}%) scale(1.1)`,
          transition: "transform 0.05s ease-out",
        }}
      />

      <div
        className="absolute inset-0 bg-gradient-to-bl from-indigo-800 via-transparent to-red-600"
        style={{
          transform: `translate(${-position.x}%, ${-position.y}%) scale(1.2)`,
          transition: "transform 0.05s ease-out",
        }}
      />

      {/* Add glowing dots for a more dynamic look */}
      <div
        className="absolute rounded-full bg-blue-300 opacity-30 blur-lg"
        style={{
          width: "150px", // Reduced width
          height: "150px", // Reduced height to make it less tall
          top: `${position.y + 10}%`,
          left: `${position.x + 10}%`,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.1s ease-out",
        }}
      />
      <div
        className="absolute rounded-full bg-red-400 opacity-20 blur-lg"
        style={{
          width: "200px", // Reduced width
          height: "200px", // Reduced height to make it less tall
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
