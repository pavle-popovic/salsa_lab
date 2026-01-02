import React from 'react';

interface WorldResponse {
    id: string;
    name: string;
    tag: string;
    imageSrc: string;
    description: string;
    progressPercentage: number;
    buttonText: string;
    buttonActionLink?: string;
}

interface CourseEditorProps {
    world: WorldResponse;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ world }) => {
    return (
        <div className="max-w-5xl mx-auto p-10">
            
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
                    <h1 className="text-3xl font-bold">Editing: {world.name}</h1>
                    <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">PUBLISHED</span>
                </div>
                <div className="flex gap-3">
                    <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold text-sm">Preview</button>
                    <button className="bg-mambo-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm">Save Changes</button>
                </div>
            </div>

            <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-8">
                <h3 className="font-bold border-b border-gray-800 pb-4 mb-4">World Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                    {/* Inputs */}
                </div>
            </div>

            <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-xl">Curriculum</h3>
                <button className="text-mambo-blue hover:text-blue-400 text-sm font-bold flex items-center gap-2">
                    <i className="fa-solid fa-plus-circle"></i> Add New Lesson
                </button>
            </div>

            <div className="space-y-3">
                {/* Lesson Items */}
            </div>

        </div>
    );
};

export default CourseEditor;