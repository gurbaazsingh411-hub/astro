import { motion } from "framer-motion";
import { Moon, Sun, Telescope, Orbit, Satellite, Camera, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ViewSettings } from "@/types/astronomy";

interface ControlPanelProps {
  settings: ViewSettings;
  onSettingsChange: (settings: ViewSettings) => void;
  onCapture: () => void;
}

const ControlPanel = ({ settings, onSettingsChange, onCapture }: ControlPanelProps) => {
  const toggleSetting = (key: keyof ViewSettings) => {
    if (typeof settings[key] === 'boolean') {
      onSettingsChange({ ...settings, [key]: !settings[key] });
    }
  };

  const formatTimeOffset = (hours: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateOffset = (hours: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    if (hours === 0) return "Now";
    if (Math.abs(hours) < 24) return formatTimeOffset(hours);
    const days = Math.floor(hours / 24);
    return `${days > 0 ? '+' : ''}${days} day${Math.abs(days) !== 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      className="absolute bottom-4 left-4 right-4 z-20"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
    >
      <div className="glass rounded-2xl p-4 space-y-4">
        {/* Time Travel Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-display font-medium">Time Travel</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => onSettingsChange({ ...settings, timeOffset: 0 })}
              >
                Reset
              </Button>
              <span className="text-sm text-muted-foreground font-mono bg-background/50 px-2 rounded">
                {formatDateOffset(settings.timeOffset)}
              </span>
            </div>
          </div>
          <Slider
            value={[settings.timeOffset]}
            onValueChange={([value]) => onSettingsChange({ ...settings, timeOffset: value })}
            min={-168}
            max={168}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
            <span>Past 7 days</span>
            <div className="flex gap-4">
              <button onClick={() => onSettingsChange({ ...settings, timeOffset: 0 })}>Now</button>
              <button onClick={() => {
                const now = new Date();
                const tonight = new Date();
                tonight.setHours(22, 0, 0, 0);
                const diff = (tonight.getTime() - now.getTime()) / (1000 * 60 * 60);
                onSettingsChange({ ...settings, timeOffset: Math.round(diff) });
              }}>Tonight</button>
            </div>
            <span>Next 7 days</span>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={settings.showPlanets ? "glow" : "glass"}
              size="icon"
              onClick={() => toggleSetting("showPlanets")}
              title="Toggle Planets"
            >
              <Orbit className="w-4 h-4" />
            </Button>

            <Button
              variant={settings.showConstellations ? "glow" : "glass"}
              size="icon"
              onClick={() => toggleSetting("showConstellations")}
              title="Toggle Constellations"
            >
              <Telescope className="w-4 h-4" />
            </Button>

            <Button
              variant={settings.showSatellites ? "glow" : "glass"}
              size="icon"
              onClick={() => toggleSetting("showSatellites")}
              title="Toggle Satellites"
            >
              <Satellite className="w-4 h-4" />
            </Button>

            <Button
              variant={settings.nightMode ? "glow" : "glass"}
              size="icon"
              onClick={() => toggleSetting("nightMode")}
              title="Night Mode"
            >
              {settings.nightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            <Button
              variant={settings.prototypeMode ? "glow" : "glass"}
              size="icon"
              onClick={() => toggleSetting("prototypeMode")}
              title="Prototype Mode (Fixed Positions)"
              className={settings.prototypeMode ? "text-cosmic-gold" : ""}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="cosmic"
            size="default"
            onClick={onCapture}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Capture</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
