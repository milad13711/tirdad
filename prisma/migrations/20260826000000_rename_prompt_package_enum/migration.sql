-- The PROMPT_PACKAGE order-item type was never used by any code path
-- (there was no admin UI or purchase flow for the old, likewise-unused
-- PromptPackage model). Renaming it in place for the new downloadable
-- tool-package feature instead of adding a redundant enum value.
ALTER TYPE "OrderItemType" RENAME VALUE 'PROMPT_PACKAGE' TO 'TOOL_PACKAGE';
