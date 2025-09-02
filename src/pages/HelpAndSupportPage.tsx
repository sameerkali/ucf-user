import type { FC } from "react";
import { useState } from "react";
import { MessageCircle, Mic, ChevronDown, ChevronUp } from "lucide-react";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  // ... your faqData remains unchanged
  {
    id: 1,
    question: "How do I reset my password?",
    answer:
      "You can reset your password by going to the 'Account Settings' page and clicking on 'Forgot Password'. An email with instructions will be sent to you.",
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, including Visa, MasterCard, and American Express. We also support payments via PayPal and direct bank transfer.",
  },
  {
    id: 3,
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time from your dashboard. Your subscription will remain active until the end of the current billing cycle.",
  },
  {
    id: 4,
    question: "How do I contact customer support?",
    answer:
      "You can contact our customer support team 24/7 by using the chat feature on this page or by sending an email to support@example.com.",
  },
];

const HelpAndSupportPage: FC = () => {
  // Initialize with first FAQ open by default
  const [expanded, setExpanded] = useState<number | null>(faqData[0]?.id ?? null);
  const [input, setInput] = useState("");

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Scrollable Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-32 pt-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-green-700 tracking-tight">
            Support Center
          </h1>
          <p className="mt-2 text-lg text-gray-500">Your questions, answered.</p>
        </header>

        <section className="space-y-3">
          {faqData.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg bg-white shadow-sm transition-all"
              >
                <button
                  className="w-full text-left flex items-center justify-between p-5 focus-visible:ring-2 focus-visible:ring-green-700 transition group"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${item.id}`}
                >
                  <span className="font-semibold text-gray-800">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="text-green-700" aria-label="Collapse" />
                  ) : (
                    <ChevronDown className="text-green-700" aria-label="Expand" />
                  )}
                </button>
                {isOpen && (
                  <div
                    id={`faq-content-${item.id}`}
                    className="px-5 pb-5 text-gray-600 text-sm animate-fade"
                    style={{ animation: "fadein 0.3s" }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      {/* Floating Chat Input Bar */}
      <footer
        className="
  fixed 
  left-0 
  right-0 
  z-20 
  bg-white/95 
  backdrop-blur-lg 
  border-t 
  border-gray-200 
  bottom-0 
  max-sm:bottom-[8%]
"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 w-full">
          <form
            className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full shadow-sm p-2 focus-within:ring-2 focus-within:ring-green-700"
            onSubmit={(e) => {
              e.preventDefault();
              // handle input submit
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow w-full bg-transparent focus:outline-none px-4 text-base"
              aria-label="Ask a question"
            />
            <button
              type="button"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Start chat"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              type="button"
              className="p-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors"
              aria-label="Record voice"
            >
              <Mic className="w-5 h-5" />
            </button>
          </form>
        </div>
      </footer>

      {/* Smooth FAQ expand animation */}
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: none;} }
        .animate-fade { animation: fadein 0.3s; }
      `}</style>
    </div>
  );
};

export default HelpAndSupportPage;
