import { useState } from 'react';
import { MessageCircle, Phone, MessageSquare } from 'lucide-react';

const QuickContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="quick-contact-dock"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      aria-label="Liên hệ nhanh"
    >
      <div className={`quick-contact-panel ${isOpen ? 'is-open' : ''}`} role="menu">
        <a
          href="https://m.me/fivetickets"
          target="_blank"
          rel="noopener noreferrer"
          className="quick-contact-option"
          role="menuitem"
        >
          <MessageCircle size={16} style={{ color: 'var(--accent)' }} />
          <span>Chat Messenger</span>
        </a>
        <a
          href="tel:19006868"
          className="quick-contact-option"
          role="menuitem"
        >
          <Phone size={16} style={{ color: 'var(--success)' }} />
          <span>Hotline: 1900 6868</span>
        </a>
      </div>

      <button
        type="button"
        className="quick-contact-bubble"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Hỗ trợ và liên hệ nhanh"
        title="Liên hệ hỗ trợ"
      >
        <MessageSquare size={18} />
      </button>
    </div>
  );
};

export default QuickContact;

