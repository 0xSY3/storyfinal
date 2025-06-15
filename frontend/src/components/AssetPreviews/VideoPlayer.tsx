"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Fade,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Fullscreen as FullscreenIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
} from "@mui/icons-material";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, poster }) => {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: 200,
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "black",
        cursor: "pointer",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlayPause}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Controls Overlay */}
      <Fade in={showControls || !isPlaying}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isPlaying
              ? "linear-gradient(transparent 60%, rgba(0,0,0,0.7))"
              : "rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          {title && (
            <Box sx={{ alignSelf: "flex-start" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                }}
              >
                {title}
              </Typography>
            </Box>
          )}

          {/* Center Play Button */}
          <Box
            sx={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              onClick={togglePlayPause}
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                color: theme.palette.primary.main,
                width: 56,
                height: 56,
                "&:hover": {
                  backgroundColor: "white",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isPlaying ? (
                <PauseIcon sx={{ fontSize: 32 }} />
              ) : (
                <PlayIcon sx={{ fontSize: 32 }} />
              )}
            </IconButton>
          </Box>

          {/* Bottom Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={toggleMute}
                sx={{ color: "white" }}
              >
                {isMuted ? <MuteIcon /> : <VolumeIcon />}
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={toggleFullscreen}
                sx={{ color: "white" }}
              >
                <FullscreenIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Video Type Badge */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: "0.7rem",
          fontWeight: 500,
        }}
      >
        VIDEO
      </Box>
    </Box>
  );
};

export default VideoPlayer;