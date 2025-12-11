import prisma from "../db.server";
import { info } from "../utils/logger.server";

export const loader = async ({ request }) => {
  info("this is the emojis loader");

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

    info("emojis");
    info(emojis);

    return Response.json(
      {
        success: true,
        data: emojis,
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
