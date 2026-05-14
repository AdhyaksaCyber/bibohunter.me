import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream2 border-t border-border mt-24 relative z-10">
      <div className="container max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-bebas text-xl text-navy mb-4">Ultron Bimbel</h3>
            <p className="text-muted text-sm leading-relaxed">
              Platform bimbingan belajar CPNS modern dengan teknologi terdepan dan mentor berpengalaman.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-navy mb-4 text-sm uppercase">Produk</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted hover:text-gold transition text-sm">
                  Landing
                </Link>
              </li>
              <li>
                <Link to="/materi" className="text-muted hover:text-gold transition text-sm">
                  Materi Belajar
                </Link>
              </li>
              <li>
                <Link to="/tryout" className="text-muted hover:text-gold transition text-sm">
                  Tryout Online
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-navy mb-4 text-sm uppercase">Perusahaan</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted hover:text-gold transition text-sm">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-gold transition text-sm">
                  Kontak
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-gold transition text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-navy mb-4 text-sm uppercase">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted hover:text-gold transition text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-gold transition text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-gold transition text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex items-center justify-between flex-col md:flex-row gap-4">
            <p className="text-muted text-sm">
              © {currentYear} Ultron Bimbel. Semua hak dilindungi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted hover:text-gold transition">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-muted hover:text-gold transition">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.205.63c-.404.159-.782.39-1.047.645-.363.365-.546.799-.645 1.48-.043.334-.06.82-.072 1.977-.012 1.246-.009 1.657.015 4.908.024 3.26.065 3.667.093 3.94.119 1.671.328 2.805.593 3.792.66 2.59 3.053 4.702 5.64 4.877.955.062 1.83.036 3.51.012 1.618-.024 1.867-.044 4.888-.062 3.02-.018 3.268.015 4.886.135 1.948.133 2.92.715 3.566 1.466.5.655.822 1.534.948 2.884.088.88.07 5.735-.012 8.657-.08 2.92-.134 3.02-.15 4.432-.016 1.412.057 2.121.22 2.906.215 1.012.55 1.627 1.37 2.208.793.565 1.456.722 3.322.777 1.466.039 1.735.024 4.86-.049 3.126-.072 3.328-.131 4.39-.504 1.06-.371 1.694-.839 2.23-1.544.535-.704.91-1.642 1.038-2.8.09-.898.055-5.945-.022-8.847-.077-2.902-.133-3.056-.15-4.465-.018-1.41.024-2.09.2-2.977.135-.68.388-1.222.816-1.666.428-.443.972-.791 1.622-.968.65-.177 1.51-.219 3.522-.247 2.013-.028 2.13-.012 3.156.03 1.027.042 1.854.216 2.59.5.736.284 1.32.708 1.78 1.3.46.593.782 1.308.948 2.2.166.89.167 3.24.157 5.05-.01 1.81-.027 2.247-.1 3.26-.073 1.01-.25 1.784-.58 2.4-.33.616-.774 1.066-1.416 1.4-.642.334-1.407.528-2.45.58-1.043.05-1.535.049-4.552.049h-4.552z" />
                </svg>
              </a>
              <a href="#" className="text-muted hover:text-gold transition">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.836.79c-1.02-.61-2.23-.977-3.465-.977-2.623 0-4.75 2.127-4.75 4.75 0 .372.044.735.127 1.083-3.946-.195-7.44-2.086-9.779-4.958a4.75 4.75 0 00-.64 2.387c0 1.648.84 3.097 2.117 3.952a4.742 4.742 0 01-2.156-.595v.061c0 2.302 1.637 4.223 3.81 4.658a4.75 4.75 0 01-2.149.081c.607 1.888 2.366 3.26 4.444 3.297-1.628 1.276-3.678 2.038-5.897 2.038-.383 0-.762-.023-1.139-.067C2.251 20.585 4.281 21 6.514 21c7.017 0 10.849-5.82 10.849-10.87 0-.165-.003-.33-.007-.495a7.738 7.738 0 001.9-1.978z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
