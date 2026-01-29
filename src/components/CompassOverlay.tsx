import { motion } from "framer-motion";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface CompassOverlayProps {
  nightMode: boolean;
  facingMode: "environment" | "user";
}

const CompassOverlay = ({ nightMode, facingMode }: CompassOverlayProps) => {
  const { alpha } = useDeviceOrientation();
  let heading = alpha !== null ? Math.round(alpha) : 0;

  // Adjust heading for front camera (opposite direction)
  if (facingMode === "user") {
    heading = (heading + 180) % 360;
  }

  const color = nightMode ? 'hsl(0, 50%, 60%)' : 'hsl(185, 70%, 60%)';
  const borderColor = nightMode ? 'hsl(0, 40%, 30%)' : 'hsl(185, 50%, 30%)';

  const directions = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 }
  ];

  const getCardinal = (h: number) => {
    const d = directions.find(d => Math.abs((h - d.angle + 360) % 360) < 22.5);
    return d ? d.label : '';
  };

  return (
    <div className="absolute top-20 left-4 right-4 z-10 pointer-events-none flex flex-col items-center">
      {/* Digital readout */}
      <div
        className="glass px-3 py-1 rounded-full mb-4 font-mono font-bold text-lg border"
        style={{ color, borderColor, backgroundColor: 'hsl(var(--background) / 0.5)' }}
      >
        {heading}° {getCardinal(heading)}
      </div>

      {/* Rotating tape */}
      <div className="relative w-full max-w-xs h-10 overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-full flex items-center border-y"
          style={{ borderColor, backgroundColor: 'hsl(var(--background) / 0.2)' }}
        >
          {/* We render 3 sets of marks for smooth looping if possible, but 0-360 is fine for tape */}
          <motion.div
            className="flex items-end h-full relative"
            animate={{ x: -heading * 5 + 160 }} // 5px per degree, centered at 160px
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {Array.from({ length: 73 }).map((_, i) => {
              const angle = i * 5;
              const isMajor = angle % 45 === 0;
              const dir = directions.find(d => d.angle === angle % 360);

              return (
                <div
                  key={i}
                  className="flex flex-col items-center flex-shrink-0"
                  style={{ width: 5 * 5 }} // 5 degrees * 5px = 25px
                >
                  <div
                    className={`w-px ${isMajor ? 'h-4' : 'h-2'}`}
                    style={{ background: color, opacity: isMajor ? 0.8 : 0.3 }}
                  />
                  {isMajor && (
                    <span className="text-[10px] font-bold mt-1" style={{ color }}>
                      {dir?.label || angle % 360}
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Center Marker */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 z-20"
          style={{ background: 'white', filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
        />
      </div>

      {/* Horizon/Zenith guide - simplified */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20vh] w-40 h-40 rounded-full border border-dashed opacity-20"
        style={{ borderColor }}
      />
    </div>
  );
};

export default CompassOverlay;
