import React, { useState, useEffect } from 'react';
import './App.css';
//import doctorImage from './pmor.png'; // Placeholder for your images
import userImage from './me.jpg';
import bffImage from './bara.jpg';
import Sidebar from './Sidebar';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user's message
    const userMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ', ' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to Flask backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      // Add AI response
      const aiMessage = {
        text: data.reply,
        sender: 'ai',
        isMarkdown: true, // Flag to identify markdown content
        timestamp: new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) + ', ' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: 'Sorry, I couldn\'t process that. Try again!',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) + ', ' + new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process the text and handle <think> tags BEFORE passing to ReactMarkdown
  const processThinkTags = (text) => {
    if (typeof text !== 'string') return text;

    // First, extract all think sections
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const matches = [...text.matchAll(thinkRegex)];

    if (matches.length === 0) return text;

    // Replace each think section with a placeholder
    let processedText = text;
    matches.forEach((match, index) => {
      const fullMatch = match[0]; // The full <think>...</think> section
      const innerContent = match[1]; // Just the content between the tags

      // Replace with span that has the think-content class
      processedText = processedText.replace(
        fullMatch,
        `<span class="think-content">${innerContent}</span>`
      );
    });

    return processedText;
  };

  // Function to render message content based on whether it's markdown or not
  const renderMessageContent = (message) => {
    if (message.isMarkdown) {
      // Process think tags in the message text before rendering markdown
      const processedText = processThinkTags(message.text);

      return (
        <div className="markdown-content"
          dangerouslySetInnerHTML={{
            __html: processedText
              .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`)
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>')
              .replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>')
              .replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>')
              .replace(/\n/g, '<br/>')
          }}
        />
      );
    }
    return <p>{message.text}</p>;
  };

  return (
    <div className="app-container">
      <Sidebar pastMessages={messages} />
      <div className="chat-container">
        <div className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <img src={bffImage} alt="BFF Bara" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div>
              <div>BFF. Bara</div>
              <div style={{ color: '#F78DA7' }}>Online</div>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area" style={{ overflowY: 'auto', padding: '10px' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  margin: '10px 0',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {message.sender === 'ai' && (
                  <img src={bffImage} alt="BFF Bara" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                )}
                <div
                  className="message-content"
                  style={{
                    background: message.sender === 'user' ? '#e0f7fa' : '#f5f5f5',
                    padding: '10px',
                    borderRadius: '8px',
                    maxWidth: '60%',
                  }}
                >
                  {renderMessageContent(message)}
                  <p style={{ fontSize: '0.8em', color: '#888' }}>{message.timestamp}</p>
                </div>
                {message.sender === 'user' && (
                  <img src={userImage} alt="User" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message ai" style={{ display: 'flex', alignItems: 'flex-start', margin: '10px 0' }}>
                <img src={bffImage} alt="BFF Bara" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                  <p style={{ fontStyle: 'italic', color: '#888' }}>Typing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area" style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>😊</span>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Write your message..."
                disabled={isLoading}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                style={{
                  marginLeft: '10px',
                  padding: '8px 16px',
                  background: '#F78DA7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;