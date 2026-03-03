import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, X, Sparkles } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface AnimatingLine {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midY: number;
  textStartX: number;
  textEndX: number;
}

const INSPIRATIONAL_QUOTES = [
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    text: "You may delay, but time will not.",
    author: "Benjamin Franklin"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    author: "Stephen King"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  }
];

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatingLine, setAnimatingLine] = useState<AnimatingLine | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const brandIconRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const todoRefs = useRef<{ [key: string]: { checkbox: HTMLButtonElement | null, text: HTMLSpanElement | null } }>({});

  // Rotate quotes every 4 seconds when celebration is shown
  useEffect(() => {
    if (showCelebration) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showCelebration]);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // If unchecking, just toggle immediately
    if (todo.completed) {
      const newTodos = todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      setTodos(newTodos);
      return;
    }

    // If checking, trigger the animation
    const brandIcon = brandIconRef.current;
    const container = containerRef.current;
    const todoElements = todoRefs.current[id];

    if (brandIcon && container && todoElements.checkbox && todoElements.text) {
      const brandRect = brandIcon.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const checkboxRect = todoElements.checkbox.getBoundingClientRect();
      const textRect = todoElements.text.getBoundingClientRect();

      // Calculate positions relative to container
      // The inner circle is at the center of the 30x30 SVG
      const startX = brandRect.left + 14.5 - containerRect.left;
      const startY = brandRect.top + 15 - containerRect.top;
      const endX = checkboxRect.left + checkboxRect.width / 2 - containerRect.left;
      const endY = checkboxRect.top + checkboxRect.height / 2 - containerRect.top;
      const midY = textRect.top + textRect.height / 2 - containerRect.top;
      const textStartX = startX;
      const textEndX = endX;

      setAnimatingLine({
        id,
        startX,
        startY,
        endX,
        endY,
        midY,
        textStartX,
        textEndX
      });

      // Complete the todo after animation finishes
      setTimeout(() => {
        const newTodos = todos.map(t =>
          t.id === id ? { ...t, completed: true } : t
        );
        setTodos(newTodos);
        setAnimatingLine(null);

        // Check if all todos are completed
        const allCompleted = newTodos.length > 0 && newTodos.every(todo => todo.completed);
        if (allCompleted) {
          setShowCelebration(true);
        }
      }, 1800);
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#f5f3ed] flex items-center justify-center p-6" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[#f5f3ed] border border-[#2d2d2d]/10 rounded-lg shadow-lg p-10 relative"
        ref={containerRef}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          minHeight: '500px',
          maxHeight: '85vh'
        }}
      >
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="absolute top-[52px] right-10"
          ref={brandIconRef}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#2d2d2d" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2.5" fill="#2d2d2d" />
          </svg>
        </motion.div>

        {/* Header */}
        <div className="mb-10">
          <motion.h1
            className="text-3xl text-[#2d2d2d] mb-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Today
          </motion.h1>
          <motion.div
            className="w-12 h-px bg-[#2d2d2d]"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
          <motion.p
            className="text-sm text-[#7a7a7a] mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {formattedDate}
          </motion.p>
          {totalCount > 0 && (
            <motion.p
              className="text-xs text-[#7a7a7a] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {completedCount} of {totalCount}
            </motion.p>
          )}
        </div>

        {/* Todo List */}
        <div className="space-y-1 mb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 260px)' }}>
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="group"
              >
                <div className="py-3 px-1 flex items-start gap-3 hover:bg-[#2d2d2d]/5 rounded transition-colors">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border transition-all ${
                      todo.completed
                        ? 'bg-[#2d2d2d] border-[#2d2d2d]'
                        : 'border-[#2d2d2d]/30 hover:border-[#2d2d2d]'
                    }`}
                    ref={el => todoRefs.current[todo.id] = { ...todoRefs.current[todo.id], checkbox: el }}
                  >
                    <AnimatePresence>
                      {todo.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center justify-center h-full"
                        >
                          <Check className="w-3.5 h-3.5 text-[#f5f3ed]" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Text */}
                  <span
                    className={`flex-1 transition-all leading-relaxed ${
                      todo.completed
                        ? 'line-through text-[#b8b8b8]'
                        : 'text-[#2d2d2d]'
                    }`}
                    style={{ fontFamily: 'Georgia, serif' }}
                    ref={el => todoRefs.current[todo.id] = { ...todoRefs.current[todo.id], text: el }}
                  >
                    {todo.text}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <X className="w-4 h-4 text-[#7a7a7a] hover:text-[#2d2d2d]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {todos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12 text-[#b8b8b8]"
          >
            <p className="text-sm" style={{ fontFamily: 'Georgia, serif' }}>Your list is empty</p>
          </motion.div>
        )}

        {/* Input Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex gap-2 items-center border-b border-[#2d2d2d]/20 pb-2">
            <Plus className="w-4 h-4 text-[#7a7a7a]" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a task..."
              className="flex-1 bg-transparent text-[#2d2d2d] placeholder:text-[#b8b8b8] focus:outline-none text-sm"
              style={{ fontFamily: 'Georgia, serif' }}
            />
          </div>
        </motion.div>

        {/* Animated Strike Line */}
        <AnimatePresence>
          {animatingLine && (
            <motion.svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path
                d={`M ${animatingLine.startX} ${animatingLine.startY} 
                    L ${animatingLine.startX} ${animatingLine.midY}
                    L ${animatingLine.textEndX} ${animatingLine.midY}
                    L ${animatingLine.endX} ${animatingLine.endY}`}
                stroke="#2d2d2d"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ 
                  pathLength: [0, 0.3, 0.3],
                  pathOffset: [0, 0, 0.7]
                }}
                transition={{ 
                  duration: 1.8, 
                  ease: "linear",
                  times: [0, 0.05, 1]
                }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2d2d2d]/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowCelebration(false)}
          >
            {/* Success Message - Larger popup with quotes */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="bg-[#f5f3ed] border border-[#2d2d2d]/20 rounded-lg shadow-2xl px-12 py-16 mx-4 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-3xl text-[#2d2d2d] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                  You did everything!
                  <br />
                  <span className="text-2xl">Now go frolic in like, a field or something?</span>
                </h2>
                <div className="w-12 h-px bg-[#2d2d2d] mx-auto mb-6" />
                <p className="text-[#7a7a7a] text-sm mb-12" style={{ fontFamily: 'Georgia, serif' }}>
                  All tasks completed
                </p>

                {/* Rotating quotes carousel */}
                <div className="relative h-40 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuoteIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex flex-col items-center justify-center px-4"
                    >
                      <p 
                        className="text-xl text-[#2d2d2d] mb-4 italic text-center leading-relaxed"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        "{INSPIRATIONAL_QUOTES[currentQuoteIndex].text}"
                      </p>
                      <p 
                        className="text-sm text-[#7a7a7a]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        — {INSPIRATIONAL_QUOTES[currentQuoteIndex].author}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Quote indicators */}
                <div className="flex justify-center gap-1.5 mt-8">
                  {INSPIRATIONAL_QUOTES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuoteIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === currentQuoteIndex 
                          ? 'bg-[#2d2d2d] w-6' 
                          : 'bg-[#2d2d2d]/30 hover:bg-[#2d2d2d]/50'
                      }`}
                      aria-label={`Go to quote ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Close hint */}
                <p className="text-xs text-[#b8b8b8] mt-8" style={{ fontFamily: 'Georgia, serif' }}>
                  Click anywhere to close
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}