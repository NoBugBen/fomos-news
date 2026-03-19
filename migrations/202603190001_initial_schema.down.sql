DROP INDEX IF EXISTS idx_admin_sessions_expires_at;
DROP INDEX IF EXISTS idx_admin_sessions_user_id;
DROP INDEX IF EXISTS idx_subscribers_status_created_at;
DROP INDEX IF EXISTS idx_briefing_section_items_section_id_rank;
DROP INDEX IF EXISTS idx_briefing_sections_briefing_id_sort_order;
DROP INDEX IF EXISTS idx_briefings_briefing_date;
DROP INDEX IF EXISTS idx_news_tags_tag_news_id;
DROP INDEX IF EXISTS idx_news_items_hot_published_at_id;
DROP INDEX IF EXISTS idx_news_items_category_published_at_id;
DROP INDEX IF EXISTS idx_news_items_published_at_id;

DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS subscribers;
DROP TABLE IF EXISTS briefing_section_items;
DROP TABLE IF EXISTS briefing_sections;
DROP TABLE IF EXISTS briefings;
DROP TABLE IF EXISTS news_tags;
DROP TABLE IF EXISTS news_items;
