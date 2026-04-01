-- Migration: fix_search_similar_courses_search_path
-- Date: 2026-04-01
-- Description: Add SET search_path TO '' to search_similar_courses function
--              to prevent SQL injection via schema manipulation.

CREATE OR REPLACE FUNCTION public.search_similar_courses(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 10
)
RETURNS TABLE(id uuid, title text, topic text, user_id uuid, similarity double precision)
LANGUAGE plpgsql
STABLE
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.topic,
    c.user_id,
    (1 - (c.embedding <=> query_embedding))::float AS similarity
  FROM public.courses c
  WHERE
    c.is_public = true
    AND c.status = 'ready'
    AND c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;
