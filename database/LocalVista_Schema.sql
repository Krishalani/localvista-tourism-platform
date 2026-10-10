/*
================================================================================
  LocalVista — Schema + Seed (SQL Server)
================================================================================
  Catalogue schema used by the LocalVista Angular frontend and ASP.NET Core API:

    Categories (1) ──< Attractions (1) ──< AttractionImages

  Frontend field mapping
  ----------------------
  Categories.Name          ← ATTRACTION_CATEGORIES (7 names)
  Attractions.*             ← Attraction (name, description, openingHours,
                             travelTips, bestVisitMonths, distanceKm,
                             latitude, longitude)
  Attractions.CategoryId     ← Attraction.category (via Categories.Name)
  AttractionImages.ImageUrl + SortOrder
                           ← Attraction.imageUrls[] (SortOrder 0 = primary /
                             card thumbnail)

  Intentionally NOT in this database
  ----------------------------------
  • One-day itinerary     → browser sessionStorage only (guest plan)
  • Tourist accounts      → out of project scope
  • Attraction feedback   → anonymous ratings and comments per attraction
  • AdminAccounts table   → NOT created (see Admin authentication below)

  Admin authentication (ASP.NET Core Identity)
  -------------------------------------------------------
  The API creates and manages its own Identity tables (for example AspNetUsers,
  AspNetRoles, AspNetUserRoles, AspNetUserClaims) through EF Core migrations.
  The API seeds the development admin account and Admin role at startup; this
  script creates catalogue and feedback tables plus catalogue seed rows.

  Do NOT add a separate dbo.AdminAccounts (or similar) table unless the team
  explicitly decides not to use Identity.

  Example SELECT / CRUD statements for the API live in:
    LocalVista_QueryExamples.sql
  This file does not create, update, or delete sample “Example Place” rows.
================================================================================
*/

-- Optional: create and select database once
-- CREATE DATABASE LocalVista;
-- GO
-- USE LocalVista;
-- GO

-- =============================================================================
-- FIRST-TIME / DEVELOPMENT RESET (DESTRUCTIVE)
-- =============================================================================
-- WARNING: The statements below DROP existing LocalVista catalogue tables and
-- DELETE all of their data. Re-running this block destroys Categories,
-- Attractions, AttractionImages, and AttractionFeedback. Use only for first-time setup or a
-- deliberate local reset. Do not run against a shared/production database.
-- =============================================================================

IF OBJECT_ID(N'dbo.AttractionImages', N'U') IS NOT NULL
    DROP TABLE dbo.AttractionImages;

IF OBJECT_ID(N'dbo.AttractionFeedback', N'U') IS NOT NULL
    DROP TABLE dbo.AttractionFeedback;

IF OBJECT_ID(N'dbo.Attractions', N'U') IS NOT NULL
    DROP TABLE dbo.Attractions;

IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
    DROP TABLE dbo.Categories;
GO

-- =============================================================================
-- SCHEMA
-- =============================================================================

CREATE TABLE dbo.Categories (
    CategoryId   INT            NOT NULL IDENTITY(1,1)
        CONSTRAINT PK_Categories PRIMARY KEY,
    Name         NVARCHAR(100)  NOT NULL,
    CONSTRAINT UQ_Categories_Name UNIQUE (Name)
);
GO

CREATE TABLE dbo.Attractions (
    AttractionId   INT             NOT NULL IDENTITY(1,1)
        CONSTRAINT PK_Attractions PRIMARY KEY,
    CategoryId     INT             NOT NULL,
    Name           NVARCHAR(200)   NOT NULL,
    Description    NVARCHAR(MAX)   NOT NULL,
    OpeningHours   NVARCHAR(200)   NULL,
    TravelTips     NVARCHAR(MAX)   NULL,
    BestVisitMonths NVARCHAR(40)   NOT NULL
        CONSTRAINT DF_Attractions_BestVisitMonths DEFAULT (N''),
    DistanceKm     DECIMAL(6,2)    NOT NULL
        CONSTRAINT CK_Attractions_DistanceKm CHECK (DistanceKm >= 0 AND DistanceKm <= 25),
    Latitude       DECIMAL(9,6)    NOT NULL,
    Longitude      DECIMAL(9,6)    NOT NULL,
    CreatedAtUtc   DATETIME2(0)    NOT NULL
        CONSTRAINT DF_Attractions_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
    UpdatedAtUtc   DATETIME2(0)    NOT NULL
        CONSTRAINT DF_Attractions_UpdatedAtUtc DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Attractions_Categories
        FOREIGN KEY (CategoryId) REFERENCES dbo.Categories (CategoryId)
);
GO

