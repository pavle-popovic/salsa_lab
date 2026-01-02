import React from 'react';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
    return (
        <footer className="border-t border-gray-800 bg-black pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2">
                    <a href="#" className="text-xl font-bold tracking-tight flex items-center gap-2 mb-4">
                        <i className="fa-solid fa-flask text-mambo-blue"></i> THE SALSA LAB
                    </a>
                    <p className="text-gray-500 max-w-sm">
                        The world's first gamified salsa academy. We use science and structure to make you a better dancer, faster.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Learn</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><a href="#" className="hover:text-mambo-blue transition">Beginner Course</a></li>
                        <li><a href="#" className="hover:text-mambo-blue transition">Styling Workshop</a></li>
                        <li><a href="#" className="hover:text-mambo-blue transition">Musicality</a></li>
                        <li><a href="#" className="hover:text-mambo-blue transition">Pricing</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Community</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><a href="#" className="hover:text-mambo-blue transition">Discord Server</a></li>
                        <li><a href="#" className="hover:text-mambo-blue transition">Instagram</a></li>
                        <li><a href="#" className="hover:text-mambo-blue transition">YouTube</a></li>
                        <li><a href="#" className="hover:text-mambo-blue transition">Support</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between text-xs text-gray-600">
                <p>&copy; 2024 The Salsa Lab. Keep dancing.</p>
                <div className="flex gap-4 mt-2 md:mt-0">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;