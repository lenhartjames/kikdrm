-- Seed data for kick_samples table
-- This creates initial kick drum samples with varied characteristics

INSERT INTO kick_samples (name, file_url, duration_ms, sample_rate, bit_depth, tags, characteristics) VALUES
-- Cold/Icy Kicks
('Ice Crystal', '/samples/ice-crystal.wav', 250, 44100, 24, '["cold", "sharp", "metallic", "bright", "crisp"]', '{"brightness": 90, "warmth": 10, "punch": 85, "decay": 20, "frequency_center": 150, "tonal_character": "metallic"}'),
('Frozen Lake', '/samples/frozen-lake.wav', 200, 44100, 24, '["cold", "deep", "minimal", "clean"]', '{"brightness": 75, "warmth": 15, "punch": 70, "decay": 25, "frequency_center": 120, "tonal_character": "crystalline"}'),
('Arctic Wind', '/samples/arctic-wind.wav', 180, 44100, 24, '["cold", "airy", "light", "ethereal"]', '{"brightness": 85, "warmth": 5, "punch": 60, "decay": 30, "frequency_center": 180, "tonal_character": "airy"}'),

-- Warm/Cozy Kicks
('Fireplace', '/samples/fireplace.wav', 400, 44100, 24, '["warm", "cozy", "round", "full"]', '{"brightness": 30, "warmth": 90, "punch": 65, "decay": 70, "frequency_center": 80, "tonal_character": "warm"}'),
('Wool Blanket', '/samples/wool-blanket.wav', 350, 44100, 24, '["warm", "soft", "muffled", "comfortable"]', '{"brightness": 25, "warmth": 85, "punch": 50, "decay": 65, "frequency_center": 70, "tonal_character": "soft"}'),
('Sunset Glow', '/samples/sunset-glow.wav', 380, 44100, 24, '["warm", "golden", "smooth", "nostalgic"]', '{"brightness": 45, "warmth": 80, "punch": 60, "decay": 60, "frequency_center": 90, "tonal_character": "golden"}'),

-- Dark/Moody Kicks
('Midnight', '/samples/midnight.wav', 500, 44100, 24, '["dark", "deep", "heavy", "mysterious"]', '{"brightness": 10, "warmth": 40, "punch": 80, "decay": 85, "frequency_center": 50, "tonal_character": "dark"}'),
('Shadow Walker', '/samples/shadow-walker.wav', 450, 44100, 24, '["dark", "brooding", "atmospheric", "cinematic"]', '{"brightness": 15, "warmth": 35, "punch": 75, "decay": 80, "frequency_center": 55, "tonal_character": "brooding"}'),
('Deep Cave', '/samples/deep-cave.wav', 600, 44100, 24, '["dark", "cavernous", "resonant", "vast"]', '{"brightness": 5, "warmth": 30, "punch": 70, "decay": 95, "frequency_center": 40, "tonal_character": "cavernous"}'),

-- Bright/Energetic Kicks
('Solar Flare', '/samples/solar-flare.wav', 220, 44100, 24, '["bright", "energetic", "explosive", "powerful"]', '{"brightness": 95, "warmth": 60, "punch": 95, "decay": 35, "frequency_center": 200, "tonal_character": "explosive"}'),
('Neon Lights', '/samples/neon-lights.wav', 200, 44100, 24, '["bright", "electric", "vibrant", "modern"]', '{"brightness": 88, "warmth": 45, "punch": 85, "decay": 30, "frequency_center": 180, "tonal_character": "electric"}'),
('Laser Beam', '/samples/laser-beam.wav', 150, 44100, 24, '["bright", "sharp", "precise", "futuristic"]', '{"brightness": 92, "warmth": 20, "punch": 90, "decay": 15, "frequency_center": 220, "tonal_character": "laser"}'),

