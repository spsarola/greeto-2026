import React, { useEffect, useState, useRef } from "react";
import { useFetcher, useLoaderData } from "react-router";
import ModelBox from "../components/ModelBox";
// import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { env } from "../utils/helper";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
// import { json } from "@remix-run/node";
import prisma from "../db.server"; // adjust path if needed
import SaveBarWrapper from "../components/common/SaveBarWrapper";
import { info } from "../utils/logger.server";

const christianFestivals = [
  { name: "Christmas", date: "2024-12-01" },
  { name: "Easter" },
  { name: "Good Friday" },
  { name: "Halloween" },
];

const hinduFestivals = [
  { name: "Diwali" },
  { name: "Makar Sankranti" },
  { name: "Maha Shivaratri" },
  { name: "Raksha Bandhan" },
  { name: "Hanuman Jayanti" },
  { name: "Gandhi Jayanti" },
  { name: "Indian Republic Day" },
  { name: "Holi" },
  { name: "Ram Navami" },
  { name: "Krishna Janmashtami" },
  { name: "Guru Purnima" },
  { name: "Pongal" },
  { name: "Dussehra" },
  { name: "Mahavir Jayanti" },
  { name: "Navaratri" },
  { name: "Ganesh Chaturthi" },
];

// Removed EmojiModal. Use ModelBox instead.

function FestivalCheckbox({ festival, checked, onChange, onEdit }) {
  // Open modal on check, but not on uncheck
  const handleCheckboxChange = () => {
    // alert("change");
    onChange();
    if (!checked) {
      onEdit();
    }
  };
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 220 }}
    >
      
      <s-checkbox
        label={festival.name}
        checked={checked}
        onChange={handleCheckboxChange}
        commandFor="modal"
        command="--show"
      />
      {checked && (

        <span style={{ cursor: "pointer" }} onClick={onEdit}>
          <s-button commandFor="emojiModal" command="--show" variant="tertiary" accessibilityLabel="Add product"><s-icon type="edit" commandFor="modal" color="base" /></s-button>
        </span>
      )}
    </div>
  );
}

