/*
  Warnings:

  - Added the required column `url` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Metric` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Créer une table temporaire pour Alert avec les nouveaux champs
CREATE TABLE "new_Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "responseTime" INTEGER,
    "threshold" INTEGER,
    "url" TEXT NOT NULL,
    "error" TEXT,
    "metricId" INTEGER NOT NULL,
    CONSTRAINT "Alert_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copier les données existantes avec l'URL de la métrique parente
INSERT INTO "new_Alert" ("id", "message", "metricId", "timestamp", "type", "url")
SELECT a."id", a."message", a."metricId", a."timestamp", a."type", m."url"
FROM "Alert" a
JOIN "Metric" m ON a."metricId" = m."id";

DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";

-- Créer une table temporaire pour Metric avec le nouveau champ serviceName
CREATE TABLE "new_Metric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT
);

-- Copier les données existantes en extrayant le nom du service de l'URL
INSERT INTO "new_Metric" ("id", "serviceName", "status", "responseTime", "url", "timestamp", "error")
SELECT 
    "id",
    CASE 
        WHEN "url" LIKE '%:3005%' THEN 'Frontend'
        WHEN "url" LIKE '%:3006%' THEN 'Authentication'
        WHEN "url" LIKE '%:3002%' THEN 'Analysis'
        ELSE 'Unknown'
    END as "serviceName",
    "status",
    "responseTime",
    "url",
    "timestamp",
    "error"
FROM "Metric";

DROP TABLE "Metric";
ALTER TABLE "new_Metric" RENAME TO "Metric";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
