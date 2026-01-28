import { motion } from "framer-motion";
import { Planet } from "@/types/astronomy";

interface PlanetMarkerProps {
  planet: Planet;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  onClick: () => void;
  nightMode: boolean;
  isRealPosition?: boolean;
}

const PlanetMarker = ({ planet, position, dimensions, onClick, nightMode, isRealPosition }: PlanetMarkerProps) => {
  const x = isRealPosition ? position.x : (position.x / 100) * dimensions.width;
  const y = isRealPosition ? position.y : (position.y / 100) * dimensions.height;

  const planetColor = nightMode
    ? `hsl(0, ${parseInt(planet.color.split(',')[1]) * 0.5}%, ${parseInt(planet.color.split(',')[2]) * 0.7}%)`
    : planet.color;

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          width: planet.size * 2.5,
          height: planet.size * 2.5,
          background: `radial-gradient(circle, ${planetColor}40 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Planet body */}
      <motion.div
        className="rounded-full -translate-x-1/2 -translate-y-1/2 relative"
        style={{
          width: planet.size,
          height: planet.size,
          background: `radial-gradient(circle at 30% 30%, ${planetColor}, ${planetColor}80)`,
          boxShadow: `0 0 ${planet.size}px ${planetColor}60, inset -${planet.size / 4}px -${planet.size / 4}px ${planet.size / 2}px rgba(0,0,0,0.4)`
        }}
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Saturn's rings */}
        {planet.id === "saturn" && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-60"
            style={{
              width: planet.size * 1.8,
              height: planet.size * 0.5,
              borderColor: planetColor,
              transform: 'translate(-50%, -50%) rotateX(70deg)'
            }}
          />
        )}
      </motion.div>

      {/* Label */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{ top: planet.size / 2 + 8 }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs font-display font-medium px-2 py-0.5 rounded-full glass text-foreground/90">
          {planet.name}
        </span>
      </motion.div>

      {/* Hover tooltip */}
      <motion.div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        <div className="glass rounded-lg px-3 py-2 text-center min-w-[120px]">
          <p className="text-xs text-muted-foreground">{planet.distance}</p>
          <p className="text-xs mt-1">
            {planet.visibleToNakedEye ? "👁️ Visible tonight" : "🔭 Telescope needed"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlanetMarker;
