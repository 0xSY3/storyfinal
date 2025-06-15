"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Slider,
  useTheme,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
} from "@mui/icons-material";

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, artist }) => {
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = Array.isArray(newValue) ? newValue[0] : newValue;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: 200,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        position: "relative",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Audio Info */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {title || "Audio Track"}
        </Typography>
        {artist && (
          <Typography variant="caption" color="text.secondary">
            {artist}
          </Typography>
        )}
      </Box>

      {/* Waveform Visualization (Simple) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "end",
          gap: 0.5,
          height: 40,
          mb: 2,
        }}
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 3,
              height: Math.random() * 30 + 10,
              backgroundColor: isPlaying 
                ? (index / 20 <= currentTime / duration ? theme.palette.primary.main : theme.palette.grey[300])
                : theme.palette.grey[300],
              borderRadius: 1,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>

      {/* Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <IconButton
          onClick={togglePlayPause}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <Typography variant="caption">
            {formatTime(currentTime)}
          </Typography>
          <Slider
            size="small"
            value={currentTime}
            max={duration}
            onChange={handleSeek}
            sx={{ flex: 1 }}
          />
          <Typography variant="caption">
            {formatTime(duration)}
          </Typography>
        </Box>

        <IconButton size="small" onClick={toggleMute}>
          {isMuted ? <MuteIcon /> : <VolumeIcon />}
        </IconButton>
        <Slider
          size="small"
          value={isMuted ? 0 : volume}
          max={1}
          step={0.1}
          onChange={handleVolumeChange}
          sx={{ width: 60 }}
        />
      </Box>
    </Box>
  );
};

export default AudioPlayer;