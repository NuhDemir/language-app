-- ============================================================
-- MAINTENANCE QUERIES: Media Metadata Analysis
-- Phase 11: Media Metadata Strategy
-- ============================================================

-- QUERY 1: Find exercises with old audio formats (wav)
-- Useful for migration planning when deprecating formats
SELECT 
    id, 
    type, 
    media_metadata->'main_audio'->>'url' as audio_url,
    media_metadata->'main_audio'->>'format' as audio_format
FROM exercises
WHERE media_metadata @> '{"main_audio": {"format": "wav"}}';


-- QUERY 2: Average audio duration by exercise type
-- Helps understand content length distribution
SELECT 
    type,
    COUNT(*) as exercise_count,
    AVG((media_metadata->'main_audio'->>'duration_ms')::int) as avg_duration_ms,
    MAX((media_metadata->'main_audio'->>'duration_ms')::int) as max_duration_ms
FROM exercises
WHERE media_metadata->'main_audio' IS NOT NULL
GROUP BY type
ORDER BY avg_duration_ms DESC;


-- QUERY 3: Find exercises missing required audio
-- Useful for content completeness audits
SELECT 
    id, 
    type, 
    level_id
FROM exercises
WHERE type IN ('listen_tap', 'speak')
AND (media_metadata->'main_audio' IS NULL 
     OR media_metadata->'main_audio'->>'url' IS NULL);


-- QUERY 4: Total media storage estimation
-- Sum of all audio file sizes for capacity planning
SELECT 
    SUM((media_metadata->'main_audio'->>'size_bytes')::bigint) as total_audio_bytes,
    pg_size_pretty(SUM((media_metadata->'main_audio'->>'size_bytes')::bigint)) as total_audio_human
FROM exercises
WHERE media_metadata->'main_audio'->'size_bytes' IS NOT NULL;


-- QUERY 5: Audio format distribution
-- Understand which formats are in use
SELECT 
    media_metadata->'main_audio'->>'format' as format,
    COUNT(*) as count
FROM exercises
WHERE media_metadata->'main_audio' IS NOT NULL
GROUP BY media_metadata->'main_audio'->>'format'
ORDER BY count DESC;
