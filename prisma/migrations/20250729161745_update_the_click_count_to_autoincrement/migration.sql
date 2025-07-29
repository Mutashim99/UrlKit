-- AlterTable
CREATE SEQUENCE url_clickcount_seq;
ALTER TABLE "Url" ALTER COLUMN "clickCount" SET DEFAULT nextval('url_clickcount_seq');
ALTER SEQUENCE url_clickcount_seq OWNED BY "Url"."clickCount";
