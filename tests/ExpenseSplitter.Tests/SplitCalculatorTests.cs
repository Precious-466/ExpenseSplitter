using ExpenseSplitter.Core.Enums;
using ExpenseSplitter.Core.Services;
using Xunit;

namespace ExpenseSplitter.Tests;

public class SplitCalculatorTests
{
    [Fact]
    public void EqualSplit_DividesEvenlyWhenDivisible()
    {
        var participants = new List<SplitRequest>
        {
            new() { UserId = 1 }, new() { UserId = 2 }
        };

        var shares = SplitCalculator.CalculateShares(100m, SplitType.Equal, participants);

        Assert.Equal(2, shares.Count);
        Assert.All(shares, s => Assert.Equal(50m, s.AmountOwed));
    }

    [Fact]
    public void EqualSplit_DistributesRemainderCentsWhenNotDivisible()
    {
        var participants = new List<SplitRequest>
        {
            new() { UserId = 1 }, new() { UserId = 2 }, new() { UserId = 3 }
        };

        var shares = SplitCalculator.CalculateShares(10m, SplitType.Equal, participants);

        Assert.Equal(3, shares.Count);
        Assert.Equal(10m, shares.Sum(s => s.AmountOwed));
        // 10 / 3 = 3.33.. so shares should be 3.34, 3.33, 3.33 (leftover cents go to first participants)
        Assert.Equal(3.34m, shares[0].AmountOwed);
        Assert.Equal(3.33m, shares[1].AmountOwed);
        Assert.Equal(3.33m, shares[2].AmountOwed);
    }

    [Fact]
    public void ExactSplit_SucceedsWhenAmountsSumToTotal()
    {
        var participants = new List<SplitRequest>
        {
            new() { UserId = 1, Value = 30m }, new() { UserId = 2, Value = 70m }
        };

        var shares = SplitCalculator.CalculateShares(100m, SplitType.Exact, participants);

        Assert.Equal(30m, shares.First(s => s.UserId == 1).AmountOwed);
        Assert.Equal(70m, shares.First(s => s.UserId == 2).AmountOwed);
    }

    [Fact]
    public void ExactSplit_ThrowsWhenAmountsDoNotSumToTotal()
    {
        var participants = new List<SplitRequest>
        {
            new() { UserId = 1, Value = 30m }, new() { UserId = 2, Value = 50m }
        };

        Assert.Throws<ArgumentException>(() => SplitCalculator.CalculateShares(100m, SplitType.Exact, participants));
    }

    [Fact]
    public void PercentageSplit_SucceedsAndReconcilesRoundingDrift()
    {
        var participants = new List<SplitRequest>
        {
            new() { UserId = 1, Value = 33.33m },
            new() { UserId = 2, Value = 33.33m },
            new() { UserId = 3, Value = 33.34m }
        };

        var shares = SplitCalculator.CalculateShares(10m, SplitType.Percentage, participants);

        Assert.Equal(10m, shares.Sum(s => s.AmountOwed));
    }

    [Fact]
    public void PercentageSplit_ThrowsWhenPercentagesDoNotSumTo100()
    {
        var participants = new List<SplitRequest>
        {
            new() { UserId = 1, Value = 40m }, new() { UserId = 2, Value = 40m }
        };

        Assert.Throws<ArgumentException>(() => SplitCalculator.CalculateShares(100m, SplitType.Percentage, participants));
    }

    [Fact]
    public void CalculateShares_ThrowsWhenNoParticipants()
    {
        Assert.Throws<ArgumentException>(() => SplitCalculator.CalculateShares(100m, SplitType.Equal, new List<SplitRequest>()));
    }
}
