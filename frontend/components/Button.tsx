import React from 'react';

interface ButtonProps {
    variant: 'primary' | 'secondary' | 'outline';
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    variant,
    children,
    onClick,
    className
}) => {
    const baseClasses = "px-8 py-4 font-bold rounded-full transition";
    let variantClasses = "";

    switch (variant) {
        case 'primary':
            variantClasses = "bg-mambo-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2";
            break;
        case 'secondary':
        case 'outline': // Both secondary and outline use the same style from the example
            variantClasses = "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10";
            break;
        default:
            variantClasses = "bg-mambo-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"; // Default to primary
    }

    const combinedClasses = `${baseClasses} ${variantClasses} ${className || ''}`.trim();

    return (
        <button
            className={combinedClasses}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;