-- Aggressive/Industrial Kicks
('Hammer Strike', '/samples/hammer-strike.wav', 180, 44100, 24, '["aggressive", "industrial", "harsh", "metallic"]', '{"brightness": 70, "warmth": 25, "punch": 100, "decay": 20, "frequency_center": 130, "tonal_character": "industrial"}'),
('Machine Gun', '/samples/machine-gun.wav', 120, 44100, 24, '["aggressive", "rapid", "intense", "mechanical"]', '{"brightness": 65, "warmth": 20, "punch": 95, "decay": 10, "frequency_center": 140, "tonal_character": "mechanical"}'),
('Steel Factory', '/samples/steel-factory.wav', 200, 44100, 24, '["industrial", "metallic", "heavy", "distorted"]', '{"brightness": 60, "warmth": 30, "punch": 88, "decay": 25, "frequency_center": 110, "tonal_character": "distorted"}'),

-- Soft/Ambient Kicks
('Cloud Nine', '/samples/cloud-nine.wav', 600, 44100, 24, '["soft", "ambient", "dreamy", "floating"]', '{"brightness": 40, "warmth": 65, "punch": 30, "decay": 90, "frequency_center": 60, "tonal_character": "dreamy"}'),
('Silk Touch', '/samples/silk-touch.wav', 500, 44100, 24, '["soft", "smooth", "delicate", "gentle"]', '{"brightness": 35, "warmth": 70, "punch": 25, "decay": 85, "frequency_center": 65, "tonal_character": "silky"}'),
('Morning Mist', '/samples/morning-mist.wav', 550, 44100, 24, '["soft", "ethereal", "atmospheric", "calm"]', '{"brightness": 45, "warmth": 60, "punch": 35, "decay": 88, "frequency_center": 70, "tonal_character": "misty"}'),

-- Natural/Organic Kicks
('Tree Trunk', '/samples/tree-trunk.wav', 300, 44100, 24, '["natural", "organic", "wooden", "earthy"]', '{"brightness": 50, "warmth": 75, "punch": 70, "decay": 50, "frequency_center": 85, "tonal_character": "wooden"}'),
('Earth Tone', '/samples/earth-tone.wav', 320, 44100, 24, '["natural", "earthy", "grounded", "raw"]', '{"brightness": 45, "warmth": 70, "punch": 65, "decay": 55, "frequency_center": 75, "tonal_character": "earthy"}'),
('Bamboo Hit', '/samples/bamboo-hit.wav', 250, 44100, 24, '["natural", "hollow", "resonant", "organic"]', '{"brightness": 55, "warmth": 65, "punch": 60, "decay": 45, "frequency_center": 95, "tonal_character": "hollow"}'),

-- Digital/Synthetic Kicks
('Binary Code', '/samples/binary-code.wav', 150, 44100, 24, '["digital", "synthetic", "precise", "clean"]', '{"brightness": 80, "warmth": 30, "punch": 85, "decay": 20, "frequency_center": 160, "tonal_character": "digital"}'),
('Pixel Perfect', '/samples/pixel-perfect.wav', 180, 44100, 24, '["digital", "8-bit", "retro", "synthetic"]', '{"brightness": 75, "warmth": 35, "punch": 80, "decay": 25, "frequency_center": 150, "tonal_character": "8-bit"}'),
('AI Generated', '/samples/ai-generated.wav', 200, 44100, 24, '["synthetic", "artificial", "processed", "modern"]', '{"brightness": 70, "warmth": 40, "punch": 75, "decay": 30, "frequency_center": 140, "tonal_character": "artificial"}'),

-- Vintage/Retro Kicks
('Vinyl Thump', '/samples/vinyl-thump.wav', 350, 44100, 24, '["vintage", "warm", "analog", "nostalgic"]', '{"brightness": 40, "warmth": 80, "punch": 60, "decay": 60, "frequency_center": 80, "tonal_character": "analog"}'),
('808 Classic', '/samples/808-classic.wav', 400, 44100, 24, '["vintage", "classic", "boomy", "iconic"]', '{"brightness": 35, "warmth": 75, "punch": 70, "decay": 70, "frequency_center": 60, "tonal_character": "808"}'),
('Tape Saturation', '/samples/tape-saturation.wav', 380, 44100, 24, '["vintage", "saturated", "compressed", "warm"]', '{"brightness": 38, "warmth": 78, "punch": 65, "decay": 65, "frequency_center": 70, "tonal_character": "saturated"}'),

