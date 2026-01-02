import React from 'react';

interface PricingCardProps {
    tier: string;
    price: string; // e.g., "29"
    features: string[];
    isPopular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
    tier,
    price,
    features,
    isPopular = false,
}) => {
    const cardClasses = `relative border-2 bg-gray-900 rounded-2xl p-8 flex flex-col shadow-2xl shadow-blue-900/20 ${isPopular ? 'border-mambo-blue scale-105 z-10' : 'border-gray-800'}`;

    return (
        <div className={cardClasses}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mambo-blue text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                </div>
            )}
            
            <div className="mb-4 mt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{tier}</span>
            </div>
            <div className="text-4xl font-bold mb-2">${price}<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <div className="text-sm text-gray-500 mb-8">Billed monthly.</div>
            
            <ul className="text-left space-y-4 mb-8 flex-1">
                {features.map((feature, index) => (
                    <li key={index} className="flex gap-3 text-sm text-white font-semibold">
                        <i className="fa-solid fa-check text-mambo-blue"></i> {feature}
                    </li>
                ))}
            </ul>
            <button className="block w-full py-4 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition shadow-lg shadow-blue-500/25">Start 7-Day Free Trial</button>
        </div>
    );
};

export default PricingCard;