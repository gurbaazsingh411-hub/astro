import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  nightMode: boolean;
  children: React.ReactNode;
  facingMode: "environment" | "user";
  onFacingModeChange: (mode: "environment" | "user") => void;
}

const CameraView = ({ nightMode, children, facingMode, onFacingModeChange }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera permissions to use AR mode.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is in use by another application.");
        } else {
          setError("Unable to access camera. Using simulation mode.");
        }
      }

      setIsLoading(false);
    }
  }, [facingMode]); // Removed stream from dependencies to avoid loop

  const switchCamera = useCallback(() => {
    onFacingModeChange(facingMode === "environment" ? "user" : "environment");
  }, [facingMode, onFacingModeChange]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: nightMode ? "brightness(0.7) saturate(0.3) sepia(0.5) hue-rotate(-30deg)" : "none",
          transform: facingMode === "user" ? "scaleX(-1)" : "none",
        }}
      />

      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-background/90 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="w-12 h-12 text-primary mx-auto" />
              </motion.div>
              <p className="text-muted-foreground">Accessing camera...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state with fallback */}
      {error && !isLoading && (
        <div
          className="absolute inset-0 star-field"
          style={{
            background: nightMode
              ? 'linear-gradient(180deg, hsl(0, 15%, 3%) 0%, hsl(0, 20%, 6%) 100%)'
              : 'linear-gradient(180deg, hsl(230, 30%, 5%) 0%, hsl(250, 35%, 12%) 50%, hsl(230, 25%, 8%) 100%)'
          }}
        >
          {/* Nebula effect for fallback */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: nightMode
                ? 'radial-gradient(ellipse at 30% 20%, hsl(0, 40%, 15%) 0%, transparent 50%)'
                : 'radial-gradient(ellipse at 30% 20%, hsl(270, 50%, 20%) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, hsl(200, 50%, 15%) 0%, transparent 40%)'
            }}
          />

          {/* Error message overlay */}
          <motion.div
            className="absolute top-20 left-4 right-4 z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass rounded-xl p-4 flex items-start gap-3 max-w-md mx-auto">
              <CameraOff className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startCamera}
                  className="mt-2 gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try again
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Camera switch button */}
      {stream && !error && (
        <motion.div
          className="absolute top-20 right-4 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="glass"
            size="icon"
            onClick={switchCamera}
            title="Switch camera"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Overlay content (planets, constellations, etc.) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="pointer-events-auto w-full h-full">
          {children}
        </div>
      </div>

      {/* Night mode overlay */}
      {nightMode && (
        <div
          className="absolute inset-0 pointer-events-none z-5"
          style={{
            background: 'linear-gradient(180deg, hsl(0, 30%, 10%, 0.3) 0%, hsl(0, 20%, 5%, 0.4) 100%)',
            mixBlendMode: 'multiply'
          }}
        />
      )}
    </div>
  );
};

export default CameraView;
