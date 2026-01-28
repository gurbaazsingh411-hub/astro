import { motion } from "framer-motion";
import { Telescope, Clock, Camera, Moon, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { toast } from "sonner";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const { requestPermission } = useDeviceOrientation();

  const handleStart = async () => {
    const granted = await requestPermission();
    if (!granted) {
      toast.info("AR mode works best with motion sensors. Switching to manual mode.");
    } else {
      toast.success("Sensors calibrated!");
    }
    onStart();
  };

  const features = [
    { icon: Telescope, label: "Planets & Stars", desc: "Identify celestial objects" },
    { icon: Clock, label: "Time Travel", desc: "View past & future skies" },
    { icon: Camera, label: "Photo Mode", desc: "Capture & share moments" },
    { icon: Moon, label: "Night Mode", desc: "Red-tinted for stargazing" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 star-field opacity-50" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(270, 50%, 15%) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, hsl(185, 50%, 10%) 0%, transparent 40%)'
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(185, 80%, 50%) 0%, transparent 70%)',
          top: '10%',
          right: '10%'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, hsl(270, 60%, 50%) 0%, transparent 70%)',
          bottom: '20%',
          left: '5%'
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-8 relative"
          style={{
            background: 'linear-gradient(135deg, hsl(185, 80%, 45%) 0%, hsl(270, 60%, 45%) 100%)',
            boxShadow: '0 0 60px hsl(185, 80%, 45%, 0.4), 0 20px 40px hsl(230, 50%, 5%, 0.5)'
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ✦
          </motion.span>
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-cosmic-gold"
            style={{ boxShadow: '0 0 10px hsl(40, 95%, 60%)' }}
            animate={{
              rotate: 360
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            initial={{ x: 50 }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-display font-bold text-5xl mb-3 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, backgroundPosition: ['0% center', '200% center'] }}
          transition={{
            y: { delay: 0.4 },
            opacity: { delay: 0.4 },
            backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" }
          }}
        >
          SkyAR
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Point your device to the sky.
          <br />
          <span className="text-foreground font-medium">Discover the universe.</span>
        </motion.p>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              className="glass rounded-xl p-4 text-left group cursor-default"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <feature.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold text-sm mb-0.5">{feature.label}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            variant="cosmic"
            size="xl"
            onClick={handleStart}
            className="group w-full"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Exploring</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Demo note */}
        <motion.p
          className="text-xs text-muted-foreground/50 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          PWA-ready • Works on mobile browsers • No app install needed
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
