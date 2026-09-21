-- CreateEnum
CREATE TYPE "ComicType" AS ENUM ('MANGA', 'MANHWA', 'MANHUA', 'WEBTOON', 'COMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "ComicStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('READING', 'COMPLETED', 'PAUSED', 'DROPPED', 'PLAN_TO_READ');

-- CreateTable
CREATE TABLE "Comic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alternativeTitles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" "ComicType" NOT NULL DEFAULT 'MANGA',
    "status" "ComicStatus" NOT NULL DEFAULT 'UNKNOWN',
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComicSite" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComicSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "comicSiteId" TEXT NOT NULL,
    "number" DECIMAL(10,3) NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "currentChapterId" TEXT,
    "status" "ReadingStatus" NOT NULL DEFAULT 'PLAN_TO_READ',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comic_title_idx" ON "Comic"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");

-- CreateIndex
CREATE INDEX "ComicSite_siteId_idx" ON "ComicSite"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "ComicSite_comicId_siteId_key" ON "ComicSite"("comicId", "siteId");

-- CreateIndex
CREATE INDEX "Chapter_comicSiteId_publishedAt_idx" ON "Chapter"("comicSiteId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_comicSiteId_number_key" ON "Chapter"("comicSiteId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_comicId_key" ON "ReadingProgress"("comicId");

-- AddForeignKey
ALTER TABLE "ComicSite" ADD CONSTRAINT "ComicSite_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicSite" ADD CONSTRAINT "ComicSite_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_comicSiteId_fkey" FOREIGN KEY ("comicSiteId") REFERENCES "ComicSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
