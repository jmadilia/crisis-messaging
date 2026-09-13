"use client";

import { useEffect, useState } from "react";
import { getMessages, Message, sendMessage } from "@/src/lib/api";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";

type ConversationProps = {
  therapistId: string;
  patientId: string;
};

export default function ConversationView({
  therapistId,
  patientId,
}: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [oldestSequence, setOldestSequence] = useState<number | null>(null);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [therapistId, patientId]);

  const fetchMessages = async (beforeSequence?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMessages(
        therapistId,
        patientId,
        beforeSequence,
        20,
      );

      if (beforeSequence) {
        // Appending older messages
        setMessages((prev) => [...response.messages.reverse(), ...prev]);
      } else {
        // Initial load or refresh
        setMessages(response.messages.reverse());
      }

      setHasMore(response.has_more);
      setOldestSequence(response.oldest_sequence);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(therapistId, patientId, content);
      // Refetch messages to get the new one
      fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleLoadOlder = () => {
    if (oldestSequence !== null && hasMore) {
      fetchMessages(oldestSequence);
    }
  };

  return (
    <div className="flex flex-col h-screen text-black bg-violet-300">
      <div className="bg-white shadow px-6 py-4">
        <h1 className="text-xl font-bold">
          {therapistId} → {patientId}
        </h1>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4">{error}</div>}

      <div className="flex-1 overflow-y-auto p-6">
        {loading && messages.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : (
          <>
            {hasMore && (
              <button
                onClick={handleLoadOlder}
                className="w-full mb-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Load Older Messages
              </button>
            )}
            <MessageList messages={messages} />
          </>
        )}
      </div>

      <MessageForm onSend={handleSendMessage} />
    </div>
  );
}
