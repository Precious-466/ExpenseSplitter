namespace ExpenseSplitter.Core.DTOs;

public record CreateGroupRequest(string Name, string? Description, List<string> MemberEmails);
public record GroupSummaryDto(int Id, string Name, string? Description, int MemberCount, decimal YourBalance);
public record GroupMemberDto(int UserId, string Name, string Email);
public record GroupDetailDto(int Id, string Name, string? Description, List<GroupMemberDto> Members);
public record AddMemberRequest(string Email);