CREATE INDEX IX_Attractions_CategoryId ON dbo.Attractions (CategoryId);
CREATE INDEX IX_Attractions_Name ON dbo.Attractions (Name);
GO

/*
  Multiple images per attraction (Angular imageUrls[]).
  SortOrder 0 = primary image used on Explore cards / default detail photo.
*/
CREATE TABLE dbo.AttractionImages (
    AttractionImageId  INT            NOT NULL IDENTITY(1,1)
        CONSTRAINT PK_AttractionImages PRIMARY KEY,
    AttractionId       INT            NOT NULL,
    ImageUrl           NVARCHAR(1000) NOT NULL,
    SortOrder          INT            NOT NULL
        CONSTRAINT DF_AttractionImages_SortOrder DEFAULT (0),
    CONSTRAINT FK_AttractionImages_Attractions
        FOREIGN KEY (AttractionId) REFERENCES dbo.Attractions (AttractionId)
        ON DELETE CASCADE,
    CONSTRAINT UQ_AttractionImages_Attraction_Sort
        UNIQUE (AttractionId, SortOrder)
);
GO

CREATE INDEX IX_AttractionImages_AttractionId ON dbo.AttractionImages (AttractionId);
GO

-- Anonymous tourist ratings and optional comments; feedback is scoped to a place.
CREATE TABLE dbo.AttractionFeedback (
    AttractionFeedbackId INT            NOT NULL IDENTITY(1,1)
        CONSTRAINT PK_AttractionFeedback PRIMARY KEY,
    AttractionId         INT            NOT NULL,
    DisplayName          NVARCHAR(80)   NULL,
    Rating               INT            NOT NULL,
    Comment              NVARCHAR(1000) NULL,
    CreatedAtUtc         DATETIME2(0)   NOT NULL
        CONSTRAINT DF_AttractionFeedback_CreatedAtUtc DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_AttractionFeedback_Attractions
        FOREIGN KEY (AttractionId) REFERENCES dbo.Attractions (AttractionId)
        ON DELETE CASCADE
);
GO

CREATE INDEX IX_AttractionFeedback_AttractionId_CreatedAtUtc
    ON dbo.AttractionFeedback (AttractionId, CreatedAtUtc DESC);
GO

-- =============================================================================
-- SEED — 7 categories (matches Angular ATTRACTION_CATEGORIES)
-- =============================================================================

SET IDENTITY_INSERT dbo.Categories ON;

INSERT INTO dbo.Categories (CategoryId, Name) VALUES
    (1, N'Religious & Heritage'),
    (2, N'Nature'),
    (3, N'Adventure'),
    (4, N'Museum'),
    (5, N'Viewpoint'),
    (6, N'Recreation'),
    (7, N'Eco Tourism');

SET IDENTITY_INSERT dbo.Categories OFF;
GO

-- =============================================================================
-- SEED — 15 attractions within ~25 km of Kandy for the live API catalogue
-- CategoryId: 1 Religious & Heritage | 2 Nature | 3 Adventure | 4 Museum
--             5 Viewpoint | 6 Recreation | 7 Eco Tourism
-- =============================================================================

SET IDENTITY_INSERT dbo.Attractions ON;

INSERT INTO dbo.Attractions (
    AttractionId, CategoryId, Name, Description, OpeningHours, TravelTips,
    DistanceKm, Latitude, Longitude
) VALUES
(1, 2,
 N'Royal Botanical Gardens, Peradeniya',
 N'A world-renowned botanical garden featuring orchids, palms, and landscaped avenues beside the Mahaweli River.',
 N'Daily 7:30 AM – 5:00 PM',
 N'Visit early to avoid midday heat. Allow 2–3 hours for a relaxed walk.',
 6.00, 7.271500, 80.596600),

