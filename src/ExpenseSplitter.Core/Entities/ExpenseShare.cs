namespace ExpenseSplitter.Core.Entities;

public class ExpenseShare
{
    public int Id { get; set; }
    public int ExpenseId { get; set; }
    public int UserId { get; set; }
    public decimal AmountOwed { get; set; }
    public bool IsSettled { get; set; }

    public Expense Expense { get; set; } = default!;
    public User User { get; set; } = default!;
}
