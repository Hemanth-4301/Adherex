import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MentalSupport.css";

const MentalSupport = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const patientId = localStorage.getItem("pid");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    console.log('MentalSupport - patientId:', patientId);
    console.log('MentalSupport - prompt:', prompt);
    
    // Validate patient ID
    if (!patientId || patientId === 'undefined' || patientId === 'null') {
      toast.error("Please login to use this feature!");
      return;
    }

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      console.log(`Sending request to: ${baseUrl}/api/gemini/medication/ask`);
      console.log('Request payload:', { prompt, pid: patientId });
      
      const res = await axios.post(`${baseUrl}/api/gemini/medication/ask`, {
        prompt,
        pid: patientId,
      });

      console.log('AI response received:', res.data);
      
      const aiMessage = {
        role: "ai",
        text: res.data.aiResponse || "No response from AI.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get AI response!";
      toast.error(errorMessage);
      // Add error message to chat
      setMessages((prev) => [...prev, {
        role: "ai",
        text: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend server is running and try again.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.info("Chat cleared!");
  };

  // 🔗 Helper: convert URLs in text into clickable links
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
            className="chat-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">🧠 Mental Support Chat</h3>

      {/* Chat Box */}
      <div className="chat-box card shadow-sm mb-4">
        <div className="chat-header d-flex justify-content-between align-items-center px-3 pt-3">
          <h6 className="text-secondary">Conversation</h6>
          <button
            className="btn btn-outline-danger btn-sm mb-2"
            onClick={clearChat}
          >
            Clear Chat
          </button>
        </div>

        <div className="chat-messages p-4">
          {messages.length === 0 && (
            <p className="text-muted text-center mt-3">
              Start a conversation with your AI support assistant 💬
            </p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${
                msg.role === "user" ? "user" : "ai"
              }`}
            >
              <div className="bubble-text">{formatMessageText(msg.text)}</div>
            </div>
          ))}
          {loading && <div className="typing-indicator">AI is typing...</div>}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="chat-input p-3 border-top">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ask something about your medication or mental health..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>

      {/* Recommended Videos & Podcasts */}
      <div className="card shadow-sm p-3">
        <h5 className="mb-3">🎧 Recommended Videos & Podcasts</h5>
        <div className="list-group">
          {resources.map((res, idx) => (
            <a
              key={idx}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              {res.title}
              <span className="badge bg-primary rounded-pill">
                {res.type === "video" ? "🎥" : "🎧"}
              </span>
            </a>
          ))}
        </div>
      </div>
      
      <style>
        {`
          @media (min-width: 1200px) {
            .container {
              max-width: 1200px;
            }
            
            .chat-box {
              height: 75vh;
            }
          }
          
          @media (min-width: 1600px) {
            .container {
              max-width: 1400px;
            }
            
            .chat-box {
              height: 80vh;
            }
            
            .bubble-text {
              font-size: 1.05rem;
              padding: 14px 18px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MentalSupport;
