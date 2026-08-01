using ExpenseSplitter.Core.Entities;
using ExpenseSplitter.Core.Enums;

namespace ExpenseSplitter.Core.Services;

public class SplitRequest
{
    public int UserId { get; set; }
    public decimal? Value { get; set; } // exact amount or percentage; null for equal split
}

public static class SplitCalculator
{
    public static List<ExpenseShare> CalculateShares(decimal amount, SplitType splitType, List<SplitRequest> participants)
    {
        if (participants.Count == 0)
            throw new ArgumentException("At least one participant is required.");

        return splitType switch
        {
            SplitType.Equal => CalculateEqualShares(amount, participants),
            SplitType.Exact => CalculateExactShares(amount, participants),
            SplitType.Percentage => CalculatePercentageShares(amount, participants),
            _ => throw new ArgumentOutOfRangeException(nameof(splitType))
        };
    }

    private static List<ExpenseShare> CalculateEqualShares(decimal amount, List<SplitRequest> participants)
    {
        int count = participants.Count;
        decimal baseShare = Math.Floor(amount / count * 100) / 100;
        decimal remainder = amount - baseShare * count;

        var shares = new List<ExpenseShare>();
        for (int i = 0; i < count; i++)
        {
            decimal share = baseShare;
            // distribute leftover cents to the first few participants so totals reconcile exactly
            if (remainder > 0)
            {
                share += 0.01m;
                remainder -= 0.01m;
            }
            shares.Add(new ExpenseShare { UserId = participants[i].UserId, AmountOwed = share });
        }
        return shares;
    }

    private static List<ExpenseShare> CalculateExactShares(decimal amount, List<SplitRequest> participants)
    {
        decimal total = participants.Sum(p => p.Value ?? 0);
        if (total != amount)
            throw new ArgumentException($"Exact split amounts ({total}) must sum to the expense total ({amount}).");

        return participants
            .Select(p => new ExpenseShare { UserId = p.UserId, AmountOwed = p.Value ?? 0 })
            .ToList();
    }

    private static List<ExpenseShare> CalculatePercentageShares(decimal amount, List<SplitRequest> participants)
    {
        decimal totalPercent = participants.Sum(p => p.Value ?? 0);
        if (totalPercent != 100)
            throw new ArgumentException($"Percentages must sum to 100 (got {totalPercent}).");

        var shares = participants
            .Select(p => new ExpenseShare { UserId = p.UserId, AmountOwed = Math.Round(amount * (p.Value ?? 0) / 100, 2) })
            .ToList();

        // fix rounding drift by adjusting the last share
        decimal diff = amount - shares.Sum(s => s.AmountOwed);
        if (diff != 0 && shares.Count > 0)
            shares[^1].AmountOwed += diff;

        return shares;
    }
}
