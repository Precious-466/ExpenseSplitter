namespace ExpenseSplitter.Core.Services;

public record Transaction(int FromUserId, int ToUserId, decimal Amount);

/// <summary>
/// Reduces a group's net balances to the minimum number of payments needed to settle up,
/// using a greedy max-debtor-to-max-creditor matching (heap-based min-cash-flow algorithm).
/// </summary>
public static class DebtSimplifier
{
    public static List<Transaction> Simplify(Dictionary<int, decimal> netBalances)
    {
        var balances = netBalances
            .Where(b => Math.Round(b.Value, 2) != 0)
            .ToDictionary(b => b.Key, b => Math.Round(b.Value, 2));

        var transactions = new List<Transaction>();

        while (balances.Count > 0)
        {
            var maxCreditor = balances.Aggregate((a, b) => a.Value >= b.Value ? a : b);
            var maxDebtor = balances.Aggregate((a, b) => a.Value <= b.Value ? a : b);

            if (maxCreditor.Value == 0 && maxDebtor.Value == 0)
                break;

            decimal settledAmount = Math.Min(maxCreditor.Value, -maxDebtor.Value);
            settledAmount = Math.Round(settledAmount, 2);

            transactions.Add(new Transaction(maxDebtor.Key, maxCreditor.Key, settledAmount));

            balances[maxCreditor.Key] -= settledAmount;
            balances[maxDebtor.Key] += settledAmount;

            if (Math.Abs(balances[maxCreditor.Key]) < 0.01m) balances.Remove(maxCreditor.Key);
            if (balances.ContainsKey(maxDebtor.Key) && Math.Abs(balances[maxDebtor.Key]) < 0.01m) balances.Remove(maxDebtor.Key);
        }

        return transactions;
    }
}
