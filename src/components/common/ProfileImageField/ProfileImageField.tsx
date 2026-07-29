import { useEffect, useId, useRef, useState } from "react";
import styles from "./ProfileImageField.module.scss";

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type ProfileImageFieldProps = {
  value: File | null;
  currentAvatarUrl?: string | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
  onInvalidFile: (message: string) => void;
};

export function ProfileImageField({
  value,
  currentAvatarUrl = null,
  disabled = false,
  onChange,
  onInvalidFile,
}: ProfileImageFieldProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const clearSelectedPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      onInvalidFile("Ảnh phải có định dạng JPG, PNG hoặc WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      onInvalidFile("Ảnh không được lớn hơn 5MB.");
      return;
    }

    clearSelectedPreview();
    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    onChange(file);
  };

  const imageUrl = previewUrl ?? currentAvatarUrl;

  return (
    <div className={styles.field}>
      <div className={styles.preview} aria-hidden="true">
        {imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <span className={styles.fallback}>Ảnh</span>
        )}
      </div>

      <div className={styles.content}>
        <label className={styles.label} htmlFor={inputId}>
          Ảnh đại diện
        </label>
        <p className={styles.hint}>JPG, PNG hoặc WebP, tối đa 5MB.</p>
        {value ? <p className={styles.fileName}>{value.name}</p> : null}
        <div className={styles.actions}>
          <label className={styles.button} htmlFor={inputId} aria-disabled={disabled}>
            Chọn ảnh
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={disabled}
            onChange={handleFileChange}
          />
          {value ? (
            <button
              type="button"
              className={`${styles.button} ${styles.remove}`}
              disabled={disabled}
              onClick={() => {
                clearSelectedPreview();
                onChange(null);
              }}
            >
              Bỏ ảnh mới
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
