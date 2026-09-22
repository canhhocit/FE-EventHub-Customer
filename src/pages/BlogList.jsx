import { useState, useEffect } from 'react';
import { Loader2, Newspaper, Tag, Sparkles } from 'lucide-react';
import { getBlogPosts, getBlogTags } from '../utils/api';
import BlogCard from '../components/BlogCard';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Lấy danh sách tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await getBlogTags();
        if (res && res.result) {
          setTags(res.result);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách tag:", err);
      }
    };
    fetchTags();
  }, []);

  // Lấy danh sách bài viết
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await getBlogPosts({ page, size: 6, tagId: selectedTag });
        if (res && res.result) {
          setBlogs(res.result.content || []);
          setTotalPages(res.result.totalPages || 1);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách bài viết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, selectedTag]);

  return (
    <div className="container py-4 animate-fade-up">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary mb-3 small fw-semibold">
          <Sparkles size={16} /> Tin tức & Hoạt động
        </div>
        <h1 className="display-4 fw-bold mb-3">
          Tin tức <span className="text-gradient">& Bài viết Sự kiện</span>
        </h1>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Cập nhật những thông tin mới nhất, câu chuyện hậu trường và cẩm nang tham gia sự kiện độc quyền từ ban tổ chức.
        </p>
      </div>

      {/* Tag Filters */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
        <button
          className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
            selectedTag === null
              ? 'btn-gradient text-white shadow-sm'
              : 'btn-outline-secondary text-white'
          }`}
          onClick={() => {
            setSelectedTag(null);
            setPage(0);
          }}
        >
          Tất cả bài viết
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
              selectedTag === tag.id
                ? 'btn-gradient text-white shadow-sm'
                : 'btn-outline-secondary text-white'
            }`}
            onClick={() => {
              setSelectedTag(tag.id);
              setPage(0);
            }}
          >
            #{tag.name}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="text-center py-5">
          <Loader2 className="animate-spin text-primary mx-auto mb-3" size={48} />
          <p className="text-muted">Đang tải bài viết...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-card text-center py-5 my-4">
          <Newspaper size={48} className="text-muted mb-3 mx-auto" />
          <h4 className="text-white mb-2">Chưa có bài viết nào</h4>
          <p className="text-muted">Vui lòng chọn danh mục khác hoặc quay lại sau.</p>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-4">
              <button
                className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
                disabled={page === 0}
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Trang trước
              </button>
              <span className="text-muted small">
                Trang <span className="text-white fw-bold">{page + 1}</span> / {totalPages}
              </span>
              <button
                className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
                disabled={page >= totalPages - 1}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default BlogList;
