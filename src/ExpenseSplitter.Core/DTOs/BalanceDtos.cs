namespace ExpenseSplitter.Core.DTOs;

public record TransactionDto(int FromUserId, string FromUserName, int ToUserId, string ToUserName, decimal Amount);
public record MemberBalanceDto(int UserId, string UserName, decimal NetBalance);
public record GroupBalancesDto(List<MemberBalanceDto> Balances, List<TransactionDto> SuggestedSettlements);
public record RecordSettlementRequest(int FromUserId, int ToUserId, decimal Amount);
public record CategoryBreakdownDto(string Category, decimal Total);
public record MonthlyTrendDto(string Month, decimal Total);
