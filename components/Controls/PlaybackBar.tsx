"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface PlaybackBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onOpBack: () => void;
  onOpForward: () => void;
  onReplay: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  disabled: boolean;
}

const SPEEDS = [0.5, 1, 2, 3];

export default function PlaybackBar({
  isPlaying,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onOpBack,
  onOpForward,
  onReplay,
  speed,
  onSpeedChange,
  disabled,
}: PlaybackBarProps) {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer text-ink-muted transition hover:bg-panel-raised hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-panel px-4 py-2.5">
      <div className="flex items-center">
        <button
          className={btn}
          onClick={onOpBack}
          disabled={disabled}
          aria-label="Previous operation"
          title="Previous operation"
        >
          <SkipBack size={16} />
        </button>
        <button
          className={btn}
          onClick={onStepBack}
          disabled={disabled}
          aria-label="Step back"
          title="Step back"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onTogglePlay}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber hover:bg-amber/90 cursor-pointer text-ink transition hover:brightness-110 disabled:opacity-30"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>
        <button
          className={btn}
          onClick={onStepForward}
          disabled={disabled}
          aria-label="Step forward"
          title="Step forward"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className={btn}
          onClick={onOpForward}
          disabled={disabled}
          aria-label="Next operation"
          title="Next operation"
        >
          <SkipForward size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="mr-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
          Replay
        </span>

        <button
          className={btn}
          onClick={onReplay}
          disabled={disabled}
          aria-label="Replay from start"
          title="Replay from start"
        >
          <RotateCcw size={16} />
        </button>

        <div className="h-5 w-px bg-hairline" />

        <span className="mr-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
          Speed
        </span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            disabled={disabled}
            className={`rounded-md cursor-pointer px-2 py-1 font-mono text-[11px] transition disabled:opacity-40 ${
              speed === s
                ? "bg-amber text-white"
                : "text-ink-muted hover:bg-panel-raised hover:text-ink"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
