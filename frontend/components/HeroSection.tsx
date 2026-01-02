import React from 'react';

interface HeroSectionProps {
    videoSrc?: string;
    fallbackImgSrc?: string;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText?: string;
    ctaSecondaryLink?: string;
    tagline?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    videoSrc = "background.mp4",
    fallbackImgSrc = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    title = (<>Turn the Dancefloor<br/>Into Your Playground.</>),
    subtitle = (<>Structured courses. Gamified progression. Real feedback. <br/>Stop memorizing steps—start mastering the game.</>),
    ctaPrimaryText = "Start Level 1",
    ctaPrimaryLink = "courses.html",
    ctaSecondaryText = "How It Works",
    ctaSecondaryLink = "#about",
    tagline = "ONLINE SALSA ACADEMY",
}) => {
    return (
        <header className="relative h-screen flex items-center justify-center">
            <video autoPlay loop muted playsInline className="hero-video opacity-60">
                <source src={videoSrc} type="video/mp4" />
                <img src={fallbackImgSrc} className="w-full h-full object-cover" alt="Background" />
            </video>
            <div className="absolute inset-0 bg-black/40 gradient-overlay"></div>

            <div className="relative z-10 text-center px-4 max-w-4xl pt-20">
                <div data-aos="fade-down" data-aos-duration="1000" className="inline-block px-4 py-1 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-xs font-bold tracking-widest mb-6">
                    {tagline}
                </div>
                <h1 data-aos="fade-up" data-aos-delay="200" className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight mb-6">
                    {title}
                </h1>
                <p data-aos="fade-up" data-aos-delay="400" className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
                    {subtitle}
                </p>
                <div data-aos="fade-up" data-aos-delay="600" className="flex flex-col md:flex-row justify-center gap-4">
                    <a href={ctaPrimaryLink} className="px-8 py-4 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-full transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                        {ctaPrimaryText}
                    </a>
                    <a href={ctaSecondaryLink} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full font-bold transition">
                        {ctaSecondaryText}
                    </a>
                </div>
            </div>
            
            <div className="absolute bottom-10 animate-bounce text-gray-500">
                <i className="fa-solid fa-arrow-down"></i>
            </div>
        </header>
    );
};

export default HeroSection;