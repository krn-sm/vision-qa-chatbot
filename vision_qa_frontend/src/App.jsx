import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setMessages((prev) => [...prev, { type: "image", file, sender: "user" }]);
  };

  const handleSend = async () => {
    if (!question.trim() || !image) return;
    setMessages((prev) => [
      ...prev,
      { type: "text", sender: "user", text: question },
    ]);
    setQuestion("");
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("question", question);

    try {
      const res = await axios.post("http://localhost:5000/ask", formData);
      setMessages((prev) => [
        ...prev,
        { type: "text", sender: "bot", text: res.data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "text", sender: "bot", text: "Oops! Error occurred." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">🧠 Vision-QA Assistant</div>
        <div className="chat-body">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`msg-row ${msg.sender === "user" ? "right" : "left"}`}
            >
              {msg.type === "image" ? (
                <img
                  src={URL.createObjectURL(msg.file)}
                  alt="uploaded"
                  className="chat-image"
                />
              ) : (
                <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
              )}
            </div>
          ))}
          {loading && <div className="loading">🤖 Thinking...</div>}
        </div>
        <div className="chat-footer">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
