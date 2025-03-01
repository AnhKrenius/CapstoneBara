import React from 'react';
import './Sidebar.css';
import userImage from './me.jpg';

const Sidebar = ({ pastMessages, onMessageClick, onNewChatClick }) => { // Added onNewChatClick here
  const conversations = pastMessages.reduce((acc, message) => {
    const date = message.timestamp.split(',')[1].trim();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  const conversationDates = Object.keys(conversations).sort().reverse();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button
          className="new-chat-btn"
          onClick={onNewChatClick} // Use the prop directly
          title="Start a new chat"
        >
          +
        </button>
        <img src={userImage} alt="User" className="user-image" />
      </div>

      <div className="conversations">
        {conversationDates.map((date) => (
          <div
            key={date}
            className="conversation-item"
            onClick={() => onMessageClick(date)}
          >
            <span className="message-time">
              {conversations[date][0].timestamp.split(',')[0].trim()}
            </span>
            <span className="message-date">{date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;