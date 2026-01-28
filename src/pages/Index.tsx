import { useState, useRef } from "react";
import { Planet, Constellation, ViewSettings } from "@/types/astronomy";
import WelcomeScreen from "@/components/WelcomeScreen";
import SkyCanvas, { SkyCanvasHandle } from "@/components/SkyCanvas";
import Header from "@/components/Header";
import ControlPanel from "@/components/ControlPanel";
import InfoCard from "@/components/InfoCard";
import CaptureModal from "@/components/CaptureModal";
import EventsModal from "@/components/EventsModal";
import { toast } from "sonner";

const Index = () => {
  const [started, setStarted] = useState(false);
  const [settings, setSettings] = useState<ViewSettings>({
    showConstellations: true,
    showPlanets: true,
    showSatellites: true,
    nightMode: false,
    timeOffset: 0,
  });
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const skyCanvasRef = useRef<SkyCanvasHandle>(null);

  const handleStart = () => {
    setStarted(true);
  };

  const handlePlanetSelect = (planet: Planet) => {
    setSelectedConstellation(null);
    setSelectedPlanet(planet);
  };

  const handleConstellationSelect = (constellation: Constellation) => {
    setSelectedPlanet(null);
    setSelectedConstellation(constellation);
  };

  const handleCloseInfo = () => {
    setSelectedPlanet(null);
    setSelectedConstellation(null);
  };

  const handleCapture = async () => {
    if (skyCanvasRef.current) {
      toast.info("Capturing your sky view...");
      const image = await skyCanvasRef.current.captureScreenshot();
      if (image) {
        setCapturedImage(image);
        setShowCapture(true);
      } else {
        toast.error("Capture failed. Please try again.");
      }
    }
  };

  if (!started) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className={`h-screen w-screen overflow-hidden relative ${settings.nightMode ? 'night-mode' : ''}`}>
      {/* Main sky canvas */}
      <SkyCanvas
        ref={skyCanvasRef}
        settings={settings}
        onPlanetSelect={handlePlanetSelect}
        onConstellationSelect={handleConstellationSelect}
      />

      {/* Header */}
      <Header
        nightMode={settings.nightMode}
        onEventsClick={() => setShowEvents(true)}
      />

      {/* Info card */}
      <InfoCard
        planet={selectedPlanet}
        constellation={selectedConstellation}
        onClose={handleCloseInfo}
      />

      {/* Control panel */}
      <ControlPanel
        settings={settings}
        onSettingsChange={setSettings}
        onCapture={handleCapture}
      />

      <CaptureModal
        isOpen={showCapture}
        image={capturedImage}
        onClose={() => {
          setShowCapture(false);
          setCapturedImage(null);
        }}
      />

      {/* Events modal */}
      <EventsModal
        isOpen={showEvents}
        onClose={() => setShowEvents(false)}
        nightMode={settings.nightMode}
      />
    </div>
  );
};

export default Index;
