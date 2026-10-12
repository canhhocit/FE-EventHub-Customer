import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Download,
  Loader2,
  CreditCard,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  MapPin,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  X,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { getMyBookings, downloadInvoice } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDateTime } from '../utils/constants';

const STATUS = {
  PAID: { label: 'Đã thanh toán', pill: 'pill-live' },
  PENDING: { label: 'Chờ thanh toán', pill: 'pill-warn' },
  FAILED: { label: 'Thất bại', pill: 'pill-danger' },
  CANCELLED: { label: 'Đã hủy', pill: 'pill-closed' },
  REFUNDED: { label: 'Đã hoàn tiền', pill: 'pill-neutral' },
};

const TICKET_STATUS = {
  VALID: { label: 'Chưa sử dụng', pill: 'pill-live' },
  USED: { label: 'Đã check-in', pill: 'pill-closed' },
  CANCELLED: { label: 'Đã hủy', pill: 'pill-danger' },
  REFUNDED: { label: 'Đã hoàn tiền', pill: 'pill-neutral' },
};

const MyTickets = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedTicketForQr, setSelectedTicketForQr] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings({ page, size: 10 });
      if (data?.code === 1000 && data.result) {
        const content = data.result.content || [];
        setOrders(content);
        setTotalPages(Math.max(data.result.totalPages || 1, 1));
        // Expand the first order by default so the user immediately sees order details
        if (content.length > 0) {
          setExpandedOrders(new Set([content[0].id]));
        }
      } else {
        setOrders([]);
        setError(data?.message || 'Không tải được danh sách đơn hàng.');
      }
    } catch (err) {
      setOrders([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloading(orderId);
    try {
      const response = await downloadInvoice(orderId);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast?.error(err.message || 'Không tải được hóa đơn.');
    } finally {
      setDownloading(null);
    }
  };

  const handleResumePayment = (order) => {
    if (!order.paymentUrl) {
      toast?.warning('Link thanh toán đã hết hạn. Vui lòng đặt lại vé.');
      return;
    }
    window.location.href = order.paymentUrl;
  };

  const handleCopyTicketCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast?.success(`Đã sao chép mã vé: ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(() => {
      toast?.error('Không thể sao chép mã vé.');
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Vé của tôi</h1>
          <p className="text-muted small mb-0">
            Xem lịch sử đơn hàng, chi tiết sự kiện và mã QR vé điện tử để check-in.
          </p>
        </div>
        <Link to="/" className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1">
          <Ticket size={15} /> Khám phá thêm sự kiện
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <Loader2 size={28} className="spin mb-3" />
          <p className="small mb-0">Đang tải đơn hàng…</p>
        </div>
      ) : error ? (
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <AlertCircle size={32} className="mb-3" style={{ color: 'var(--danger)' }} />
          <h2 className="h6 fw-bold mb-2">Không tải được đơn hàng</h2>
          <p className="text-muted small mb-4">{error}</p>
          <button className="btn btn-accent px-4 py-2" onClick={fetchOrders}>
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <Ticket size={32} className="text-muted mb-3" />
          <h2 className="h6 fw-bold mb-2">Bạn chưa có vé nào</h2>
          <p className="text-muted small mb-4">
            Các vé bạn đặt sẽ xuất hiện tại đây.
          </p>
          <Link to="/" className="btn btn-accent px-4 py-2">
            Khám phá sự kiện
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const status = STATUS[order.paymentStatus] || {
              label: order.paymentStatus,
              pill: 'pill-neutral',
            };

            const items = order.items || [];
            const tickets = order.tickets || [];
            const totalTicketsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

            // Group order items by event
            const eventGroups = [];
            const eventMap = new Map();
            items.forEach((item) => {
              const eventKey = item.eventId || item.eventName || 'default';
              if (!eventMap.has(eventKey)) {
                const group = {
                  eventId: item.eventId,
                  eventName: item.eventName,
                  eventImage: item.eventImage,
                  eventLocation: item.eventLocation,
                  eventProvince: item.eventProvince,
                  eventStartTime: item.eventStartTime,
                  eventEndTime: item.eventEndTime,
                  items: [],
                };
                eventMap.set(eventKey, group);
                eventGroups.push(group);
              }
              eventMap.get(eventKey).items.push(item);
            });

            return (
              <div
                key={order.id}
                className="panel p-0 overflow-hidden shadow-sm"
                style={{
                  border: isExpanded ? '1px solid var(--accent, #4560e6)' : '1px solid var(--border)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Main Order Header Card */}
                <div className="p-4">
                  <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className={`pill ${status.pill}`}>{status.label}</span>
                        <span className="badge rounded-pill bg-light text-dark border px-2 py-1" style={{ fontSize: '0.72rem' }}>
                          {order.paymentMethod}
                        </span>
                        {order.orderCode && (
                          <span className="text-muted small">
                            Mã GD: #{order.orderCode}
                          </span>
                        )}
                      </div>
                      <div className="fw-bold fs-6 mb-1">
                        Đơn hàng #{order.id}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                        Đặt lúc {formatDateTime(order.orderDate)}
                      </div>
                    </div>

                    <div className="text-lg-end">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Tổng tiền
                      </div>
                      <div className="fw-bold fs-5 mb-2" style={{ color: 'var(--text)' }}>
                        {formatCurrency(order.totalAmount)}
                      </div>

                      <div className="d-flex align-items-center justify-content-lg-end gap-2">
                        {order.paymentStatus === 'PAID' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloading === order.id}
                          >
                            {downloading === order.id ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              <Download size={14} />
                            )}
                            Hóa đơn PDF
                          </button>
                        )}
                        {order.paymentStatus === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-accent btn-sm px-3 py-2 d-inline-flex align-items-center gap-2"
                            onClick={() => handleResumePayment(order)}
                          >
                            <CreditCard size={14} /> Tiếp tục thanh toán
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Toggle Bar */}
                  <div
                    className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 28,
                          height: 28,
                          background: isExpanded ? 'var(--accent-soft, rgba(69, 96, 230, 0.12))' : 'var(--surface-2)',
                          color: isExpanded ? 'var(--accent, #4560e6)' : 'var(--text-muted)',
                        }}
                      >
                        <Ticket size={15} />
                      </div>
                      <span className="small fw-semibold">
                        {items.length > 0
                          ? `${totalTicketsCount} vé · ${eventGroups.length} sự kiện`
                          : 'Xem thông tin vé & sự kiện'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm px-2 py-1 d-inline-flex align-items-center gap-1 text-primary small"
                      style={{ fontSize: '0.8125rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOrderExpand(order.id);
                      }}
                    >
                      <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết đơn hàng'}</span>
                      <ChevronDown
                        size={15}
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div
                    className="p-4 border-top"
                    style={{ background: 'var(--surface-2, #f8f9fa)' }}
                  >
                    {/* Event & Ticket Items Section */}
                    {eventGroups.length > 0 ? (
                      <div className="d-flex flex-column gap-3 mb-4">
                        {eventGroups.map((group, gIdx) => (
                          <div
                            key={group.eventId || gIdx}
                            className="p-3 rounded bg-white border"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                          >
                            {/* Event Information Header */}
                            <div className="d-flex flex-wrap align-items-center gap-3 pb-3 border-bottom mb-3">
                              {group.eventImage ? (
                                <img
                                  src={group.eventImage}
                                  alt={group.eventName}
                                  className="rounded object-fit-cover"
                                  style={{ width: 64, height: 64, flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="rounded d-flex align-items-center justify-content-center text-muted"
                                  style={{
                                    width: 64,
                                    height: 64,
                                    background: 'var(--surface-2)',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Ticket size={24} />
                                </div>
                              )}
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <h3 className="h6 fw-bold mb-0 text-dark">
                                    {group.eventName || 'Sự kiện'}
                                  </h3>
                                  {group.eventId && (
                                    <Link
                                      to={`/events/${group.eventId}`}
                                      className="small text-primary text-decoration-none d-inline-flex align-items-center gap-1 ms-1 hover-primary"
                                      title="Xem chi tiết sự kiện"
                                    >
                                      <ExternalLink size={13} />
                                    </Link>
                                  )}
                                </div>

                                <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
                                  {group.eventStartTime && (
                                    <span className="d-inline-flex align-items-center gap-1">
                                      <Calendar size={13} className="text-secondary" />
                                      {formatDateTime(group.eventStartTime)}
                                      {group.eventEndTime ? ` - ${formatDateTime(group.eventEndTime)}` : ''}
                                    </span>
                                  )}
                                  {(group.eventLocation || group.eventProvince) && (
                                    <span className="d-inline-flex align-items-center gap-1">
                                      <MapPin size={13} className="text-danger" />
                                      {[group.eventLocation, group.eventProvince].filter(Boolean).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Ticket Types in this event */}
                            <div>
                              <div className="small fw-semibold text-muted mb-2 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                Danh sách loại vé
                              </div>
                              <div className="d-flex flex-column gap-2">
                                {group.items.map((item) => (
                                  <div
                                    key={item.id || item.ticketTypeId}
                                    className="d-flex align-items-center justify-content-between p-2 rounded"
                                    style={{ background: 'var(--surface-2, #f9fafb)' }}
                                  >
                                    <div>
                                      <span className="fw-semibold small text-dark">
                                        {item.ticketTypeName || 'Loại vé'}
                                      </span>
                                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                        {formatCurrency(item.unitPrice)} × {item.quantity} vé
                                      </div>
                                    </div>
                                    <span className="fw-bold small">
                                      {formatCurrency(item.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted small mb-3">
                        Đang cập nhật thông tin loại vé cho đơn hàng này.
                      </p>
                    )}

                    {/* Issued Electronic Tickets (E-Tickets with QR codes) */}
                    {order.paymentStatus === 'PAID' && tickets.length > 0 && (
                      <div className="p-3 rounded bg-white border mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <QrCode size={18} className="text-primary" />
                            <h4 className="h6 fw-bold mb-0">Vé điện tử ({tickets.length} vé)</h4>
                          </div>
                          <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            Xuất trình mã QR tại cửa soát vé để check-in
                          </span>
                        </div>

                        <div className="row g-2">
                          {tickets.map((t) => {
                            const ticketStatus = TICKET_STATUS[t.status] || {
                              label: t.status,
                              pill: 'pill-neutral',
                            };
                            return (
                              <div key={t.id || t.ticketCode} className="col-md-6 col-lg-4">
                                <div
                                  className="p-3 rounded border d-flex flex-column justify-content-between h-100"
                                  style={{
                                    background: 'var(--surface-2, #f9fafb)',
                                    borderLeft: '4px solid var(--accent, #4560e6)',
                                  }}
                                >
                                  <div>
                                    <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                                      <span className={`pill ${ticketStatus.pill}`} style={{ fontSize: '0.7rem' }}>
                                        {ticketStatus.label}
                                      </span>
                                      <span className="fw-semibold text-truncate small text-muted" style={{ maxWidth: 120 }}>
                                        {t.ticketTypeName}
                                      </span>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between gap-2 p-2 rounded bg-white border mb-3">
                                      <span className="font-monospace fw-bold small text-dark">
                                        {t.ticketCode}
                                      </span>
                                      <button
                                        type="button"
                                        className="btn btn-sm p-1 border-0 text-muted hover-primary"
                                        onClick={() => handleCopyTicketCode(t.ticketCode)}
                                        title="Sao chép mã vé"
                                      >
                                        {copiedCode === t.ticketCode ? (
                                          <Check size={14} className="text-success" />
                                        ) : (
                                          <Copy size={14} />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="btn btn-accent btn-sm w-100 py-1 d-inline-flex align-items-center justify-content-center gap-1"
                                    onClick={() => setSelectedTicketForQr(t)}
                                  >
                                    <QrCode size={14} /> Xem mã QR
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Financial Breakdown */}
                    <div className="p-3 rounded bg-white border">
                      <div className="small fw-semibold text-muted mb-2 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                        Chi tiết thanh toán
                      </div>
                      <div className="d-flex flex-column gap-1 small">
                        {order.discountAmount && Number(order.discountAmount) > 0 && (
                          <div className="d-flex justify-content-between text-success">
                            <span className="d-inline-flex align-items-center gap-1">
                              <Tag size={13} /> Giảm giá voucher ({order.voucherCode})
                            </span>
                            <span>−{formatCurrency(order.discountAmount)}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold pt-2 border-top mt-1">
                          <span>Tổng thanh toán</span>
                          <span className="text-dark fs-6">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-muted small" style={{ fontSize: '0.8125rem' }}>
                      {order.paymentStatus === 'PAID'
                        ? 'Vé điện tử và hóa đơn đã được gửi tới email của bạn. Bạn có thể mở mã QR bất cứ lúc nào trên điện thoại để vào cổng.'
                        : order.paymentStatus === 'PENDING'
                          ? 'Đơn hàng đang chờ thanh toán. Vui lòng hoàn tất giao dịch để nhận mã vé điện tử.'
                          : 'Đơn hàng này đã kết thúc.'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <nav className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
            type="button"
            className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={15} /> Trước
          </button>
          <span className="small text-muted px-2">
            Trang <strong style={{ color: 'var(--text)' }}>{page}</strong> / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau <ChevronRight size={15} />
          </button>
        </nav>
      )}

      {/* QR Code Check-in Modal */}
      {selectedTicketForQr && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setSelectedTicketForQr(null)}
          />
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
              <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
                <div className="modal-header border-0 pb-0">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <h3 className="modal-title h6 fw-bold mb-0">Mã QR Check-in</h3>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedTicketForQr(null)}
                    aria-label="Đóng"
                  />
                </div>

                <div className="modal-body text-center p-4">
                  <div className="fw-semibold text-dark fs-6 mb-1">
                    {selectedTicketForQr.eventName || 'Sự kiện'}
                  </div>
                  <div className="badge rounded-pill bg-light text-dark border px-3 py-1 mb-3">
                    {selectedTicketForQr.ticketTypeName || 'Vé sự kiện'}
                  </div>

                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-3 border d-inline-block shadow-sm mb-3">
                    {selectedTicketForQr.qrCode ? (
                      <img
                        src={selectedTicketForQr.qrCode}
                        alt={`QR Code ${selectedTicketForQr.ticketCode}`}
                        style={{ width: 220, height: 220, objectFit: 'contain' }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center text-muted"
                        style={{ width: 220, height: 220 }}
                      >
                        <QrCode size={48} />
                      </div>
                    )}
                  </div>

                  {/* Ticket Code Display */}
                  <div className="p-2 rounded bg-light border d-inline-flex align-items-center gap-2 mb-3">
                    <span className="font-monospace fw-bold text-dark">
                      {selectedTicketForQr.ticketCode}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm p-1 border-0 text-muted hover-primary"
                      onClick={() => handleCopyTicketCode(selectedTicketForQr.ticketCode)}
                      title="Sao chép"
                    >
                      {copiedCode === selectedTicketForQr.ticketCode ? (
                        <Check size={14} className="text-success" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>

                  <p className="small text-muted mb-0">
                    Quý khách vui lòng xuất trình mã QR này tại cửa soát vé để nhân viên quét mã check-in vào sự kiện.
                  </p>
                </div>

                <div className="modal-footer border-0 pt-0 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-ghost px-4 py-2"
                    onClick={() => setSelectedTicketForQr(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyTickets;
