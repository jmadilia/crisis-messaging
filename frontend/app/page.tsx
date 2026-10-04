"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ConversationView from "@/components/ConversationView";
import {
  conversationHref,
  DEMO_CONVERSATIONS,
  DEMO_THERAPIST_ID,
} from "@/src/lib/demo";

export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const therapistId = searchParams.get("therapist");
  const patientId = searchParams.get("patient");

  if (therapistId && patientId) {
    return (
      <ConversationView
        therapistId={therapistId}
        patientId={patientId}
        onBack={() => router.push("/")}
      />
    );
  }

  const startNewConversation = () => {
    const suffix = Math.random().toString(36).slice(2, 8);
    router.push(conversationHref(DEMO_THERAPIST_ID, `patient-${suffix}`));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-violet-300 p-4">
      <div className="bg-white text-purple-800 p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Crisis Messaging</h1>
        <p className="text-gray-700 mb-6">
          A therapist-to-patient messaging demo built with Next.js and FastAPI.
          Messages are strictly ordered by sequence number and paginated with
          a cursor. Pick a sample conversation to see it in action.
        </p>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Sample conversations
        </h2>
        <div className="space-y-3 mb-6">
          {DEMO_CONVERSATIONS.map((demo) => (
            <Link
              key={demo.patientId}
              href={conversationHref(DEMO_THERAPIST_ID, demo.patientId)}
              className="block border border-violet-200 rounded-md px-4 py-3 hover:bg-violet-50 hover:border-violet-400">
              <span className="block font-medium">
                Therapist → {demo.patientName}
              </span>
              <span className="block text-sm text-gray-600">
                {demo.summary}
              </span>
            </Link>
          ))}
        </div>

        <button
          onClick={startNewConversation}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mb-6">
          Start a new conversation
        </button>

        <ManualEntry
          onOpen={(t, p) => router.push(conversationHref(t, p))}
        />
      </div>
    </div>
  );
}

function ManualEntry({
  onOpen,
}: {
  onOpen: (therapistId: string, patientId: string) => void;
}) {
  const [therapistId, setTherapistId] = useState("");
  const [patientId, setPatientId] = useState("");

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-gray-600">
        Open a conversation by ID
      </summary>
      <form
        className="space-y-4 mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (therapistId && patientId) onOpen(therapistId, patientId);
        }}>
        <div>
          <label className="block text-sm font-medium mb-1">Therapist ID</label>
          <input
            type="text"
            value={therapistId}
            onChange={(e) => setTherapistId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`e.g. ${DEMO_THERAPIST_ID}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Patient ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`e.g. ${DEMO_CONVERSATIONS[0].patientId}`}
          />
        </div>

        <button
          type="submit"
          disabled={!therapistId || !patientId}
          className="w-full bg-white border border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed">
          Load Conversation
        </button>
      </form>
    </details>
  );
}