-- Experimental/Abstract Kicks
('Quantum Flux', '/samples/quantum-flux.wav', 280, 44100, 24, '["experimental", "abstract", "unpredictable", "glitchy"]', '{"brightness": 65, "warmth": 45, "punch": 72, "decay": 42, "frequency_center": 125, "tonal_character": "glitchy"}'),
('Fractal Pattern', '/samples/fractal-pattern.wav', 333, 44100, 24, '["experimental", "complex", "layered", "evolving"]', '{"brightness": 58, "warmth": 52, "punch": 68, "decay": 58, "frequency_center": 108, "tonal_character": "fractal"}'),
('Void Echo', '/samples/void-echo.wav', 450, 44100, 24, '["experimental", "spacious", "reverberant", "otherworldly"]', '{"brightness": 48, "warmth": 38, "punch": 55, "decay": 78, "frequency_center": 88, "tonal_character": "void"}');

-- Add more variety to complete 100 samples
INSERT INTO kick_samples (name, file_url, duration_ms, sample_rate, bit_depth, tags, characteristics) VALUES
-- Additional Cold/Icy variants
('Glacier Break', '/samples/glacier-break.wav', 230, 44100, 24, '["cold", "cracking", "brittle", "sharp"]', '{"brightness": 88, "warmth": 8, "punch": 82, "decay": 22, "frequency_center": 165, "tonal_character": "brittle"}'),
('Winter Morning', '/samples/winter-morning.wav', 210, 44100, 24, '["cold", "crisp", "fresh", "clear"]', '{"brightness": 82, "warmth": 12, "punch": 75, "decay": 28, "frequency_center": 155, "tonal_character": "crisp"}'),
('Frost Bite', '/samples/frost-bite.wav', 190, 44100, 24, '["cold", "biting", "sharp", "intense"]', '{"brightness": 86, "warmth": 6, "punch": 88, "decay": 18, "frequency_center": 175, "tonal_character": "biting"}'),

-- Additional Warm/Cozy variants
('Hot Chocolate', '/samples/hot-chocolate.wav', 420, 44100, 24, '["warm", "rich", "creamy", "comforting"]', '{"brightness": 32, "warmth": 88, "punch": 58, "decay": 72, "frequency_center": 75, "tonal_character": "creamy"}'),
('Campfire', '/samples/campfire.wav', 390, 44100, 24, '["warm", "crackling", "organic", "cozy"]', '{"brightness": 42, "warmth": 82, "punch": 62, "decay": 68, "frequency_center": 85, "tonal_character": "crackling"}'),
('Golden Hour', '/samples/golden-hour.wav', 360, 44100, 24, '["warm", "golden", "soft", "beautiful"]', '{"brightness": 48, "warmth": 85, "punch": 55, "decay": 62, "frequency_center": 88, "tonal_character": "golden"}'),

-- Additional Dark/Moody variants
('Abyss', '/samples/abyss.wav', 550, 44100, 24, '["dark", "bottomless", "vast", "ominous"]', '{"brightness": 8, "warmth": 32, "punch": 78, "decay": 92, "frequency_center": 45, "tonal_character": "abyssal"}'),
('Storm Cloud', '/samples/storm-cloud.wav', 480, 44100, 24, '["dark", "threatening", "heavy", "electric"]', '{"brightness": 18, "warmth": 38, "punch": 82, "decay": 75, "frequency_center": 58, "tonal_character": "stormy"}'),
('Black Hole', '/samples/black-hole.wav', 520, 44100, 24, '["dark", "gravitational", "pulling", "infinite"]', '{"brightness": 3, "warmth": 28, "punch": 85, "decay": 98, "frequency_center": 35, "tonal_character": "gravitational"}'),

