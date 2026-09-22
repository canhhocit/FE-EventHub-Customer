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

const MyTickets = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings({ page, size: 10 });
      if (data?.code === 1000 && data.result) {
        setOrders(data.result.content || []);
        setTotalPages(Math.max(data.result.totalPages || 1, 1));
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

  return (
    <div className="container py-4">
      <h1 className="h4 fw-bold mb-4">Vé của tôi</h1>

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
            const status = STATUS[order.paymentStatus] || {
              label: order.paymentStatus,
              pill: 'pill-neutral',
            };

            return (
              <div key={order.id} className="panel p-4">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className={`pill ${status.pill}`}>{status.label}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="fw-semibold small mb-1">Đơn hàng #{order.id}</div>
                    <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      Đặt lúc {formatDateTime(order.orderDate)}
                    </div>
                  </div>

                  <div className="text-lg-end">
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Tổng tiền
                    </div>
                    <div className="fw-bold fs-5 mb-2">
                      {formatCurrency(order.totalAmount)}
                    </div>

                    {order.paymentStatus === 'PAID' && (
                      <button
                        className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-2"
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
                        className="btn btn-accent btn-sm px-3 py-2 d-inline-flex align-items-center gap-2"
                        onClick={() => handleResumePayment(order)}
                      >
                        <CreditCard size={14} /> Tiếp tục thanh toán
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="mt-3 pt-3 border-top text-muted"
                  style={{ fontSize: '0.8125rem' }}
                >
                  {order.paymentStatus === 'PAID'
                    ? 'Vé điện tử và hóa đơn đã được gửi tới email của bạn.'
                    : order.paymentStatus === 'PENDING'
                      ? 'Đơn hàng đang chờ thanh toán. Hoàn tất giao dịch để nhận vé.'
                      : 'Đơn hàng này đã kết thúc và không còn hiệu lực.'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
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
            className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau <ChevronRight size={15} />
          </button>
        </nav>
      )}
    </div>
  );
};

export default MyTickets;
