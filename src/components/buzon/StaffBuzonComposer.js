'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { validateBuzonAttachmentFile } from '@/lib/staffBuzonAttachments';
import { BUZON_MESSAGE_EMOJIS } from '@/lib/staffBuzonEmojis';
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
  const textareaRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const uploadFile = async (file, errorMessage = 'No se pudo subir el archivo.') => {
    const validation = validateBuzonAttachmentFile(file);
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    setUploadingAttachment(true);
    try {
      await onUploadFile(file);
    } catch (error) {
      toast.error(error.message || errorMessage);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await uploadFile(file);
  };

  const handlePaste = async (event) => {
    const imageItem = Array.from(event.clipboardData?.items || []).find(
      (item) => item.kind === 'file' && item.type.startsWith('image/'),
    );
    if (!imageItem) return;

    event.preventDefault();
    if (uploadingAttachment || sending || isRecordingAudio) {
      toast.error('Espera a que termine el envío actual.');
      return;
    }

    const clipboardFile = imageItem.getAsFile();
    if (!clipboardFile) {
      toast.error('No se pudo leer el pantallazo del portapapeles.');
      return;
    }

    const extension =
      clipboardFile.type === 'image/jpeg'
        ? 'jpg'
        : clipboardFile.type === 'image/webp'
          ? 'webp'
          : clipboardFile.type === 'image/gif'
            ? 'gif'
            : 'png';
    const screenshot = new File(
      [clipboardFile],
      `pantallazo-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`,
      { type: clipboardFile.type || 'image/png' },
    );

    await uploadFile(screenshot, 'No se pudo pegar el pantallazo.');
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

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? draft.length;
    const end = textarea?.selectionEnd ?? draft.length;
    const nextDraft = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
    setDraft(nextDraft);
    setShowEmojiPicker(false);

    window.requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = start + emoji.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <form
      ref={formRef}
      className={styles.composer}
      onSubmit={onSend}
      onPaste={(event) => void handlePaste(event)}
    >
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
            {pendingAttachment.attachment_kind === 'image' ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingAttachment.attachment_url}
                  alt="Vista previa del pantallazo"
                  className={styles.pendingImagePreview}
                />
              </>
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
          ref={textareaRef}
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
      {showEmojiPicker ? (
        <div className={styles.emojiPicker} role="dialog" aria-label="Seleccionar emoji">
          {BUZON_MESSAGE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              aria-label={`Insertar ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.composerActions}>
        <button
          type="button"
          className={styles.attachBtn}
          onClick={() => setShowEmojiPicker((current) => !current)}
          disabled={sending || isRecordingAudio}
          title="Abrir emojis"
          aria-expanded={showEmojiPicker}
        >
          😊
        </button>
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
