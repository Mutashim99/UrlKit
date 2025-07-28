import { PrismaClient } from "@prisma/client";

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateSlug = (length = 6) => {
  let slug = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    slug += charset[randomIndex];
  }
  return slug;
};

export const generateUniqueSlug = async (prisma: PrismaClient, maxRetries = 5): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    const slug = generateSlug(); // from Option 1 or 2
    const exists = await prisma.url.findUnique({ where: { shortSlug: slug } });

    if (!exists) return slug;
  }
  throw new Error("Failed to generate a unique slug. Try again.");
}
