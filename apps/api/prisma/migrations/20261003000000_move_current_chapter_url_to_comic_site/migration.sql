-- AlterTable: a URL do capítulo passa a pertencer ao vínculo (ComicSite)
ALTER TABLE "ComicSite" ADD COLUMN "currentChapterUrl" TEXT;

-- Migração de dados: move a URL salva para o vínculo usado na última leitura
UPDATE "ComicSite" cs
SET "currentChapterUrl" = rp."currentChapterUrl"
FROM "ReadingProgress" rp
WHERE rp."comicSiteId" = cs."id"
  AND rp."currentChapterUrl" IS NOT NULL;

-- AlterTable
ALTER TABLE "ReadingProgress" DROP COLUMN "currentChapterUrl";
