using ExpenseSplitter.Core.Enums;

namespace ExpenseSplitter.Core.Entities;

public class Expense
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public string Description { get; set; } = default!;
    public decimal Amount { get; set; }
    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;
    public SplitType SplitType { get; set; } = SplitType.Equal;
    public int PaidByUserId { get; set; }
    public DateTime IncurredAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Group Group { get; set; } = default!;
    public User PaidBy { get; set; } = default!;
    public ICollection<ExpenseShare> Shares { get; set; } = new List<ExpenseShare>();
}
