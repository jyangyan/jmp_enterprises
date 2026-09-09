using System.Collections.Generic;
using System.Threading.Tasks;
using JMP.Enterprises.Api.Dtos;

namespace JMP.Enterprises.Api.Services;

public interface IReceiptService
{
    Task<ReceiptDto> CreateReceiptAsync(CreateReceiptDto dto);
    Task<ReceiptDto?> GetReceiptByIdAsync(int id);
    Task<IEnumerable<ReceiptDto>> GetReceiptsAsync(int? reservationId = null, int? paymentId = null);
    Task<IEnumerable<ReceiptDto>> GetReservationReceiptsAsync(int reservationId);
    Task<ReceiptDto?> GetPaymentReceiptAsync(int paymentId);
    Task<ReceiptDto?> VoidReceiptAsync(int id);
    Task<ReceiptDto> GenerateCheckoutReceiptAsync(CheckoutSettlementDto dto);
}
