using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// GET: api/payments?propertyId=1&reservationId=2
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments(
        [FromQuery] int? propertyId, 
        [FromQuery] int? reservationId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var payments = await _paymentService.GetAllPaymentsAsync(propertyId, reservationId, startDate, endDate);
        return Ok(payments);
    }

    /// <summary>
    /// GET: api/payments/5
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentDto>> GetPayment(int id)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(id);
        if (payment == null) return NotFound();
        return Ok(payment);
    }

    /// <summary>
    /// GET: api/payments/reservation/5/summary
    /// </summary>
    [HttpGet("reservation/{reservationId}/summary")]
    public async Task<ActionResult<ReservationPaymentSummaryDto>> GetReservationSummary(int reservationId)
    {
        var summary = await _paymentService.GetReservationPaymentSummaryAsync(reservationId);
        if (summary == null) return NotFound();
        return Ok(summary);
    }

    /// <summary>
    /// POST: api/payments
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto dto)
    {
        try
        {
            var payment = await _paymentService.CreatePaymentAsync(dto);
            return CreatedAtAction(nameof(GetPayment), new { id = payment.PaymentId }, payment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PUT: api/payments/5
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<PaymentDto>> UpdatePayment(int id, [FromBody] UpdatePaymentDto dto)
    {
        var updated = await _paymentService.UpdatePaymentAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// DELETE: api/payments/5
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var deleted = await _paymentService.DeletePaymentAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
