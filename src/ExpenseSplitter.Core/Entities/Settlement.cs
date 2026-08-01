namespace ExpenseSplitter.Core.Entities;

public class Settlement
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int FromUserId { get; set; }
    public int ToUserId { get; set; }
    public decimal Amount { get; set; }
    public DateTime SettledAt { get; set; } = DateTime.UtcNow;

    public Group Group { get; set; } = default!;
    public User FromUser { get; set; } = default!;
    public User ToUser { get; set; } = default!;
}
