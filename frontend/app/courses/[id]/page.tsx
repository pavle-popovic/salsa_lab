"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import QuestLogSidebar from "@/components/QuestLogSidebar";

interface Lesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
}

export default function WorldDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const worldId = params.id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [worldTitle, setWorldTitle] = useState("Loading...");
  const [worldProgress, setWorldProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorld();
  }, [worldId]);

  const loadWorld = async () => {
    try {
      setLoading(true);
      const worlds = await apiClient.getWorlds();
      const world = worlds.find((w) => w.id === worldId);
      
      if (!world) {
        setError("World not found");
        return;
      }

      setWorldTitle(world.title);
      
      // Only load lessons if user is authenticated
      if (user) {
        const worldLessons = await apiClient.getWorldLessons(worldId);
        setLessons(worldLessons);
        
        const completed = worldLessons.filter((l) => l.is_completed).length;
        setWorldProgress((completed / worldLessons.length) * 100);
      } else {
        // For unauthenticated users, show a message
        setLessons([]);
        setWorldProgress(0);
      }
    } catch (err: any) {
      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        setError("Please log in to view lesson details");
      } else {
        setError(err.message || "Failed to load world");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFirstUnlockedLesson = () => {
    return lessons.find((l) => !l.is_locked && !l.is_completed) || lessons[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mambo-dark">
        <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border border-gray-600 hover:bg-gray-800 text-mambo-text rounded-lg font-bold transition"
                >
                  Log In
                </Link>
              </div>
            )}
            <Link
              href="/courses"
              className="inline-block mt-4 text-gray-400 hover:text-mambo-text transition"
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const firstLesson = getFirstUnlockedLesson();

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <Link
          href="/courses"
          className="text-gray-400 hover:text-mambo-text transition mb-6 inline-block"
        >
          ← Back to Courses
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-mambo-text">{worldTitle}</h1>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden max-w-md">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${worldProgress}%` }}
              />
            </div>
            <span className="text-gray-400">
              {Math.round(worldProgress)}% Complete
            </span>
          </div>
        </div>

        {!user && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-blue-400 text-2xl">🔒</div>
              <div>
                <h3 className="font-bold text-mambo-text mb-2">Unlock This World</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Create a free account to access lessons, track your progress, and earn XP.
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
        )}

        {lessons.length === 0 && user ? (
          <div className="text-center text-gray-400 py-16">
            No lessons available in this world yet.
          </div>
        ) : lessons.length === 0 && !user ? (
          <div className="text-center text-gray-400 py-16">
            Please log in to view lessons.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={lesson.is_locked ? "#" : `/lesson/${lesson.id}`}
                onClick={(e) => {
                  if (lesson.is_locked) {
                    e.preventDefault();
                  }
                }}
                className={`bg-mambo-panel border rounded-xl p-6 transition ${
                  lesson.is_locked
                    ? "border-gray-800 opacity-60 cursor-not-allowed"
                    : "border-gray-800 hover:border-gray-600 cursor-pointer"
                }`}
              >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    lesson.is_boss_battle
                      ? "bg-red-600 text-white"
                      : lesson.is_completed
                      ? "bg-green-500 text-black"
                      : lesson.is_locked
                      ? "bg-gray-800 text-gray-500 border border-gray-700"
                      : "bg-mambo-blue text-white"
                  }`}
                >
                  {lesson.is_boss_battle ? "⚔️" : lesson.order_index}
                </div>
                {lesson.is_locked && (
                  <svg
                    className="w-5 h-5 text-gray-600"
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
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 text-mambo-text">{lesson.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {lesson.xp_value} XP {lesson.is_boss_battle && "• Boss Battle"}
              </p>
              {lesson.is_completed && (
                <div className="text-green-400 text-sm font-semibold">✓ Completed</div>
              )}
            </Link>
          ))}
          </div>
        )}

        {user && firstLesson && !firstLesson.is_locked && (
          <div className="mt-8 text-center">
            <Link
              href={`/lesson/${firstLesson.id}`}
              className="inline-block px-8 py-4 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-full transition shadow-lg shadow-blue-500/25"
            >
              {firstLesson.is_completed ? "Continue Learning" : "Start First Lesson"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

