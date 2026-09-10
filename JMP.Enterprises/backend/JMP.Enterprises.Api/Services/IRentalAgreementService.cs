using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public interface IRentalAgreementService
{
    Task<RentalAgreementDto?> GetByIdAsync(int id);
    Task<RentalAgreementDto?> GetByReservationIdAsync(int reservationId);
    Task<RentalAgreementDto> CreateDraftAsync(int reservationId, CreateRentalAgreementDto? customDto = null);
    Task<RentalAgreementDto> UpdateDraftAsync(int id, UpdateRentalAgreementDto dto);
    Task<RentalAgreementDto> FinalizeAsync(int id);
    Task<RentalAgreementDto> CancelAsync(int id);
}
