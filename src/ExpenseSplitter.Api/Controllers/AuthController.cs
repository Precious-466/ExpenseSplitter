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

    public AuthController(AppDbContext db, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
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
}
