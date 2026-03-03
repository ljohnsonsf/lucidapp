import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function BedtimeCalculator({ onBedtimeChange }: { onBedtimeChange?: (hour24: number) => void }) {
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(30);
  const [wakePeriod, setWakePeriod] = useState<'AM' | 'PM'>('AM');
  const [sleepHours, setSleepHours] = useState(8.5);
  const [useCycles, setUseCycles] = useState(false);
  const [sleepCycles, setSleepCycles] = useState(5); // 5 cycles = 7.5 hours
  
  // Drag state
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'hour' | 'minute' | 'period' | null>(null);

  // 3D tilt state for cards
  const [wakeCardTilt, setWakeCardTilt] = useState({ x: 0, y: 0 });
  const [bedtimeCardTilt, setBedtimeCardTilt] = useState({ x: 0, y: 0 });
  const [tipsCardTilt, setTipsCardTilt] = useState({ x: 0, y: 0 });

  // Sleep tips rotation
  const sleepTips = [
    "Avoid screens 30-60 minutes before bedtime for better sleep quality",
    "Keep your bedroom cool (60-67°F / 15-19°C) for optimal sleep",
    "Avoid caffeine at least 6 hours before your planned bedtime",
    "Waking during light sleep feels more refreshing than deep sleep"
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % sleepTips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, [sleepTips.length]);

  // Calculate bedtime
  const calculateBedtime = () => {
    // Convert wake time to 24-hour format
    let wakeTime24 = wakeHour;
    if (wakePeriod === 'PM' && wakeHour !== 12) {
      wakeTime24 += 12;
    } else if (wakePeriod === 'AM' && wakeHour === 12) {
      wakeTime24 = 0;
    }

    // Calculate total minutes from midnight for wake time
    const wakeMinutesFromMidnight = wakeTime24 * 60 + wakeMinute;

    // Subtract sleep time (convert hours to minutes)
    const sleepMinutes = useCycles ? sleepCycles * 90 : sleepHours * 60;
    let bedtimeMinutesFromMidnight = wakeMinutesFromMidnight - sleepMinutes;

    // Handle negative values (previous day)
    if (bedtimeMinutesFromMidnight < 0) {
      bedtimeMinutesFromMidnight += 24 * 60;
    }

    // Convert back to hours and minutes
    const bedtimeHour24 = Math.floor(bedtimeMinutesFromMidnight / 60);
    const bedtimeMinute = Math.floor(bedtimeMinutesFromMidnight % 60);

    // Convert to 12-hour format
    let bedtimeHour12 = bedtimeHour24;
    let bedtimePeriod: 'AM' | 'PM' = 'AM';

    if (bedtimeHour24 >= 12) {
      bedtimePeriod = 'PM';
      if (bedtimeHour24 > 12) {
        bedtimeHour12 = bedtimeHour24 - 12;
      }
    } else if (bedtimeHour24 === 0) {
      bedtimeHour12 = 12;
    }

    return {
      hour: bedtimeHour12,
      minute: bedtimeMinute,
      period: bedtimePeriod,
    };
  };

  const bedtime = calculateBedtime();

  // Notify parent component of bedtime change
  useEffect(() => {
    if (onBedtimeChange) {
      // Convert bedtime back to 24-hour format
      let hour24 = bedtime.hour;
      if (bedtime.period === 'PM' && bedtime.hour !== 12) {
        hour24 = bedtime.hour + 12;
      } else if (bedtime.period === 'AM' && bedtime.hour === 12) {
        hour24 = 0;
      }
      onBedtimeChange(hour24);
    }
  }, [wakeHour, wakeMinute, wakePeriod, sleepHours, sleepCycles, useCycles, onBedtimeChange]);

  const incrementWakeTime = () => {
    let newMinute = wakeMinute + 15;
    let newHour = wakeHour;
    let newPeriod = wakePeriod;

    if (newMinute >= 60) {
      newMinute = 0;
      newHour += 1;
      if (newHour > 12) {
        newHour = 1;
      } else if (newHour === 12) {
        newPeriod = wakePeriod === 'AM' ? 'PM' : 'AM';
      }
    }

    setWakeMinute(newMinute);
    setWakeHour(newHour);
    setWakePeriod(newPeriod);
  };

  const decrementWakeTime = () => {
    let newMinute = wakeMinute - 15;
    let newHour = wakeHour;
    let newPeriod = wakePeriod;

    if (newMinute < 0) {
      newMinute = 45;
      newHour -= 1;
      if (newHour < 1) {
        newHour = 12;
      } else if (newHour === 11 && wakeHour === 12) {
        newPeriod = wakePeriod === 'AM' ? 'PM' : 'AM';
      }
    }

    setWakeMinute(newMinute);
    setWakeHour(newHour);
    setWakePeriod(newPeriod);
  };

  const incrementHour = () => {
    let newHour = wakeHour + 1;
    let newPeriod = wakePeriod;
    if (newHour > 12) {
      newHour = 1;
    } else if (newHour === 12) {
      newPeriod = wakePeriod === 'AM' ? 'PM' : 'AM';
    }
    setWakeHour(newHour);
    setWakePeriod(newPeriod);
  };

  const decrementHour = () => {
    let newHour = wakeHour - 1;
    let newPeriod = wakePeriod;
    if (newHour < 1) {
      newHour = 12;
    }
    if (wakeHour === 12) {
      newPeriod = wakePeriod === 'AM' ? 'PM' : 'AM';
    }
    setWakeHour(newHour);
    setWakePeriod(newPeriod);
  };

  const incrementMinute = () => {
    const newMinute = wakeMinute + 15;
    if (newMinute >= 60) {
      setWakeMinute(0);
    } else {
      setWakeMinute(newMinute);
    }
  };

  const decrementMinute = () => {
    const newMinute = wakeMinute - 15;
    if (newMinute < 0) {
      setWakeMinute(45);
    } else {
      setWakeMinute(newMinute);
    }
  };

  const togglePeriod = () => {
    setWakePeriod(wakePeriod === 'AM' ? 'PM' : 'AM');
  };

  // Drag handlers
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent, type: 'hour' | 'minute' | 'period') => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart(clientY);
    setDragType(type);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStart === null || dragType === null) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = dragStart - clientY;
    const threshold = 30; // pixels to drag for one increment
    
    if (Math.abs(delta) >= threshold) {
      const steps = Math.floor(Math.abs(delta) / threshold);
      
      if (dragType === 'hour') {
        if (delta > 0) {
          for (let i = 0; i < steps; i++) incrementHour();
        } else {
          for (let i = 0; i < steps; i++) decrementHour();
        }
      } else if (dragType === 'minute') {
        if (delta > 0) {
          for (let i = 0; i < steps; i++) incrementMinute();
        } else {
          for (let i = 0; i < steps; i++) decrementMinute();
        }
      } else if (dragType === 'period') {
        togglePeriod();
      }
      
      setDragStart(clientY);
    }
  };

  const handleDragEnd = () => {
    setDragStart(null);
    setDragType(null);
  };

  const incrementSleepHours = () => {
    setSleepHours(prev => Math.min(prev + 0.5, 12));
  };

  const decrementSleepHours = () => {
    setSleepHours(prev => Math.max(prev - 0.5, 1));
  };

  const incrementCycles = () => {
    setSleepCycles(prev => Math.min(prev + 1, 8));
  };

  const decrementCycles = () => {
    setSleepCycles(prev => Math.max(prev - 1, 3));
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      {/* Wake Time Card */}
      <div 
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)] border border-white/30"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const tiltX = (x - centerX) / centerX * 5;
          const tiltY = (y - centerY) / centerY * 5;
          setWakeCardTilt({ x: tiltX, y: tiltY });
        }}
        onMouseLeave={() => setWakeCardTilt({ x: 0, y: 0 })}
        style={{
          transform: `rotateX(${wakeCardTilt.y}deg) rotateY(${wakeCardTilt.x}deg)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <h2 className="text-white text-sm font-normal mb-4 text-center text-etched-sm">
          What time are you waking up?
        </h2>

        {/* Time Display */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center justify-center gap-2">
            {/* Hour Control */}
            <div className="flex flex-col items-center">
              <div 
                className="bg-white/15 backdrop-blur-sm px-4 py-6 rounded-xl min-w-[70px] text-center cursor-grab active:cursor-grabbing select-none touch-none overflow-hidden"
                onTouchStart={(e) => handleDragStart(e, 'hour')}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e, 'hour')}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="text-xs text-white/50 mb-1 text-etched-sm">HOUR</div>
                <div className="relative h-12 flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={wakeHour}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute text-4xl font-bold text-white tracking-tight tabular-nums text-etched-lg"
                    >
                      {wakeHour}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="text-4xl font-bold text-white mb-2 text-etched-lg">:</div>

            {/* Minute Control */}
            <div className="flex flex-col items-center">
              <div 
                className="bg-white/15 backdrop-blur-sm px-4 py-6 rounded-xl min-w-[70px] text-center cursor-grab active:cursor-grabbing select-none touch-none overflow-hidden"
                onTouchStart={(e) => handleDragStart(e, 'minute')}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e, 'minute')}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="text-xs text-white/50 mb-1 text-etched-sm">MIN</div>
                <div className="relative h-12 flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={wakeMinute}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute text-4xl font-bold text-white tracking-tight tabular-nums text-etched-lg"
                    >
                      {wakeMinute.toString().padStart(2, '0')}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Period Control */}
            <div className="flex flex-col items-center ml-2">
              <div 
                className="bg-white/15 backdrop-blur-sm px-3 py-6 rounded-xl min-w-[65px] text-center cursor-grab active:cursor-grabbing select-none touch-none overflow-hidden"
                onTouchStart={(e) => handleDragStart(e, 'period')}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e, 'period')}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="text-xs text-white/50 mb-1 text-etched-sm">PERIOD</div>
                <div className="relative h-12 flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={wakePeriod}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute text-2xl font-bold text-white tracking-tight text-etched"
                    >
                      {wakePeriod}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20 my-4"></div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setUseCycles(false)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              !useCycles 
                ? 'bg-white/30 text-white backdrop-blur-sm' 
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            Duration
          </button>
          <button
            onClick={() => setUseCycles(true)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              useCycles 
                ? 'bg-white/30 text-white backdrop-blur-sm' 
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            Sleep Cycles
          </button>
        </div>

        {/* Sleep Hours or Cycles */}
        {!useCycles ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-white text-xs text-center text-etched-sm">
              How many hours of sleep do you want?
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={decrementSleepHours}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors active:scale-95 backdrop-blur-sm"
                aria-label="Decrement sleep hours"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
              
              <div className="text-white text-xl font-medium min-w-[100px] text-center text-etched">
                {sleepHours} hours
              </div>
              
              <button
                onClick={incrementSleepHours}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors active:scale-95 backdrop-blur-sm"
                aria-label="Increment sleep hours"
              >
                <ChevronUp className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-white text-xs text-center text-etched-sm">
              How many sleep cycles? (90 min each)
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={decrementCycles}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors active:scale-95 backdrop-blur-sm"
                aria-label="Decrement sleep cycles"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
              
              <div className="text-white text-xl font-medium min-w-[120px] text-center text-etched">
                {sleepCycles} cycles
              </div>
              
              <button
                onClick={incrementCycles}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors active:scale-95 backdrop-blur-sm"
                aria-label="Increment sleep cycles"
              >
                <ChevronUp className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="text-white/60 text-xs text-etched-sm">
              ({(sleepCycles * 1.5).toFixed(1)} hours total)
            </div>
          </div>
        )}
      </div>

      {/* Bedtime Result Card */}
      <div 
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)] border border-white/30 relative overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const tiltX = (x - centerX) / centerX * 5;
          const tiltY = (y - centerY) / centerY * 5;
          setBedtimeCardTilt({ x: tiltX, y: tiltY });
        }}
        onMouseLeave={() => setBedtimeCardTilt({ x: 0, y: 0 })}
        style={{
          transform: `rotateX(${bedtimeCardTilt.y}deg) rotateY(${bedtimeCardTilt.x}deg)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
        
        <h2 className="text-white text-sm font-normal mb-3 text-center relative z-10 text-etched-sm">
          You should go to bed at:
        </h2>
        <div className="relative h-16 flex items-center justify-center overflow-hidden z-10">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${bedtime.hour}-${bedtime.minute}-${bedtime.period}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute text-5xl font-bold text-center tracking-tight tabular-nums text-white text-etched-lg"
            >
              {bedtime.hour}:{bedtime.minute.toString().padStart(2, '0')} {bedtime.period}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sleep Tips Card */}
      <div 
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)] border border-white/30 mt-2"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const tiltX = (x - centerX) / centerX * 5;
          const tiltY = (y - centerY) / centerY * 5;
          setTipsCardTilt({ x: tiltX, y: tiltY });
        }}
        onMouseLeave={() => setTipsCardTilt({ x: 0, y: 0 })}
        style={{
          transform: `rotateX(${tipsCardTilt.y}deg) rotateY(${tipsCardTilt.x}deg)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <div className="relative h-20 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute text-white/80 text-sm text-center px-4 leading-relaxed text-etched-sm"
            >
              {sleepTips[currentTipIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Tip indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {sleepTips.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentTipIndex 
                  ? 'w-6 bg-white/60' 
                  : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}