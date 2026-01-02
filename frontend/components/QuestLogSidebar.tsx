"use client";

import { FaLock, FaCheck, FaPlay, FaSkull } from "react-icons/fa";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
}

interface QuestLogSidebarProps {
  currentLessonId: string;
  lessons: Lesson[];
  worldTitle: string;
  worldProgress: number;
}

export default function QuestLogSidebar({
  currentLessonId,
  lessons,
  worldTitle,
  worldProgress,
}: QuestLogSidebarProps) {
  return (
    <aside className="w-80 bg-mambo-panel border-l border-gray-800 flex-none hidden lg:flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">
          Current World
        </h3>
        <div className="font-bold text-lg text-mambo-text">{worldTitle}</div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-mambo-blue h-full transition-all"
              style={{ width: `${worldProgress}%` }}
            />
          </div>
          <span className="text-mambo-text-light">
            {Math.round(worldProgress)}% Completed
          </span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {lessons.map((lesson) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = lesson.is_completed;
          const isLocked = lesson.is_locked;
          const isBoss = lesson.is_boss_battle;

          return (
            <Link
              key={lesson.id}
              href={isLocked ? "#" : `/lesson/${lesson.id}`}
              className={`p-3 rounded-lg flex gap-3 items-center transition ${
                isActive
                  ? "bg-blue-900/20 border border-blue-500/30"
                  : isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-white/5 cursor-pointer"
              }`}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                }
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isBoss
                    ? "bg-red-600 text-white"
                    : isCompleted
                    ? "bg-green-500 text-black"
                    : isActive
                    ? "bg-mambo-blue text-white"
                    : "border border-gray-600 text-gray-500"
                }`}
              >
                {isBoss ? (
                  <FaSkull className="text-[8px]" />
                ) : isCompleted ? (
                  <FaCheck className="text-[8px]" />
                ) : isActive ? (
                  <FaPlay className="text-[8px]" />
                ) : (
                  lesson.order_index
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-bold truncate ${
                    isActive
                      ? "text-blue-200"
                      : isLocked
                      ? "text-gray-400"
                      : "text-mambo-text-light"
                  }`}
                >
                  {lesson.title}
                </div>
                <div
                  className={`text-[10px] ${
                    isActive
                      ? "text-blue-400"
                      : isLocked
                      ? "text-gray-600"
                      : "text-gray-500"
                  }`}
                >
                  {lesson.xp_value} XP
                  {isBoss && " • Boss Battle"}
                </div>
              </div>
              {isLocked && (
                <FaLock className="text-xs text-gray-600 shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

