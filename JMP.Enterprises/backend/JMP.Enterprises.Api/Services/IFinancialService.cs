using System;
using System.Threading.Tasks;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public interface IFinancialService
{
    Task<FinancialSummaryDto> GetFinancialSummaryAsync(int? propertyId = null, DateTime? startDate = null, DateTime? endDate = null);
}
