export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const mockFaqItems: FaqItem[] = [
  {
    id: "f1",
    question: "How can i use this app?",
    answer:
      'You can download it in the play store/app store, then type in the search menu with the name "ChatMe" then press download to be able to communicate easily.',
  },
  {
    id: "f2",
    question: "Is this app paid?",
    answer: "No, RiseChat is completely free to download and use.",
  },
  {
    id: "f3",
    question: "How to send messages and videos?",
    answer:
      "Open a chat, tap the attachment icon next to the message box, then choose a video or type your message and hit send.",
  },
  {
    id: "f4",
    question: "Are there any special requirements for using this application?",
    answer: "You just need a valid phone number and an internet connection.",
  },
  {
    id: "f5",
    question: "How to send files?",
    answer:
      "Open a chat, tap the attachment icon next to the message box, then select the file you'd like to share.",
  },
];
