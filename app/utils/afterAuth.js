import { info } from "./logger.server";
import prisma from "../db.server";
import fs from "fs";
import toml from "toml";
import path from "path";

// Helper to get API version from shopify.app.toml
function getApiVersionFromToml() {
  const tomlPath = path.resolve(process.cwd(), "shopify.app.toml");
  const tomlContent = fs.readFileSync(tomlPath, "utf-8");
  const parsed = toml.parse(tomlContent);
  return parsed.webhooks?.api_version || "2025-01";
}

const SHOPIFY_API_VERSION = getApiVersionFromToml();

/**
 * Function to be called after authentication.
 * Fetches shop details using Shopify Admin GraphQL API and stores them in shop_users table.
 * @param {object} session - The session object after authentication.
 */
async function shopUserCreateOrUpdate(session, shopData) {
  const createObj = {
    shopify_id: shopData.id.match(/\d+$/)[0],
    shop: session.shop,
    myshopify_domain: session.shop,
    domain: shopData.primaryDomain?.host || session.shop,
    store_name: shopData.name,
    store_email: shopData.email,
    shop_owner: shopData.shopOwnerName,
    plan_name: shopData.plan?.displayName,
    currency: shopData.currencyCode,
    shopify_token: session.accessToken,
    created_at: new Date(),
    updated_at: new Date(),
    is_install: "Installed",
    is_charge_approve: "Approved",
    is_enabled: "Enabled",
  };
  info('create obj', { createObj });
  try {
    await prisma.shop_users.upsert({
      where: { myshopify_domain: session.shop },
      update: {
        shopify_token: session.accessToken,
        updated_at: new Date(),
        store_name: shopData.name,
        store_email: shopData.email,
        shop_owner: shopData.shopOwnerName,
        plan_name: shopData.plan?.displayName,
        currency: shopData.currencyCode,
        domain: shopData.primaryDomain?.host || session.shop,
      },
      create: createObj,
    });
  } catch (error) {
    prisma.$on("query", (e) => {
      info("🔥 Prisma Raw Query:", { query: e.query, params: e.params });
    });
    info("Prisma upsert error for shop_users", { error: error.message, stack: error.stack });
  }
}

async function getShopData(session) {
  const response = await fetch(`https://${session.shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": session.accessToken,
    },
    body: JSON.stringify({
      query: `{
        shop {
          id
          name
          email
          myshopifyDomain
          primaryDomain { url host }
          plan { displayName }
          shopOwnerName
          currencyCode
        }
      }`
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    info("GraphQL request failed", { status: response.status, errorText });
    return null;
  }

  const result = await response.json();
  info("Full GraphQL result", { result });
  const shopData = result?.data?.shop;
  if (!shopData) {
    info("No shop data found in GraphQL result", { result });
    return null;
  }
  return shopData;
}

export async function afterAuth(session) {
  info("afterAuth called for shop:", { shop: session.shop });
  const shopData = await getShopData(session);
  if (shopData) await shopUserCreateOrUpdate(session, shopData);
}
 