import React from "react";
import { motion } from "framer-motion";

const Loader = ({ size = "md", fullScreen = false, text = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated circular loader with gradient */}
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`}
          style={{
            backgroundClip: "padding-box",
            border: "4px solid transparent",
            backgroundOrigin: "border-box",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full bg-white dark:bg-black m-1"></div>
        </motion.div>

        {/* Inner pulsing circle */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-20`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Center animated dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${dotSizes[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-500`}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated text with gradient */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <motion.p
            className="text-sm md:text-base font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            {text}
          </motion.p>
          {/* Subtle shimmer effect */}
          <motion.div
            className="h-0.5 mt-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"
            animate={{
              x: ["-100%", "100%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-md"
      >
        {loader}
      </motion.div>
    );
  }

  return loader;
};

export default Loader;
