"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "../../config";

export default function Signin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function handleSignin() {
        try {
            const response = await axios.post(`${BACKEND_URL}/signin`, { username, password });
            localStorage.setItem("token", response.data.token);
            router.push("/");
        } catch (e) {
            alert("Invalid credentials");
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h1>
                <p className="text-gray-400 text-center mb-8">Sign in to continue to your rooms</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSignin}
                    className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
                >
                    Sign In
                </button>

                <p className="mt-6 text-center text-gray-400">
                    Don't have an account? <Link href="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}