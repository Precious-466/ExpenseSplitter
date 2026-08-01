FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ExpenseSplitter.sln .
COPY src/ExpenseSplitter.Api/ExpenseSplitter.Api.csproj src/ExpenseSplitter.Api/
COPY src/ExpenseSplitter.Core/ExpenseSplitter.Core.csproj src/ExpenseSplitter.Core/
COPY src/ExpenseSplitter.Infrastructure/ExpenseSplitter.Infrastructure.csproj src/ExpenseSplitter.Infrastructure/
COPY tests/ExpenseSplitter.Tests/ExpenseSplitter.Tests.csproj tests/ExpenseSplitter.Tests/
RUN dotnet restore ExpenseSplitter.sln

COPY src/ src/
RUN dotnet publish src/ExpenseSplitter.Api/ExpenseSplitter.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:5299
EXPOSE 5299

ENTRYPOINT ["dotnet", "ExpenseSplitter.Api.dll"]
