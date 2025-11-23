"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Send, MapPin, DollarSign, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  onQuery: (query: string) => void;
  messages: Message[];
  isFullscreen?: boolean;
  isLoading?: boolean;
}

export const ChatInterface = ({ onQuery, messages, isFullscreen = false, isLoading = false }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onQuery(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full  relative">
      {/* Floating Header Badge for Split View */}
      {!isFullscreen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass backdrop-blur-xl shadow-lg">
            <span className="text-xl">🥑</span>
            <span className="text-xs font-medium text-charcoal-700">Avocado AI</span>
          </div>
        </motion.div>
      )}

      {/* Chat Header - Only show when messages exist in fullscreen, or always in split view (which is handled by !isFullscreen condition above) */}
      {isFullscreen && messages.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 pt-6 pb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥑</span>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-800 tracking-tight">Avocado</h2>
            </div>
          </div>
      </motion.div>
      )}

      {/* Messages - with bottom padding for floating input */}
      <div className={`flex-1 overflow-y-auto scrollbar-none ${ 
        isFullscreen ? 'px-8 pt-8 pb-56' : 'p-6 pt-20 pb-40'
      }`}>
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`flex flex-col items-center h-full text-center px-4 ${
              isFullscreen ? 'justify-end pb-8' : 'justify-center space-y-8'
            }`}>
            
            <div className="space-y-10 max-w-3xl">
              {/* Minimal Floating Welcome - Gemini style */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col items-center gap-6"
              >
                <motion.div 
                  className="text-7xl"
                  animate={{ 
                    y: [-8, 8, -8],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  🥑
                </motion.div>

                <div className="space-y-4 pb-10 text-center">
                  <h3 className="text-5xl text-charcoal-800 font-light tracking-tight">
                    Welcome to Avocado
                  </h3>
                  <p className="text-xl text-charcoal-500 font-light max-w-xl">
                    AI-powered cost of living intelligence for cities worldwide
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
          <div className="space-y-8">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex gap-3 ${
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-xl glass-strong flex items-center justify-center shrink-0 frosted-overlay shadow-sm">
                  <span className="text-sm">🥑</span>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                  message.type === "user"
                    ? "glass-strong text-charcoal-800 shadow-lg"
                    : "glass-card text-charcoal-700 shadow-md"
                }`}
              >
                <p className="text-sm leading-relaxed font-light">{message.content}</p>
              </motion.div>
            </motion.div>
          ))}
          </div>
          </AnimatePresence>
        )}
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`absolute bottom-0 left-0 right-0 z-20 flex justify-center ${
          isFullscreen ? 'p-8 pb-12' : 'p-6'
        }`}
      >
        <div className={cn(
          "w-full transition-all duration-500 ease-out",
          isFullscreen && messages.length === 0 ? "max-w-2xl" : "max-w-full"
        )}>
          <div className={cn(
            "rounded-3xl transition-all duration-300 p-2",
            isFullscreen && messages.length === 0 
              ? "border border-white/30"
              : "border border-white/20"
          )}>
            <form onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cost of living... "
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                className={cn(
                  "w-full border  bg-transparent focus:bg-transparent  focus-visible:outline-none transition-all disabled:opacity-50 placeholder:text-charcoal-400 rounded-3xl resize-none align-top",
                  isFullscreen && messages.length === 0 
                    ? "h-32 pl-6 pr-6 pt-4 text-lg"
                    : "h-24 pl-5 pr-4 pt-3 text-sm"
                )}
              />
            </form>
            
            {/* Quick Prompt Pills below input */}
            {isFullscreen && messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-2 justify-center mt-3 px-4 pb-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setInput("I want to move to Toronto");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-avocado-400/50 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-avocado-600" />
                  <span className="text-xs text-charcoal-700 font-light">I want to move to Toronto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("I'm a student moving to New York");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-avocado-400/50 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-avocado-600" />
                  <span className="text-xs text-charcoal-700 font-light">I'm a student moving to New York</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("I want to move to London with 2 kids");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-avocado-400/50 transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-avocado-600" />
                  <span className="text-xs text-charcoal-700 font-light">How much would living in London with 2 kids cost?</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
