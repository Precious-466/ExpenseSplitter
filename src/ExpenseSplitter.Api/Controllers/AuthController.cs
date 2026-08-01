using ExpenseSplitter.Core.DTOs;
using ExpenseSplitter.Core.Entities;
using ExpenseSplitter.Core.Interfaces;
using ExpenseSplitter.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseSplitter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IWebHostEnvironment _env;

    public AuthController(AppDbContext db, IPasswordHasher passwordHasher, ITokenService tokenService, IWebHostEnvironment env)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name, email, and password are required.");

        if (request.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters.");

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail))
            return Conflict("A user with this email already exists.");

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Name, user.Email));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password.");

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Name, user.Email));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ForgotPasswordResponse>> ForgotPassword(ForgotPasswordRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        // Always return 200 with no token for unknown emails, so this endpoint can't be used to enumerate accounts.
        if (user is null)
            return Ok(new ForgotPasswordResponse(null));

        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        _db.PasswordResetTokens.Add(resetToken);
        await _db.SaveChangesAsync();

        // No email provider is configured, so in development the token is handed back directly
        // instead of being emailed, so the reset flow is usable without SMTP setup.
        var exposedToken = _env.IsDevelopment() ? resetToken.Token : null;
        return Ok(new ForgotPasswordResponse(exposedToken));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return BadRequest("Password must be at least 6 characters.");

        var resetToken = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (resetToken is null || resetToken.Used || resetToken.ExpiresAt < DateTime.UtcNow)
            return BadRequest("This reset link is invalid or has expired.");

        resetToken.User.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        resetToken.Used = true;
        await _db.SaveChangesAsync();

        return Ok();
    }
}
