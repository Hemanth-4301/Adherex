import React, { useState, useRef } from "react";
import axios from "axios";
import { baseUrl } from "../config";
import { toast } from "react-toastify";
import { FaCamera, FaUpload, FaTimes, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

const MedicineScanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const patientId = localStorage.getItem("pid");

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    if (!patientId || patientId === "undefined" || patientId === "null") {
      toast.error("Please login to use this feature");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1];

        try {
          const res = await axios.post(`${baseUrl}/api/gemini/medication/ask`, {
            prompt: `Analyze this medicine/pill image and provide detailed information in the following format:

Medicine Name: [Name of the medicine if identifiable]
Active Ingredient: [Main active pharmaceutical ingredient]
Common Uses: [What this medicine is typically prescribed for]
Symptoms Treated: [Specific symptoms this medicine addresses]
Dosage Form: [Tablet, Capsule, Syrup, etc.]
Common Side Effects: [List 3-5 common side effects]
Precautions: [Important warnings or precautions]
Storage: [How to store this medicine]

If you cannot identify the exact medicine from the image, provide general information based on what you can observe (shape, color, markings, etc.) and mention that exact identification requires professional verification.

Important: Add a disclaimer that this is AI-generated information and patients should always consult their healthcare provider for accurate medical advice.

Image Data: data:image/jpeg;base64,${base64Image}`,
            pid: patientId,
          });

          // Parse and clean the response
          let cleanedResponse =
            res.data.aiResponse || "Unable to analyze the image.";

          cleanedResponse = cleanedResponse
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/_(.+?)_/g, "$1")
            .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ""))
            .replace(/`(.+?)`/g, "$1")
            .replace(/~~(.+?)~~/g, "$1")
            .replace(/^#{1,6}\s+/gm, "")
            .trim();

          setAnalysis(cleanedResponse);
          toast.success("Analysis complete!");
        } catch (err) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to analyze image";
          toast.error(errorMessage);
          setAnalysis(
            "Sorry, I encountered an error analyzing the image. Please make sure the image is clear and try again."
          );
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      setLoading(false);
      toast.error("Failed to process image");
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          🔍 AI Medicine Scanner
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Upload a photo of your medicine to get instant AI-powered analysis
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-[#171717] border-2 border-dashed border-gray-300 dark:border-gray-700 
                   rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 md:p-8">
          {!imagePreview ? (
            <div
              className="flex flex-col items-center justify-center py-12 md:py-16 cursor-pointer
                         hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 
                           rounded-full flex items-center justify-center mb-4 shadow-lg"
              >
                <FaCamera className="text-3xl md:text-4xl text-white" />
              </motion.div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Medicine Image
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md text-sm md:text-base">
                Click here or drag and drop an image of your medicine
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm mt-2">
                Supported: JPG, PNG (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img
                  src={imagePreview}
                  alt="Selected medicine"
                  className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                />
                <button
                  onClick={handleClear}
                  className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 text-white 
                           rounded-full transition-colors shadow-lg"
                  title="Remove image"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 
                           bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                           text-white rounded-xl font-semibold transition-all disabled:opacity-50 
                           disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base md:text-lg"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-xl" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-xl" />
                      <span>Analyze Medicine</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl 
                           font-semibold transition-all disabled:opacity-50 shadow-lg"
                >
                  Change Image
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center py-8"
          >
            <Loader size="lg" text="Analyzing medicine image with AI..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                       rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <span>📋</span> Analysis Results
              </h3>
            </div>

            <div className="p-6 md:p-8">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {analysis}
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
                <p className="text-sm md:text-base text-yellow-800 dark:text-yellow-300">
                  <strong>⚠️ Important:</strong> This analysis is AI-generated
                  and for informational purposes only. Always consult your
                  healthcare provider or pharmacist for accurate medical advice
                  and proper medication identification.
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl 
                           font-semibold transition-all shadow-lg"
                >
                  Scan Another Medicine
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <div
          className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                       rounded-xl p-6 shadow-md"
        >
          <div className="text-3xl mb-3">📸</div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            Clear Photo
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Take a clear, well-lit photo showing the pill markings or medicine
            label
          </p>
        </div>

        <div
          className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                       rounded-xl p-6 shadow-md"
        >
          <div className="text-3xl mb-3">🤖</div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            AI Analysis
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get instant information about uses, symptoms, and precautions
          </p>
        </div>

        <div
          className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                       rounded-xl p-6 shadow-md"
        >
          <div className="text-3xl mb-3">⚕️</div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            Stay Safe
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Always verify with healthcare professionals before taking any
            medication
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicineScanner;
