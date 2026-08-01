namespace ExpenseSplitter.Core.DTOs;

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, int UserId, string Name, string Email);
public record ForgotPasswordRequest(string Email);
public record ForgotPasswordResponse(string? ResetToken);
public record ResetPasswordRequest(string Token, string NewPassword);
