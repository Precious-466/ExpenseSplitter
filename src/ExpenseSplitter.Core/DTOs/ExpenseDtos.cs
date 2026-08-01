using ExpenseSplitter.Core.Enums;

namespace ExpenseSplitter.Core.DTOs;

public record ExpenseShareRequest(int UserId, decimal? Value);

public record CreateExpenseRequest(
    string Description,
    decimal Amount,
    ExpenseCategory Category,
    SplitType SplitType,
    int PaidByUserId,
    DateTime? IncurredAt,
    List<ExpenseShareRequest> Participants);

public record ExpenseShareDto(int UserId, string UserName, decimal AmountOwed, bool IsSettled);

public record ExpenseDto(
    int Id,
    string Description,
    decimal Amount,
    ExpenseCategory Category,
    SplitType SplitType,
    int PaidByUserId,
    string PaidByName,
    DateTime IncurredAt,
    List<ExpenseShareDto> Shares);
