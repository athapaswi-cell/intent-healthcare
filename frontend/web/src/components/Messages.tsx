import React, { useState, useEffect } from 'react';
import './Messages.css';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'read' | 'unread';
  type: 'sent' | 'received' | 'draft';
}

export default function Messages() {
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'draft'>('received');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [editingDraft, setEditingDraft] = useState<Message | null>(null);

  // Sample messages data - in real app, this would come from API
  const [allMessages, setAllMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'Dr. Sarah Bennett',
      to: 'You',
      subject: 'Lab Results Available',
      body: 'Your recent lab results are now available. Please review them at your earliest convenience.',
      timestamp: '2024-04-28T10:30:00',
      status: 'unread',
      type: 'received'
    },
    {
      id: '2',
      from: 'You',
      to: 'Dr. Emily Wilson',
      subject: 'Appointment Request',
      body: 'I would like to schedule an appointment for next week. Please let me know your availability.',
      timestamp: '2024-04-27T14:20:00',
      status: 'read',
      type: 'sent'
    },
    {
      id: '3',
      from: 'You',
      to: 'Dr. Mark Johnson',
      subject: 'Prescription Refill',
      body: 'I need a refill for my medication. Can you please process this request?',
      timestamp: '2024-04-26T09:15:00',
      status: 'read',
      type: 'sent'
    },
    {
      id: '4',
      from: 'Dr. Sarah Bennett',
      to: 'You',
      subject: 'Follow-up Appointment',
      body: 'This is a reminder about your follow-up appointment scheduled for May 5th, 2024 at 2:00 PM.',
      timestamp: '2024-04-25T16:45:00',
      status: 'read',
      type: 'received'
    },
    {
      id: '5',
      from: 'You',
      to: 'Dr. Sarah Bennett',
      subject: 'Question about medication',
      body: 'I have a question about the dosage of my current medication...',
      timestamp: '2024-04-24T11:00:00',
      status: 'read',
      type: 'draft'
    },
    {
      id: '6',
      from: 'Dr. Emily Roberts',
      to: 'You',
      subject: 'Test Results',
      body: 'Your test results from last week are normal. No further action needed.',
      timestamp: '2024-04-23T13:30:00',
      status: 'read',
      type: 'received'
    },
    {
      id: '7',
      from: 'You',
      to: 'Dr. Mark Johnson',
      subject: 'Insurance Question',
      body: 'I wanted to ask about insurance coverage for my upcoming procedure...',
      timestamp: '2024-04-22T10:00:00',
      status: 'read',
      type: 'draft'
    }
  ]);

  const filteredMessages = allMessages.filter(msg => {
    const matchesTab = msg.type === activeTab;
    const matchesSearch = searchQuery === '' || 
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = {
    received: allMessages.filter(m => m.type === 'received' && m.status === 'unread').length,
    sent: 0, // Sent messages don't have unread status
    draft: allMessages.filter(m => m.type === 'draft').length
  };

  // Update unread count in localStorage so App.tsx can read it for the badge
  useEffect(() => {
    const unreadReceivedCount = allMessages.filter(m => m.type === 'received' && m.status === 'unread').length;
    localStorage.setItem('messagesUnreadCount', unreadReceivedCount.toString());
    
    // Dispatch a custom event to notify App.tsx of the update
    window.dispatchEvent(new CustomEvent('messagesUnreadCountUpdated', { 
      detail: { count: unreadReceivedCount } 
    }));
  }, [allMessages]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read if it's a received message
    if (message.type === 'received' && message.status === 'unread') {
      message.status = 'read';
    }
  };

  const handleCompose = () => {
    setComposeData({ to: '', subject: '', body: '' });
    setEditingDraft(null);
    setShowCompose(true);
  };

  const handleComposeChange = (field: 'to' | 'subject' | 'body', value: string) => {
    setComposeData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendMessage = () => {
    if (!composeData.to.trim() || !composeData.subject.trim() || !composeData.body.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (editingDraft) {
      // Update draft to sent
      setAllMessages(prev => prev.map(msg => 
        msg.id === editingDraft.id 
          ? { ...msg, type: 'sent', status: 'read', timestamp: new Date().toISOString() }
          : msg
      ));
    } else {
      // Create new sent message
      const newMessage: Message = {
        id: Date.now().toString(),
        from: 'You',
        to: composeData.to,
        subject: composeData.subject,
        body: composeData.body,
        timestamp: new Date().toISOString(),
        status: 'read',
        type: 'sent'
      };
      setAllMessages(prev => [newMessage, ...prev]);
    }

    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
    setEditingDraft(null);
    setActiveTab('sent');
    setSelectedMessage(null);
  };

  const handleSaveDraft = () => {
    if (!composeData.to.trim() && !composeData.subject.trim() && !composeData.body.trim()) {
      alert('Draft must have at least one field filled');
      return;
    }

    if (editingDraft) {
      // Update existing draft
      setAllMessages(prev => prev.map(msg => 
        msg.id === editingDraft.id 
          ? { ...msg, to: composeData.to, subject: composeData.subject, body: composeData.body }
          : msg
      ));
    } else {
      // Create new draft
      const newDraft: Message = {
        id: Date.now().toString(),
        from: 'You',
        to: composeData.to,
        subject: composeData.subject,
        body: composeData.body,
        timestamp: new Date().toISOString(),
        status: 'read',
        type: 'draft'
      };
      setAllMessages(prev => [newDraft, ...prev]);
    }

    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
    setEditingDraft(null);
    setActiveTab('draft');
    setSelectedMessage(null);
  };

  const handleCancelCompose = () => {
    if (composeData.to || composeData.subject || composeData.body) {
      if (!confirm('Discard this message? Any unsaved changes will be lost.')) {
        return;
      }
    }
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
    setEditingDraft(null);
  };

  const handleEditDraft = (draft: Message) => {
    setComposeData({
      to: draft.to,
      subject: draft.subject,
      body: draft.body
    });
    setEditingDraft(draft);
    setShowCompose(true);
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>💬 Messages</h1>
        <button className="btn-compose" onClick={handleCompose}>
          ✉️ Compose
        </button>
      </div>

      {/* Search Bar */}
      <div className="messages-search">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="messages-layout">
        {/* Sidebar with tabs */}
        <div className="messages-sidebar">
          <div className="messages-tabs">
            <button
              className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('received');
                setSelectedMessage(null);
              }}
            >
              <span className="tab-icon">📥</span>
              <span className="tab-label">Received</span>
              {unreadCount.received > 0 && (
                <span className="tab-badge">{unreadCount.received}</span>
              )}
            </button>
            
            <button
              className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('sent');
                setSelectedMessage(null);
              }}
            >
              <span className="tab-icon">📤</span>
              <span className="tab-label">Sent</span>
            </button>
            
            <button
              className={`tab-button ${activeTab === 'draft' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('draft');
                setSelectedMessage(null);
              }}
            >
              <span className="tab-icon">📝</span>
              <span className="tab-label">Draft</span>
              {unreadCount.draft > 0 && (
                <span className="tab-badge">{unreadCount.draft}</span>
              )}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="messages-list-container">
          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No {activeTab} messages</h3>
                <p>You don't have any {activeTab} messages yet.</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${message.status === 'unread' ? 'unread' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="message-header">
                    <div className="message-sender">
                      {activeTab === 'sent' ? (
                        <span className="message-to">To: {message.to}</span>
                      ) : activeTab === 'draft' ? (
                        <span className="message-to">To: {message.to}</span>
                      ) : (
                        <span className="message-from">{message.from}</span>
                      )}
                    </div>
                    <span className="message-time">{formatDate(message.timestamp)}</span>
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-preview">{message.body.substring(0, 80)}...</div>
                  {message.status === 'unread' && (
                    <span className="unread-indicator"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className="message-detail">
          {selectedMessage ? (
            <div className="message-detail-content">
              <div className="message-detail-header">
                <button className="btn-back" onClick={() => setSelectedMessage(null)}>
                  ← Back
                </button>
                <h2>{selectedMessage.subject}</h2>
              </div>
              
              <div className="message-detail-info">
                <div className="detail-row">
                  <span className="detail-label">
                    {activeTab === 'sent' || activeTab === 'draft' ? 'To:' : 'From:'}
                  </span>
                  <span className="detail-value">
                    {activeTab === 'sent' || activeTab === 'draft' ? selectedMessage.to : selectedMessage.from}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </span>
                </div>
                {activeTab === 'draft' && (
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value draft-badge">Draft</span>
                  </div>
                )}
              </div>

              <div className="message-detail-body">
                {selectedMessage.body}
              </div>

              <div className="message-detail-actions">
                {activeTab === 'draft' && (
                  <>
                    <button 
                      className="btn-action"
                      onClick={() => handleEditDraft(selectedMessage)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-action"
                      onClick={() => {
                        // Send draft directly without opening compose modal
                        setAllMessages(prev => prev.map(msg => 
                          msg.id === selectedMessage.id 
                            ? { ...msg, type: 'sent', status: 'read', timestamp: new Date().toISOString() }
                            : msg
                        ));
                        setActiveTab('sent');
                        setSelectedMessage(null);
                      }}
                    >
                      📤 Send
                    </button>
                  </>
                )}
                {activeTab === 'received' && (
                  <>
                    <button className="btn-action">↩️ Reply</button>
                    <button className="btn-action">↪️ Forward</button>
                  </>
                )}
                {activeTab === 'sent' && (
                  <button className="btn-action">↪️ Forward</button>
                )}
                <button className="btn-action btn-delete">🗑️ Delete</button>
              </div>
            </div>
          ) : (
            <div className="message-detail-empty">
              <div className="empty-icon-large">💬</div>
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="compose-modal-overlay" onClick={handleCancelCompose}>
          <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
            <div className="compose-modal-header">
              <h2>{editingDraft ? 'Edit Draft' : 'Compose Message'}</h2>
              <button className="btn-close-modal" onClick={handleCancelCompose}>
                ✕
              </button>
            </div>

            <div className="compose-modal-body">
              <div className="compose-field">
                <label htmlFor="compose-to">To:</label>
                <input
                  id="compose-to"
                  type="text"
                  placeholder="Enter recipient name or email"
                  value={composeData.to}
                  onChange={(e) => handleComposeChange('to', e.target.value)}
                  className="compose-input"
                />
              </div>

              <div className="compose-field">
                <label htmlFor="compose-subject">Subject:</label>
                <input
                  id="compose-subject"
                  type="text"
                  placeholder="Enter subject"
                  value={composeData.subject}
                  onChange={(e) => handleComposeChange('subject', e.target.value)}
                  className="compose-input"
                />
              </div>

              <div className="compose-field">
                <label htmlFor="compose-body">Message:</label>
                <textarea
                  id="compose-body"
                  placeholder="Type your message here..."
                  value={composeData.body}
                  onChange={(e) => handleComposeChange('body', e.target.value)}
                  className="compose-textarea"
                  rows={12}
                />
              </div>
            </div>

            <div className="compose-modal-footer">
              <button className="btn-compose-secondary" onClick={handleCancelCompose}>
                Cancel
              </button>
              <button className="btn-compose-secondary" onClick={handleSaveDraft}>
                💾 Save Draft
              </button>
              <button className="btn-compose-primary" onClick={handleSendMessage}>
                📤 Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

