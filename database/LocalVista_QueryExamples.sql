/*
================================================================================
  LocalVista — Example queries (NOT a seed script)
================================================================================
  Use this file as a reference when building the ASP.NET Core API / EF Core
  repositories. Do not run the write examples blindly against a seeded database
  unless you intend to change or remove data.

  Schema + seed (15 attractions): LocalVista_Schema.sql

  Admin authentication: ASP.NET Core Identity (API phase) — not these tables.
================================================================================
*/

-- USE LocalVista;
-- GO

-- =============================================================================
-- READ — catalogue / Explore cards (primary image = SortOrder 0)
-- =============================================================================

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

-- =============================================================================
-- READ — search by name + optional single category
-- =============================================================================

DECLARE @Search NVARCHAR(200) = N'tea';
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

-- Multi-category filter (UI category chips)
SELECT a.AttractionId, a.Name, c.Name AS Category
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
WHERE c.Name IN (N'Nature', N'Viewpoint')
ORDER BY a.Name;

-- =============================================================================
-- READ — detail page (attraction + ordered gallery)
-- =============================================================================

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

-- Optional JSON shape close to the Angular Attraction model
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

-- Category list (filter chips)
SELECT CategoryId, Name
FROM dbo.Categories
ORDER BY Name;

-- =============================================================================
-- WRITE EXAMPLES — admin CRUD patterns (run only when testing writes)
-- =============================================================================

-- Create attraction + images (transaction)
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

    -- Keep @NewId for the update/delete examples below in the same session,
    -- or set it manually: DECLARE @NewId INT = <id>;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- Update attraction fields
-- DECLARE @NewId INT = <id>;
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

-- Replace image set (admin edit form pattern)
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

-- Delete attraction (CASCADE removes images)
-- DELETE FROM dbo.Attractions WHERE AttractionId = @NewId;
