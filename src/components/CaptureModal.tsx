import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface CaptureModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
}

const CaptureModal = ({ isOpen, image, onClose }: CaptureModalProps) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!image) return;

    const link = document.createElement("a");
    link.href = image;
    link.download = `skyar-capture-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSaved(true);
    toast.success("Image saved to gallery!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = async () => {
    if (!image) return;

    try {
      // Convert dataURL to Blob for sharing
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], "skyar-capture.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My SkyAR Capture',
          text: 'Check out this amazing night sky view I captured with SkyAR!'
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
      toast.error("Share failed");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass rounded-2xl overflow-hidden max-w-md w-full"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview */}
            <div
              className="aspect-[4/3] relative overflow-hidden bg-black"
            >
              {image ? (
                <img src={image} className="w-full h-full object-cover" alt="Sky Capture" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center star-field">
                  <motion.div
                    className="text-6xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    ✦
                  </motion.div>
                </div>
              )}

              {/* Watermark Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="glass rounded-lg px-3 py-2 flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-muted-foreground">
                    {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-display font-bold text-primary tracking-tighter uppercase">SkyAR</span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <Button
                variant="glass"
                size="icon"
                className="absolute top-4 right-4 z-20"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center gap-3">
              <Button
                variant="glow"
                className="flex-1 gap-2"
                onClick={handleSave}
              >
                {saved ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {saved ? "Saved!" : "Save Image"}
              </Button>
              <Button
                variant="cosmic"
                className="flex-1 gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CaptureModal;