(2, 3,
 N'Hanthana Katusukonda Hike, Tea & Waterfall',
 N'A scenic hike through tea estates with waterfall stops and panoramic mountain views above Kandy.',
 N'Daylight hours recommended (6:00 AM – 5:00 PM)',
 N'Wear sturdy shoes and carry water. Trails can be slippery after rain.',
 8.00, 7.250200, 80.633500),

(3, 1,
 N'British Garrison Cemetery',
 N'A historic cemetery preserving graves of British colonial officers and civilians from the Kandyan era.',
 N'Daily 8:00 AM – 5:00 PM',
 N'A short, quiet stop near the Temple of the Tooth — ideal between city sights.',
 1.00, 7.294500, 80.640100),

(4, 2,
 N'Sir James Taylor''s Loolkandura Tea Heritage Hike',
 N'A historic tea estate linked to the pioneer of Sri Lanka''s commercial tea industry, with heritage trails.',
 N'Typically 8:00 AM – 4:30 PM (confirm locally)',
 N'Combine with a factory visit if open. Plan extra travel time from central Kandy.',
 20.00, 7.145000, 80.652000),

(5, 2,
 N'Udawattakele Forest Sanctuary',
 N'A protected forest reserve above Kandy known for walking trails, birdlife, and cool canopy shade.',
 N'Daily 8:00 AM – 5:00 PM',
 N'Stay on marked paths. Mornings are best for birdwatching.',
 2.00, 7.299000, 80.643000),

(6, 4,
 N'Ceylon Tea Museum',
 N'A museum showcasing the history and development of Sri Lanka''s tea industry in a former factory setting.',
 N'Tue–Sat 8:30 AM – 3:45 PM; Sun 8:30 AM – 3:00 PM (closed Mon)',
 N'Pair with a short tea tasting if available. Allow about 1–1.5 hours.',
 4.00, 7.270500, 80.620500),

(7, 5,
 N'Bellwood View Point',
 N'A scenic viewpoint offering panoramic views of surrounding mountains and valleys near Kandy.',
 N'Daylight hours',
 N'Best in clear weather; late afternoon light is often dramatic.',
 15.00, 7.220000, 80.700000),

(8, 6,
 N'Water World Kandy',
 N'A family-friendly recreational attraction featuring aquatic exhibits and leisure facilities.',
 N'Daily 8:30 AM – 5:30 PM',
 N'Good option for families needing a cooler indoor stop midday.',
 9.00, 7.255000, 80.610000),

(9, 1,
 N'Sri Dalada Maligawa (Temple of the Sacred Tooth Relic)',
 N'Sri Lanka''s most sacred Buddhist temple and a UNESCO World Heritage Site at the heart of Kandy.',
 N'Daily 5:30 AM – 8:00 PM (puja times vary)',
 N'Dress modestly (cover shoulders and knees). Remove shoes before entering.',
 0.50, 7.293600, 80.641200),

(10, 1,
 N'Lankatilaka Temple',
 N'An ancient temple known for distinctive architecture and historical importance southwest of Kandy.',
 N'Daily ~6:00 AM – 6:00 PM',
 N'Often combined with Gadaladeniya and Embekke in one half-day loop.',
 14.00, 7.233300, 80.566700),

(11, 1,
 N'Gadaladeniya Temple',
 N'A historic temple reflecting South Indian architectural influence on a rocky outcrop near Kandy.',
 N'Daily ~6:00 AM – 6:00 PM',
 N'Wear sun protection; the site is partly exposed. Combine with Lankatilaka.',
 13.00, 7.250000, 80.550000),

(12, 7,
 N'Ambuluwawa Biodiversity Complex & Tower',
 N'A biodiversity reserve featuring an iconic spiral observation tower and wide landscape views.',
 N'Daily 8:30 AM – 5:30 PM (tower access may vary)',
 N'The tower climb is steep and open — avoid if uncomfortable with heights.',
 24.00, 7.141500, 80.538500),

(13, 4,
 N'National Museum of Kandy',
 N'A museum displaying Kandyan cultural artifacts and historical collections next to the palace complex.',
 N'Tue–Sat 9:00 AM – 5:00 PM (closed Sun–Mon; confirm locally)',
 N'Easy to combine with the Temple of the Tooth in the same morning.',
 0.50, 7.294000, 80.640500),

