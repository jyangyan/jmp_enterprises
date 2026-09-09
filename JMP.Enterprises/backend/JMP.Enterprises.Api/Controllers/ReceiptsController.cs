using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.Dtos;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptsController : ControllerBase
{
    private readonly IReceiptService _receiptService;

    public ReceiptsController(IReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReceiptDto>>> GetReceipts([FromQuery] int? reservationId, [FromQuery] int? paymentId)
    {
        var receipts = await _receiptService.GetReceiptsAsync(reservationId, paymentId);
        return Ok(receipts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReceiptDto>> GetReceipt(int id)
    {
        var receipt = await _receiptService.GetReceiptByIdAsync(id);
        if (receipt == null) return NotFound(new { message = "Receipt not found." });
        return Ok(receipt);
    }

    [HttpPost]
    public async Task<ActionResult<ReceiptDto>> CreateReceipt([FromBody] CreateReceiptDto dto)
    {
        try
        {
            var receipt = await _receiptService.CreateReceiptAsync(dto);
            return CreatedAtAction(nameof(GetReceipt), new { id = receipt.ReceiptId }, receipt);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred generating receipt.", details = ex.Message });
        }
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<ReceiptDto>> CreateCheckoutReceipt([FromBody] CheckoutSettlementDto dto)
    {
        try
        {
            var receipt = await _receiptService.GenerateCheckoutReceiptAsync(dto);
            return CreatedAtAction(nameof(GetReceipt), new { id = receipt.ReceiptId }, receipt);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred generating checkout receipt.", details = ex.Message });
        }
    }

    [HttpPost("{id}/void")]
    public async Task<ActionResult<ReceiptDto>> VoidReceipt(int id)
    {
        var receipt = await _receiptService.VoidReceiptAsync(id);
        if (receipt == null) return NotFound(new { message = "Receipt not found." });
        return Ok(receipt);
    }
}

[ApiController]
[Route("api")]
public class ReservationAndPaymentReceiptsController : ControllerBase
{
    private readonly IReceiptService _receiptService;

    public ReservationAndPaymentReceiptsController(IReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [HttpGet("reservations/{reservationId}/receipts")]
    public async Task<ActionResult<IEnumerable<ReceiptDto>>> GetReservationReceipts(int reservationId)
    {
        var receipts = await _receiptService.GetReservationReceiptsAsync(reservationId);
        return Ok(receipts);
    }

    [HttpGet("payments/{paymentId}/receipt")]
    public async Task<ActionResult<ReceiptDto>> GetPaymentReceipt(int paymentId)
    {
        var receipt = await _receiptService.GetPaymentReceiptAsync(paymentId);
        if (receipt == null) return NotFound(new { message = "No receipt found for this payment." });
        return Ok(receipt);
    }
}
