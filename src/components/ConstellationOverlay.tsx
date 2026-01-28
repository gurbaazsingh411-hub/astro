import { motion } from "framer-motion";
import { Constellation } from "@/types/astronomy";

interface ConstellationOverlayProps {
  constellation: Constellation;
  dimensions: { width: number; height: number };
  onClick: () => void;
  nightMode: boolean;
}

const ConstellationOverlay = ({ constellation, dimensions, onClick, nightMode }: ConstellationOverlayProps) => {
  const lineColor = nightMode ? 'hsl(0, 50%, 50%)' : 'hsl(185, 70%, 60%)';
  const starColor = nightMode ? 'hsl(0, 30%, 80%)' : 'hsl(45, 90%, 85%)';

  return (
    <motion.div
      className="absolute inset-0 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
    >
      {/* SVG for lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {constellation.lines.map(([startIdx, endIdx], i) => {
          const start = constellation.stars[startIdx];
          const end = constellation.stars[endIdx];
          if (!start?.screenPos || !end?.screenPos) return null;

          return (
            <motion.line
              key={`${constellation.id}-line-${i}`}
              x1={start.screenPos.x}
              y1={start.screenPos.y}
              x2={end.screenPos.x}
              y2={end.screenPos.y}
              stroke={lineColor}
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeDasharray="4,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Stars */}
      {constellation.stars.map((star, i) => {
        if (!star.screenPos) return null;
        const { x, y } = star.screenPos;

        return (
          <motion.div
            key={`${constellation.id}-star-${i}`}
            className="absolute"
            style={{ left: x, top: y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: star.brightness }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            {/* Star glow */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 8 + star.brightness * 8,
                height: 8 + star.brightness * 8,
                background: `radial-gradient(circle, ${starColor} 0%, transparent 70%)`,
              }}
            />
            {/* Star core */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 2 + star.brightness * 3,
                height: 2 + star.brightness * 3,
                background: starColor,
                boxShadow: `0 0 ${4 + star.brightness * 4}px ${starColor}`
              }}
              animate={{
                opacity: [star.brightness, star.brightness * 0.7, star.brightness],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      })}

      {/* Constellation name label */}
      {(constellation as any).centerScreenPos && (
        <motion.div
          className="absolute"
          style={{
            left: (constellation as any).centerScreenPos.x,
            top: (constellation as any).centerScreenPos.y - 30
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span
            className="text-sm font-display font-medium tracking-wider"
            style={{ color: lineColor }}
          >
            {constellation.name}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConstellationOverlay;
