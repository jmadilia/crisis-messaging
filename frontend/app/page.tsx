"use client";

import { useState } from "react";
import ConversationView from "@/components/ConversationView";

export default function Home() {
  const [therapistId, setTherapistId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [showConversation, setShowConversation] = useState(false);

  const handleLoadConversation = () => {
    if (therapistId && patientId) {
      setShowConversation(true);
    }
  };

  if (showConversation) {
    return <ConversationView therapistId={therapistId} patientId={patientId} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-violet-300">
      <div className="bg-white text-purple-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Crisis Messaging</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Therapist ID
            </label>
            <input
              type="text"
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="w-full px-3 py-2 border border-gray=300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. therapist-123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray=300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. patient-456"
            />
          </div>

          <button
            onClick={handleLoadConversation}
            disabled={!therapistId || !patientId}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
            Load Conversation
          </button>
        </div>
      </div>
    </div>
  );
}

