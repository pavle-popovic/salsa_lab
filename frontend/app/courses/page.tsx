"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface World {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty: string;
  progress_percentage: number;
  is_locked: boolean;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      // Try to load worlds - will work for both authenticated and unauthenticated users
      // If unauthenticated, API might return limited data or error
      const data = await apiClient.getWorlds();
      setWorlds(data);
    } catch (err: any) {
      // If error is due to authentication, show a message but don't redirect
      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        setError("Please log in to view course details");
      } else {
        setError(err.message || "Failed to load courses");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <div className="bg-mambo-panel border-b border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-6 text-mambo-text">Explore Worlds</h1>
          <p className="text-gray-400 mb-10 max-w-2xl">
            Follow the path. Master the foundation before you unlock the flair.
          </p>
        </div>
      </div>

      {!user && (
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-blue-400 text-2xl">ℹ️</div>
              <div>
                <h3 className="font-bold text-mambo-text mb-2">Start Your Journey</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Browse our courses below. Create a free account to unlock lessons and track your progress.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-2 border border-gray-600 hover:bg-gray-800 text-mambo-text rounded-lg font-bold text-sm transition"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="max-w-7xl mx-auto px-8 py-16 text-center text-gray-400">
          Loading worlds...
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            {!user && (
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition"
              >
                Log In to Continue
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-10">
          {worlds.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 py-16">
              No worlds available yet. Check back soon!
            </div>
          ) : (
            worlds.map((world) => (
              <div
                key={world.id}
                className={`bg-mambo-panel border border-gray-800 rounded-xl overflow-hidden transition ${
                  world.is_locked
                    ? "opacity-75 relative"
                    : "hover:border-gray-600 group cursor-pointer"
                }`}
              >
                {world.is_locked && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 border border-gray-600">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                      Complete Previous World
                    </span>
                  </div>
                )}

                <div className="h-48 relative overflow-hidden">
                  {world.image_url ? (
                    <Image
                      src={world.image_url}
                      alt={world.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <Image
                      src="/assets/Mambo_image_1.png"
                      alt={world.title}
                      fill
                      className={`object-cover group-hover:scale-105 transition duration-500 ${
                        world.is_locked ? "grayscale opacity-50" : ""
                      }`}
                    />
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                    {world.difficulty.toUpperCase()}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className={`font-bold text-lg transition ${
                        world.is_locked
                          ? "text-gray-500"
                          : "group-hover:text-mambo-blue text-mambo-text"
                      }`}
                    >
                      {world.title}
                    </h3>
                    {!world.is_locked && (
                      <svg
                        className="w-6 h-6 text-mambo-blue"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-5 line-clamp-2">
                    {world.description || "Master the fundamentals and build your foundation."}
                  </p>

                  {!world.is_locked && (
                    <>
                      {user && (
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 mb-3">
                          <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 h-full transition-all"
                              style={{ width: `${world.progress_percentage}%` }}
                            />
                          </div>
                          <span>{Math.round(world.progress_percentage)}%</span>
                        </div>
                      )}
                      {user ? (
                        <Link
                          href={`/courses/${world.id}`}
                          className="block w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold text-mambo-text transition text-center"
                        >
                          {world.progress_percentage > 0 ? "Resume" : "Start"}
                        </Link>
                      ) : (
                        <Link
                          href="/register"
                          className="block w-full py-2 bg-mambo-blue hover:bg-blue-600 rounded-lg text-sm font-bold text-white transition text-center"
                        >
                          Get Started
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}

