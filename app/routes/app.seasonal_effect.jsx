import React, { useEffect, useState, useRef } from "react";
import { useLoaderData, useSubmit, useActionData } from "react-router";
import ModelBox from "../components/ModelBox";
import { env } from "../utils/helper";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import SaveBarWrapper from "../components/common/SaveBarWrapper";
import { info } from "../utils/logger.server";

/* ---------------- FESTIVALS ---------------- */

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

/* ---------------- CHECKBOX COMPONENT ---------------- */

function FestivalCheckbox({ festival, checked, onChange, onEdit }) {
  const handleCheckboxChange = () => {
    onChange();
    if (!checked) onEdit();
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 220 }}
    >
      <s-checkbox
        name="selectedFestivals[]"
        value={festival.name}
        label={festival.name}
        checked={checked}
        onChange={handleCheckboxChange}
      />
      {checked && (
        <s-button
          variant="tertiary"
          onClick={onEdit}
          accessibilityLabel="Edit Festival"
        >
          <s-icon type="edit" />
        </s-button>
      )}
    </div>
  );
}

/* ---------------- LOADER ---------------- */

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const shopUser = await prisma.shop_users.findFirst({
    where: { shop },
    select: { id: true },
  });

  let selectedFestivals = [];

  if (shopUser) {
    const record = await prisma.seasonal_festivals.findFirst({
      where: {
        shop_user_id: shopUser.id,
        deleted_at: null,
      },
      select: { festival_list: true },
    });

    selectedFestivals = record?.festival_list ?? [];
  }

  return {
    shop,
    selectedFestivals,
  };
};

/* ---------------- ACTION ---------------- */

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const selectedFestivals = formData.getAll("selectedFestivals[]");

  info("Saving festivals:", selectedFestivals);

  const shopUser = await prisma.shop_users.findFirst({
    where: { shop },
    select: { id: true },
  });

  if (!shopUser) return null;

  await prisma.seasonal_festivals.upsert({
    where: {
      shop_user_id: shopUser.id,
    },
    update: {
      festival_list: selectedFestivals,
      updated_at: new Date(),
    },
    create: {
      shop_user_id: shopUser.id,
      festival_list: selectedFestivals,
      created_at: new Date(),
    },
  });

  return { success: true, data: Date.now() };
};

/* ---------------- COMPONENT ---------------- */

export default function SeasonalEffect() {
  const shopify = useAppBridge();
  const submit = useSubmit();
  const formRef = useRef(null);
  const actionData = useActionData();

  const { shop, selectedFestivals } = useLoaderData();
  const appName = env("APP_NAME", "Greeto: Seasonal Effect");

  /* ----- Modal State ----- */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);

  /* ----- Checkbox State (hydrated from DB) ----- */
  const [checkedFestivals, setCheckedFestivals] = useState(() => {
    const obj = {};
    selectedFestivals.forEach((f) => (obj[f] = true));
    return obj;
  });

  const [dirty, setDirty] = useState(false);

  /* ----- Handlers ----- */

  const handleEdit = (festival) => {
    setSelectedFestival(festival);
    setModalOpen(true);
  };

  const handleToggle = (festival) => {
    setCheckedFestivals((prev) => ({
      ...prev,
      [festival.name]: !prev[festival.name],
    }));
    setDirty(true);
  };

  const handleSave = () => {
    const fd = new FormData(formRef.current);
    submit(fd, { method: "post", navigate: false });
  };

  const handleDiscard = () => {
    setDirty(false);
  };

  /* ----- SaveBar Control ----- */
  useEffect(() => {
    if (dirty) shopify.saveBar.show("my-save-bar");
    else shopify.saveBar.hide("my-save-bar");
  }, [dirty, shopify]);

  /* ---------------- RENDER ---------------- */

  useEffect(() => {
    console.log('sssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
    if (actionData?.success) {
      shopify.toast.show("Festivals saved successfully 🎉",{ duration: 3000 });
      setDirty(false); // hide SaveBar
    }

    if (actionData?.success === false) {
      shopify.toast.show("Failed to save", { isError: true, duration: 5000 });
    }
  }, [actionData, shopify]);

  return (
    <s-page heading="Seasonal Effect">
      <s-link slot="breadcrumb-actions" href="/">
        {appName}
      </s-link>

      <SaveBarWrapper
        onSave={handleSave}
        onDiscard={handleDiscard}
        onHide={() => setDirty(false)}
      />

      <ModelBox
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentClickedCheckbox={selectedFestival?.name || ""}
        upComingFestivalDate={selectedFestival?.date || ""}
      />

      <form method="post" ref={formRef}>
        <s-section heading="Christian Calendar Festivals">
          <div style={{ display: "flex", gap: 10 }}>
            {christianFestivals.map((festival) => (
              <FestivalCheckbox
                key={festival.name}
                festival={festival}
                checked={!!checkedFestivals[festival.name]}
                onChange={() => handleToggle(festival)}
                onEdit={() => handleEdit(festival)}
              />
            ))}
          </div>
        </s-section>

        <br />

        <s-section heading="Hindu Calendar Festivals">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {hinduFestivals.map((festival) => (
              <FestivalCheckbox
                key={festival.name}
                festival={festival}
                checked={!!checkedFestivals[festival.name]}
                onChange={() => handleToggle(festival)}
                onEdit={() => handleEdit(festival)}
              />
            ))}
          </div>
        </s-section>
      </form>
    </s-page>
  );
}