(14, 1,
 N'Commonwealth War Cemetery',
 N'A well-maintained cemetery commemorating Commonwealth soldiers of the Second World War.',
 N'Daily daylight hours',
 N'A quiet reflective stop; keep voices low and stay on paths.',
 5.00, 7.280000, 80.620000),

(15, 5,
 N'Kandy Viewpoint (Arthur''s Seat)',
 N'A popular viewpoint overlooking Kandy city, Kandy Lake, and the surrounding hills.',
 N'Daylight hours',
 N'Sunset is popular — arrive early for parking and clear views.',
 2.00, 7.290500, 80.635500);

SET IDENTITY_INSERT dbo.Attractions OFF;
GO

-- =============================================================================
-- SEED — images (SortOrder 0 = primary; matches Angular imageUrls order)
-- =============================================================================

INSERT INTO dbo.AttractionImages (AttractionId, ImageUrl, SortOrder) VALUES
-- 1 Royal Botanical Gardens
(1, N'/images/attractions/royal-botanical-gardens.jpg', 0),
(1, N'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', 1),
(1, N'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80', 2),
-- 2 Hanthana
(2, N'/images/attractions/hanthana-hike.jpg', 0),
(2, N'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80', 1),
(2, N'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', 2),
-- 3 British Garrison Cemetery
(3, N'/images/attractions/british-garrison-cemetery.jpg', 0),
(3, N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80', 1),
-- 4 Loolkandura
(4, N'/images/attractions/loolkandura-tea-estate.jpg', 0),
(4, N'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=80', 1),
(4, N'https://images.unsplash.com/photo-1597318112767-7dfb7295c2d0?auto=format&fit=crop&w=1200&q=80', 2),
-- 5 Udawattakele
(5, N'/images/attractions/udawattakele-forest.jpg', 0),
(5, N'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80', 1),
(5, N'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80', 2),
-- 6 Ceylon Tea Museum
(6, N'/images/attractions/ceylon-tea-museum.jpg', 0),
(6, N'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80', 1),
-- 7 Bellwood View Point
(7, N'/images/attractions/bellwood-view-point.jpg', 0),
(7, N'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80', 1),
(7, N'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80', 2),
-- 8 Water World Kandy
(8, N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80', 0),
(8, N'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=80', 1),
-- 9 Temple of the Tooth
(9, N'/images/attractions/temple-of-the-tooth.jpg', 0),
(9, N'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', 1),
(9, N'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', 2),
-- 10 Lankatilaka
(10, N'/images/attractions/lankatilaka-temple.jpg', 0),
(10, N'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', 1),
-- 11 Gadaladeniya
(11, N'/images/attractions/gadaladeniya-temple.jpg', 0),
(11, N'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80', 1),
-- 12 Ambuluwawa
(12, N'/images/attractions/ambuluwawa-tower.jpg', 0),
(12, N'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', 1),
(12, N'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80', 2),
-- 13 National Museum of Kandy
(13, N'/images/attractions/national-museum-kandy.jpg', 0),
(13, N'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80', 1),
-- 14 Commonwealth War Cemetery
(14, N'/images/attractions/commonwealth-war-cemetery.jpg', 0),
(14, N'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80', 1),
-- 15 Kandy Viewpoint
(15, N'/images/attractions/kandy-viewpoint.jpg', 0),
(15, N'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 1),
(15, N'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80', 2);
GO

-- =============================================================================
-- QUICK VERIFY (optional)
-- =============================================================================
-- Expected: 7 categories, 15 attractions, every attraction has SortOrder = 0

-- SELECT COUNT(*) AS CategoryCount FROM dbo.Categories;           -- 7
-- SELECT COUNT(*) AS AttractionCount FROM dbo.Attractions;          -- 15
-- SELECT COUNT(*) AS WithPrimaryImage
-- FROM dbo.Attractions AS a
-- WHERE EXISTS (
--     SELECT 1 FROM dbo.AttractionImages AS i
--     WHERE i.AttractionId = a.AttractionId AND i.SortOrder = 0
-- );                                                              -- 15
