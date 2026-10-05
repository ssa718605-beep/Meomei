import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SproutCharacter } from '../types';
import { sound } from '../utils/audio';

interface SproutAvatarProps {
  sprout: SproutCharacter;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onPet?: () => void;
  isWatering?: boolean;
  isSunbathing?: boolean;
}

export const SproutAvatar: React.FC<SproutAvatarProps> = ({
  sprout,
  size = 'lg',
  interactive = true,
  onPet,
  isWatering = false,
  isSunbathing = false,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const [floatingHeart, setFloatingHeart] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleTap = (e: React.MouseEvent) => {
    if (!interactive) return;
    sound.playPetChirp();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 20;
    const y = e.clientY - rect.top - 20;

    const newHeart = { id: Date.now(), x, y };
    setFloatingHeart((prev) => [...prev.slice(-3), newHeart]);

    setTimeout(() => {
      setFloatingHeart((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1000);

    if (onPet) {
      onPet();
    }
  };

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size];

  // Pick expressions based on mood or care states
  const isExcited = sprout.mood === 'excited' || isWatering || isSunbathing;
  const isSleepy = sprout.mood === 'sleepy';

  return (
    <div
      onClick={handleTap}
      className={`relative select-none flex items-center justify-center ${sizeClasses} ${
        interactive ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
      title={interactive ? 'Chạm vào để yêu thương Bé Mầm! ✨' : undefined}
    >
      {/* Sunlight Radiant Glow */}
      {isSunbathing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.15, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-amber-300/30 via-yellow-200/40 to-orange-300/20 blur-xl pointer-events-none"
        />
      )}

      {/* Watering Droplets Animation */}
      {isWatering && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0, x: (i - 3) * 18 }}
              animate={{ y: [0, 60, 90], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
              className="absolute top-2 left-1/2 w-2.5 h-3.5 bg-sky-400 rounded-full shadow-sm"
              style={{
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Pet Hearts */}
      <AnimatePresence>
        {floatingHeart.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: heart.y, x: heart.x, scale: 0.6 }}
            animate={{ opacity: 0, y: heart.y - 70, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute z-30 pointer-events-none text-rose-500 font-bold text-2xl drop-shadow"
          >
            💚
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Character Base Drawing SVG */}
      <motion.div
        animate={
          isBouncing
            ? { y: [0, -18, 2, -6, 0], scale: [1, 1.08, 0.96, 1.02, 1] }
            : { y: [0, -4, 0], rotate: [0, -1, 1, 0] }
        }
        transition={
          isBouncing
            ? { duration: 0.55, ease: 'easeInOut' }
            : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
        }
        className="w-full h-full relative flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md overflow-visible">
          {/* Soft Shadow on ground */}
          <ellipse cx="100" cy="178" rx="46" ry="10" fill="#292524" opacity="0.12" />

          {/* Plant Pot / Soil Mound */}
          <path
            d="M 68 152 Q 100 144 132 152 L 126 178 Q 100 184 74 178 Z"
            fill="#A88B74"
            stroke="#7E5F48"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Pot Rim */}
          <path
            d="M 63 150 Q 100 144 137 150 Q 100 156 63 150 Z"
            fill="#C4A482"
            stroke="#7E5F48"
            strokeWidth="3"
          />
          {/* Soil */}
          <ellipse cx="100" cy="149" rx="30" ry="6" fill="#5D4037" />

          {/* Stem / Body */}
          <path
            d="M 100 148 Q 98 126 100 110"
            stroke="#4CAF50"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cute Round Head / Sprout Body */}
          <circle
            cx="100"
            cy="96"
            r="44"
            fill="#66BB6A"
            stroke="#388E3C"
            strokeWidth="4"
          />

          {/* Body Highlight */}
          <path
            d="M 80 68 Q 94 62 108 65"
            stroke="#A5D6A7"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sprout Leaves on top of Head */}
          <g>
            {/* Left Leaf */}
            <motion.path
              animate={
                isExcited
                  ? { rotate: [-10, 15, -10] }
                  : { rotate: [-2, 4, -2] }
              }
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ originX: '100px', originY: '54px' }}
              d="M 100 56 C 80 50, 68 28, 82 22 C 94 18, 98 38, 100 56 Z"
              fill="#81C784"
              stroke="#388E3C"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Right Leaf */}
            <motion.path
              animate={
                isExcited
                  ? { rotate: [10, -15, 10] }
                  : { rotate: [2, -4, 2] }
              }
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
              style={{ originX: '100px', originY: '54px' }}
              d="M 100 56 C 120 50, 132 28, 118 22 C 106 18, 102 38, 100 56 Z"
              fill="#4CAF50"
              stroke="#2E7D32"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Tiny Bud Center */}
            <circle cx="100" cy="54" r="5" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="76" cy="106" rx="7" ry="4" fill="#FF8A80" opacity="0.85" />
          <ellipse cx="124" cy="106" rx="7" ry="4" fill="#FF8A80" opacity="0.85" />

          {/* Eyes */}
          {isSleepy ? (
            /* Sleepy closed eyes */
            <g stroke="#1B5E20" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 80 96 Q 86 101 92 96" />
              <path d="M 108 96 Q 114 101 120 96" />
            </g>
          ) : isExcited ? (
            /* Sparkle Star / Wide Happy Eyes */
            <g fill="#1B5E20">
              <path d="M 86 86 Q 92 92 86 98 Q 80 92 86 86 Z" fill="#1B5E20" />
              <path d="M 114 86 Q 120 92 114 98 Q 108 92 114 86 Z" fill="#1B5E20" />
              <circle cx="88" cy="90" r="2" fill="#FFFFFF" />
              <circle cx="116" cy="90" r="2" fill="#FFFFFF" />
            </g>
          ) : (
            /* Cheerful normal shiny eyes */
            <g fill="#1B5E20">
              <ellipse cx="86" cy="95" rx="5" ry="6" />
              <circle cx="88" cy="93" r="2" fill="#FFFFFF" />
              <ellipse cx="114" cy="95" rx="5" ry="6" />
              <circle cx="116" cy="93" r="2" fill="#FFFFFF" />
            </g>
          )}

          {/* Mouth */}
          {isExcited ? (
            /* Wide Open Joyful Smile */
            <path
              d="M 94 105 Q 100 116 106 105 Q 100 110 94 105 Z"
              fill="#D32F2F"
              stroke="#B71C1C"
              strokeWidth="2"
            />
          ) : (
            /* Sweet Gentle Smile */
            <path
              d="M 95 106 Q 100 111 105 106"
              stroke="#1B5E20"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Hand Leaves */}
          <motion.path
            animate={
              isBouncing
                ? { rotate: [-20, 20, -20] }
                : { rotate: [-5, 5, -5] }
            }
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ originX: '60px', originY: '110px' }}
            d="M 64 108 C 50 102 46 116 56 122 C 64 126 66 116 64 108 Z"
            fill="#81C784"
            stroke="#388E3C"
            strokeWidth="2.5"
          />
          <motion.path
            animate={
              isBouncing
                ? { rotate: [20, -20, 20] }
                : { rotate: [5, -5, 5] }
            }
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.1 }}
            style={{ originX: '140px', originY: '110px' }}
            d="M 136 108 C 150 102 154 116 144 122 C 136 126 134 116 136 108 Z"
            fill="#81C784"
            stroke="#388E3C"
            strokeWidth="2.5"
          />

          {/* Accessories Layer */}
          {/* Hat: Straw Hat */}
          {sprout.equippedHat === 'hat_straw' && (
            <g transform="translate(0, -6)">
              {/* Straw Hat Brim */}
              <ellipse cx="100" cy="58" rx="42" ry="12" fill="#F4E0A5" stroke="#C49B3E" strokeWidth="2.5" />
              {/* Crown */}
              <path
                d="M 80 56 Q 100 36 120 56 Z"
                fill="#ECD07B"
                stroke="#C49B3E"
                strokeWidth="2.5"
              />
              {/* Ribbon */}
              <path
                d="M 81 54 Q 100 48 119 54 Q 100 58 81 54 Z"
                fill="#E53935"
              />
            </g>
          )}

          {/* Hat: Nightcap */}
          {sprout.equippedHat === 'hat_nightcap' && (
            <g transform="translate(4, -8)">
              <path
                d="M 78 58 Q 100 32 136 40 Q 150 56 146 72"
                stroke="#1E3A8A"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cap Brim */}
              <rect x="74" y="52" width="52" height="10" rx="5" fill="#FFFFFF" />
              {/* Pompom Star */}
              <circle cx="146" cy="74" r="7" fill="#FACC15" />
            </g>
          )}

          {/* Hat: Scholar Glasses */}
          {sprout.equippedHat === 'hat_glasses' && (
            <g stroke="#3E2723" strokeWidth="2.5" fill="none" transform="translate(0, -2)">
              <circle cx="86" cy="94" r="10" fill="rgba(255,255,255,0.3)" />
              <circle cx="114" cy="94" r="10" fill="rgba(255,255,255,0.3)" />
              <line x1="96" y1="94" x2="104" y2="94" />
            </g>
          )}

          {/* Accessory: Flower Bow */}
          {sprout.equippedAccessory === 'acc_flower_bow' && (
            <g transform="translate(68, 62)">
              <circle cx="0" cy="0" r="5" fill="#FF80AB" />
              <circle cx="-6" cy="-4" r="4" fill="#FF4081" />
              <circle cx="6" cy="-4" r="4" fill="#FF4081" />
              <circle cx="-6" cy="4" r="4" fill="#FF4081" />
              <circle cx="6" cy="4" r="4" fill="#FF4081" />
              <circle cx="0" cy="0" r="3" fill="#FFEE58" />
            </g>
          )}

          {/* Accessory: Backpack */}
          {sprout.equippedAccessory === 'acc_backpack' && (
            <g transform="translate(136, 102)">
              <rect x="0" y="0" width="16" height="24" rx="4" fill="#E65100" stroke="#BF360C" strokeWidth="2" />
              <rect x="3" y="12" width="10" height="8" rx="2" fill="#FF9800" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
