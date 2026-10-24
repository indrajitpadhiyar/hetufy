import React from 'react';
import { motion } from 'framer-motion';

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-[#f6f3eb] bg-[#1c1b18] shadow-sm'
                : 'text-[#5e584f] bg-[#eee9df] hover:bg-[#e4ded4] border border-[#d6cfc4]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 rounded-full bg-[#1c1b18] -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}

