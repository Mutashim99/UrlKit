-- AlterTable
ALTER TABLE "Url" ALTER COLUMN "clickCount" SET DEFAULT 0,
ALTER COLUMN "clickCount" DROP DEFAULT;
DROP SEQUENCE "url_clickcount_seq";
