/*
  LocalVista — SQL Server schema aligned with the Angular mock frontend

  Relationships (same as the UI):
    Categories (1) ──< (many) Attractions (1) ──< (many) AttractionImages

  Intentionally NOT stored in the database:
    - One-day itinerary  → browser sessionStorage only (guest plan)
    - Tourist accounts   → not in scope

  Admin authentication:
    Prefer ASP.NET Core Identity (AspNetUsers / AspNetRoles) in the API phase.
    Do not store plain-text passwords in a custom table for production.
*/

-- =============================================================================
-- 1. CREATE DATABASE (run once; optional)
-- =============================================================================
-- CREATE DATABASE LocalVista;
-- GO
-- USE LocalVista;
-- GO

-- =============================================================================
-- 2. TABLE DEFINITIONS
-- =============================================================================

IF OBJECT_ID(N'dbo.AttractionImages', N'U') IS NOT NULL DROP TABLE dbo.AttractionImages;
IF OBJECT_ID(N'dbo.Attractions', N'U') IS NOT NULL DROP TABLE dbo.Attractions;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL DROP TABLE dbo.Categories;
GO

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
  Multiple images per attraction (maps to Attraction.imageUrls[] in Angular).
  SortOrder 0 = primary / card thumbnail.
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

-- =============================================================================
-- 3. SEED CATEGORIES (matches ATTRACTION_CATEGORIES in the Angular model)
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
-- 4. EXAMPLE SEED — one attraction + images (pattern for the other 14)
-- =============================================================================

SET IDENTITY_INSERT dbo.Attractions ON;
INSERT INTO dbo.Attractions (
    AttractionId, CategoryId, Name, Description, OpeningHours, TravelTips,
    DistanceKm, Latitude, Longitude
) VALUES (
    1,
    2, -- Nature
    N'Royal Botanical Gardens, Peradeniya',
    N'A world-renowned botanical garden featuring orchids, palms, and landscaped avenues beside the Mahaweli River.',
    N'Daily 7:30 AM – 5:00 PM',
    N'Visit early to avoid midday heat. Allow 2–3 hours for a relaxed walk.',
    6.00,
    7.271500,
    80.596600
);
SET IDENTITY_INSERT dbo.Attractions OFF;

INSERT INTO dbo.AttractionImages (AttractionId, ImageUrl, SortOrder) VALUES
    (1, N'/images/attractions/royal-botanical-gardens.jpg', 0),
    (1, N'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', 1),
    (1, N'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80', 2);
GO

-- Repeat the same INSERT pattern for attractions 2–15 from mock-attractions.ts
-- (CategoryId: map Name → Categories.Name, then use that CategoryId.)

-- =============================================================================
-- 5. QUERIES THAT MATCH THE ANGULAR UI / FUTURE API
-- =============================================================================

-- 5.1 Catalogue list (Explore cards) — primary image = SortOrder 0
SELECT
    a.AttractionId   AS Id,
    a.Name,
    c.Name           AS Category,
    a.Description,
    a.OpeningHours,
    a.TravelTips,
    a.DistanceKm,
    a.Latitude,
    a.Longitude,
    img.ImageUrl     AS PrimaryImageUrl
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
OUTER APPLY (
    SELECT TOP (1) i.ImageUrl
    FROM dbo.AttractionImages AS i
    WHERE i.AttractionId = a.AttractionId
    ORDER BY i.SortOrder
) AS img
ORDER BY a.Name;

-- 5.2 Search by name + optional category filter (FR search/filter)
DECLARE @Search NVARCHAR(200) = N'tea';  -- pass NULL/empty for all
DECLARE @CategoryName NVARCHAR(100) = NULL; -- e.g. N'Nature'

SELECT
    a.AttractionId AS Id,
    a.Name,
    c.Name AS Category,
    a.DistanceKm,
    a.OpeningHours,
    (
        SELECT TOP (1) i.ImageUrl
        FROM dbo.AttractionImages AS i
        WHERE i.AttractionId = a.AttractionId
        ORDER BY i.SortOrder
    ) AS PrimaryImageUrl
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
WHERE (@Search IS NULL OR @Search = N'' OR a.Name LIKE N'%' + @Search + N'%')
  AND (@CategoryName IS NULL OR c.Name = @CategoryName)
ORDER BY a.Name;

