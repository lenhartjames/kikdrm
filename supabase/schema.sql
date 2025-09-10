-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create kick_samples table
CREATE TABLE kick_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    sample_rate INTEGER NOT NULL,
    bit_depth INTEGER NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    characteristics JSONB NOT NULL DEFAULT '{
        "brightness": 50,
        "warmth": 50,
        "punch": 50,
        "decay": 50,
        "frequency_center": 100,
        "tonal_character": "neutral"
    }'::jsonb,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create image_uploads table
CREATE TABLE image_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    file_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    analysis_result JSONB DEFAULT '{}'::jsonb,
    matched_sample_id UUID REFERENCES kick_samples(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_sessions table for anonymous users
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    sequences JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) + INTERVAL '30 days'
);

-- Create indexes for better performance
CREATE INDEX idx_kick_samples_tags ON kick_samples USING GIN (tags);
CREATE INDEX idx_kick_samples_characteristics ON kick_samples USING GIN (characteristics);
CREATE INDEX idx_kick_samples_embedding ON kick_samples USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_image_uploads_user_id ON image_uploads(user_id);
CREATE INDEX idx_image_uploads_matched_sample ON image_uploads(matched_sample_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for kick_samples
CREATE TRIGGER update_kick_samples_updated_at BEFORE UPDATE
    ON kick_samples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE kick_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow read access to kick_samples for everyone
CREATE POLICY "Allow public read access to kick_samples" ON kick_samples
    FOR SELECT USING (true);

-- Allow insert and read for image_uploads
CREATE POLICY "Allow public insert to image_uploads" ON image_uploads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to image_uploads" ON image_uploads
    FOR SELECT USING (true);

-- Allow full access to user_sessions for session management
CREATE POLICY "Allow public access to user_sessions" ON user_sessions
    FOR ALL USING (true);

-- Function to search for similar kick samples based on embedding
CREATE OR REPLACE FUNCTION search_similar_kicks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    file_url TEXT,
    characteristics JSONB,
    tags JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ks.id,
        ks.name,
        ks.file_url,
        ks.characteristics,
        ks.tags,
        1 - (ks.embedding <=> query_embedding) as similarity
    FROM kick_samples ks
    WHERE ks.embedding IS NOT NULL
        AND 1 - (ks.embedding <=> query_embedding) > match_threshold
    ORDER BY ks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;