-- Additional Bright/Energetic variants
('Lightning Strike', '/samples/lightning-strike.wav', 180, 44100, 24, '["bright", "electric", "instant", "powerful"]', '{"brightness": 98, "warmth": 40, "punch": 98, "decay": 25, "frequency_center": 210, "tonal_character": "lightning"}'),
('Crystal Clear', '/samples/crystal-clear.wav', 210, 44100, 24, '["bright", "transparent", "pure", "pristine"]', '{"brightness": 90, "warmth": 50, "punch": 80, "decay": 32, "frequency_center": 190, "tonal_character": "crystalline"}'),
('Sunburst', '/samples/sunburst.wav', 240, 44100, 24, '["bright", "radiant", "explosive", "warm"]', '{"brightness": 93, "warmth": 65, "punch": 88, "decay": 38, "frequency_center": 195, "tonal_character": "radiant"}'),

-- Additional Aggressive/Industrial variants
('Pneumatic Drill', '/samples/pneumatic-drill.wav', 160, 44100, 24, '["aggressive", "drilling", "repetitive", "industrial"]', '{"brightness": 68, "warmth": 22, "punch": 92, "decay": 15, "frequency_center": 135, "tonal_character": "drilling"}'),
('Sledgehammer', '/samples/sledgehammer.wav', 190, 44100, 24, '["aggressive", "heavy", "impactful", "destructive"]', '{"brightness": 72, "warmth": 28, "punch": 96, "decay": 22, "frequency_center": 125, "tonal_character": "impactful"}'),
('Grinder', '/samples/grinder.wav', 170, 44100, 24, '["industrial", "grinding", "harsh", "mechanical"]', '{"brightness": 66, "warmth": 24, "punch": 89, "decay": 18, "frequency_center": 145, "tonal_character": "grinding"}'),

-- Additional Soft/Ambient variants
('Feather Touch', '/samples/feather-touch.wav', 580, 44100, 24, '["soft", "delicate", "light", "airy"]', '{"brightness": 38, "warmth": 62, "punch": 28, "decay": 92, "frequency_center": 62, "tonal_character": "feathery"}'),
('Whisper', '/samples/whisper.wav', 540, 44100, 24, '["soft", "quiet", "intimate", "subtle"]', '{"brightness": 33, "warmth": 68, "punch": 22, "decay": 86, "frequency_center": 58, "tonal_character": "whispered"}'),
('Velvet', '/samples/velvet.wav', 520, 44100, 24, '["soft", "luxurious", "smooth", "rich"]', '{"brightness": 42, "warmth": 72, "punch": 32, "decay": 82, "frequency_center": 68, "tonal_character": "velvety"}'),

-- Additional Natural/Organic variants
('Stone Drop', '/samples/stone-drop.wav', 280, 44100, 24, '["natural", "stone", "solid", "ancient"]', '{"brightness": 52, "warmth": 68, "punch": 72, "decay": 48, "frequency_center": 90, "tonal_character": "stony"}'),
('Clay Pot', '/samples/clay-pot.wav', 340, 44100, 24, '["natural", "ceramic", "hollow", "handmade"]', '{"brightness": 48, "warmth": 72, "punch": 58, "decay": 52, "frequency_center": 82, "tonal_character": "ceramic"}'),
('Rain Drop', '/samples/rain-drop.wav', 260, 44100, 24, '["natural", "water", "liquid", "pure"]', '{"brightness": 58, "warmth": 55, "punch": 52, "decay": 42, "frequency_center": 105, "tonal_character": "liquid"}'),

