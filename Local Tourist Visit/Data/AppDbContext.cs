using Local_Tourist_Visit.Models;
using Microsoft.EntityFrameworkCore;

namespace Local_Tourist_Visit.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Attraction> Attractions => Set<Attraction>();
    public DbSet<AdministratorAccount> AdministratorAccounts => Set<AdministratorAccount>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(50).IsRequired();
            entity.HasIndex(c => c.Name).IsUnique();
            entity.HasData(SeedData.Categories);
        });

        modelBuilder.Entity<Attraction>(entity =>
        {
            entity.Property(a => a.Name).HasMaxLength(150).IsRequired();
            entity.Property(a => a.Description).HasMaxLength(2000).IsRequired();
            entity.Property(a => a.OpeningHours).HasMaxLength(200);
            entity.Property(a => a.TravelTips).HasMaxLength(1000);
            entity.Property(a => a.ImageUrl).HasMaxLength(500);
            entity.Property(a => a.DistanceFromKandyKm).HasPrecision(4, 1);
            entity.HasIndex(a => a.Name);

            // A category that still classifies attractions cannot be deleted.
            entity.HasOne(a => a.Category)
                .WithMany(c => c.Attractions)
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AdministratorAccount>(entity =>
        {
            entity.Property(a => a.Username).HasMaxLength(50).IsRequired();
            entity.Property(a => a.PasswordHash).IsRequired();
            entity.HasIndex(a => a.Username).IsUnique();
        });
    }
}
