import React from 'react';

interface XPToastProps {
    xpAmount: number;
    isVisible: boolean;
}

const XPToast: React.FC<XPToastProps> = ({ xpAmount, isVisible }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-8 right-8 bg-mambo-panel border border-mambo-gold text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce">
            <div className="w-10 h-10 rounded-full bg-mambo-gold flex items-center justify-center text-black font-bold">
                <i className="fa-solid fa-bolt"></i>
            </div>
            <div>
                <div className="font-bold text-mambo-gold">Level Up!</div>
                <div className="text-sm">You gained {xpAmount} XP</div>
            </div>
        </div>
    );
};

export default XPToast;