using ExpenseSplitter.Core.Services;
using Xunit;

namespace ExpenseSplitter.Tests;

public class DebtSimplifierTests
{
    [Fact]
    public void Simplify_TwoPersonDebt_ProducesSingleTransaction()
    {
        var balances = new Dictionary<int, decimal> { { 1, 500m }, { 2, -500m } };

        var result = DebtSimplifier.Simplify(balances);

        Assert.Single(result);
        Assert.Equal(2, result[0].FromUserId);
        Assert.Equal(1, result[0].ToUserId);
        Assert.Equal(500m, result[0].Amount);
    }

    [Fact]
    public void Simplify_AllSettled_ProducesNoTransactions()
    {
        var balances = new Dictionary<int, decimal> { { 1, 0m }, { 2, 0m } };

        var result = DebtSimplifier.Simplify(balances);

        Assert.Empty(result);
    }

    [Fact]
    public void Simplify_ChainOfDebts_MinimizesTransactionCount()
    {
        // A owes B 10, B owes C 10 -> net: A owes C 10 (1 transaction instead of 2)
        var balances = new Dictionary<int, decimal> { { 1, -10m }, { 2, 0m }, { 3, 10m } };

        var result = DebtSimplifier.Simplify(balances);

        Assert.Single(result);
        Assert.Equal(1, result[0].FromUserId);
        Assert.Equal(3, result[0].ToUserId);
        Assert.Equal(10m, result[0].Amount);
    }

    [Fact]
    public void Simplify_ThreeWayGroup_SettlesWithMinimumTransactions()
    {
        // A paid 300 total for a 3-way equal split (100 each): A is owed 200, others owe 100 each
        var balances = new Dictionary<int, decimal> { { 1, 200m }, { 2, -100m }, { 3, -100m } };

        var result = DebtSimplifier.Simplify(balances);

        Assert.Equal(2, result.Count);
        Assert.Equal(200m, result.Sum(t => t.Amount));
        Assert.All(result, t => Assert.Equal(1, t.ToUserId));
    }

    [Fact]
    public void Simplify_TotalTransferredEqualsTotalOwed()
    {
        var balances = new Dictionary<int, decimal>
        {
            { 1, 150.50m }, { 2, -75.25m }, { 3, -50.25m }, { 4, -25m }
        };

        var result = DebtSimplifier.Simplify(balances);

        decimal totalFromCreditors = balances.Where(b => b.Value > 0).Sum(b => b.Value);
        decimal totalTransactions = result.Sum(t => t.Amount);
        Assert.Equal(totalFromCreditors, totalTransactions);
    }

    [Fact]
    public void Simplify_EmptyBalances_ProducesNoTransactions()
    {
        var result = DebtSimplifier.Simplify(new Dictionary<int, decimal>());
        Assert.Empty(result);
    }
}
