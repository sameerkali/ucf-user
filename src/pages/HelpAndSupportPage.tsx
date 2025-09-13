import type { FC } from "react";
import { useState, useRef } from "react";
import { Mic, ChevronDown, ChevronUp, Square, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../api/axios";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
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
      "You can contact our customer support team 24/7 by using the chat feature on this page or by sending an email to [support@example.com](mailto:support@example.com).",
  },
];

const HelpAndSupportPage: FC = () => {
  // FAQ state
  const [expanded, setExpanded] = useState<number | null>(faqData[0]?.id ?? null);
  
  // Chat input state
  const [input, setInput] = useState("");
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // API mutation for sending support requests
  const supportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/api/support/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Support request sent successfully!");
      setInput("");
      setAudioBlob(null);
      setRecordingTime(0);
    },
    onError: (error: any) => {
      console.error("Error sending support request:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send support request. Please try again."
      );
    },
  });

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && !audioBlob) {
      toast.error("Please enter a message or record audio");
      return;
    }

    const formData = new FormData();
    
    if (audioBlob) {
      // Send voice recording
      const audioFile = new File([audioBlob], `voice_message_${Date.now()}.wav`, {
        type: "audio/wav",
      });
      formData.append("file", audioFile);
    } else if (input.trim()) {
      // Send text message
      formData.append("text", input.trim());
    }

    supportMutation.mutate(formData);
  };

  // Handle voice recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
      <footer className="fixed left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-t border-gray-200 bottom-0 max-sm:bottom-[8%]">
        <div className="max-w-3xl mx-auto px-4 py-3 w-full">
          {/* Recording status */}
          {isRecording && (
            <div className="flex items-center justify-between mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">Recording: {formatTime(recordingTime)}</span>
              </div>
              <button
                onClick={cancelRecording}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Audio preview */}
          {audioBlob && !isRecording && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Voice message ready ({formatTime(recordingTime)})</span>
                </div>
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }}
                  className="text-green-600 hover:text-green-700 transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {!audioBlob && !isRecording && (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow bg-gray-100 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-700 text-base"
                aria-label="Ask a question"
                disabled={supportMutation.isPending}
              />
            )}
            
            {(audioBlob || isRecording) && (
              <div className="flex-grow bg-gray-100 border border-gray-300 rounded-full px-4 py-3 flex items-center justify-center text-gray-600">
                {isRecording ? "Recording..." : "Voice message ready"}
              </div>
            )}

            {/* Voice recording button */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={supportMutation.isPending}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : audioBlob
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={supportMutation.isPending || (!input.trim() && !audioBlob)}
              className="p-3 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {supportMutation.isPending ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
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
