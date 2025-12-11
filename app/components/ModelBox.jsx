import React, { useEffect, useState } from "react";
import { getUpcomingFestivalDate } from "../utils/helper";
// import { Modal, TextContainer, Spinner, Checkbox, Card, Text, Button } from "@shopify/polaris";
// import { LockIcon } from "@shopify/polaris-icons";
import he from "he"; // for decoding HTML entities
// import { useToast } from "./ToastProvider"; // Uncomment if you have a ToastProvider

const ModelBox = ({ currentClickedCheckbox, isOpen, onClose }) => {
  const [emojis, setEmojis] = useState([]);
  const [festivalSlug, setFestivalSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState(new Set());
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [upcomingDate, setUpcomingDate] = useState("");

  

  
  
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
    if (!currentClickedCheckbox) return;

    const formattedName = currentClickedCheckbox
      .toLowerCase()
      .replace(/\s+/g, "_");

    setFestivalSlug(formattedName);
    setLoading(true);
    setEmojis([]);

    // Get upcoming date
    const nextDate = getUpcomingFestivalDate(formattedName);
    setUpcomingDate(nextDate);

    fetch(`/api/emojis?festival_name=${formattedName}`)
      .then((res) => res.json())
      .then((data) => {
        setEmojis(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching emojis:", err);
        setEmojis([]);
        setLoading(false);
      });
  }, [currentClickedCheckbox]);

  if (!isOpen) return null;

  return (
    <s-modal
      id="emojiModal"
      open={isOpen}
      command="--show"
      onClose={onClose}
      title={`Pick an emoji to celebrate ${currentClickedCheckbox}! 🎉${upcomingDate ? ` (Next ${currentClickedCheckbox}: ${upcomingDate})` : ""}`}
      primaryAction={{
        content: "Save",
        onAction: handleSave,
      }}
      secondaryActions={[
        {
          content: "Close",
          onAction: onClose,
        },
      ]}
    >
      <s-paragraph>
        {loading ? (
          <s-text>
            {/* <Spinner accessibilityLabel="Loading emoji data" size="small" /> */}
            <s-spinner accessibilityLabel="Loading" size="large-100" />
            &nbsp;Loading data...
          </s-text>
        ) : emojis.length === 0 ? (
          <s-text>No emojis found for this festival.</s-text>
        ) : (
          emojis.map((item, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                Select Emoji
              </div>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                {item.emoji_code.map((code, i) => (
                  <s-checkbox
                    key={i}
                    label={
                      <span style={{ fontSize: "28px", lineHeight: "32px" }}>
                        {he.decode(code)}
                      </span>
                    }
                    checked={selectedEmojis.has(code)}
                    onChange={() => toggleEmoji(code)}
                  />
                ))}
              </div>

              <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                Pre Built Images
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {item.images.map((img, i) => (
                  <div key={i}>
                    <s-checkbox
                      label={
                        <img
                          style={{ fontSize: "28px", lineHeight: "32px" }}
                          src={`/assets/images/festival_images/${festivalSlug}/${img}`}
                          alt={`emoji ${i}`}
                          width={32}
                        />
                      }
                      checked={selectedImages.has(img)}
                      onChange={() => toggleImage(img)}
                    />
                  </div>
                ))}
              </div>

              {/* Custom Images (locked, upgrade required) */}

              <s-section padding="400">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, color: "#bbb" }}>
                    <s-icon type="lock" />
                  </div>

                  <s-text as="p" tone="subdued">
                    To unlock advanced features of your Shopify store <br />
                    Access more custom features with upgrade
                  </s-text>

                  <div style={{ marginTop: 16 }}>
                    <s-button
                      variant="primary"
                      size="large"
                      onClick={() => {
                        window.location.href = "/charges?amount=1.99";
                      }}
                    >
                      Upgrade Now ($1.99 USD)
                    </s-button>
                  </div>
                </div>
              </s-section>
              
            </div>
          ))
        )}
      </s-paragraph>
    </s-modal>
  );
};

export default ModelBox;
