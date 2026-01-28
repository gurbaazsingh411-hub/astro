import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Calendar as CalendarIcon, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { skyEvents } from "@/data/skyEvents";
import { toast } from "sonner";

interface EventsModalProps {
    isOpen: boolean;
    onClose: () => void;
    nightMode: boolean;
}

const EventsModal = ({ isOpen, onClose, nightMode }: EventsModalProps) => {
    const handleNotifyMe = (title: string) => {
        toast.success(`You'll be notified before the ${title}!`, {
            icon: <Bell className="w-4 h-4" />
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative w-full max-w-md glass rounded-3xl overflow-hidden shadow-2xl border"
                        style={{
                            borderColor: nightMode ? 'hsl(0, 40%, 20%)' : 'hsl(185, 40%, 20%)',
                        }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-display font-bold">Sky Events</h2>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                                    Upcoming Manifestations
                                </p>
                            </div>
                            <Button
                                variant="glass"
                                size="icon"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                            {skyEvents.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    className="glass-card p-4 rounded-2xl border border-white/5 space-y-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <CalendarIcon className="w-4 h-4" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-2 text-xs"
                                            onClick={() => handleNotifyMe(event.title)}
                                        >
                                            <Bell className="w-3.5 h-3.5" />
                                            Remind Me
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-sm">{event.title}</h3>
                                        <p className="text-[10px] text-primary uppercase tracking-tighter mt-0.5">
                                            {event.date.toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Info className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">
                                All event times are shown in your local timezone. Notifications require permission.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EventsModal;
