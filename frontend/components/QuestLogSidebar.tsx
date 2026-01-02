import React from 'react';

interface LessonResponse {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface QuestLogSidebarProps {
    currentLessonId: string;
    lessons: LessonResponse[];
    worldTitle: string;
}

const QuestLogSidebar: React.FC<QuestLogSidebarProps> = ({
    currentLessonId,
    lessons,
    worldTitle,
}) => {
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <aside className="w-80 bg-mambo-panel border-l border-gray-800 flex-none hidden lg:flex flex-col">
            <div className="p-5 border-b border-gray-800">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Current World</h3>
                <div className="font-bold text-lg">{worldTitle}</div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                    <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-mambo-blue h-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <span>{completedLessons}/{totalLessons} Completed</span>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {lessons.map((lesson, index) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const lessonClasses = `flex items-center gap-3 p-3 rounded-lg transition ${isCurrent ? 'bg-mambo-blue/20 text-mambo-blue font-bold' : 'hover:bg-gray-800 text-gray-400'}`;
                    const iconClasses = `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-mambo-blue text-white' : 'bg-gray-700'}`;

                    return (
                        <a key={lesson.id} href={`/lessons/${lesson.id}`} className={lessonClasses}>
                            <div className={iconClasses}>{index + 1}</div>
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.isCompleted && (
                                <i className="fa-solid fa-check text-green-500"></i>
                            )}
                            {isCurrent && !lesson.isCompleted && (
                                <i className="fa-solid fa-play text-mambo-blue text-xs"></i>
                            )}
                        </a>
                    );
                })}
            </div>
        </aside>
    );
};

export default QuestLogSidebar;