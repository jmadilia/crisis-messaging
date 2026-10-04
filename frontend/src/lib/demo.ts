// Fixed IDs for the sample conversations seeded by the backend, so visitors
// can open a populated conversation without knowing any IDs.
export const DEMO_THERAPIST_ID = "therapist-demo";

export type DemoConversation = {
  patientId: string;
  patientName: string;
  summary: string;
};

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    patientId: "patient-alex",
    patientName: "Alex",
    summary: "Interview anxiety, with a follow-up check-in",
  },
  {
    patientId: "patient-jordan",
    patientName: "Jordan",
    summary: "Trouble sleeping, plus crisis line resources",
  },
];

export function conversationHref(therapistId: string, patientId: string) {
  const params = new URLSearchParams({
    therapist: therapistId,
    patient: patientId,
  });
  return `/?${params}`;
}
