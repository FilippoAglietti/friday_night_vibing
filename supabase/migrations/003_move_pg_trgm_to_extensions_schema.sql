-- Migration: move_pg_trgm_to_extensions_schema
-- Date: 2026-04-01
-- Description: Move pg_trgm extension from public schema to extensions schema.
--              Prevents exposing internal C functions in the public API surface.

ALTER EXTENSION pg_trgm SET SCHEMA extensions;
