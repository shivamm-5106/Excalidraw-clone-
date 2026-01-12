"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "./../config";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();
  async function createRoom() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BACKEND_URL}/room`, {
        name: roomName 
      }, {
        headers: { Authorization: token }
      });
      router.push(`/canvas/${response.data.slug || roomName}`);
    } catch (e) {
      alert("Please login first!");
      router.push("/signin");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-24 px-4">
      {/* Navbar Placeholder */}
      <div className="absolute top-4 right-4 flex gap-4">
        <Link href="/signin" className="text-gray-400 hover:text-white transition">Sign In</Link>
        <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition">Sign Up</Link>
      </div>

      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Draw & Chat
      </h1>
      <p className="text-gray-400 mb-12 text-lg">Real-time collaboration made simple.</p>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* Create Room Card */}
        <div className="flex-1 bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
          <h2 className="text-2xl font-bold mb-4 text-blue-400 group-hover:text-blue-300">Create Room</h2>
          <p className="text-gray-400 mb-6">Start a new session and invite your friends.</p>
          <input
            type="text" placeholder="Enter room name..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button onClick={createRoom} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
            Create New Room
          </button>
        </div>

        {/* Join Room Card */}
        <div className="flex-1 bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/50 transition-all group">
          <h2 className="text-2xl font-bold mb-4 text-purple-400 group-hover:text-purple-300">Join Room</h2>
          <p className="text-gray-400 mb-6">Enter an existing ID to jump into the action.</p>
          <input
            type="text" placeholder="Enter Room Name..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            onClick={() => router.push(`/canvas/${roomName}`)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}