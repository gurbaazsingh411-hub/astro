import { motion, AnimatePresence } from "framer-motion";
import { Move3d, Compass, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface CalibrationGuideProps {
    isVisible: boolean;
    onClose: () => void;
}

const CalibrationGuide = ({ isVisible, onClose }: CalibrationGuideProps) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setStep(1);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="glass p-6 rounded-3xl max-w-[300px] text-center space-y-5 backdrop-blur-2xl border-white/20 pointer-events-auto">
                        <motion.div
                            className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
                            animate={{
                                rotate: [0, 45, -45, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <Compass className="w-8 h-8 text-primary" />
                        </motion.div>

                        <div className="space-y-2">
                            <h3 className="font-display font-bold text-xl">
                                {step === 0 ? "Calibrating AR" : "Sensor Sync"}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step === 0
                                    ? "Point your device around the sky to sync the orientation sensors."
                                    : "Move your device in a figure-8 motion for best results."}
                            </p>
                        </div>

                        <Button
                            variant="glow"
                            size="sm"
                            className="w-full h-10 gap-2 font-medium"
                            onClick={onClose}
                        >
                            <Check className="w-4 h-4" />
                            Got it
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CalibrationGuide;
