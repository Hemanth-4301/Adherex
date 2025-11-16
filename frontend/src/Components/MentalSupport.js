import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { baseUrl } from "../config";
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
      const res = await axios.post(`${baseUrl}/api/gemini/medication/ask`, {
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
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 
                   text-gray-900 dark:text-white"
      >
        🧠 AI Mental Support Chat
      </h2>

      {/* Chat Box */}
      <div
        className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                    rounded-2xl shadow-lg overflow-hidden flex flex-col"
        style={{
          height: "calc(100vh - 300px)",
          minHeight: "500px",
          maxHeight: "700px",
        }}
      >
        {/* Chat Header */}
        <div
          className="flex justify-between items-center px-4 md:px-6 py-4 
                      border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0a]"
        >
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Conversation
          </h3>
          <div className="flex gap-2">
            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base
                         bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                title="Stop speaking"
              >
                <FaVolumeMute className="text-sm" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            )}
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base
                       bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FaTrash className="text-sm" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 dark:bg-[#0a0a0a]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FaRobot className="text-6xl md:text-7xl text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-md">
                Start a conversation with your AI support assistant 💬
                <br />
                <span className="text-sm">
                  Ask about medications, mental health, or wellness tips
                </span>
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "ai" && (
                <div
                  className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-black dark:bg-white 
                              text-white dark:text-black rounded-full flex items-center justify-center"
                >
                  <FaRobot className="text-sm md:text-base" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-3 
                            ${
                              msg.role === "user"
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-white dark:bg-[#171717] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800"
                            }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words flex-1">
                    {formatMessageText(msg.text)}
                  </p>
                  {msg.role === "ai" && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                               transition-colors text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      title="Read aloud"
                    >
                      <FaVolumeUp className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {msg.role === "user" && (
                <div
                  className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-black dark:bg-white 
                              text-white dark:text-black rounded-full flex items-center justify-center"
                >
                  <FaUser className="text-sm md:text-base" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-black dark:bg-white 
                            text-white dark:text-black rounded-full flex items-center justify-center"
              >
                <FaRobot className="text-sm md:text-base" />
              </div>
              <div
                className="bg-white dark:bg-[#171717] text-gray-900 dark:text-white 
                            border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3"
              >
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
          className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 
                                                bg-white dark:bg-[#171717]"
        >
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-3 md:py-3.5 text-sm md:text-base bg-gray-50 dark:bg-[#0a0a0a] 
                       text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 
                       rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white 
                       placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Ask about your medication or mental health..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              required
            />
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={loading}
              className={`px-4 py-3 rounded-xl font-semibold transition-all 
                       flex items-center gap-2 ${
                         isListening
                           ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                           : "bg-gray-600 hover:bg-gray-700 text-white"
                       } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? (
                <FaStop className="text-sm md:text-base" />
              ) : (
                <FaMicrophone className="text-sm md:text-base" />
              )}
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 md:px-6 py-3 bg-black dark:bg-white text-white dark:text-black 
                       rounded-xl font-semibold transition-all hover:opacity-90 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaPaperPlane className="text-sm md:text-base" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recommended Resources */}
      <div
        className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 
                    rounded-2xl shadow-lg p-4 md:p-6"
      >
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          🎧 Recommended Videos & Podcasts
        </h3>
        <div className="space-y-3">
          {resources.map((res, idx) => (
            <a
              key={idx}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-between items-center p-4 rounded-xl border border-gray-200 
                       dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0a0a0a] 
                       transition-colors group"
            >
              <span className="text-sm md:text-base text-gray-900 dark:text-white group-hover:underline">
                {res.title}
              </span>
              <span className="text-2xl flex-shrink-0">
                {res.type === "video" ? "🎥" : "🎧"}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentalSupport;
