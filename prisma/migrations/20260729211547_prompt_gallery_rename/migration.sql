-- Repurpose AiTool from a metered AI-generation feature into a free,
-- copyable prompt gallery. Renaming (not drop+add) to preserve existing rows.
ALTER TABLE "AiTool" RENAME COLUMN "hiddenPrompt" TO "promptText";
ALTER TABLE "AiTool" ALTER COLUMN "creditCost" SET DEFAULT 0;