-- Multi-category filter (when UI selects several chips)
-- Example: Nature + Viewpoint
SELECT a.AttractionId, a.Name, c.Name AS Category
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
WHERE c.Name IN (N'Nature', N'Viewpoint')
ORDER BY a.Name;

-- 5.3 Detail page — attraction + all images ordered (gallery)
DECLARE @AttractionId INT = 1;

SELECT
    a.AttractionId AS Id,
    a.Name,
    c.Name AS Category,
    a.Description,
    a.OpeningHours,
    a.TravelTips,
    a.DistanceKm,
    a.Latitude,
    a.Longitude
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
WHERE a.AttractionId = @AttractionId;

SELECT ImageUrl, SortOrder
FROM dbo.AttractionImages
WHERE AttractionId = @AttractionId
ORDER BY SortOrder;

-- Same detail as one JSON-shaped result (SQL Server 2016+)
SELECT
    a.AttractionId AS id,
    a.Name AS name,
    c.Name AS category,
    a.Description AS description,
    a.OpeningHours AS openingHours,
    a.TravelTips AS travelTips,
    a.DistanceKm AS distanceKm,
    a.Latitude AS latitude,
    a.Longitude AS longitude,
    (
        SELECT i.ImageUrl AS [url], i.SortOrder AS [sortOrder]
        FROM dbo.AttractionImages AS i
        WHERE i.AttractionId = a.AttractionId
        ORDER BY i.SortOrder
        FOR JSON PATH
    ) AS imageUrlsJson
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
WHERE a.AttractionId = @AttractionId
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

-- 5.4 List categories (filter chips)
SELECT CategoryId, Name
FROM dbo.Categories
ORDER BY Name;

-- =============================================================================
-- 6. ADMIN CRUD QUERIES (mock CRUD → real SQL)
-- =============================================================================

-- 6.1 Create attraction + images (transaction)
BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @NewId INT;

    INSERT INTO dbo.Attractions (
        CategoryId, Name, Description, OpeningHours, TravelTips,
        DistanceKm, Latitude, Longitude
    )
    VALUES (
        (SELECT CategoryId FROM dbo.Categories WHERE Name = N'Nature'),
        N'Example Place',
        N'Description here.',
        N'Daily 8:00 AM – 5:00 PM',
        N'Bring water.',
        10.00,
        7.290500,
        80.633700
    );

    SET @NewId = SCOPE_IDENTITY();

    INSERT INTO dbo.AttractionImages (AttractionId, ImageUrl, SortOrder)
    VALUES
        (@NewId, N'https://example.com/a.jpg', 0),
        (@NewId, N'https://example.com/b.jpg', 1);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- 6.2 Update attraction fields
UPDATE dbo.Attractions
SET
    Name = N'Updated name',
    Description = N'Updated description',
    OpeningHours = N'Daily 9:00 AM – 4:00 PM',
    TravelTips = N'Updated tip',
    DistanceKm = 12.5,
    Latitude = 7.280000,
    Longitude = 80.620000,
    CategoryId = (SELECT CategoryId FROM dbo.Categories WHERE Name = N'Museum'),
    UpdatedAtUtc = SYSUTCDATETIME()
WHERE AttractionId = @NewId;

-- 6.3 Replace image set for an attraction (edit form: remove all, re-add)
BEGIN TRANSACTION;
BEGIN TRY
    DELETE FROM dbo.AttractionImages WHERE AttractionId = @NewId;

    INSERT INTO dbo.AttractionImages (AttractionId, ImageUrl, SortOrder)
    VALUES
        (@NewId, N'https://example.com/new-1.jpg', 0),
        (@NewId, N'https://example.com/new-2.jpg', 1);

    UPDATE dbo.Attractions
    SET UpdatedAtUtc = SYSUTCDATETIME()
    WHERE AttractionId = @NewId;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- 6.4 Delete attraction (CASCADE removes images)
DELETE FROM dbo.Attractions WHERE AttractionId = @NewId;

-- =============================================================================
-- 7. WHAT NOT TO CREATE (preserves current UI relationships)
-- =============================================================================
/*
  No Itinerary / DayPlan / TouristUser tables for this project scope.
  Guests keep attraction IDs in sessionStorage only.

  Admin login: use ASP.NET Core Identity tables when you build the API, e.g.:
    AspNetUsers, AspNetRoles, AspNetUserRoles, ...
  Seed an Admin role user (demo: manager) via Identity — not a plain-text password column.
*/
