"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { WS_URL, BACKEND_URL } from "./../../../config";
import axios from "axios";

interface ChatMessage {
    message: string;
    userId?: string; // Optional
    id?: number;
}

export default function Room() {
    const { roomId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when message arrives
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/signin");
            return;
        }

        // Fetch History
        axios.get(`${BACKEND_URL}/chats/${roomId}`).then(res => {
            setMessages(res.data.messages);
        });

        // Connect WS
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join_room", roomId }));
        };

        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "chat") {
                setMessages(prev => [...prev, { message: parsed.message }]);
            }
        };

        return () => {
            ws.close();
        }
    }, [roomId, router]);

    function sendMessage() {
        if (!wsRef.current || !currentMessage.trim()) return;

        wsRef.current.send(JSON.stringify({
            type: "chat",
            roomId,
            message: currentMessage
        }));
        
        setCurrentMessage("");
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h1 className="text-xl font-bold">Room #{roomId}</h1>
                </div>
                <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white text-sm">
                    Leave Room
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                {messages.map((m, index) => (
                    <div key={index} className="flex flex-col animate-fade-in-up">
                        <div className="bg-gray-800 self-start text-white px-4 py-2 rounded-2xl rounded-tl-none max-w-xs break-words shadow-sm border border-gray-700/50">
                            {m.message}
                        </div>
                         {/* Placeholder for timestamp if needed */}
                        <span className="text-[10px] text-gray-500 mt-1 ml-1">Just now</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="max-w-4xl mx-auto flex gap-4">
                    <input 
                        type="text" 
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 bg-black border border-gray-700 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-gray-500"
                        placeholder="Type a message..."
                    />
                    <button 
                        onClick={sendMessage} 
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all flex items-center justify-center w-12 h-12 shadow-lg hover:shadow-blue-500/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}