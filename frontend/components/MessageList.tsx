"use client";

import { Message } from "@/src/lib/api";

export type MessageListProps = {
  messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="text=center-text-gray-500">No messages yet</p>;
  }

  return (
    <div className="space-y-4">
      {[...messages].map((msg) => (
        <div
          key={msg.message_id}
          className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-mono text-gray-500">
              #{msg.sequence_number}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(msg.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-800">{msg.encrypted_content}</p>
          <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
            <span>ID: {msg.message_id.slice(0, 8)}...</span>
            <span
              className={`px-2 py-1 rounded ${
                msg.read_status === "unread"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
              {msg.read_status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
