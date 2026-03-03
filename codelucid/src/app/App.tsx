import { useState, useRef } from 'react';
import { BedtimeCalculator } from './components/BedtimeCalculator';
import { SleepTracker } from './components/SleepTracker';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';

type Tab = 'bedtime' | 'tracker';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('bedtime');
  const [bedtimeHour24, setBedtimeHour24] = useState<number>(23); // Default to 11 PM
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold && activeTab === 'tracker') {
      // Swipe right - go to bedtime
      setActiveTab('bedtime');
    } else if (info.offset.x < -swipeThreshold && activeTab === 'bedtime') {
      // Swipe left - go to tracker
      setActiveTab('tracker');
    }
    
    x.set(0);
  };

  // Calculate gradient colors based on bedtime
  const getGradientColors = (hour24: number) => {
    // Map bedtime to color intensity
    // Earlier bedtimes (9-10 PM / 21-22) -> more peach
    // Later bedtimes (12-2 AM / 0-2) -> more blue
    
    // Normalize to 0-1 scale where:
    // 21:00 (9 PM) = 0 (most peach)
    // 02:00 (2 AM) = 1 (most blue)
    let normalized;
    if (hour24 >= 21) {
      // 9 PM to midnight
      normalized = (hour24 - 21) / 5; // 0 to 0.6
    } else if (hour24 <= 3) {
      // Midnight to 3 AM
      normalized = 0.6 + (hour24 / 3) * 0.4; // 0.6 to 1
    } else {
      // Other times default to middle
      normalized = 0.5;
    }

    // Interpolate colors
    const peachTop = { r: 212, g: 164, b: 148 }; // #D4A494
    const blueTop = { r: 160, g: 150, b: 170 }; // More mauve-blue
    
    const peachMid = { r: 159, g: 139, b: 146 }; // #9F8B92
    const blueMid = { r: 90, g: 90, b: 110 }; // Cooler mid
    
    const topColor = {
      r: Math.round(peachTop.r + (blueTop.r - peachTop.r) * normalized),
      g: Math.round(peachTop.g + (blueTop.g - peachTop.g) * normalized),
      b: Math.round(peachTop.b + (blueTop.b - peachTop.b) * normalized),
    };
    
    const midColor = {
      r: Math.round(peachMid.r + (blueMid.r - peachMid.r) * normalized),
      g: Math.round(peachMid.g + (blueMid.g - peachMid.g) * normalized),
      b: Math.round(peachMid.b + (blueMid.b - peachMid.b) * normalized),
    };

    return {
      top: `rgb(${topColor.r}, ${topColor.g}, ${topColor.b})`,
      topRgb: `${topColor.r}, ${topColor.g}, ${topColor.b}`,
      mid: `rgb(${midColor.r}, ${midColor.g}, ${midColor.b})`,
      bottom: '#3A4A5A' // Keep bottom consistent
    };
  };

  const gradientColors = getGradientColors(bedtimeHour24);

  return (
  <div className="min-h-screen w-full flex items-center justify-center p-4">
    <div
      className="h-[100vh] max-h-[840px] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-gradient"
      style={{
        background: `linear-gradient(to bottom, ${gradientColors.top}, ${gradientColors.mid}, ${gradientColors.bottom})`,
        transition: 'background 4s ease-in-out'
      }}
    >
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center pt-6 pb-4">
          <h1 className="text-white text-xl font-normal tracking-wide text-etched">lucid</h1>
        </div>

        {/* Tabs */}
        <div className="px-3 mb-8">
          <div className="flex gap-1.5 justify-center">
            <button
              onClick={() => setActiveTab('bedtime')}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === 'bedtime'
                  ? 'bg-white'
                  : 'bg-white/20 text-white'
              }`}
              style={activeTab === 'bedtime' ? { color: `rgb(${gradientColors.topRgb})` } : undefined}
            >
              Bedtime
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === 'tracker'
                  ? 'bg-white'
                  : 'bg-white/20 text-white'
              }`}
              style={activeTab === 'tracker' ? { color: `rgb(${gradientColors.topRgb})` } : undefined}
            >
              Tracker
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-3 pb-6">
          <motion.div
            ref={containerRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'bedtime' && (
                <motion.div
                  key="bedtime"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <BedtimeCalculator onBedtimeChange={setBedtimeHour24} />
                </motion.div>
              )}
              {activeTab === 'tracker' && (
                <motion.div
                  key="tracker"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <SleepTracker />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
  );
}
