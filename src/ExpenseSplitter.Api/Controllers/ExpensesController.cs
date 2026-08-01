using ExpenseSplitter.Core.DTOs;
using ExpenseSplitter.Core.Entities;
using ExpenseSplitter.Core.Services;
using ExpenseSplitter.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseSplitter.Api.Controllers;

[Route("api/groups/{groupId}/[controller]")]
public class ExpensesController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public ExpensesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExpenseDto>>> GetExpenses(int groupId)
    {
        if (!await IsMember(groupId)) return Forbid();

        var expenses = await _db.Expenses
            .Where(e => e.GroupId == groupId)
            .Include(e => e.PaidBy)
            .Include(e => e.Shares).ThenInclude(s => s.User)
            .OrderByDescending(e => e.IncurredAt)
            .ToListAsync();

        return Ok(expenses.Select(ToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense(int groupId, CreateExpenseRequest request)
    {
        var group = await _db.Groups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == groupId);
        if (group is null) return NotFound();
        if (!group.Members.Any(m => m.UserId == CurrentUserId)) return Forbid();

        if (request.Amount <= 0) return BadRequest("Amount must be positive.");
        if (string.IsNullOrWhiteSpace(request.Description)) return BadRequest("Description is required.");

        var memberIds = group.Members.Select(m => m.UserId).ToHashSet();
        if (!memberIds.Contains(request.PaidByUserId))
            return BadRequest("Payer must be a member of the group.");
        if (request.Participants.Any(p => !memberIds.Contains(p.UserId)))
            return BadRequest("All participants must be members of the group.");

        List<ExpenseShare> shares;
        try
        {
            var splitRequests = request.Participants
                .Select(p => new SplitRequest { UserId = p.UserId, Value = p.Value })
                .ToList();
            shares = SplitCalculator.CalculateShares(request.Amount, request.SplitType, splitRequests);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }

        var expense = new Expense
        {
            GroupId = groupId,
            Description = request.Description.Trim(),
            Amount = request.Amount,
            Category = request.Category,
            SplitType = request.SplitType,
            PaidByUserId = request.PaidByUserId,
            IncurredAt = request.IncurredAt ?? DateTime.UtcNow,
            Shares = shares
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();

        await _db.Entry(expense).Reference(e => e.PaidBy).LoadAsync();
        foreach (var share in expense.Shares)
            await _db.Entry(share).Reference(s => s.User).LoadAsync();

        return Ok(ToDto(expense));
    }

    [HttpDelete("{expenseId}")]
    public async Task<IActionResult> DeleteExpense(int groupId, int expenseId)
    {
        if (!await IsMember(groupId)) return Forbid();

        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == expenseId && e.GroupId == groupId);
        if (expense is null) return NotFound();

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("~/api/groups/{groupId}/analytics/by-category")]
    public async Task<ActionResult<List<CategoryBreakdownDto>>> GetCategoryBreakdown(int groupId)
    {
        if (!await IsMember(groupId)) return Forbid();

        var breakdown = await _db.Expenses
            .Where(e => e.GroupId == groupId)
            .GroupBy(e => e.Category)
            .Select(g => new CategoryBreakdownDto(g.Key.ToString(), g.Sum(e => e.Amount)))
            .ToListAsync();

        return Ok(breakdown);
    }

    [HttpGet("~/api/groups/{groupId}/analytics/monthly")]
    public async Task<ActionResult<List<MonthlyTrendDto>>> GetMonthlyTrend(int groupId)
    {
        if (!await IsMember(groupId)) return Forbid();

        var expenses = await _db.Expenses.Where(e => e.GroupId == groupId).ToListAsync();

        var trend = expenses
            .GroupBy(e => new { e.IncurredAt.Year, e.IncurredAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyTrendDto($"{g.Key.Year}-{g.Key.Month:D2}", g.Sum(e => e.Amount)))
            .ToList();

        return Ok(trend);
    }

    private async Task<bool> IsMember(int groupId) =>
        await _db.GroupMembers.AnyAsync(m => m.GroupId == groupId && m.UserId == CurrentUserId);

    private static ExpenseDto ToDto(Expense e) => new(
        e.Id,
        e.Description,
        e.Amount,
        e.Category,
        e.SplitType,
        e.PaidByUserId,
        e.PaidBy.Name,
        e.IncurredAt,
        e.Shares.Select(s => new ExpenseShareDto(s.UserId, s.User.Name, s.AmountOwed, s.IsSettled)).ToList());
}