export const loader = async ({ request }) => {
  console.log("Loader called for SeasonalEffect route");
  const { session, admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const festival_name = url.searchParams.get("festival_name");
  // const shop = url.searchParams.get("shop");
  const shop = session.shop;

  // Guard: If no festival_name, return minimal data (prevents Prisma error)
  let data = {};
  if (!festival_name) {
    info("ifffffffff festival_name:-----------", festival_name);
  } else {
    info("festival_name:-----------", festival_name);

    // 1. Get available emojis/images for the festival
    const data = await prisma.emojis.findFirst({
      where: { festival_name },
    });
  }

  // 2. Get shop_user_id for the shop
  const shopUser = await prisma.shop_users.findFirst({
    where: { shop },
    select: { id: true },
  });

  // 3. Get stored emoji/images for this shop user and festival
  let storedEmoji = null;
  if (shopUser) {
    storedEmoji = await prisma.store_emojis.findMany({
      where: { shop_user_id: shopUser.id },
      select: {
        festival_name: true,
      },
    });
  }

  const selectedEmoji = storedEmoji?.emoji_code || "";
  const selectedImages = storedEmoji?.pre_built_images || "";
  const customImages = storedEmoji?.custom_images || "";

  const xyzzz = {
    data: data?.emoji_code ?? [],
    festivalImages: data?.images ?? [],
    selectedImages: selectedImages ?? [],
    festival_name: data?.festival_name ?? festival_name,
    selected_emoji: selectedEmoji ?? [],
    customImages: customImages ?? [],
  };

  console.log("Loader returning data:");
  console.log(xyzzz);

  return {
    shop: shop ?? "sachin.myshopify.com",
    data: data?.emoji_code ?? [],
    festivalImages: data?.images ?? [],
    selectedImages: selectedImages ?? [],
    festival_name: data?.festival_name ?? festival_name,
    selected_emoji: selectedEmoji ?? [],
    customImages: customImages ?? [],
  };
  return null;
};

export const action = async ({ request }) => {
  info("store emojis action called");
  const { admin } = await authenticate.admin(request);

  // You can add logic here to handle form submissions or checkbox updates
  return null;
};

export default function SeasonalEffect() {
  const shopify = useAppBridge();
  // const submit = useSubmit();
  const appName = env("APP_NAME", "Greeto: Sesasonal Effect");
  const {
    shop,
    festivalImages,
    selectedImages,
    festival_name,
    selected_emoji,
    customImages,
  } = useLoaderData();

  console.log("SeasonalEffect component loader data:");
  console.log({
    shop,
    festivalImages,
    selectedImages,
    festival_name,
    selected_emoji,
    customImages,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [checkedChristian, setCheckedChristian] = useState({
    Christmas: true,
    Easter: false,
    "Good Friday": false,
    Halloween: true,
  });
  const [checkedHindu, setCheckedHindu] = useState({});

  const [dirty, setDirty] = useState(false);
  
  const emojiModalRef = useRef(null);
  const handleEdit = (festival) => {
    setSelectedFestival(festival);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedFestival(null);
  };

  const handleChristianCheck = (festival) => {
    setCheckedChristian((prev) => ({
      ...prev,
      [festival.name]: !prev[festival.name],
    }));
    setDirty(true);
  };

  const handleHinduCheck = (festival) => {
    setCheckedHindu((prev) => ({
      ...prev,
      [festival.name]: !prev[festival.name],
    }));
    setDirty(true);
  };

  useEffect(() => {
    if (dirty) {
      console.log("dirty changed to true, showing SaveBar");
      shopify.saveBar.show("my-save-bar");
    } else {
      console.log("dirty changed to false, hiding SaveBar");
      shopify.saveBar.hide("my-save-bar");
    }
  }, [dirty, shopify]);

  // Methods requested: simple console + setDirty(false)
  const handleAfterSaveBarHide = () => {
    console.log("[Parent] SaveBar hidden, clearing dirty");
    setDirty(false);
  };

  const handleSave = async () => {
    console.log("[Parent] Saving...");
    // do save work here

    submit(
      {
        intent: "save",
        festival_name: "festivalName",
        // For arrays, either send multiple values with same key using FormData,
        // or use JSON enctype (shown below):
        christian: checkedChristian,
        hindu: checkedHindu,
      },
      { method: "post", encType: "application/json", navigate: false }, // stay on page
    );
  };

  const handleDiscard = async () => {
    console.log("[Parent] Discarding...");
    // reset form fields here
  };
  

  return (
    <s-page>
      <TitleBar title={appName} />
      <SaveBarWrapper
        onHide={handleAfterSaveBarHide}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
      <ModelBox
        isOpen={modalOpen}
        onClose={handleClose}
        currentClickedCheckbox={selectedFestival?.name || ""}
        upComingFestivalDate={selectedFestival?.date || ""}
      />
      <s-stack gap="400">
        <s-text variant="heading2xl" as="h1">
          Seasonal Effect
        </s-text>
        <s-section>
          <s-text variant="headingLg" as="h2">
            Christian Calender Festivals
          </s-text>
          <s-stack gap="200">
            <div style={{ display: "flex", gap: 32 }}>
              {christianFestivals.map((festival) => (
                <FestivalCheckbox
                  key={festival.name}
                  festival={festival}
                  checked={!!checkedChristian[festival.name]}
                  onChange={() => handleChristianCheck(festival)}
                  onEdit={() => handleEdit(festival)}
                  commandFor="modal"
                />
              ))}
            </div>
          </s-stack>
        </s-section>
        <s-section sectioned>
          <s-text variant="headingLg" as="h2" style={{ marginBottom: 16 }}>
            Hindu Calender Festivals
          </s-text>
          <s-stack gap="200">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
              {hinduFestivals.map((festival) => (
                <FestivalCheckbox
                  key={festival.name}
                  festival={festival}
                  checked={!!checkedHindu[festival.name]}
                  onChange={() => handleHinduCheck(festival)}
                  onEdit={() => handleEdit(festival)}
                />
              ))}
            </div>
          </s-stack>
        </s-section>
      </s-stack>
    </s-page>
  );
}
