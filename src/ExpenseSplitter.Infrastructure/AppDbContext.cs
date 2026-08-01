using ExpenseSplitter.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExpenseSplitter.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ExpenseShare> ExpenseShares => Set<ExpenseShare>();
    public DbSet<Settlement> Settlements => Set<Settlement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Group>()
            .HasOne(g => g.CreatedBy)
            .WithMany()
            .HasForeignKey(g => g.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GroupMember>()
            .HasIndex(gm => new { gm.GroupId, gm.UserId })
            .IsUnique();

        modelBuilder.Entity<GroupMember>()
            .HasOne(gm => gm.Group)
            .WithMany(g => g.Members)
            .HasForeignKey(gm => gm.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GroupMember>()
            .HasOne(gm => gm.User)
            .WithMany(u => u.GroupMemberships)
            .HasForeignKey(gm => gm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Group)
            .WithMany(g => g.Expenses)
            .HasForeignKey(e => e.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.PaidBy)
            .WithMany(u => u.ExpensesPaid)
            .HasForeignKey(e => e.PaidByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ExpenseShare>()
            .HasOne(es => es.Expense)
            .WithMany(e => e.Shares)
            .HasForeignKey(es => es.ExpenseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ExpenseShare>()
            .HasOne(es => es.User)
            .WithMany()
            .HasForeignKey(es => es.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Expense>()
            .Property(e => e.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ExpenseShare>()
            .Property(es => es.AmountOwed)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Settlement>()
            .Property(s => s.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Settlement>()
            .HasOne(s => s.FromUser)
            .WithMany()
            .HasForeignKey(s => s.FromUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Settlement>()
            .HasOne(s => s.ToUser)
            .WithMany()
            .HasForeignKey(s => s.ToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Settlement>()
            .HasOne(s => s.Group)
            .WithMany()
            .HasForeignKey(s => s.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
