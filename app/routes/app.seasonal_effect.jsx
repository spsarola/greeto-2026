import React, { useEffect, useState, useRef } from "react";
import { useLoaderData, useFetcher } from "react-router";
import ModelBox from "../components/ModelBox";
import { env } from "../utils/helper";
import { useAppBridge } from "@shopify/app-bridge-react";
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
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 220 }}>
      <s-checkbox
        name="selectedFestivals[]"
        value={festival.name}
        label={festival.name}
        checked={checked}
        onChange={handleCheckboxChange}
      />
      {checked && (
        <s-button variant="tertiary" onClick={onEdit}>
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

  return { shop, selectedFestivals };
};

/* ---------------- ACTION ---------------- */
export const action = async ({ request }) => {
  try {
    info("SeasonalEffect save started");

    const { session, admin } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const selectedFestivals = formData.getAll("selectedFestivals[]");

    info("Selected festivals received", selectedFestivals);

    // 1️⃣ Find shop user
    const shopUser = await prisma.shop_users.findFirst({
      where: { shop },
      select: { id: true },
    });

    if (!shopUser) {
      info("Shop user not found", { shop });
      return { success: false, error: "Shop user not found" };
    }

    // 2️⃣ Save to DB
    await prisma.seasonal_festivals.upsert({
      where: { shop_user_id: shopUser.id },
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

    info("Seasonal festivals saved in DB");

    // 3️⃣ Save Shopify metafield (Laravel equivalent)
    const METAFIELD_UPSERT = `
      mutation metafieldUpsert($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const metafieldResponse = await admin.graphql(METAFIELD_UPSERT, {
      variables: {
        metafields: [
          {
            ownerId: shopUser.shopify_gid,
            namespace: "greeto_seasonal_data",
            key: "festivals",
            type: "json",
            value: JSON.stringify(selectedFestivals),
          },
        ],
      },
    });

    const metafieldResult = await metafieldResponse.json();

    if (metafieldResult?.data?.metafieldsSet?.userErrors?.length) {
      info("Metafield userErrors", metafieldResult.data.metafieldsSet.userErrors);
      return {
        success: false,
        error: "Metafield save failed",
      };
    }

    info("Shopify metafield saved successfully");

    return { success: true };
  } catch (error) {
    info("SeasonalEffect save FAILED", {
      message: error?.message,
      stack: error?.stack,
    });

    return {
      success: false,
      error: "Unexpected error occurred",
    };
  }
};


/* ---------------- COMPONENT ---------------- */

export default function SeasonalEffect() {
  const shopify = useAppBridge();
  const fetcher = useFetcher();
  const formRef = useRef(null);

  const { shop, selectedFestivals } = useLoaderData();
  const appName = env("APP_NAME", "Greeto: Seasonal Effect");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);

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
    fetcher.submit(fd, { method: "post" });
  };

  const handleDiscard = () => {
    setDirty(false);
  };

  /* ----- SaveBar Control ----- */
  useEffect(() => {
    if (dirty) shopify.saveBar.show("my-save-bar");
    else shopify.saveBar.hide("my-save-bar");
  }, [dirty, shopify]);

  /* ----- Toast after save ----- */
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      shopify.toast.show("Festivals saved successfully 🎉", {
        duration: 3000,
      });
      setDirty(false);
    }

    if (fetcher.state === "idle" && fetcher.data?.success === false) {
      shopify.toast.show("Failed to save", {
        isError: true,
        duration: 5000,
      });
    }
  }, [fetcher.state, fetcher.data, shopify]);

  /* ---------------- RENDER ---------------- */

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
            {christianFestivals.map((festival, i) => (
              <FestivalCheckbox
                key={`chri-fest-chk-${i}-${festival.name}`}
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
            {hinduFestivals.map((festival, i) => (
              <FestivalCheckbox
                key={`hindu-fest-chk-${i}-${festival.name}`}
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
