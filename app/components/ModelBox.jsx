import React, { useEffect, useState, useRef } from "react";
import { getUpcomingFestivalDate } from "../utils/helper";

// import { Modal, TextContainer, Spinner, Checkbox, Card, Text, Button } from "@shopify/polaris";
// import { LockIcon } from "@shopify/polaris-icons";
import he from "he"; // for decoding HTML entities
// import { useToast } from "./ToastProvider"; // Uncomment if you have a ToastProvider

const ModelBox = ({ currentClickedCheckbox, isOpen, onClose }) => {
  // const [emojis, setEmojis] = useState([{"emoji_code":["&#x1F423;", "&#x1F425;", "&#x1F430;"],"images":['01-img.png', '02-img.png', '03-img.png', '04-img.png', '05-img.png']}]);
  const [emojis, setEmojis] = useState([]);
  const [festivalSlug, setFestivalSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState(new Set());
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [upcomingDate, setUpcomingDate] = useState("");
  const emojiModalRef = useRef(null);

  // const { showToast } = useToast(); // Uncomment if you have a ToastProvider

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
      // showToast && showToast("Emojis saved successfully!");
      onClose && onClose();
    } catch (err) {
      console.error("Error saving emojis:", err);
      // showToast && showToast("Failed to save emojis", true);
    }
  };

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

  useEffect(() => {
    if (isOpen && emojiModalRef) {
      emojiModalRef?.current.showOverlay();
    } else if (emojiModalRef) {
      // emojiModalRef?.current.hideOverlay();
    }
  }, [isOpen]);
  // useEffect(() => {
  //   if (!currentClickedCheckbox) return;

  //   const formattedName = currentClickedCheckbox
  //     .toLowerCase()
  //     .replace(/\s+/g, "_");

  //   setFestivalSlug(formattedName);
  //   setLoading(true);
  //   setEmojis([]);

  //   // Get upcoming date
  //   const nextDate = getUpcomingFestivalDate(formattedName);
  //   setUpcomingDate(nextDate);

  //   fetch(`/api/emojis?festival_name=${formattedName}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setEmojis(Array.isArray(data) ? data : []);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching emojis:", err);
  //       setEmojis([]);
  //       setLoading(false);
  //     });
  // }, [currentClickedCheckbox]);

  useEffect(() => {
    if (!currentClickedCheckbox) return;

    const controller = new AbortController();
    const formattedName = currentClickedCheckbox
      .toLowerCase()
      .replace(/\s+/g, "_");

    setFestivalSlug(formattedName);
    setLoading(true);
    setEmojis([]);

    // Get upcoming date
    const nextDate = getUpcomingFestivalDate(formattedName);
    setUpcomingDate(nextDate);

    (async () => {
      try {
        const res = await fetch(`/api/emojis?festival_name=${formattedName}`, {
          signal: controller.signal,
        });

        // Try to parse JSON safely
        const payload = await res.json().catch((e) => {
          console.error("Failed to parse JSON:", e);
          return null;
        });

        // HTTP error (non-2xx)
        if (!res.ok) {
          console.error("Server returned error:", res.status, payload);
          setEmojis([]);
          return;
        }

        // New standard response: { success: true, data: [...], error: null }
        if (payload && typeof payload === "object") {
          if (payload.success === true && Array.isArray(payload.data)) {
            console.log("Fetched emojis data;;;;;;;;:", payload.data);
            setEmojis(payload.data);
            return;
          }

          if (payload.success === false) {
            console.error("API error:", payload.error);
            setEmojis([]);
            return;
          }
        }

        // Backwards compatibility: payload itself is an array
        if (Array.isArray(payload)) {
          setEmojis(payload);
          return;
        }

        // Unknown shape
        setEmojis([]);
      } catch (err) {
        if (err.name === "AbortError") {
          // fetch was aborted — ignore
          return;
        }
        console.error("Error fetching emojis:", err);
        setEmojis([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [currentClickedCheckbox]);

  if (!isOpen) return null;

  return (
    <s-modal
      onHide={onClose}
      ref={emojiModalRef}
      id="emojiModal"
      heading={`Pick an emoji to celebrate ${currentClickedCheckbox || ""}`}
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
            <div key={idx} style={{ marginBottom: "1rem" }}>
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
                  <s-stack direction="inline" gap="small" align="center">
                    <s-checkbox
                      key={i}
                      label={''} // string label for accessibility
                      checked={selectedEmojis.has(code)}
                      onChange={() => toggleEmoji(code)} // DOM event; you can also use the event object if needed
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
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {item.images.map((img, i) => (
                  <div key={i}>
                    <s-stack direction="inline" gap="small" align="center">
                      <s-checkbox
                        label={``}
                        checked={selectedImages.has(img)}
                        onChange={(event) => toggleImage(img)}
                      />
                      <img
                        style={{ fontSize: "28px", lineHeight: "32px" }}
                        src={`/assets/images/festival_images/${festivalSlug}/${img}`}
                        alt={`emoji ${i}`}
                        width={32}
                      />
                    </s-stack>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </s-paragraph>

      <s-button
        slot="secondary-actions"
        commandFor="emojiModal"
        command="--hide"
        onClick={onClose}
      >
        Close
      </s-button>

      <s-button slot="primary-action" variant="primary" onClick={handleSave}>
        Save
      </s-button>
    </s-modal>
  );
};

export default ModelBox;