-- Additional Digital/Synthetic variants
('Matrix Code', '/samples/matrix-code.wav', 170, 44100, 24, '["digital", "coded", "encrypted", "cyber"]', '{"brightness": 78, "warmth": 32, "punch": 82, "decay": 22, "frequency_center": 155, "tonal_character": "coded"}'),
('Synth Wave', '/samples/synth-wave.wav', 190, 44100, 24, '["synthetic", "wave", "oscillating", "electronic"]', '{"brightness": 72, "warmth": 38, "punch": 78, "decay": 28, "frequency_center": 145, "tonal_character": "oscillating"}'),
('Circuit Board', '/samples/circuit-board.wav', 160, 44100, 24, '["digital", "electronic", "precise", "technical"]', '{"brightness": 76, "warmth": 34, "punch": 83, "decay": 24, "frequency_center": 152, "tonal_character": "electronic"}'),

-- Additional Vintage/Retro variants
('Cassette Deck', '/samples/cassette-deck.wav', 370, 44100, 24, '["vintage", "tape", "lofi", "nostalgic"]', '{"brightness": 36, "warmth": 76, "punch": 62, "decay": 64, "frequency_center": 72, "tonal_character": "lofi"}'),
('Tube Amp', '/samples/tube-amp.wav', 410, 44100, 24, '["vintage", "tube", "warm", "harmonic"]', '{"brightness": 42, "warmth": 82, "punch": 68, "decay": 66, "frequency_center": 78, "tonal_character": "tube"}'),
('Moog Bass', '/samples/moog-bass.wav', 430, 44100, 24, '["vintage", "synth", "fat", "classic"]', '{"brightness": 34, "warmth": 79, "punch": 72, "decay": 72, "frequency_center": 65, "tonal_character": "moog"}'),

-- Additional Experimental/Abstract variants
('Chaos Theory', '/samples/chaos-theory.wav', 310, 44100, 24, '["experimental", "chaotic", "random", "mathematical"]', '{"brightness": 62, "warmth": 48, "punch": 70, "decay": 45, "frequency_center": 118, "tonal_character": "chaotic"}'),
('Time Warp', '/samples/time-warp.wav', 420, 44100, 24, '["experimental", "warped", "stretched", "temporal"]', '{"brightness": 55, "warmth": 42, "punch": 62, "decay": 72, "frequency_center": 98, "tonal_character": "warped"}'),
('Dimension Shift', '/samples/dimension-shift.wav', 380, 44100, 24, '["experimental", "shifting", "morphing", "unstable"]', '{"brightness": 60, "warmth": 50, "punch": 66, "decay": 66, "frequency_center": 112, "tonal_character": "morphing"}'),

