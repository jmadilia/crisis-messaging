"use client";

import { useState } from "react";

type MessageFormProps = {
  onSend: (content: string) => Promise<void>;
};

export default function MessageForm({ onSend }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setSending(true);
      await onSend(content);
      setContent(""); // Clear input after successful send
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-t border-gray-200 p-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
