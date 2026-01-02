"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { FaArrowLeft, FaPen, FaTrash, FaPlus, FaGripVertical } from "react-icons/fa";
import Image from "next/image";

export default function AdminBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [worldTitle, setWorldTitle] = useState("World 1: The Foundation");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [description, setDescription] = useState(
    "Master timing On2, weight transfer, and the core 6 steps of Mambo."
  );
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // Mock lessons data - in real app, this would come from API
  const lessons = [
    { id: "1", title: "1.1 The Basic Step", xp: 50, type: "Video" },
    { id: "2", title: "1.2 Side Breaks", xp: 50, type: "Video" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-gray-400 hover:text-mambo-text"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-3xl font-bold text-mambo-text">
                Editing: {worldTitle}
              </h1>
              {isPublished && (
                <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">
                  PUBLISHED
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold text-sm text-mambo-text">
                Preview
              </button>
              <button className="bg-mambo-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm text-white">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="font-bold border-b border-gray-800 pb-4 mb-4 text-mambo-text">
              World Settings
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  World Title
                </label>
                <input
                  type="text"
                  value={worldTitle}
                  onChange={(e) => setWorldTitle(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light h-24 focus:border-mambo-blue outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-xl text-mambo-text">Curriculum</h3>
            <button className="text-mambo-blue hover:text-blue-400 text-sm font-bold flex items-center gap-2">
              <FaPlus />
              Add New Lesson
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-mambo-panel border border-gray-800 p-4 rounded-lg flex items-center gap-4 group cursor-move hover:border-gray-600 transition"
              >
                <div className="text-gray-600 group-hover:text-gray-400">
                  <FaGripVertical />
                </div>
                <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden">
                  <Image
                    src="/assets/Mambo_image_1.png"
                    alt={lesson.title}
                    width={64}
                    height={40}
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-mambo-text">{lesson.title}</div>
                  <div className="text-xs text-gray-500">
                    {lesson.type} • {lesson.xp} XP
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:text-mambo-text text-gray-500">
                    <FaPen />
                  </button>
                  <button className="p-2 hover:text-red-500 text-gray-500">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-mambo-blue hover:text-mambo-blue hover:bg-gray-900 transition cursor-pointer">
              <svg
                className="w-12 h-12 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="font-bold text-sm">Click to upload new video</span>
              <span className="text-xs mt-1">or drag and drop MP4 file here</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
