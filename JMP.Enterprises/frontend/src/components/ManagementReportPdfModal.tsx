import React, { useRef } from 'react';
import { ExecutiveReportSummary } from '../types/reports';
import { X, Printer, Building2, TrendingUp, TrendingDown, DollarSign, Calendar, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ManagementReportPdfModalProps {
  report: ExecutiveReportSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManagementReportPdfModal: React.FC<ManagementReportPdfModalProps> = ({
  report,
  isOpen,
  onClose
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !report) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handlePrint = () => {
    const content = printAreaRef.current;
    if (!content) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc) return;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>JMP Executive Rental Management Report</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #0f172a;
              line-height: 1.4;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 11pt;
            }
            * {
              box-sizing: border-box;
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .logo-text-section h1 {
              font-size: 20pt;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              letter-spacing: -0.5px;
            }
            .logo-text-section p {
              margin: 2px 0 0 0;
              color: #475569;
              font-size: 9pt;
            }
            .report-title-badge {
              text-align: right;
            }
            .report-title-badge h2 {
              font-size: 13pt;
              font-weight: 700;
              color: #1e293b;
              margin: 0;
              text-transform: uppercase;
            }
            .report-title-badge p {
              margin: 3px 0 0 0;
              font-size: 8.5pt;
              color: #64748b;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 16px;
            }
            .kpi-card {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              border-radius: 6px;
              padding: 8px 10px;
            }
            .kpi-label {
              font-size: 7.5pt;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .kpi-value {
              font-size: 12pt;
              font-weight: 800;
              color: #0f172a;
            }
            .loss-text {
              color: #dc2626 !important;
            }
            .profit-text {
              color: #16a34a !important;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 8pt;
              font-weight: 800;
              text-transform: uppercase;
            }
            .status-profit {
              background: #dcfce7;
              color: #15803d;
              border: 1px solid #86efac;
            }
            .status-loss {
              background: #fee2e2;
              color: #b91c1c;
              border: 1px solid #fca5a5;
            }
            .section-title {
              font-size: 11pt;
              font-weight: 700;
              color: #0f172a;
              margin: 16px 0 8px 0;
              padding-bottom: 4px;
              border-bottom: 1.5px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
              font-size: 8.5pt;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #334155;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .note-box {
              background: #fffbe6;
              border: 1px solid #ffe58f;
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 8pt;
              color: #856404;
              margin-bottom: 14px;
            }
            .signature-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 30px;
              page-break-inside: avoid;
            }
            .sig-line {
              border-top: 1px solid #0f172a;
              margin-top: 35px;
              padding-top: 4px;
              font-size: 9pt;
              font-weight: 700;
              color: #0f172a;
              text-align: center;
            }
            .footer-note {
              margin-top: 20px;
              font-size: 7.5pt;
              color: #94a3b8;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 300);
  };

  const isLoss = report.profitLossStatus === 'LOSS';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden'
      }}>
        {/* Modal Header Controls */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Printable Executive Management Report
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              A4 Format • Period: {report.periodText} • Scope: {report.filteredPropertyName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Print Preview Area */}
        <div style={{
          padding: '30px',
          overflowY: 'auto',
          flex: 1,
          background: '#ffffff'
        }}>
          <div ref={printAreaRef}>
            {/* Header Banner */}
            <div className="header-banner">
              <div className="logo-text-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}>
                    JMP
                  </div>
                  <div>
                    <h1 style={{ fontSize: '18pt', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      JMP RENTAL PROPERTY
                    </h1>
                    <p style={{ margin: '2px 0 0 0', color: '#475569', fontSize: '8.5pt' }}>
                      Deo Homes Residences, Brgy. Salvacion, Ormoc City, Leyte
                    </p>
                  </div>
                </div>
              </div>

              <div className="report-title-badge">
                <h2>MANAGEMENT & PROFITABILITY REPORT</h2>
                <p><strong>Generated:</strong> {formatDate(report.generatedAt)}</p>
                <p><strong>Filter Scope:</strong> {report.filteredPropertyName} ({report.periodText})</p>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Rental Revenue</div>
                <div className="kpi-value profit-text">{formatCurrency(report.totalRevenue)}</div>
                <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>Cash Basis Received</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Operating Expenses</div>
                <div className="kpi-value loss-text">{formatCurrency(report.totalExpenses)}</div>
                <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>Direct & Shared Costs</div>
              </div>

              <div className="kpi-card" style={{ background: isLoss ? '#fef2f2' : '#f0fdf4', borderColor: isLoss ? '#fca5a5' : '#86efac' }}>
                <div className="kpi-label">Net Profit / (Loss)</div>
                <div className={`kpi-value ${isLoss ? 'loss-text' : 'profit-text'}`}>
                  {formatCurrency(report.netProfit)}
                </div>
                <div style={{ marginTop: '2px' }}>
                  <span className={`status-badge ${isLoss ? 'status-loss' : 'status-profit'}`}>
                    {report.profitLossStatus} ({report.profitMargin}%)
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Occupancy Rate</div>
                <div className="kpi-value">{report.occupancyRate}%</div>
                <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>
                  {report.occupiedDays} Occupied Days
                </div>
              </div>
            </div>

            {/* Secondary KPI Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '18px',
              padding: '10px 14px',
              background: '#f1f5f9',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '8.5pt'
            }}>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Total Reservations:</span>{' '}
                <strong>{report.totalReservations}</strong> ({report.shortStayReservations} Short / {report.longStayReservations} Long)
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Security Deposits Held:</span>{' '}
                <strong style={{ color: '#0369a1' }}>{formatCurrency(report.securityDepositsHeld)}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Top Property:</span>{' '}
                <strong style={{ color: '#16a34a' }}>{report.topPerformingProperty}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Accounting Method:</span>{' '}
                <strong>Cash Basis</strong>
              </div>
            </div>

            {/* Note on Security Deposit Rule */}
            <div className="note-box">
              <strong>Security Deposit Disclosure Rule:</strong> Security deposit collections ({formatCurrency(report.securityDepositsHeld)}) are recorded strictly as customer liabilities held in trust and are <strong>EXCLUDED</strong> from rental revenue and net profit calculations.
            </div>

            {/* Section 1: Property Performance Breakdown */}
            <div className="section-title">
              <span>1. Property Performance & Yield Analysis</span>
              <span style={{ fontSize: '8pt', color: '#64748b', fontWeight: 400 }}>Comparative view across units</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Property Name</th>
                  <th>Code</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Expenses</th>
                  <th className="text-right">Net Profit / (Loss)</th>
                  <th className="text-center">Margin %</th>
                  <th className="text-center">Short Stay</th>
                  <th className="text-center">Long Stay</th>
                  <th className="text-center">Occupied Days</th>
                </tr>
              </thead>
              <tbody>
                {report.propertyPerformances.map((prop) => {
                  const pLoss = prop.netProfit < 0;
                  return (
                    <tr key={prop.propertyId}>
                      <td><strong>{prop.propertyName}</strong></td>
                      <td><code>{prop.propertyCode}</code></td>
                      <td className="text-right">{formatCurrency(prop.revenue)}</td>
                      <td className="text-right">{formatCurrency(prop.expenses)}</td>
                      <td className={`text-right ${pLoss ? 'loss-text' : 'profit-text'}`} style={{ fontWeight: 700 }}>
                        {formatCurrency(prop.netProfit)}
                      </td>
                      <td className="text-center">{prop.profitMargin}%</td>
                      <td className="text-center">{prop.shortStayCount}</td>
                      <td className="text-center">{prop.longStayCount}</td>
                      <td className="text-center">{prop.occupiedDays} days</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Section 2: Rental Type Model Comparison */}
            <div className="section-title">
              <span>2. Rental Business Model Analysis (Short-Stay vs Long-Stay)</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Rental Model</th>
                  <th className="text-center">Total Bookings</th>
                  <th className="text-right">Direct Revenue</th>
                  <th className="text-right">Direct Expenses</th>
                  <th className="text-right">Net Profit (Before Shared Costs)</th>
                  <th className="text-center">Avg Stay Length</th>
                </tr>
              </thead>
              <tbody>
                {report.rentalTypePerformances.map((type) => (
                  <tr key={type.rentalType}>
                    <td>
                      <strong>{type.rentalType === 'ShortStay' ? 'Short Stay (Transient / Nightly)' : 'Long Stay (Monthly Lease)'}</strong>
                    </td>
                    <td className="text-center">{type.reservationCount}</td>
                    <td className="text-right">{formatCurrency(type.revenue)}</td>
                    <td className="text-right">{formatCurrency(type.directExpenses)}</td>
                    <td className="text-right profit-text" style={{ fontWeight: 700 }}>
                      {formatCurrency(type.netProfitBeforeSharedExpenses)}
                    </td>
                    <td className="text-center">{type.averageStayLength} days</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Section 3: Monthly Profitability Trend */}
            {report.monthlyProfitability.length > 0 && (
              <>
                <div className="section-title">
                  <span>3. Monthly Profitability & Revenue Trend</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Year-Month</th>
                      <th className="text-right">Revenue</th>
                      <th className="text-right">Expenses</th>
                      <th className="text-right">Net Profit / (Loss)</th>
                      <th className="text-center">Profit Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlyProfitability.map((m, idx) => {
                      const mLoss = m.netProfit < 0;
                      return (
                        <tr key={idx}>
                          <td><strong>{m.yearMonth}</strong></td>
                          <td className="text-right">{formatCurrency(m.revenue)}</td>
                          <td className="text-right">{formatCurrency(m.expenses)}</td>
                          <td className={`text-right ${mLoss ? 'loss-text' : 'profit-text'}`} style={{ fontWeight: 700 }}>
                            {formatCurrency(m.netProfit)}
                          </td>
                          <td className="text-center">{m.profitMargin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {/* Section 4: Operating Expenses Breakdown */}
            {report.expenseBreakdown.length > 0 && (
              <>
                <div className="section-title">
                  <span>4. Operating Expense Categorization</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Expense Category</th>
                      <th className="text-right">Total Disbursed</th>
                      <th className="text-center">% of Total Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenseBreakdown.map((exp, idx) => (
                      <tr key={idx}>
                        <td><strong>{exp.category}</strong></td>
                        <td className="text-right">{formatCurrency(exp.totalAmount)}</td>
                        <td className="text-center">{exp.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Section 5: Booking Channel Performance */}
            {report.bookingSourceBreakdown.length > 0 && (
              <>
                <div className="section-title">
                  <span>5. Channel / Booking Source Distribution</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Booking Channel</th>
                      <th className="text-center">Reservation Count</th>
                      <th className="text-right">Total Revenue</th>
                      <th className="text-right">Average Booking Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.bookingSourceBreakdown.map((b, idx) => (
                      <tr key={idx}>
                        <td><strong>{b.bookingSource}</strong></td>
                        <td className="text-center">{b.reservationCount}</td>
                        <td className="text-right">{formatCurrency(b.revenue)}</td>
                        <td className="text-right">{formatCurrency(b.averageReservationValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Signature Block */}
            <div className="signature-grid">
              <div>
                <p style={{ fontSize: '8pt', color: '#64748b', margin: 0 }}>Prepared By:</p>
                <div className="sig-line">
                  JMP Rental Operations Manager
                </div>
              </div>
              <div>
                <p style={{ fontSize: '8pt', color: '#64748b', margin: 0 }}>Approved & Accepted By:</p>
                <div className="sig-line">
                  JMP Enterprises Business Owner / Proprietor
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer-note">
              JMP ENTERPRISES • Deo Homes Residences, Brgy. Salvacion, Ormoc City, Leyte • Official Management Report
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
