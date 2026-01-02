import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
    url: string;
    poster?: string;
    onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, onEnded }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // Percentage from 0 to 100

    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const { currentTime, duration } = videoRef.current;
            if (duration > 0) {
                setProgress((currentTime / duration) * 100);
            }
        }
    }, []);

    const handleVideoEnded = useCallback(() => {
        setIsPlaying(false);
        setProgress(0); // Reset progress when video ends
        if (onEnded) {
            onEnded();
        }
    }, [onEnded]);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const progressBar = e.currentTarget;
            const clickX = e.nativeEvent.offsetX;
            const width = progressBar.offsetWidth;
            const newTime = (clickX / width) * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
        }
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('ended', handleVideoEnded);
            videoElement.addEventListener('play', () => setIsPlaying(true));
            videoElement.addEventListener('pause', () => setIsPlaying(false));
            // Set initial poster if provided
            if (poster) {
                videoElement.poster = poster;
            }
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                videoElement.removeEventListener('ended', handleVideoEnded);
                videoElement.removeEventListener('play', () => setIsPlaying(true));
                videoElement.removeEventListener('pause', () => setIsPlaying(false));
            }
        };
    }, [handleTimeUpdate, handleVideoEnded, poster]);

    return (
        <div className="w-full aspect-video bg-gray-900 relative group">
            <video
                ref={videoRef}
                src={url}
                poster={poster}
                className="w-full h-full object-cover"
                onClick={togglePlayPause}
                onDoubleClick={() => videoRef.current?.requestFullscreen()}
            >
                Your browser does not support the video tag.
            </video>

            {!isPlaying && (
                <button
                    className="absolute inset-0 flex items-center justify-center z-10"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                    <div className="w-20 h-20 bg-mambo-blue/90 hover:bg-mambo-blue rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110 shadow-lg shadow-blue-500/50">
                        <i className="fa-solid fa-play text-2xl ml-1 text-white"></i>
                    </div>
                </button>
            )}

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 cursor-pointer" onClick={handleProgressClick}>
                <div className="h-full bg-mambo-blue relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;