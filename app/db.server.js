import { PrismaClient } from "@prisma/client";

// ✅ import this once — patches BigInt globally
import "./utils/bigint-serializer.js";

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

export default prisma;
