import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, onClose, title, children, type = "default" }) => {
  const typeStyles = {
    default: "border-gray-300 dark:border-gray-700",
    success: "border-green-500 dark:border-green-600",
    warning: "border-yellow-500 dark:border-yellow-600",
    error: "border-red-500 dark:border-red-600",
    info: "border-blue-500 dark:border-blue-600",
  };

  const headerStyles = {
    default: "bg-gray-100 dark:bg-gray-800",
    success: "bg-green-500 dark:bg-green-600 text-white",
    warning: "bg-yellow-500 dark:bg-yellow-600 text-white",
    error: "bg-red-500 dark:bg-red-600 text-white",
    info: "bg-blue-500 dark:bg-blue-600 text-white",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl 
                       max-w-md w-full border-2 ${typeStyles[type]} overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`flex justify-between items-center px-6 py-4 ${headerStyles[type]}`}
            >
              <h3
                className={`text-xl font-bold ${
                  type === "default" ? "text-gray-900 dark:text-white" : ""
                }`}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  type === "default"
                    ? "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    : "hover:bg-white/20 text-current"
                }`}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
