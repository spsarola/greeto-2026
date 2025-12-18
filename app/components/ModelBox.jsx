import React, { useEffect, useState, useRef } from "react";
import { getUpcomingFestivalDate } from "../utils/helper";
import { useAppBridge } from "@shopify/app-bridge-react"; // ✅ ADDED
import he from "he"; // for decoding HTML entities
import CustomImagesUploader from './CustomImagesUploader';
import ProductMediaField from './ProductMediaField';

const ModelBox = ({ currentClickedCheckbox, isOpen, onClose }) => {
  const shopify = useAppBridge(); // ✅ ADDED (toast needs this)

  const [emojis, setEmojis] = useState([]);
  const [festivalSlug, setFestivalSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState(new Set());
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [upcomingDate, setUpcomingDate] = useState("");
  const emojiModalRef = useRef(null);

  /* ---------------- SAVE (UNCHANGED + TOAST ADDED) ---------------- */

  const handleSave = async () => {
    try {
      const res = await fetch("/api/store-emojis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          festival_name: festivalSlug,
          emoji_code: Array.from(selectedEmojis),
          pre_built_images: Array.from(selectedImages),
        }),
      });

      if (!res.ok) throw new Error("Failed to save emojis");

      // ✅ TOAST ADDED (SUCCESS)
      shopify.toast.show(
        `${currentClickedCheckbox} effects saved successfully 🎉`,
        { duration: 3000 },
      );

      onClose && onClose();
    } catch (err) {
      console.error("Error saving emojis:", err);

      // ✅ TOAST ADDED (ERROR)
      shopify.toast.show(`Failed to save ${currentClickedCheckbox} effects`, {
        isError: true,
        duration: 5000,
      });
    }
  };

  /* ---------------- TOGGLES (UNCHANGED) ---------------- */

  const toggleEmoji = (code) => {
    setSelectedEmojis((prev) => {
      const newSet = new Set(prev);
      newSet.has(code) ? newSet.delete(code) : newSet.add(code);
      return newSet;
    });
  };

  const toggleImage = (img) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      newSet.has(img) ? newSet.delete(img) : newSet.add(img);
      return newSet;
    });
  };

  /* ---------------- MODAL OPEN (UNCHANGED) ---------------- */

  useEffect(() => {
    if (isOpen && emojiModalRef) {
      emojiModalRef?.current.showOverlay();
    }
  }, [isOpen]);

  /* ---------------- FETCH EMOJIS (UNCHANGED) ---------------- */

  useEffect(() => {
    if (!currentClickedCheckbox) return;

    const controller = new AbortController();
    const formattedName = currentClickedCheckbox
      .toLowerCase()
      .replace(/\s+/g, "_");

    setFestivalSlug(formattedName);
    setLoading(true);
    setEmojis([]);

    const nextDate = getUpcomingFestivalDate(formattedName);
    setUpcomingDate(nextDate);

    (async () => {
      try {
        const res = await fetch(`/api/emojis?festival_name=${formattedName}`, {
          signal: controller.signal,
        });

        const payload = await res.json().catch(() => null);

        if (!res.ok) {
          setEmojis([]);
          return;
        }

        if (payload?.success === true && payload?.data && Array.isArray(payload.data.emojis) ) {
          setEmojis(payload.data.emojis);

          // 2️⃣ Hydrate selected emojis & images (NEW)
          const stored = Array.isArray(payload.data.storeEmojis)
            ? payload.data.storeEmojis[0]
            : payload.data.storeEmojis;

          if (stored) {
            setSelectedEmojis(new Set(stored.emoji_code ?? []));
            setSelectedImages(new Set(stored.pre_built_images ?? []));
          } else {
            setSelectedEmojis(new Set());
            setSelectedImages(new Set());
          }

          return;
        }

        if (Array.isArray(payload)) {
          setEmojis(payload);
          return;
        }

        setEmojis([]);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching emojis:", err);
        }
        setEmojis([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [currentClickedCheckbox]);

  if (!isOpen) return null;

  /* ---------------- RENDER (UNCHANGED) ---------------- */

  return (
    <s-modal
      onHide={onClose}
      ref={emojiModalRef}
      id="emojiModal"
      heading={`Pick an emoji to celebrate ${currentClickedCheckbox}! 🎉${
        upcomingDate ? ` (Next ${currentClickedCheckbox}: ${upcomingDate})` : ""
      }`}
    >
      <s-paragraph>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <s-spinner accessibilityLabel="Loading" size="large-100" />
            <s-text>Loading data...</s-text>
          </div>
        ) : emojis.length === 0 ? (
          <s-text>No emojis found for this festival.</s-text>
        ) : (
          emojis.map((item, idx) => (
            <div key={`emojis-${idx}`} style={{ marginBottom: "1rem" }}>
              <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                Select Emoji
              </div>

              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "10px",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {item.emoji_code.map((code, i) => (
                  <s-stack
                    key={i}
                    direction="inline"
                    gap="small"
                    alignItems="center"
                  >
                    <s-checkbox
                      checked={selectedEmojis.has(code)}
                      onChange={() => toggleEmoji(code)}
                    />
                    <span style={{ fontSize: "28px", lineHeight: "32px" }}>
                      {he.decode(code)}
                    </span>
                  </s-stack>
                ))}
              </div>

              <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                Pre Built Images
              </div>

              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {item.images.map((img, i) => (
                  <s-stack
                    key={i}
                    direction="inline"
                    gap="small"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <s-checkbox
                      checked={selectedImages.has(img)}
                      onChange={() => toggleImage(img)}
                    />
                    <img
                      src={`/assets/images/festival_images/${festivalSlug}/${img}`}
                      width={32}
                      alt=""
                    />
                  </s-stack>
                ))}
              </div>

              {/* Custom Images (locked, upgrade required) */}

              <CustomImagesUploader isPremium={true} festivalSlug={festivalSlug} />

             
            </div>
          ))
        )}
      </s-paragraph>

      <s-button slot="secondary-actions" onClick={onClose}>
        Close
      </s-button>

      <s-button slot="primary-action" variant="primary" onClick={handleSave}>
        Save
      </s-button>
    </s-modal>
  );
};

export default ModelBox;
