import React, { useState, useRef, useEffect } from 'react';
import { Send, Clock, Sparkles, BookOpen, History, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `Bạn là một trợ lí học tập môn Lịch sử dành cho học sinh Trung học Cơ sở (THCS). 
Nhiệm vụ của bạn là giải đáp các thắc mắc về lịch sử và hướng dẫn học sinh làm bài tập sách giáo khoa.
Yêu cầu quan trọng:
- Trả lời ngắn gọn, súc tích, đi thẳng vào trọng tâm.
- Trình bày dễ hiểu, rõ ràng, chia thành các ý chính (gạch đầu dòng) để học sinh dễ học thuộc.
- Tuyệt đối KHÔNG kể chuyện dài dòng hay dùng văn phong cổ tích.
- Cung cấp thông tin chính xác, bám sát chương trình sách giáo khoa Lịch sử THCS.`;

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

const SUGGESTED_TOPICS = [
  "Nguyên nhân Chiến tranh thế giới thứ hai?",
  "Ý nghĩa Cách mạng tháng Tám 1945?",
  "Diễn biến khởi nghĩa Hai Bà Trưng",
  "Tóm tắt phong trào Cần Vương",
  "Sự ra đời của Đảng Cộng sản VN"
];

const ChimLacIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Background circles representing the Dong Son bronze drum */}
    <circle cx="100" cy="100" r="100" fill="#78350f" />
    <circle cx="100" cy="100" r="92" fill="#b45309" />
    <circle cx="100" cy="100" r="88" fill="#d97706" />
    
    {/* Stylized Chim Lạc (Lạc Bird) */}
    <g transform="translate(10, 20) scale(0.9)" fill="#fef3c7">
      {/* Beak */}
      <polygon points="170,60 195,65 165,70" />
      {/* Head */}
      <circle cx="160" cy="65" r="10" />
      {/* Eye */}
      <circle cx="163" cy="63" r="2" fill="#78350f" />
      {/* Crest */}
      <polygon points="155,57 130,40 148,60" />
      {/* Neck */}
      <path d="M 155,72 Q 140,100 110,100 L 120,85 Q 140,85 150,68 Z" />
      {/* Body */}
      <ellipse cx="90" cy="105" rx="30" ry="15" transform="rotate(-15 90 105)" />
      {/* Wing */}
      <path d="M 95,95 Q 70,50 40,30 Q 60,60 80,95 Z" />
      {/* Tail */}
      <path d="M 65,110 Q 30,120 10,115 Q 35,105 65,100 Z" />
    </g>
  </svg>
);

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Chào bạn! Mình là trợ lí học tập môn Lịch sử. Bạn có câu hỏi hay bài tập sách giáo khoa nào cần giải đáp không? Hãy gửi cho mình nhé, mình sẽ giúp bạn trả lời ngắn gọn và dễ hiểu nhất!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // We use generateContent to simulate chat with system instructions easily
      const prompt = `Học sinh hỏi: "${text}". Hãy giải đáp ngắn gọn, súc tích, bám sát SGK.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.text || "Xin lỗi cậu, cỗ máy thời gian của mình đang bị trục trặc một chút. Cậu hỏi lại sau nhé!",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Ôi không! Cỗ máy thời gian hết năng lượng mất rồi. Lỗi: ${error instanceof Error ? error.message : String(error)}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[90vh] border-4 border-amber-200">
        
        {/* Header */}
        <header className="bg-amber-400 p-4 sm:p-6 flex items-center justify-between text-amber-950 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-sm overflow-hidden bg-white border-2 border-amber-200 flex-shrink-0">
              <ChimLacIcon className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                Sử Gia Nhí AI <Sparkles className="w-5 h-5 text-yellow-100" />
              </h1>
              <p className="text-amber-800 text-sm font-medium">Trợ lí giải đáp Lịch sử THCS</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-amber-300/50 px-4 py-2 rounded-full">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Hỗ trợ bài tập</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-amber-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md overflow-hidden ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {msg.role === 'user' ? (
                      <span className="text-xl font-bold">👤</span>
                    ) : (
                      <ChimLacIcon className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 sm:p-5 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border-2 border-amber-100 rounded-tl-none'
                  }`}>
                    <div className={`text-sm sm:text-base leading-relaxed space-y-2 ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                          em: ({node, ...props}) => <em className="italic" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-2" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[75%] gap-3 flex-row">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-md overflow-hidden">
                  <ChimLacIcon className="w-full h-full object-cover" />
                </div>
                <div className="p-4 sm:p-5 rounded-2xl rounded-tl-none bg-white border-2 border-amber-100 shadow-sm flex items-center gap-2 text-amber-600 font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tìm câu trả lời ngắn gọn nhất...
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Topics */}
        {messages.length === 1 && (
          <div className="px-4 sm:px-6 pb-2 bg-amber-50/50">
            <p className="text-sm text-gray-500 mb-2 font-medium flex items-center gap-1">
              <History className="w-4 h-4" /> Gợi ý chủ đề:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(topic)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors font-medium border border-amber-200"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white border-t-2 border-amber-100 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi hoặc bài tập Lịch sử..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-full px-6 py-3 sm:py-4 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all text-gray-700 text-base sm:text-lg disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
