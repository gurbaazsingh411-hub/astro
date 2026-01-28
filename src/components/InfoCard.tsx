import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Sparkles } from "lucide-react";
import { Planet, Constellation } from "@/types/astronomy";
import { Button } from "@/components/ui/button";

interface InfoCardProps {
  planet?: Planet | null;
  constellation?: Constellation | null;
  onClose: () => void;
}

const InfoCard = ({ planet, constellation, onClose }: InfoCardProps) => {
  const isOpen = !!(planet || constellation);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-4 left-4 right-4 z-30 max-w-md mx-auto"
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div 
              className="p-4 flex items-center justify-between"
              style={{
                background: planet 
                  ? `linear-gradient(135deg, ${planet.color}30 0%, transparent 100%)`
                  : 'linear-gradient(135deg, hsl(185, 70%, 40%, 0.3) 0%, transparent 100%)'
              }}
            >
              <div className="flex items-center gap-3">
                {planet && (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}80)`,
                      boxShadow: `0 0 15px ${planet.color}60`
                    }}
                  >
                    {planet.symbol}
                  </div>
                )}
                {constellation && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 border border-primary/50">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-display font-bold text-lg">
                    {planet?.name || constellation?.name}
                  </h3>
                  {constellation && (
                    <p className="text-sm text-muted-foreground italic">
                      {constellation.latinName}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {planet && (
                <>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Distance:</span>
                      <span className="font-mono text-foreground">{planet.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {planet.visibleToNakedEye ? (
                        <>
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Telescope needed</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-display font-semibold text-primary">
                      ✨ Fun Facts
                    </h4>
                    <ul className="space-y-1">
                      {planet.facts.map((fact, i) => (
                        <motion.li 
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <span className="text-accent">•</span>
                          {fact}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {constellation && (
                <div className="space-y-2">
                  <h4 className="text-sm font-display font-semibold text-primary">
                    📜 Mythology
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {constellation.mythology}
                  </p>
                  <div className="pt-2 text-xs text-muted-foreground/70">
                    {constellation.stars.length} major stars
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoCard;
