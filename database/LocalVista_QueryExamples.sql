/*
================================================================================
  LocalVista — Example queries (NOT a seed script)
================================================================================
  Reference for ASP.NET Core API / EF Core repositories. Do not run the write
  examples blindly against a seeded database unless you intend to change data.

  Schema + seed: LocalVista_Schema.sql

  API shapes
  ----------
  List  → AttractionSummaryDto  (shortDescription; no contact / long description)
  Detail → AttractionDetailDto  (full description + contact + travel tips)
  Write → AttractionWriteDto    (admin create/update; includes contact fields)

  Admin authentication: ASP.NET Core Identity — not these catalogue tables.
================================================================================
*/

-- USE LocalVista;
-- GO

-- =============================================================================
-- READ — Explore / plan cards (summary = GET /api/attractions)
-- =============================================================================

SELECT
    a.AttractionId      AS Id,
    a.Name,
    c.Name              AS Category,
    a.ShortDescription,
    a.OpeningHours,
    a.BestVisitMonths,
    a.DistanceKm,
    a.Latitude,
    a.Longitude,
    img.ImageUrl        AS PrimaryImageUrl
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
-- READ — search (name, short description, tips, hours, category)
-- =============================================================================

DECLARE @Search NVARCHAR(200) = N'tea';
DECLARE @CategoryName NVARCHAR(100) = NULL; -- e.g. N'Nature'

SELECT
    a.AttractionId AS Id,
    a.Name,
    c.Name AS Category,
    a.ShortDescription,
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
WHERE (
        @Search IS NULL OR @Search = N''
        OR a.Name LIKE N'%' + @Search + N'%'
        OR a.ShortDescription LIKE N'%' + @Search + N'%'
        OR a.Description LIKE N'%' + @Search + N'%'
        OR (a.TravelTips IS NOT NULL AND a.TravelTips LIKE N'%' + @Search + N'%')
        OR (a.OpeningHours IS NOT NULL AND a.OpeningHours LIKE N'%' + @Search + N'%')
        OR c.Name LIKE N'%' + @Search + N'%'
      )
  AND (@CategoryName IS NULL OR c.Name = @CategoryName)
ORDER BY a.Name;

-- Multi-category filter (UI category chips)
SELECT a.AttractionId, a.Name, c.Name AS Category, a.ShortDescription
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
WHERE c.Name IN (N'Nature', N'Viewpoint')
ORDER BY a.Name;

-- Seasonal pick (BestVisitMonths stores comma-separated month numbers, e.g. N'1,2,12')
DECLARE @CurrentMonth INT = MONTH(SYSUTCDATETIME());

SELECT TOP (1)
    a.AttractionId,
    a.Name,
    a.ShortDescription,
    a.BestVisitMonths
FROM dbo.Attractions AS a
WHERE a.BestVisitMonths <> N''
  AND (
        N',' + a.BestVisitMonths + N',' LIKE N'%,' + CAST(@CurrentMonth AS NVARCHAR(2)) + N',%'
      )
ORDER BY a.Name;

-- =============================================================================
-- READ — detail (GET /api/attractions/{id}) including contact
-- =============================================================================

DECLARE @AttractionId INT = 12; -- e.g. Ambuluwawa (seeded with contact)

SELECT
    a.AttractionId AS Id,
    a.Name,
    c.Name AS Category,
    a.ShortDescription,
    a.Description,
    a.OpeningHours,
    a.TravelTips,
    a.BestVisitMonths,
    a.ContactPhone,
    a.ContactEmail,
    a.WebsiteUrl,
    a.Address,
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

-- Optional JSON close to AttractionDetailDto
SELECT
    a.AttractionId AS id,
    a.Name AS name,
    c.Name AS category,
    a.ShortDescription AS shortDescription,
    a.Description AS description,
    a.OpeningHours AS openingHours,
    a.TravelTips AS travelTips,
    a.BestVisitMonths AS bestVisitMonths,
    a.ContactPhone AS contactPhone,
    a.ContactEmail AS contactEmail,
    a.WebsiteUrl AS websiteUrl,
    a.Address AS address,
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
-- READ — visitor feedback (detail ratings + admin review list)
-- =============================================================================

-- Summary for one attraction
SELECT
    CAST(AVG(CAST(f.Rating AS DECIMAL(4,2))) AS DECIMAL(4,2)) AS AverageRating,
    COUNT(*) AS ReviewCount
FROM dbo.AttractionFeedback AS f
WHERE f.AttractionId = @AttractionId;

SELECT
    f.AttractionFeedbackId AS Id,
    f.DisplayName,
    f.Rating,
    f.Comment,
    f.CreatedAtUtc
FROM dbo.AttractionFeedback AS f
WHERE f.AttractionId = @AttractionId
ORDER BY f.CreatedAtUtc DESC;

-- Admin: all feedback grouped by attraction
SELECT
    a.AttractionId,
    a.Name AS AttractionName,
    c.Name AS Category,
    CAST(AVG(CAST(f.Rating AS DECIMAL(4,2))) AS DECIMAL(4,2)) AS AverageRating,
    COUNT(*) AS ReviewCount
FROM dbo.Attractions AS a
INNER JOIN dbo.Categories AS c ON c.CategoryId = a.CategoryId
LEFT JOIN dbo.AttractionFeedback AS f ON f.AttractionId = a.AttractionId
GROUP BY a.AttractionId, a.Name, c.Name
ORDER BY ReviewCount DESC, a.Name;

-- =============================================================================
-- WRITE EXAMPLES — admin CRUD (run only when testing writes)
-- =============================================================================

-- Create attraction + images (includes short description + contact)
BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @NewId INT;

    INSERT INTO dbo.Attractions (
        CategoryId, Name, ShortDescription, Description, OpeningHours, TravelTips,
        BestVisitMonths, ContactPhone, ContactEmail, WebsiteUrl, Address,
        DistanceKm, Latitude, Longitude
    )
    VALUES (
        (SELECT CategoryId FROM dbo.Categories WHERE Name = N'Nature'),
        N'Example Place',
        N'Short card summary for Explore and My plan.',
        N'Full description shown on plan-stop Open details.',
        N'Daily 8:00 AM – 5:00 PM',
        N'Bring water.',
        N'1,2,12',
        N'+94 81 000 0000',
        N'info@example.local',
        N'https://example.com',
        N'Example Road, Kandy',
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

-- Update attraction fields (admin edit form)
-- DECLARE @NewId INT = <id>;
UPDATE dbo.Attractions
SET
    Name = N'Updated name',
    ShortDescription = N'Updated short summary for cards.',
    Description = N'Updated full description for plan-stop detail.',
    OpeningHours = N'Daily 9:00 AM – 4:00 PM',
    TravelTips = N'Updated tip',
    BestVisitMonths = N'6,7,8',
    ContactPhone = N'+94 81 111 1111',
    ContactEmail = N'contact@example.local',
    WebsiteUrl = N'https://example.com/updated',
    Address = N'Updated address, Kandy',
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

-- Submit visitor feedback (plan-stop rating form)
-- INSERT INTO dbo.AttractionFeedback (AttractionId, DisplayName, Rating, Comment)
-- VALUES (@AttractionId, N'Local visitor', 5, N'Great stop on our day plan.');

-- Delete attraction (CASCADE removes images + feedback)
-- DELETE FROM dbo.Attractions WHERE AttractionId = @NewId;
