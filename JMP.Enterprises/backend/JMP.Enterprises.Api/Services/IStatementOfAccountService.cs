using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public interface IStatementOfAccountService
{
    Task<IEnumerable<StatementOfAccountResponseDto>> GetAllAsync(string? status = null);
    Task<StatementOfAccountResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<StatementOfAccountResponseDto>> GetByReservationIdAsync(int reservationId);
    Task<IEnumerable<StatementOfAccountResponseDto>> GetByAgreementIdAsync(int agreementId);
    Task<decimal> GetLatestMeterReadingForPropertyAsync(int propertyId);
    Task<StatementOfAccountResponseDto> CreateAsync(CreateStatementOfAccountDto dto);
    Task<StatementOfAccountResponseDto> UpdateAsync(int id, UpdateStatementOfAccountDto dto);
    Task<StatementOfAccountResponseDto> RecordPaymentAsync(int id, RecordSoaPaymentDto dto);
    Task<bool> DeleteAsync(int id);
}
