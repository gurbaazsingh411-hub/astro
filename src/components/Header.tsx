import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";

interface HeaderProps {
  nightMode: boolean;
  onEventsClick: () => void;
}

const Header = ({ nightMode, onEventsClick }: HeaderProps) => {
  const now = new Date();

  return (
    <motion.header
      className="absolute top-0 left-0 right-0 z-20 p-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer"
            style={{
              background: nightMode
                ? 'linear-gradient(135deg, hsl(0, 60%, 35%) 0%, hsl(0, 50%, 25%) 100%)'
                : 'linear-gradient(135deg, hsl(185, 80%, 45%) 0%, hsl(270, 60%, 45%) 100%)',
              boxShadow: nightMode
                ? '0 0 20px hsl(0, 60%, 35%, 0.4)'
                : '0 0 20px hsl(185, 80%, 45%, 0.4)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✦
          </motion.div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">
              SkyAR
            </h1>
            <p className="text-xs text-muted-foreground">
              Explore the cosmos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Auto</span>
          </div>
          <motion.button
            className="glass rounded-lg px-3 py-1.5 flex items-center gap-2"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onEventsClick}
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">
              {now.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
