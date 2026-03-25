import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Dreams',
    artist: 'AI Synthwave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    color: 'text-pink-500',
    glow: 'shadow-pink-500/50',
  },
  {
    id: 2,
    title: 'Cybernetic Pulse',
    artist: 'AI Darksynth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    color: 'text-cyan-400',
    glow: 'shadow-cyan-400/50',
  },
  {
    id: 3,
    title: 'Digital Sunset',
    artist: 'AI Retrowave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    color: 'text-purple-500',
    glow: 'shadow-purple-500/50',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Decorative neon line */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent ${currentTrack.color} opacity-70`} />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shadow-[0_0_15px_currentColor] ${currentTrack.color}`}>
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold tracking-wider ${currentTrack.color} drop-shadow-[0_0_8px_currentColor]`}>
              {currentTrack.title}
            </h3>
            <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div 
          className={`h-full ${currentTrack.color.replace('text-', 'bg-')} transition-all duration-300 ease-linear shadow-[0_0_10px_currentColor]`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={prevTrack}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        
        <button 
          onClick={togglePlay}
          className={`w-14 h-14 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700 text-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:${currentTrack.glow}`}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
        
        <button 
          onClick={nextTrack}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
