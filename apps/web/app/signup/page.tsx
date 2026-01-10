"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "../../config";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();

    async function handleSignup() {
        try {
            await axios.post(`${BACKEND_URL}/signup`, { username, password, name });
            router.push("/signin");
        } catch (e) {
            alert("Error signing up");
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h1>
                <p className="text-gray-400 text-center mb-8">Join the drawing community</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            placeholder="johndoe123"
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
                    onClick={handleSignup}
                    className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
                >
                    Sign Up
                </button>

                <p className="mt-6 text-center text-gray-400">
                    Already have an account? <Link href="/signin" className="text-blue-400 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}