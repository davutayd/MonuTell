import React, { useState, useRef } from "react";
import styles from "./AddPhotoModal.module.css";

const translations = {
  en: {
    title: "Add Photo",
    description: "Help improve MonuTell by adding a photo for this monument.",
    selectPhoto: "Select Photo",
    changePhoto: "Change Photo",
    uploading: "Uploading...",
    submit: "Submit Photo",
    cancel: "Cancel",
    success: "Photo submitted successfully! It will appear after admin approval.",
    error: "Failed to upload photo. Please try again.",
    dragDrop: "or drag and drop here",
  },
  tr: {
    title: "Fotoğraf Ekle",
    description: "Bu anıt için fotoğraf ekleyerek MonuTell'i geliştirmeye yardımcı olun.",
    selectPhoto: "Fotoğraf Seç",
    changePhoto: "Fotoğrafı Değiştir",
    uploading: "Yükleniyor...",
    submit: "Fotoğrafı Gönder",
    cancel: "İptal",
    success: "Fotoğraf başarıyla gönderildi! Yönetici onayından sonra görünecek.",
    error: "Fotoğraf yüklenemedi. Lütfen tekrar deneyin.",
    dragDrop: "veya buraya sürükleyip bırakın",
  },
  hu: {
    title: "Fénykép Hozzáadása",
    description: "Segítsen javítani a MonuTell-t egy fénykép hozzáadásával ehhez az emlékműhöz.",
    selectPhoto: "Fénykép Kiválasztása",
    changePhoto: "Fénykép Módosítása",
    uploading: "Feltöltés...",
    submit: "Fénykép Beküldése",
    cancel: "Mégse",
    success: "A fénykép sikeresen beküldve! Az admin jóváhagyása után jelenik meg.",
    error: "A fénykép feltöltése sikertelen. Kérjük, próbálja újra.",
    dragDrop: "vagy húzza ide",
  },
};

const AddPhotoModal = ({ isOpen, onClose, monumentId, monumentName, language = "en" }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const fileInputRef = useRef(null);
  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setStatus(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setStatus(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("type", "photo_upload");
      formData.append("targetMonumentId", monumentId.toString());
      formData.append("image", selectedFile);

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("success");
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error("Submission error:", errorData);
        setStatus("error");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setStatus(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>

        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.description}>
          {t.description}
          <br />
          <strong>{monumentName}</strong>
        </p>

        <div
          className={styles.dropZone}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className={styles.preview} />
          ) : (
            <div className={styles.dropZoneContent}>
              <span className={styles.cameraIcon}>📷</span>
              <span>{t.selectPhoto}</span>
              <span className={styles.dragDropText}>{t.dragDrop}</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />

        {preview && (
          <button
            className={styles.changeButton}
            onClick={() => fileInputRef.current?.click()}
          >
            {t.changePhoto}
          </button>
        )}

        {status === "success" && (
          <div className={styles.successMessage}>{t.success}</div>
        )}
        {status === "error" && (
          <div className={styles.errorMessage}>{t.error}</div>
        )}

        <div className={styles.buttonRow}>
          <button className={styles.cancelButton} onClick={handleClose}>
            {t.cancel}
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? t.uploading : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoModal;
