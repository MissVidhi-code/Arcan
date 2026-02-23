import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      boxRef.current?.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  useEffect(scrollToBottom, [chat]);

  // Typewriter effect
  const typeText = (text, callback) => {
    let i = 0;
    let output = "";

    const interval = setInterval(() => {
      output += text[i];
      i++;
      callback(output);

      if (i >= text.length) clearInterval(interval);
    }, 15); // speed
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setLoading(true);

    // Add user message immediately
    setChat((c) => [...c, { user: userMsg, bot: "" }]);

    const resp = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });

    const data = await resp.json();
    const reply = data.reply || "No reply";

    // Typing animation
    typeText(reply, (partial) => {
      setChat((c) => {
        const copy = [...c];
        copy[copy.length - 1].bot = partial;
        return copy;
      });
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-black to-purple-900 text-white">

      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10">

        <h2 className="text-xl font-semibold mb-4">AI Chat</h2>

        {/* Chat Box */}
        <div
          ref={boxRef}
          className="h-96 overflow-y-auto space-y-4 p-4 bg-black/40 rounded-lg"
        >
          {chat.length === 0 && (
            <div className="text-gray-400 text-sm">
              Ask me anything 🙂
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i}>

              {/* USER */}
              <div className="flex justify-end items-start gap-2 mb-2">
                <div className="bg-indigo-600 px-4 py-2 rounded-xl max-w-[75%]">
                  {c.user}
                </div>
                <div className="text-2xl">🧑</div>
              </div>

              {/* BOT */}
              <div className="flex justify-start items-start gap-2">
                <div className="text-2xl">🤖</div>

                <div className="bg-white text-black px-4 py-2 rounded-xl max-w-[75%] overflow-x-auto prose prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {c.bot || (loading ? "Typing..." : "")}
                  </ReactMarkdown>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3 mt-4">
          <input
            className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default Chatbot;
