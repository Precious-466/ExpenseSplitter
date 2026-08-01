using ExpenseSplitter.Core.DTOs;
using ExpenseSplitter.Core.Entities;
using ExpenseSplitter.Core.Services;
using ExpenseSplitter.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseSplitter.Api.Controllers;

[Route("api/[controller]")]
public class GroupsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public GroupsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<GroupSummaryDto>>> GetMyGroups()
    {
        var groups = await _db.Groups
            .Where(g => g.Members.Any(m => m.UserId == CurrentUserId))
            .Include(g => g.Members)
            .Include(g => g.Expenses).ThenInclude(e => e.Shares)
            .ToListAsync();

        var result = groups.Select(g =>
        {
            decimal balance = ComputeUserBalance(g, CurrentUserId);
            return new GroupSummaryDto(g.Id, g.Name, g.Description, g.Members.Count, balance);
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GroupDetailDto>> GetGroup(int id)
    {
        var group = await _db.Groups
            .Include(g => g.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group is null) return NotFound();
        if (!group.Members.Any(m => m.UserId == CurrentUserId)) return Forbid();

        var dto = new GroupDetailDto(
            group.Id,
            group.Name,
            group.Description,
            group.Members.Select(m => new GroupMemberDto(m.UserId, m.User.Name, m.User.Email)).ToList());

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<GroupDetailDto>> CreateGroup(CreateGroupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Group name is required.");

        var group = new Group
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            CreatedByUserId = CurrentUserId
        };
        group.Members.Add(new GroupMember { UserId = CurrentUserId });

        foreach (var email in request.MemberEmails.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user is null || user.Id == CurrentUserId) continue;
            group.Members.Add(new GroupMember { UserId = user.Id });
        }

        _db.Groups.Add(group);
        await _db.SaveChangesAsync();

        return await GetGroup(group.Id);
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(int id, AddMemberRequest request)
    {
        var group = await _db.Groups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == id);
        if (group is null) return NotFound();
        if (!group.Members.Any(m => m.UserId == CurrentUserId)) return Forbid();

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user is null) return NotFound("No user found with that email.");

        if (group.Members.Any(m => m.UserId == user.Id))
            return Conflict("User is already a member of this group.");

        group.Members.Add(new GroupMember { GroupId = id, UserId = user.Id });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/balances")]
    public async Task<ActionResult<GroupBalancesDto>> GetBalances(int id)
    {
        var group = await _db.Groups
            .Include(g => g.Members).ThenInclude(m => m.User)
            .Include(g => g.Expenses).ThenInclude(e => e.Shares).ThenInclude(s => s.User)
            .Include(g => g.Expenses).ThenInclude(e => e.PaidBy)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group is null) return NotFound();
        if (!group.Members.Any(m => m.UserId == CurrentUserId)) return Forbid();

        var settlements = await _db.Settlements.Where(s => s.GroupId == id).ToListAsync();

        var netBalances = group.Members.ToDictionary(m => m.UserId, m => 0m);

        foreach (var expense in group.Expenses)
        {
            netBalances[expense.PaidByUserId] = netBalances.GetValueOrDefault(expense.PaidByUserId) + expense.Amount;
            foreach (var share in expense.Shares)
                netBalances[share.UserId] = netBalances.GetValueOrDefault(share.UserId) - share.AmountOwed;
        }

        foreach (var settlement in settlements)
        {
            netBalances[settlement.FromUserId] = netBalances.GetValueOrDefault(settlement.FromUserId) + settlement.Amount;
            netBalances[settlement.ToUserId] = netBalances.GetValueOrDefault(settlement.ToUserId) - settlement.Amount;
        }

        var nameLookup = group.Members.ToDictionary(m => m.UserId, m => m.User.Name);

        var balanceDtos = netBalances
            .Select(b => new MemberBalanceDto(b.Key, nameLookup[b.Key], Math.Round(b.Value, 2)))
            .ToList();

        var transactions = DebtSimplifier.Simplify(netBalances)
            .Select(t => new TransactionDto(t.FromUserId, nameLookup[t.FromUserId], t.ToUserId, nameLookup[t.ToUserId], t.Amount))
            .ToList();

        return Ok(new GroupBalancesDto(balanceDtos, transactions));
    }

    [HttpPost("{id}/settlements")]
    public async Task<IActionResult> RecordSettlement(int id, RecordSettlementRequest request)
    {
        var group = await _db.Groups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == id);
        if (group is null) return NotFound();
        if (!group.Members.Any(m => m.UserId == CurrentUserId)) return Forbid();
        if (request.Amount <= 0) return BadRequest("Amount must be positive.");

        _db.Settlements.Add(new Settlement
        {
            GroupId = id,
            FromUserId = request.FromUserId,
            ToUserId = request.ToUserId,
            Amount = request.Amount
        });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static decimal ComputeUserBalance(Group group, int userId)
    {
        decimal balance = 0;
        foreach (var expense in group.Expenses)
        {
            if (expense.PaidByUserId == userId) balance += expense.Amount;
            var share = expense.Shares.FirstOrDefault(s => s.UserId == userId);
            if (share is not null) balance -= share.AmountOwed;
        }
        return Math.Round(balance, 2);
    }
}
