import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { getCategories, getEvents } from '../utils/api';
import { VIETNAM_PROVINCES, getImageUrl } from '../utils/constants';

import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data.code === 1000) {
          setCategories(data.result || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: 10,
        keyword: search,
        province,
        categoryId,
        minPrice
      };

      const data = await getEvents(params);
      if (data.code === 1000) {
        setEvents(data.result.content || []);
        setTotalPages(data.result.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, province, categoryId, minPrice]); // removed maxPrice

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEvents();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="text-center mb-2 animate-fade-up">
        <h1 className="display-4 fw-bold mb-3">Khám phá <span className="text-gradient">Sự kiện</span></h1>
      </div>

      {/* Filter Section */}
      <div className="glass-card p-4 mb-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label text-muted small"><Search size={14} className="me-1"/> Từ khóa</label>
            <input 
              type="text" 
              className="form-control bg-dark text-white border-secondary shadow-none" 
              placeholder="Tên sự kiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted small"><Filter size={14} className="me-1"/> Danh mục</label>
            <select 
              className="form-select bg-dark text-white border-secondary shadow-none"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted small"><MapPin size={14} className="me-1"/> Tỉnh/TP</label>
            <select 
              className="form-select bg-dark text-white border-secondary shadow-none"
              value={province}
              onChange={(e) => { setProvince(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả tỉnh/TP</option>
              {VIETNAM_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label text-muted small">Giá từ (VNĐ)</label>
            <input 
              type="number" 
              className="form-control bg-dark text-white border-secondary shadow-none" 
              placeholder="0"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h4>Không tìm thấy sự kiện nào phù hợp.</h4>
          </div>
        ) : (
          events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5 gap-2">
          <button 
            className="btn btn-outline-primary rounded-pill px-4"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Trước
          </button>
          <div className="d-flex align-items-center px-3 fw-bold">
            Trang {page} / {totalPages}
          </div>
          <button 
            className="btn btn-outline-primary rounded-pill px-4"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;