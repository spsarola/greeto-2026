import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { info } from "../utils/logger.server";


export const loader = async ({ request }) => {
  info("this is the emojis loader");
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  info("shop in emojis loader", shop);

  const shopUser = await prisma.shop_users.findFirst({
      where: { shop },
      select: { id: true },
  });

  try {
    const url = new URL(request.url);
    const festivalName = url.searchParams.get("festival_name");

    if (!festivalName) {
      return Response.json(
        {
          success: false,
          data: null,
          error: "Missing festival_name",
        },
        { status: 400 }
      );
    }

    const emojis = await prisma.emojis.findMany({
      where: { festival_name: festivalName },
      select: { emoji_code: true, images: true },
    });
    const storeEmojis = await prisma.store_emojis.findMany({
      where: { festival_name: festivalName, shop_user_id: shopUser.id },
      select: { emoji_code: true, pre_built_images: true, custom_images: true },
    });

    info("emojis");
    info(emojis);

    return Response.json(
      {
        success: true,
        data: {emojis, storeEmojis },
        oldData: emojis,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching emojis", error);

    return Response.json(
      {
        success: false,
        data: null,
        error: "Could not fetch emojis: " + String(error),
      },
      { status: 500 }
    );
  }
};
