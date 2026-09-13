import { before } from "node:test";

const API_URL = "http://localhost:8000";

export interface Message {
  message_id: string;
  encrypted_content: string;
  timestamp: string;
  sequence_number: number;
  read_status: string;
}

export interface MessagesResponse {
  messages: Message[];
  has_more: boolean;
  oldest_sequence: number | null;
}

export async function sendMessage(
  therapistId: string,
  patientId: string,
  content: string,
): Promise<{ message_id: string; timestamp: string }> {
  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      therapist_id: therapistId,
      patient_id: patientId,
      encrypted_content: content,
    }),
  });

  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

export async function getMessages(
  therapistId: string,
  patientId: string,
  beforeSequence?: number,
  limit = 20,
): Promise<MessagesResponse> {
  const params = new URLSearchParams({
    therapist_id: therapistId,
    patient_id: patientId,
    limit: limit.toString(),
  });

  if (beforeSequence) {
    params.append("before_sequence", beforeSequence.toString());
  }

  const response = await fetch(`${API_URL}/messages?${params}`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}
