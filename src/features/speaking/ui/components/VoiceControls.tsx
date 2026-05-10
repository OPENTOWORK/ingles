'use client';

type MediaApi = {
  status: 'idle' | 'recording' | 'stopped';
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  isRecording: boolean;
};

type Props = {
  media: MediaApi;
  onRecorded: (blob: Blob) => void | Promise<void>;
  disabled?: boolean;
};

export function VoiceControls({ media, onRecorded, disabled }: Props) {
  const { status, error, start, stop, isRecording } = media;

  const handleClick = async () => {
    if (isRecording) {
      const blob = await stop();
      if (blob && blob.size > 0) await onRecorded(blob);
    } else {
      await start();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`rounded-full px-6 py-3 font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 disabled:opacity-50 ${
            isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-sky-600 hover:bg-sky-500'
          }`}
          aria-pressed={isRecording}
          aria-label={isRecording ? 'Stop recording' : 'Start speaking'}
        >
          {isRecording ? 'Stop' : 'Start speaking'}
        </button>
        <span className="text-sm text-slate-400 capitalize" aria-live="polite">
          {status === 'recording' ? 'Listening…' : status === 'stopped' ? 'Processing…' : 'Ready'}
        </span>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-amber-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
