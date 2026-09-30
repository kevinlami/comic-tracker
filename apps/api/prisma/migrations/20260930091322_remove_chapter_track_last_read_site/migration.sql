-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_comicSiteId_fkey";

-- AlterTable
ALTER TABLE "ReadingProgress" DROP COLUMN "currentChapterId",
ADD COLUMN     "comicSiteId" TEXT,
ADD COLUMN     "currentChapterNumber" DECIMAL(10,3),
ADD COLUMN     "currentChapterUrl" TEXT,
ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Chapter";

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_comicSiteId_key" ON "ReadingProgress"("comicSiteId");

-- CreateIndex
CREATE INDEX "ReadingProgress_comicSiteId_idx" ON "ReadingProgress"("comicSiteId");

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_comicSiteId_fkey" FOREIGN KEY ("comicSiteId") REFERENCES "ComicSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
