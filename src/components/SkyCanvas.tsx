import { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { planets } from "@/data/planets";
import { constellations } from "@/data/constellations";
import { Planet, Constellation, ViewSettings } from "@/types/astronomy";
import PlanetMarker from "./PlanetMarker";
import ConstellationOverlay from "./ConstellationOverlay";
import CompassOverlay from "./CompassOverlay";
import CameraView from "./CameraView";
import { useLocation } from "@/hooks/useLocation";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { calculatePlanetPosition, calculateStarPosition, getBodyFromId } from "@/lib/astronomyService";
import { altAzToScreenPosition } from "@/lib/coordinateUtils";
import { calculateISSPosition } from "@/lib/satelliteService";
import html2canvas from "html2canvas";

interface SkyCanvasProps {
  settings: ViewSettings;
  onPlanetSelect: (planet: Planet) => void;
  onConstellationSelect: (constellation: Constellation) => void;
}

export interface SkyCanvasHandle {
  captureScreenshot: () => Promise<string | null>;
}

const SkyCanvas = forwardRef<SkyCanvasHandle, SkyCanvasProps>(({ settings, onPlanetSelect, onConstellationSelect }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { coords, loading: locationLoading } = useLocation();
  const { alpha, beta, hasAbsoluteOrientation } = useDeviceOrientation();
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Manual orientation for desktop fallback
  const [manualAlpha, setManualAlpha] = useState(0);
  const [manualBeta, setManualBeta] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    captureScreenshot: async () => {
      if (!containerRef.current) return null;
      try {
        const canvas = await html2canvas(containerRef.current, {
          useCORS: true,
          scale: 2, // Higher quality
          backgroundColor: null,
          logging: false
        });
        return canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Capture failed:", err);
        return null;
      }
    }
  }));

  // Ticking time for real-time sky rotation
  const [internalTime, setInternalTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setInternalTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const currentTime = useMemo(() => {
    const d = new Date(internalTime);
    d.setHours(d.getHours() + settings.timeOffset);
    return d;
  }, [internalTime, settings.timeOffset]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handle manual panning on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (alpha !== null && beta !== null) return; // Ignore if sensors are active
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    // Sensibility factors for manual rotation
    const sensitivity = 0.2;

    setManualAlpha(prev => (prev - dx * sensitivity + 360) % 360);
    setManualBeta(prev => {
      const newVal = prev + dy * sensitivity;
      return Math.max(10, Math.min(170, newVal)); // Clamp to avoid flipping
    });

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cardinalDirections = [
    { label: 'N', azimuth: 0 },
    { label: 'NE', azimuth: 45 },
    { label: 'E', azimuth: 90 },
    { label: 'SE', azimuth: 135 },
    { label: 'S', azimuth: 180 },
    { label: 'SW', azimuth: 225 },
    { label: 'W', azimuth: 270 },
    { label: 'NW', azimuth: 315 },
  ];

  const computedCardinals = useMemo(() => {
    if (locationLoading || dimensions.width === 0) return [];
    const activeAlpha = alpha ?? manualAlpha;
    const activeBeta = beta ?? manualBeta;

    return cardinalDirections.map(dir => ({
      ...dir,
      screenPos: altAzToScreenPosition(
        0, // On horizon
        dir.azimuth,
        activeAlpha,
        activeBeta,
        dimensions.width,
        dimensions.height,
        facingMode
      )
    }));
  }, [alpha, manualAlpha, beta, manualBeta, dimensions, locationLoading, facingMode]);

  // Calculate planet screen positions
  const computedPlanets = useMemo(() => {
    if (locationLoading) return [];

    const activeAlpha = alpha ?? manualAlpha;
    const activeBeta = beta ?? manualBeta;

    return planets.map(planet => {
      const body = getBodyFromId(planet.id);
      if (!body) return null;

      const celestialPos = calculatePlanetPosition(
        body,
        currentTime,
        coords.latitude,
        coords.longitude
      );

      const screenPos = altAzToScreenPosition(
        celestialPos.altitude,
        celestialPos.azimuth,
        activeAlpha,
        activeBeta,
        dimensions.width,
        dimensions.height,
        facingMode
      );

      return {
        ...planet,
        screenPos,
        celestialPos
      };
    }).filter(p => p !== null && p.screenPos !== null && p.celestialPos && p.celestialPos.altitude > -10); // Show slightly below horizon
  }, [planets, currentTime, coords, alpha, beta, manualAlpha, manualBeta, dimensions, locationLoading, facingMode]);

  // Calculate constellation screen positions
  const computedConstellations = useMemo(() => {
    if (locationLoading) return [];

    const activeAlpha = alpha ?? manualAlpha;
    const activeBeta = beta ?? manualBeta;

    return constellations.map(constellation => {
      // Calculate center position
      const centerCelestialPos = calculateStarPosition(
        constellation.ra,
        constellation.dec,
        currentTime,
        coords.latitude,
        coords.longitude
      );

      const centerScreenPos = altAzToScreenPosition(
        centerCelestialPos.altitude,
        centerCelestialPos.azimuth,
        activeAlpha,
        activeBeta,
        dimensions.width,
        dimensions.height,
        facingMode
      );

      // Calculate star positions
      const starsWithScreenPos = constellation.stars.map(star => {
        const starCelestialPos = calculateStarPosition(
          star.ra,
          star.dec,
          currentTime,
          coords.latitude,
          coords.longitude
        );

        return {
          ...star,
          screenPos: altAzToScreenPosition(
            starCelestialPos.altitude,
            starCelestialPos.azimuth,
            activeAlpha,
            activeBeta,
            dimensions.width,
            dimensions.height,
            facingMode
          )
        };
      });

      return {
        ...constellation,
        centerScreenPos,
        centerCelestialPos,
        stars: starsWithScreenPos
      };
    }).filter(c => c.centerScreenPos !== null && c.centerCelestialPos && c.centerCelestialPos.altitude > -10);
  }, [constellations, currentTime, coords, alpha, beta, manualAlpha, manualBeta, dimensions, locationLoading, facingMode]);

  const computedISS = useMemo(() => {
    if (locationLoading || dimensions.width === 0) return null;

    const activeAlpha = alpha ?? manualAlpha;
    const activeBeta = beta ?? manualBeta;

    const issCelestialPos = calculateISSPosition(
      currentTime,
      coords.latitude,
      coords.longitude
    );

    if (!issCelestialPos || issCelestialPos.altitude < -10) return null;

    const screenPos = altAzToScreenPosition(
      issCelestialPos.altitude,
      issCelestialPos.azimuth,
      activeAlpha,
      activeBeta,
      dimensions.width,
      dimensions.height,
      facingMode
    );

    return {
      screenPos,
      altitude: issCelestialPos.altitude,
      visible: issCelestialPos.altitude > 0
    };
  }, [currentTime, coords, alpha, beta, manualAlpha, manualBeta, dimensions, locationLoading, facingMode]);

  // Debug: Calculate position of Horizon (Alt = 0) at North/East/South/West
  const horizonPoints = useMemo(() => {
    if (dimensions.width === 0) return [];

    const points = [];
    const activeAlpha = alpha ?? manualAlpha;
    const activeBeta = beta ?? manualBeta;

    for (let az = 0; az <= 360; az += 10) {
      const pos = altAzToScreenPosition(0, az, activeAlpha, activeBeta, dimensions.width, dimensions.height, facingMode);
      if (isFinite(pos.x) && isFinite(pos.y)) {
        points.push(pos);
      }
    }
    return points;
  }, [alpha, beta, manualAlpha, manualBeta, dimensions, facingMode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CameraView
        nightMode={settings.nightMode}
        facingMode={facingMode}
        onFacingModeChange={setFacingMode}
      >
        <div className="relative w-full h-full">
          {/* Cardinal Directions */}
          {computedCardinals.map((dir) => (
            <motion.div
              key={dir.label}
              className="absolute pointer-events-none select-none text-foreground/50 font-bold text-xl"
              style={{
                left: dir.screenPos.x,
                top: dir.screenPos.y,
                transform: 'translate(-50%, -100%)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            >
              {dir.label}
            </motion.div>
          ))}

          {/* Constellation lines and stars */}
          <AnimatePresence>
            {settings.showConstellations && computedConstellations.map((constellation) => (
              <ConstellationOverlay
                key={constellation.id}
                constellation={constellation}
                dimensions={dimensions}
                onClick={() => onConstellationSelect(constellation)}
                nightMode={settings.nightMode}
              />
            ))}
          </AnimatePresence>

          {/* Planets */}
          <AnimatePresence>
            {settings.showPlanets && computedPlanets.map((planet) => (
              <PlanetMarker
                key={planet.id}
                planet={planet}
                position={planet.screenPos!}
                dimensions={dimensions}
                onClick={() => onPlanetSelect(planet)}
                nightMode={settings.nightMode}
                isRealPosition={true}
              />
            ))}
          </AnimatePresence>

          {/* ISS Satellite */}
          {settings.showSatellites && computedISS && computedISS.visible && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: computedISS.screenPos.x,
                top: computedISS.screenPos.y
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: settings.nightMode ? 'hsl(0, 70%, 60%)' : 'hsl(185, 80%, 70%)',
                    boxShadow: settings.nightMode
                      ? '0 0 10px hsl(0, 70%, 60%)'
                      : '0 0 10px hsl(185, 80%, 70%)'
                  }}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest text-foreground/80 whitespace-nowrap bg-background/40 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10 uppercase">
                  ISS
                </span>
              </div>
            </motion.div>
          )}

          {/* Horizon Line (Debug/Reference) */}
          {horizonPoints.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <path
                d={`M ${horizonPoints.map((p, i) => `${i === 0 ? '' : 'L'} ${p.x} ${p.y}`).join(' ')}`}
                fill="none"
                stroke={settings.nightMode ? "rgba(255, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.2)"}
                strokeWidth="1.5"
              />
            </svg>
          )}

          {/* Compass overlay */}
          <CompassOverlay
            nightMode={settings.nightMode}
            facingMode={facingMode}
          />

          {/* Debug Overlay */}
          <div className="absolute top-20 left-4 z-50 pointer-events-none bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] font-mono space-y-1 min-w-[180px]">
            <div className="text-muted-foreground uppercase text-[8px] mb-1 border-b border-white/10 pb-1">Device Orientation</div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Heading:</span>
              <span className="text-primary">{(alpha ?? manualAlpha).toFixed(1)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Pitch:</span>
              <span className="text-primary">{(beta ?? manualBeta).toFixed(1)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Look Alt:</span>
              <span className="text-primary">{((beta ?? manualBeta) - 90).toFixed(1)}°</span>
            </div>

            <div className="text-muted-foreground uppercase text-[8px] mt-2 mb-1 border-b border-white/10 pb-1">Location & Time</div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Lat:</span>
              <span className="text-primary">{coords.latitude.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Lon:</span>
              <span className="text-primary">{coords.longitude.toFixed(2)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Time:</span>
              <span className="text-primary">{currentTime.toLocaleTimeString()}</span>
            </div>

            {computedPlanets.length > 0 && (
              <>
                <div className="text-muted-foreground uppercase text-[8px] mt-2 mb-1 border-b border-white/10 pb-1">
                  {computedPlanets[0].name} Position
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Alt:</span>
                  <span className="text-green-400">{computedPlanets[0].celestialPos?.altitude.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Az:</span>
                  <span className="text-green-400">{computedPlanets[0].celestialPos?.azimuth.toFixed(1)}°</span>
                </div>
              </>
            )}

            <div className="flex justify-between gap-4 mt-2 pt-1 border-t border-white/10">
              <span className="text-muted-foreground">Mode:</span>
              <span className={alpha !== null ? "text-green-400 font-bold" : "text-amber-400"}>
                {alpha !== null ? "📡 SENSOR" : "🖱️ MANUAL"}
              </span>
            </div>
            {alpha !== null && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Compass:</span>
                <span className={hasAbsoluteOrientation ? "text-green-400" : "text-red-400"}>
                  {hasAbsoluteOrientation ? "✓ TRUE NORTH" : "✗ RELATIVE"}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Visible:</span>
              <span className="text-cyan-400">{computedPlanets.length}P / {computedConstellations.length}C</span>
            </div>
          </div>

          {/* Horizon gradient for depth */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: settings.nightMode
                ? 'linear-gradient(to top, hsl(0, 20%, 5%, 0.8) 0%, transparent 100%)'
                : 'linear-gradient(to top, hsl(230, 30%, 5%, 0.7) 0%, transparent 100%)'
            }}
          />
        </div>
      </CameraView>
    </div>
  );
});

export default SkyCanvas;
