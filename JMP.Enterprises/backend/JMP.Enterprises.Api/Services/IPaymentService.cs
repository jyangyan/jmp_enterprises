using System.Collections.Generic;
using System.Threading.Tasks;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync(int? propertyId = null, int? reservationId = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<PaymentDto?> GetPaymentByIdAsync(int id);
    Task<IEnumerable<PaymentDto>> GetPaymentsByReservationIdAsync(int reservationId);
    Task<ReservationPaymentSummaryDto?> GetReservationPaymentSummaryAsync(int reservationId);
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto);
    Task<PaymentDto?> UpdatePaymentAsync(int id, UpdatePaymentDto dto);
    Task<bool> DeletePaymentAsync(int id);
}
