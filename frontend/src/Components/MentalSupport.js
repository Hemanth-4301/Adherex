import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api";
import { toast } from "react-toastify";
import {
  FaPaperPlane,
  FaTrash,
  FaRobot,
  FaUser,
  FaMicrophone,
  FaStop,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";

const MentalSupport = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const patientId = localStorage.getItem("pid");

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast.error("Voice input failed. Please try again.");
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, []);

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... Speak now!");
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Failed to start voice input.");
      }
    }
  };

  const speakText = (text) => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Text-to-speech failed.");
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    setResources([
      {
        type: "video",
        title: "Meditation for Stress Relief",
        link: "https://www.youtube.com/watch?v=inpok4MKVLM",
      },
      {
        type: "podcast",
        title: "Mental Health Tips",
        link: "https://www.listennotes.com/podcast/mental-health-tips-12345/",
      },
      {
        type: "video",
        title: "Relaxing Music for Sleep",
        link: "https://www.youtube.com/watch?v=2OEL4P1Rz04",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!patientId || patientId === "undefined" || patientId === "null") {
      toast.error("Please login to use this feature!");
      return;
    }

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await axios.post(API_ENDPOINTS.GEMINI_ASK, {
        prompt,
        pid: patientId,
      });

      // Parse and clean the AI response
      let cleanedResponse = res.data.aiResponse || "No response from AI.";

      // Remove markdown formatting
      cleanedResponse = cleanedResponse
        // Remove bold markers (**text**)
        .replace(/\*\*(.+?)\*\*/g, "$1")
        // Remove italic markers (*text* or _text_)
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        // Remove code block markers (```text```)
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ""))
        // Remove inline code markers (`text`)
        .replace(/`(.+?)`/g, "$1")
        // Remove strikethrough (~~text~~)
        .replace(/~~(.+?)~~/g, "$1")
        // Remove heading markers (# text)
        .replace(/^#{1,6}\s+/gm, "")
        // Clean up extra spaces
        .replace(/\s+/g, " ")
        .trim();

      const aiMessage = {
        role: "ai",
        text: cleanedResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Auto-read AI response
      speakText(cleanedResponse);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to get AI response!";
      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend server is running.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    stopSpeaking(); // Stop any ongoing speech
    toast.info("Chat cleared!");
  };

  const formatMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#171717]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
        <div className="relative px-4 py-6 sm:py-8 md:py-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-lg rounded-full mb-4">
              <FaRobot className="text-3xl sm:text-4xl text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
              AI Mental Support Assistant
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Your 24/7 companion for mental wellness, medication guidance, and
              emotional support
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col gap-4 overflow-hidden">
        {/* Chat Box */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#171717] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaRobot className="text-white text-sm sm:text-base" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#171717] rounded-full"></div>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  AI Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Always here to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium
                           bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Stop speaking"
                >
                  <FaVolumeMute className="text-sm" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              )}
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium
                         bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all
                         shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaTrash className="text-sm" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-[#0a0a0a]/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <FaRobot className="text-4xl sm:text-5xl text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome! How can I help you today?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Ask me about medications, mental health tips, wellness advice,
                  or just chat
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "How to manage stress?",
                    "Tell me about my medications",
                    "Sleep tips",
                    "Mindfulness exercises",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(suggestion)}
                      className="p-3 sm:p-4 bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-gray-700
                               rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:border-purple-500
                               dark:hover:border-purple-500 transition-all hover:shadow-lg transform hover:scale-105"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-1.5 sm:gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                {msg.role === "ai" && (
                  <div className="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <FaRobot className="text-white text-xs sm:text-base" />
                  </div>
                )}

                <div
                  className={`group max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl sm:rounded-3xl px-3 py-2 sm:px-5 sm:py-4 shadow-lg
                            ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                                : "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                            }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm sm:text-base leading-[1.6] whitespace-pre-wrap break-words flex-1 text-left">
                      {formatMessageText(msg.text)}
                    </p>
                    {msg.role === "ai" && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                               transition-all text-gray-500 dark:text-gray-400 hover:text-purple-600 
                               dark:hover:text-purple-400 transform hover:scale-110"
                        title="Read aloud"
                      >
                        <FaVolumeUp className="text-base" />
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-white dark:to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                    <FaUser className="text-white dark:text-gray-900 text-xs sm:text-base" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 sm:gap-3 animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaRobot className="text-white text-sm sm:text-base" />
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl px-5 py-4 shadow-lg">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 
                     bg-white dark:bg-[#171717] flex-shrink-0"
          >
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base 
                         bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 
                         border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Type your message here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading}
                className={`px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all 
                       flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105
                       ${
                         isListening
                           ? "bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse"
                           : "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                       } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <FaStop className="text-base sm:text-lg" />
                ) : (
                  <FaMicrophone className="text-base sm:text-lg" />
                )}
              </button>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                       text-white rounded-xl sm:rounded-2xl font-semibold 
                       transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed 
                       flex items-center justify-center gap-2 shrink-0 transform hover:scale-105 disabled:transform-none"
              >
                <FaPaperPlane className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Resources Section */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎧</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Recommended for You
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {resources.map((res, idx) => (
              <a
                key={idx}
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl 
                       bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a]
                       border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 
                       dark:hover:border-purple-500 transition-all hover:shadow-lg transform hover:scale-105"
              >
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-1 pr-3">
                  {res.title}
                </span>
                <span className="text-2xl sm:text-3xl flex-shrink-0 transform group-hover:scale-125 transition-transform">
                  {res.type === "video" ? "🎥" : "🎧"}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalSupport;
