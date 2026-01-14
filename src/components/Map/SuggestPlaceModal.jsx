import React, { useState, useRef } from "react";
import styles from "./SuggestPlaceModal.module.css";

const translations = {
  en: {
    title: "Suggest a Place",
    description: "Help grow MonuTell by suggesting a new monument or landmark.",
    nameLabel: "Name (English)",
    namePlaceholder: "Enter the name of the place",
    storyLabel: "Story/Description (English)",
    storyPlaceholder: "Tell us about this place...",
    categoryLabel: "Category",
    addressLabel: "Address (Optional)",
    addressPlaceholder: "Enter the address",
    photoLabel: "Photo",
    selectPhoto: "Select Photo",
    changePhoto: "Change",
    locationNote: "📍 Location will be set to your current map position",
    uploading: "Submitting...",
    submit: "Submit Suggestion",
    cancel: "Cancel",
    success: "Place submitted successfully! It will appear after admin approval.",
    error: "Failed to submit. Please try again.",
    required: "* Required",
    categories: {
      statue: "Monument/Statue",
      castle: "Castle",
      church: "Church/Religious",
      museum: "Museum",
      bridge: "Bridge",
      landmark: "Landmark",
    },
  },
  tr: {
    title: "Yer Öner",
    description: "Yeni bir anıt veya simgesel yapı önererek MonuTell'i büyütmeye yardımcı olun.",
    nameLabel: "İsim (İngilizce)",
    namePlaceholder: "Yerin adını girin",
    storyLabel: "Hikaye/Açıklama (İngilizce)",
    storyPlaceholder: "Bize bu yer hakkında bilgi verin...",
    categoryLabel: "Kategori",
    addressLabel: "Adres (İsteğe bağlı)",
    addressPlaceholder: "Adresi girin",
    photoLabel: "Fotoğraf",
    selectPhoto: "Fotoğraf Seç",
    changePhoto: "Değiştir",
    locationNote: "📍 Konum mevcut harita konumunuza ayarlanacak",
    uploading: "Gönderiliyor...",
    submit: "Öneriyi Gönder",
    cancel: "İptal",
    success: "Yer başarıyla gönderildi! Yönetici onayından sonra görünecek.",
    error: "Gönderilemedi. Lütfen tekrar deneyin.",
    required: "* Zorunlu",
    categories: {
      statue: "Anıt/Heykel",
      castle: "Kale",
      church: "Kilise/Dini Yapı",
      museum: "Müze",
      bridge: "Köprü",
      landmark: "Simgesel Yapı",
    },
  },
  hu: {
    title: "Hely Javaslása",
    description: "Segítsen bővíteni a MonuTell-t egy új emlékmű vagy látnivaló javaslásával.",
    nameLabel: "Név (Angol)",
    namePlaceholder: "Adja meg a hely nevét",
    storyLabel: "Történet/Leírás (Angol)",
    storyPlaceholder: "Meséljen nekünk erről a helyről...",
    categoryLabel: "Kategória",
    addressLabel: "Cím (Opcionális)",
    addressPlaceholder: "Adja meg a címet",
    photoLabel: "Fénykép",
    selectPhoto: "Fénykép Kiválasztása",
    changePhoto: "Módosítás",
    locationNote: "📍 A helyszín az aktuális térképpozícióra lesz beállítva",
    uploading: "Beküldés...",
    submit: "Javaslat Beküldése",
    cancel: "Mégse",
    success: "A hely sikeresen beküldve! Az admin jóváhagyása után jelenik meg.",
    error: "Sikertelen beküldés. Kérjük, próbálja újra.",
    required: "* Kötelező",
    categories: {
      statue: "Emlékmű/Szobor",
      castle: "Vár",
      church: "Templom/Vallási",
      museum: "Múzeum",
      bridge: "Híd",
      landmark: "Látnivaló",
    },
  },
};

const SuggestPlaceModal = ({
  isOpen,
  onClose,
  language = "en",
  mapCenter, // { lat, lng } - current map center coordinates
}) => {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState("landmark");
  const [address, setAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null);
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

  const handleSubmit = async () => {
    if (!name.trim() || !story.trim() || !selectedFile || isUploading) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const payload = {
        name_en: name.trim(),
        story_en: story.trim(),
        category: category,
        address: address.trim() || null,
        latitude: mapCenter?.lat || null,
        longitude: mapCenter?.lng || null,
      };

      const formData = new FormData();
      formData.append("type", "new_place");
      formData.append("payload", JSON.stringify(payload));
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
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setStory("");
    setCategory("landmark");
    setAddress("");
    setSelectedFile(null);
    setPreview(null);
    setStatus(null);
    setIsUploading(false);
    onClose();
  };

  const isFormValid = name.trim() && story.trim() && selectedFile;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>

        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.description}>{t.description}</p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t.nameLabel} <span className={styles.required}>{t.required}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className={styles.input}
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t.storyLabel} <span className={styles.required}>{t.required}</span>
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={t.storyPlaceholder}
              className={styles.textarea}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t.categoryLabel}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
              >
                {Object.entries(t.categories).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.addressLabel}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.addressPlaceholder}
                className={styles.input}
                maxLength={200}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t.photoLabel} <span className={styles.required}>{t.required}</span>
            </label>
            <div className={styles.photoSection}>
              {preview ? (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="Preview" className={styles.preview} />
                  <button
                    className={styles.changeButton}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.changePhoto}
                  </button>
                </div>
              ) : (
                <button
                  className={styles.selectPhotoButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷 {t.selectPhoto}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.hiddenInput}
              />
            </div>
          </div>

          <div className={styles.locationNote}>{t.locationNote}</div>
        </div>

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
            disabled={!isFormValid || isUploading}
          >
            {isUploading ? t.uploading : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestPlaceModal;
