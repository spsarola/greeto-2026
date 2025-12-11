import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { info } from "../utils/logger.server";

export const loader = async ({ request }) => {
  // Authenticate the request and derive shop from session
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const festival_name = url.searchParams.get("festival_name");

  // info(session, festival_name);

  if (!festival_name) {
    return Response.json({}, { status: 400 });
  }

  const shop = session?.shop;
  if (!shop) return Response.json({}, { status: 401 });

  try {
    const shopUser = await prisma.shop_users.findFirst({
      where: { myshopify_domain: shop },
    });

    if (!shopUser) return Response.json({}, { status: 404 });

    const record = await prisma.store_emojis.findFirst({
      where: {
        festival_name,
        shop_user_id: shopUser.id,
      },
    });

    return Response.json(record || {});
  } catch (err) {
    console.error("DB error (loader):", err);
    return Response.json({}, { status: 500 });
  }
};

export const actionNew = async ({ request }) => {
   const { session } = await authenticate.admin(request);

   // info('session');
   // info(session);

   const shop = session?.shop;
   // info('shop', shop);
   var shopUser = await prisma.shop_users.findFirst({ where: { shop : shop } });
   if (!shopUser){
     return Response.json({ error: "Shop user not found" }, { status: 404 });
    //  return json({ error: "Shop user not found" }, { status: 404 });
    } else{

      // info('shopUser');
      // info(typeof shopUser);
      // info(shopUser);
      console.log(shopUser);
      
      return Response.json({ error: "Shop user found", shopUser: shopUser }, { status: 200 });
      // return json({ error: "Shop user found", shopUser: shopUser }, { status: 200 });
    }
    
};
export const action = async ({ request }) => {
    // info('store emojis action called');
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let { festival_name, emoji_code, pre_built_images } = body;

  if (!festival_name || !emoji_code) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Basic sanitization & type coercion
  try {
    festival_name = String(festival_name).trim();

    if (typeof emoji_code === "string") {
      emoji_code = JSON.parse(emoji_code);
    }
    if (!Array.isArray(emoji_code)) {
      return Response.json({ error: "emoji_code must be an array" }, { status: 400 });
    }

    if (typeof pre_built_images === "string") {
      pre_built_images = JSON.parse(pre_built_images);
    }
    if (
      pre_built_images !== null &&
      pre_built_images !== undefined &&
      !Array.isArray(pre_built_images)
    ) {
      return Response.json({ error: "pre_built_images must be an array or null" }, { status: 400 });
    }

    // shop_user_id will be derived from authenticated session below
  } catch (err) {
    return Response.json({ error: "Invalid input format" }, { status: 400 });
  }

  try {
    // Derive shop_user_id from authenticated session (do not trust client-supplied IDs)
    const { session } = await authenticate.admin(request);
    const shop = session?.shop;
    // info('shop eee', shop)
    if (!shop) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // const shopUser = await prisma.shop_users.findFirst({ where: { shop : shop } });
    // info('just before shop user');
    const shopUser = await prisma.shop_users.findFirst({ where: { shop : shop } });

    if (!shopUser) return Response.json({ error: "Shop user not found" }, { status: 404 });

    // info('shopUserrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
    // info(shopUser)

    // info('step before existing');
    // info({ "festival_name": festival_name, "shop_user_id": shopUser.id });
    const existing = await prisma.store_emojis.findFirst({
      where: { "festival_name" : festival_name, "shop_user_id" : shopUser.id },
    });

    // info('step existing');
    // info(existing);

    if (existing) {
        // info('inside if');
      const updated = await prisma.store_emojis.update({
        where: { id: existing.id },
        data: {
          emoji_code,
          pre_built_images,
          updated_at: new Date(),
        },
      });
      // info('after update');
      return Response.json({ success: true, record: updated });
    } else {
      const created = await prisma.store_emojis.create({
        data: {
          festival_name,
          emoji_code,
          pre_built_images,
          shop_user_id: shopUser.id,
        },
      });

      return Response.json({ success: true, record: created });
    }
  } catch (err) {
    // info('err')
    // info(err)
    console.error("DB error:", err);
    return Response.json({ error: "Failed to store emojis" }, { status: 500 });
  }
};
