import { useState } from 'react';
import { Moon, Sun, Plus, TrendingUp, Clock, Tag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SleepEntry {
  id: string;
  date: Date;
  bedtime: string;
  wakeTime: string;
  duration: number; // in hours
  quality: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export function SleepTracker() {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SleepEntry | null>(null);
  const [showMoreEntries, setShowMoreEntries] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Form state
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [formBedtime, setFormBedtime] = useState('22:30');
  const [formWakeTime, setFormWakeTime] = useState('06:30');
  const [formQuality, setFormQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [formTags, setFormTags] = useState<string[]>([]);
  
  const availableTags = [
    'Late Caffeine',
    'Stressed',
    'Early Meal',
    'Late Meal',
    'Exercise',
    'Alcohol',
    'Screen Time',
    'Meditation'
  ];
  
  const toggleTag = (tag: string) => {
    setFormTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const [entries, setEntries] = useState<SleepEntry[]>([
    {
      id: '1',
      date: new Date(2026, 1, 28),
      bedtime: '10:30 PM',
      wakeTime: '6:30 AM',
      duration: 8,
      quality: 4,
      tags: ['Exercise', 'Early Meal']
    },
    {
      id: '2',
      date: new Date(2026, 1, 27),
      bedtime: '11:00 PM',
      wakeTime: '7:00 AM',
      duration: 8,
      quality: 3,
      tags: ['Screen Time', 'Late Meal']
    },
    {
      id: '3',
      date: new Date(2026, 1, 26),
      bedtime: '10:00 PM',
      wakeTime: '6:00 AM',
      duration: 8,
      quality: 5,
      tags: ['Meditation', 'Exercise']
    },
    {
      id: '4',
      date: new Date(2026, 1, 25),
      bedtime: '11:30 PM',
      wakeTime: '6:30 AM',
      duration: 7,
      quality: 3,
      tags: ['Late Caffeine', 'Stressed']
    },
    {
      id: '5',
      date: new Date(2026, 1, 24),
      bedtime: '10:15 PM',
      wakeTime: '6:45 AM',
      duration: 8.5,
      quality: 4,
      tags: ['Exercise', 'Meditation']
    }
  ]);

  // Calculate stats
  const avgDuration = entries.length > 0 
    ? (entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length)
    : 0;
  
  const avgQuality = entries.length > 0
    ? (entries.reduce((sum, entry) => sum + entry.quality, 0) / entries.length).toFixed(1)
    : 0;

  const getWeekDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekDays = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      weekDays.push({
        day: days[date.getDay()],
        date: date.getDate(),
        fullDate: date
      });
    }
    
    return weekDays;
  };

  const weekDays = getWeekDays();

  const getEntryForDate = (date: Date) => {
    return entries.find(entry => 
      entry.date.getDate() === date.getDate() &&
      entry.date.getMonth() === date.getMonth() &&
      entry.date.getFullYear() === date.getFullYear()
    );
  };

  const calculateDuration = (bedtime: string, wakeTime: string) => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    // If wake time is earlier than bedtime, it crosses midnight
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    const durationMinutes = wakeMinutes - bedMinutes;
    return Math.round((durationMinutes / 60) * 10) / 10; // Round to 1 decimal
  };

  const formatTimeTo12Hour = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h}h`;
    }
    return `${h}h ${m}m`;
  };

  const handleAddEntry = () => {
    const duration = calculateDuration(formBedtime, formWakeTime);
    const selectedDate = new Date(formDate);
    
    const newEntry: SleepEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      bedtime: formatTimeTo12Hour(formBedtime),
      wakeTime: formatTimeTo12Hour(formWakeTime),
      duration,
      quality: formQuality,
      tags: formTags
    };
    
    setEntries(prev => [newEntry, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setShowAddEntry(false);
    
    // Reset form
    const today = new Date();
    setFormDate(today.toISOString().split('T')[0]);
    setFormBedtime('22:30');
    setFormWakeTime('06:30');
    setFormQuality(3);
    setFormTags([]);
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
    setSelectedEntry(null);
  };

  // Tag insights
  const getTagInsights = () => {
    const tagStats: { [tag: string]: { quality: number[], count: number } } = {};
    
    entries.forEach(entry => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach(tag => {
          if (!tagStats[tag]) {
            tagStats[tag] = { quality: [], count: 0 };
          }
          tagStats[tag].quality.push(entry.quality);
          tagStats[tag].count++;
        });
      }
    });

    const tagAverages = Object.entries(tagStats).map(([tag, stats]) => ({
      tag,
      avgQuality: stats.quality.reduce((a, b) => a + b, 0) / stats.quality.length,
      count: stats.count
    }));

    tagAverages.sort((a, b) => b.avgQuality - a.avgQuality);

    return {
      best: tagAverages[0] || null,
      worst: tagAverages[tagAverages.length - 1] || null
    };
  };

  const tagInsights = getTagInsights();

  const displayedEntries = showMoreEntries ? entries.slice(0, 9) : entries.slice(0, 4);
  const hasMoreEntries = entries.length > 4;

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto">
      {entries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6">
            <Moon className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">No Sleep Data Yet</h3>
          <p className="text-white/60 text-sm mb-6 text-center max-w-xs">
            Start tracking your sleep to discover patterns and improve your rest
          </p>
          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-white/30 hover:bg-white/40 px-6 py-3 rounded-xl transition-all active:scale-95 backdrop-blur-sm flex items-center gap-2 text-white font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Entry</span>
          </button>
        </div>
      ) : (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-xs">Avg Duration</span>
          </div>
          <div className="text-white text-2xl font-bold">{formatDuration(avgDuration)}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-xs">Avg Quality</span>
          </div>
          <div className="text-white text-2xl font-bold">{avgQuality}/5</div>
        </div>
      </div>

      {/* Tag Insights */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-white/60" />
          <h3 className="text-white text-sm font-normal">Tag Insights</h3>
        </div>
        
        {tagInsights.best && tagInsights.worst ? (
          <div className="grid grid-cols-2 gap-3">
            {/* Best Tag */}
            <div className="bg-blue-400/10 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-lg">
              <div className="text-white/70 text-xs mb-2 text-etched-sm">Best Sleep</div>
              <div className="text-white font-medium text-sm mb-1 text-etched">{tagInsights.best.tag}</div>
              <div className="text-white/60 text-xs text-etched-sm">Avg: {tagInsights.best.avgQuality.toFixed(1)}/5</div>
            </div>

            {/* Worst Tag */}
            <div className="bg-orange-300/10 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-lg">
              <div className="text-white/70 text-xs mb-2 text-etched-sm">Worst Sleep</div>
              <div className="text-white font-medium text-sm mb-1 text-etched">{tagInsights.worst.tag}</div>
              <div className="text-white/60 text-xs text-etched-sm">Avg: {tagInsights.worst.avgQuality.toFixed(1)}/5</div>
            </div>
          </div>
        ) : (
          <div className="text-white/40 text-sm text-center py-4">
            Add entries with tags to see insights
          </div>
        )}
      </div>

      {/* Recent Entries */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-normal">Recent Sleep</h3>
          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors active:scale-95 backdrop-blur-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white text-xs">Add Entry</span>
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto" onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}>
          <AnimatePresence>
            {displayedEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedEntry(entry)}
                className="bg-white/10 rounded-xl p-3 border border-white/10 cursor-pointer hover:bg-white/15 transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white text-sm">
                    {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= entry.quality ? 'bg-white' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/60">
                    <Moon className="w-3 h-3" />
                    <span>{entry.bedtime}</span>
                  </div>
                  <div className="text-white/40">→</div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Sun className="w-3 h-3" />
                    <span>{entry.wakeTime}</span>
                  </div>
                  <div className="text-white font-medium ml-2">
                    {formatDuration(entry.duration)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMoreEntries && (
            <button
              onClick={() => setShowMoreEntries(!showMoreEntries)}
              className="w-full text-white/60 hover:text-white text-sm py-2 bg-white/10 hover:bg-white/15 rounded-xl transition-all"
            >
              {showMoreEntries ? 'Show Less' : 'View More'}
            </button>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowAddEntry(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 35, stiffness: 250, mass: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/20 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl p-4 max-w-sm w-full border border-white/30 shadow-2xl"
            >
              <h3 className="text-white text-base font-medium mb-3 text-center">Add Sleep Entry</h3>
              
              <div className="space-y-3">
                {/* Date */}
                <div>
                  <label className="text-white/80 text-xs mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                {/* Bedtime & Wake Time */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Bedtime */}
                  <div>
                    <label className="text-white/80 text-xs mb-1.5 block flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5" />
                      Bedtime
                    </label>
                    <input
                      type="time"
                      value={formBedtime}
                      onChange={(e) => setFormBedtime(e.target.value)}
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-2.5 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>

                  {/* Wake Time */}
                  <div>
                    <label className="text-white/80 text-xs mb-1.5 block flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      Wake Time
                    </label>
                    <input
                      type="time"
                      value={formWakeTime}
                      onChange={(e) => setFormWakeTime(e.target.value)}
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-2.5 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                {/* Sleep Quality */}
                <div>
                  <label className="text-white/80 text-xs mb-2 block">Sleep Quality</label>
                  <div className="flex justify-between gap-1.5">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormQuality(rating as 1 | 2 | 3 | 4 | 5)}
                          className={`flex-1 py-2.5 rounded-xl transition-all ${
                            formQuality === rating
                              ? 'bg-white/50 scale-105'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <div className="text-white text-base font-medium">{rating}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-white/40 text-[10px] mt-1.5 px-0.5">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-white/80 text-xs mb-2 block">Tags (Optional)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(showAllTags ? availableTags : availableTags.slice(0, 4)).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
                          formTags.includes(tag)
                            ? 'bg-white/30 text-white scale-105'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {!showAllTags && (
                      <button
                        type="button"
                        onClick={() => setShowAllTags(true)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-all"
                      >
                        +{availableTags.length - 4} more
                      </button>
                    )}
                    {showAllTags && availableTags.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowAllTags(false)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-all"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>

                {/* Duration Preview */}
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-white/60 text-[10px] mb-0.5">Duration</div>
                  <div className="text-white text-lg font-medium">
                    {formatDuration(calculateDuration(formBedtime, formWakeTime))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddEntry(false);
                    setShowAllTags(false);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddEntry();
                    setShowAllTags(false);
                  }}
                  className="flex-1 bg-white/30 hover:bg-white/40 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                >
                  Add Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Entry Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/30 shadow-2xl"
            >
              <h3 className="text-white text-lg font-medium mb-5 text-center">
                {selectedEntry.date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              
              <div className="space-y-4">
                {/* Sleep Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <Moon className="w-4 h-4" />
                      <span>Bedtime</span>
                    </div>
                    <div className="text-white text-lg font-medium">{selectedEntry.bedtime}</div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <Sun className="w-4 h-4" />
                      <span>Wake Time</span>
                    </div>
                    <div className="text-white text-lg font-medium">{selectedEntry.wakeTime}</div>
                  </div>
                </div>

                {/* Duration & Quality */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-white/60 text-xs mb-2">Duration</div>
                    <div className="text-white text-2xl font-bold">{formatDuration(selectedEntry.duration)}</div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-white/60 text-xs mb-2">Quality</div>
                    <div className="text-white text-2xl font-bold">{selectedEntry.quality}/5</div>
                  </div>
                </div>

                {/* Quality Stars */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-xs mb-3 text-center">Sleep Quality</div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const colorMap = {
                        1: 'bg-orange-400/70',
                        2: 'bg-orange-300/60',
                        3: 'bg-teal-300/50',
                        4: 'bg-blue-400/70',
                        5: 'bg-blue-600/70'
                      };
                      
                      return (
                        <div
                          key={star}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium ${
                            star === selectedEntry.quality
                              ? colorMap[star as keyof typeof colorMap]
                              : 'bg-white/10'
                          }`}
                        >
                          {star}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tags */}
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-white/60 text-xs mb-3">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag) => (
                        <div
                          key={tag}
                          className="px-3 py-2 rounded-lg text-xs bg-white/30 text-white"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEntry(selectedEntry.id);
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex-1 bg-white/30 hover:bg-white/40 text-white py-3 rounded-xl transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}