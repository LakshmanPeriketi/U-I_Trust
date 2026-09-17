import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export default function ChatWindow() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    try {
      const [matchRes, msgRes] = await Promise.all([
        api.get(`/matches/${matchId}`),
        api.get(`/messages/${matchId}`),
      ]);

      setMatch(matchRes.data);
      setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
      setError('');
    } catch (err) {
      console.error('Error loading chat:', err);
      setError(err.response?.data?.message || err.message || 'Error loading chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
    // 3-second polling interval for real-time messages
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const { data } = await api.post(`/messages/${matchId}`, { content });
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (user?.role === 'ngo') {
      navigate('/ngo/incoming-matches');
    } else {
      navigate('/donor/match-status');
    }
  };

  // Safe counterpart calculation
  const currentUserId = String(user?.id || user?._id || '');
  const donorIdStr = typeof match?.donorId === 'object' ? match?.donorId?._id : match?.donorId;
  const isCurrentDonor = currentUserId === String(donorIdStr || '');

  const counterpartName = match
    ? isCurrentDonor
      ? match.ngoId?.name || 'NGO Partner'
      : match.donorId?.name || 'Donor'
    : 'Chat Partner';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="text-xs text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition flex items-center gap-1 font-semibold"
        >
          ← Back to {user?.role === 'ngo' ? 'Incoming Matches' : 'Match Tracker'}
        </button>
        <span className="text-xs text-gray-400 font-mono">Match ID: {matchId}</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading chat thread...</div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col h-[600px] shadow-xl">
          {/* Chat Top Banner */}
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                💬 {counterpartName}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Item:{' '}
                <span className="text-gray-200 font-medium capitalize">
                  {match?.donationId?.itemType || match?.requirementId?.itemType || 'Donation Item'}
                </span>
                {' · '}
                <span className="capitalize text-blue-400 font-semibold">{match?.status?.replace(/_/g, ' ')}</span>
              </p>
            </div>
            {match?.ngoId?.area && (
              <span className="text-xs text-gray-300 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded">
                📍 {match.ngoId.area}
              </span>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-900/40">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500 text-xs italic">
                No messages yet. Send a message to coordinate handover details.
              </div>
            ) : (
              messages.map((msg) => {
                const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
                const isMine = String(msgSenderId) === currentUserId;
                const senderName = msg.senderId?.name || (isMine ? 'You' : counterpartName);
                const senderRole = msg.senderId?.role;

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-300">
                        {isMine ? 'You' : senderName}
                      </span>
                      {senderRole && (
                        <span className="uppercase text-[9px] px-1 py-0.2 bg-gray-800 border border-gray-700 text-gray-300 rounded font-mono">
                          {senderRole}
                        </span>
                      )}
                      <span>·</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-none shadow'
                          : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none shadow'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
