using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== 1. ADD SERVICES =====

// Add controllers
builder.Services.AddControllers();

// Add Swagger for API testing (accessible at /swagger)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() 
    { 
        Title = "JMP Enterprises API", 
        Version = "v1",
        Description = "Rental Management API for JMP Enterprises"
    });
});

// Add Entity Framework Core with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Register Services for dependency injection
builder.Services.AddScoped<PropertyService>();
builder.Services.AddScoped<GuestService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IFinancialService, FinancialService>();
builder.Services.AddScoped<IReceiptService, ReceiptService>();
builder.Services.AddScoped<IRentalAgreementService, RentalAgreementService>();
builder.Services.AddScoped<IStatementOfAccountService, StatementOfAccountService>();
builder.Services.AddScoped<IReportService, ReportService>();

// Configure CORS — allow the React frontend (localhost:5173) to call our API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

// ===== 2. CONFIGURE MIDDLEWARE =====

// Enable Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "JMP Enterprises API v1");
    });
}

app.UseHttpsRedirection();

// Enable CORS (must be before MapControllers)
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
