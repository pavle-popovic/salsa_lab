import React from 'react';

interface AdminSidebarProps {
    activeRoute: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeRoute }) => {
    const getLinkClasses = (href: string) => {
        const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition";
        const activeClasses = "bg-blue-600/10 text-blue-400 border border-blue-600/20";
        const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent";

        return `${baseClasses} ${activeRoute === href ? activeClasses : inactiveClasses}`;
    };

    return (
        <aside className="w-64 bg-mambo-panel border-r border-gray-800 flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <i className="fa-solid fa-flask text-mambo-blue text-xl"></i>
                <span className="font-bold text-lg tracking-wide">ADMIN LAB</span>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <a href="/admin/dashboard" className={getLinkClasses("/admin/dashboard")}>
                    <i className="fa-solid fa-chart-line w-5"></i> Dashboard
                </a>
                {/* Other links would go here, e.g.: */}
                {/* <a href="/admin/users" className={getLinkClasses("/admin/users")}>
                    <i className="fa-solid fa-users w-5"></i> Users
                </a> */}
                {/* <a href="/admin/courses" className={getLinkClasses("/admin/courses")}>
                    <i className="fa-solid fa-book w-5"></i> Courses
                </a> */}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <a href="/" className="flex items-center gap-2 text-gray-500 hover:text-white text-sm">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </a>
            </div>
        </aside>
    );
};

export default AdminSidebar;