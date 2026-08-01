using ExpenseSplitter.Core.Entities;

namespace ExpenseSplitter.Core.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