-- Mixed characteristics for variety
('Urban Pulse', '/samples/urban-pulse.wav', 220, 44100, 24, '["urban", "gritty", "street", "raw"]', '{"brightness": 62, "warmth": 45, "punch": 78, "decay": 35, "frequency_center": 115, "tonal_character": "urban"}'),
('Desert Wind', '/samples/desert-wind.wav', 340, 44100, 24, '["dry", "sandy", "warm", "vast"]', '{"brightness": 55, "warmth": 65, "punch": 55, "decay": 58, "frequency_center": 95, "tonal_character": "dry"}'),
('Ocean Wave', '/samples/ocean-wave.wav', 460, 44100, 24, '["oceanic", "flowing", "deep", "rhythmic"]', '{"brightness": 45, "warmth": 58, "punch": 62, "decay": 75, "frequency_center": 78, "tonal_character": "oceanic"}'),
('Mountain Echo', '/samples/mountain-echo.wav', 520, 44100, 24, '["reverberant", "spacious", "natural", "grand"]', '{"brightness": 50, "warmth": 55, "punch": 65, "decay": 85, "frequency_center": 85, "tonal_character": "echoing"}'),
('City Night', '/samples/city-night.wav', 290, 44100, 24, '["nocturnal", "urban", "electric", "alive"]', '{"brightness": 58, "warmth": 42, "punch": 72, "decay": 45, "frequency_center": 105, "tonal_character": "nocturnal"}'),
('Forest Floor', '/samples/forest-floor.wav', 360, 44100, 24, '["organic", "earthy", "damp", "natural"]', '{"brightness": 40, "warmth": 68, "punch": 58, "decay": 62, "frequency_center": 75, "tonal_character": "forest"}'),
('Space Station', '/samples/space-station.wav', 250, 44100, 24, '["futuristic", "clean", "technological", "precise"]', '{"brightness": 72, "warmth": 35, "punch": 75, "decay": 40, "frequency_center": 138, "tonal_character": "space"}'),
('Rubber Ball', '/samples/rubber-ball.wav', 280, 44100, 24, '["bouncy", "elastic", "playful", "round"]', '{"brightness": 65, "warmth": 55, "punch": 68, "decay": 45, "frequency_center": 110, "tonal_character": "bouncy"}'),
('Glass Shatter', '/samples/glass-shatter.wav', 200, 44100, 24, '["brittle", "sharp", "breaking", "crystalline"]', '{"brightness": 85, "warmth": 15, "punch": 80, "decay": 30, "frequency_center": 185, "tonal_character": "shattering"}'),
('Copper Bell', '/samples/copper-bell.wav', 450, 44100, 24, '["metallic", "resonant", "bell-like", "harmonious"]', '{"brightness": 68, "warmth": 48, "punch": 60, "decay": 78, "frequency_center": 128, "tonal_character": "bell"}'),
('Plastic Hit', '/samples/plastic-hit.wav', 180, 44100, 24, '["synthetic", "hollow", "cheap", "light"]', '{"brightness": 70, "warmth": 25, "punch": 65, "decay": 25, "frequency_center": 148, "tonal_character": "plastic"}'),
('Leather Thud', '/samples/leather-thud.wav', 310, 44100, 24, '["organic", "soft", "thick", "muffled"]', '{"brightness": 35, "warmth": 72, "punch": 62, "decay": 55, "frequency_center": 82, "tonal_character": "leather"}'),
('Mercury Drop', '/samples/mercury-drop.wav', 240, 44100, 24, '["liquid", "metallic", "heavy", "unique"]', '{"brightness": 60, "warmth": 40, "punch": 70, "decay": 38, "frequency_center": 120, "tonal_character": "liquid-metal"}'),
('Neon Glow', '/samples/neon-glow.wav', 260, 44100, 24, '["electric", "glowing", "vibrant", "synthetic"]', '{"brightness": 80, "warmth": 45, "punch": 73, "decay": 42, "frequency_center": 165, "tonal_character": "neon"}'),
('Rust Bucket', '/samples/rust-bucket.wav', 330, 44100, 24, '["metallic", "decayed", "rough", "industrial"]', '{"brightness": 45, "warmth": 52, "punch": 67, "decay": 58, "frequency_center": 92, "tonal_character": "rusty"}'),
('Silk Road', '/samples/silk-road.wav', 370, 44100, 24, '["exotic", "eastern", "mystical", "ancient"]', '{"brightness": 52, "warmth": 62, "punch": 60, "decay": 65, "frequency_center": 88, "tonal_character": "exotic"}'),
('Chrome Finish', '/samples/chrome-finish.wav', 210, 44100, 24, '["metallic", "shiny", "modern", "clean"]', '{"brightness": 78, "warmth": 30, "punch": 77, "decay": 32, "frequency_center": 158, "tonal_character": "chrome"}'),
('Velcro Rip', '/samples/velcro-rip.wav', 190, 44100, 24, '["textured", "ripping", "rough", "synthetic"]', '{"brightness": 73, "warmth": 28, "punch": 71, "decay": 28, "frequency_center": 142, "tonal_character": "ripping"}'),
('Bubble Pop', '/samples/bubble-pop.wav', 150, 44100, 24, '["light", "popping", "playful", "wet"]', '{"brightness": 82, "warmth": 38, "punch": 64, "decay": 20, "frequency_center": 172, "tonal_character": "popping"}'),
('Concrete Block', '/samples/concrete-block.wav', 270, 44100, 24, '["solid", "heavy", "urban", "hard"]', '{"brightness": 48, "warmth": 58, "punch": 74, "decay": 50, "frequency_center": 100, "tonal_character": "concrete"}');