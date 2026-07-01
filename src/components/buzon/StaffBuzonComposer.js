'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { validateBuzonAttachmentFile } from '@/lib/staffBuzonAttachments';
import { useMediaRecorder } from '@/features/speaking/ui/hooks/useMediaRecorder';
import styles from './StaffBuzonPanel.module.css';

function pendingAttachmentLabel(attachment) {
  if (attachment?.attachment_kind === 'image') return '🖼';
  if (attachment?.attachment_kind === 'audio') return '🎤';
  return '📎';
}

export default function StaffBuzonComposer({
  draft,
  setDraft,
  pendingAttachment,
  setPendingAttachment,
  uploadingAttachment,
  setUploadingAttachment,
  sending,
  onSend,
  onUploadFile,
}) {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const { start, stop, discard, release, isRecording, isActive: isRecordingAudio, error } =
    useMediaRecorder();
  const releaseRef = useRef(release);
  releaseRef.current = release;

  useEffect(() => {
    return () => {
      releaseRef.current();
    };
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handlePickAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateBuzonAttachmentFile(file);
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    setUploadingAttachment(true);
    try {
      await onUploadFile(file);
    } catch (error) {
      toast.error(error.message || 'No se pudo subir el archivo.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleToggleRecording = async () => {
    if (uploadingAttachment || sending) return;

    if (isRecordingAudio) {
      const blob = await stop();
      if (!blob || blob.size < 1) {
        toast.error('No se capturó audio.');
        return;
      }
      const mime = blob.type || 'audio/webm';
      const extension = mime.includes('ogg') ? 'ogg' : 'webm';
      const file = new File([blob], `audio-${Date.now()}.${extension}`, { type: mime });
      const validation = validateBuzonAttachmentFile(file);
      if (!validation.ok) {
        toast.error(validation.error);
        return;
      }
      setUploadingAttachment(true);
      try {
        await onUploadFile(file);
      } catch (error) {
        toast.error(error.message || 'No se pudo subir el audio.');
      } finally {
        setUploadingAttachment(false);
      }
      return;
    }

    if (pendingAttachment) {
      setPendingAttachment(null);
    }

    try {
      await start();
    } catch (_error) {
      toast.error('No se pudo acceder al micrófono.');
    }
  };

  const handleCancelRecording = () => {
    void discard();
  };

  return (
    <form ref={formRef} className={styles.composer} onSubmit={onSend}>
      <input
        ref={fileInputRef}
        type="file"
        className={styles.hiddenFileInput}
        accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,audio/*,.mp3,.m4a,.wav,.ogg,.webm"
        onChange={(event) => void handleAttachmentChange(event)}
      />
      <div className={styles.composerMain}>
        {isRecordingAudio ? (
          <div className={styles.recordingBanner}>
            <span className={styles.recordingDot} aria-hidden />
            <span>Grabando audio…</span>
            <button type="button" onClick={handleCancelRecording}>
              Cancelar
            </button>
          </div>
        ) : null}
        {pendingAttachment ? (
          <div className={styles.pendingAttachment}>
            <span>
              {pendingAttachmentLabel(pendingAttachment)} {pendingAttachment.attachment_name}
            </span>
            {pendingAttachment.attachment_kind === 'audio' ? (
              <audio
                key={pendingAttachment.attachment_url}
                controls
                preload="metadata"
                src={pendingAttachment.attachment_url}
                className={styles.pendingAudioPreview}
              />
            ) : null}
            <button
              type="button"
              onClick={() => setPendingAttachment(null)}
              aria-label="Quitar adjunto"
            >
              ×
            </button>
          </div>
        ) : null}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe un mensaje…"
          rows={2}
          aria-label="Mensaje"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
      </div>
      <div className={styles.composerActions}>
        <button
          type="button"
          className={styles.attachBtn}
          onClick={handlePickAttachment}
          disabled={uploadingAttachment || sending || isRecordingAudio}
          title="Adjuntar imagen, documento o audio"
        >
          {uploadingAttachment ? '…' : '📎'}
        </button>
        <button
          type="button"
          className={`${styles.attachBtn}${isRecording ? ` ${styles.recordBtnActive}` : ''}`}
          onClick={() => void handleToggleRecording()}
          disabled={uploadingAttachment || sending}
          title={isRecordingAudio ? 'Detener grabación' : 'Grabar audio'}
          aria-pressed={isRecordingAudio}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
        <button
          type="submit"
          disabled={
            sending ||
            uploadingAttachment ||
            isRecordingAudio ||
            (!draft.trim() && !pendingAttachment)
          }
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}
