import { motion, AnimatePresence } from "framer-motion";
import { Move, Compass } from "lucide-react";
import { useEffect, useState } from "react";

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
            }, 3000);

            const closeTimer = setTimeout(() => {
                onClose();
            }, 8000);

            return () => {
                clearTimeout(timer);
                clearTimeout(closeTimer);
            };
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="glass p-6 rounded-3xl max-w-[280px] text-center space-y-4 backdrop-blur-xl border-white/20">
                        <motion.div
                            className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
                            animate={{
                                rotate: [0, 45, -45, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {step === 0 ? <Move className="w-8 h-8 text-primary" /> : <Compass className="w-8 h-8 text-cosmic-gold" />}
                        </motion.div>

                        <div className="space-y-1">
                            <h3 className="font-display font-bold text-lg">
                                {step === 0 ? "Calibrating Sensors" : "Figure-8 Motion"}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step === 0
                                    ? "Point your device around to sync with the stars."
                                    : "Move your device in a figure-8 motion for better compass accuracy."}
                            </p>
                        </div>

                        <div className="flex justify-center gap-1">
                            {[0, 1].map((i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${step === i ? 'bg-primary' : 'bg-primary/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CalibrationGuide;
