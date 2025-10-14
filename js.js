/* app.js — versi modular dari script di index.html
   Catatan: index.html saat ini sudah punya skrip inline — file ini opsional.
   Jika ingin pakai, ganti <script> inline dengan <script src="app.js"></script>
*/

(() => {
  const DEFAULT_QUERY = 'tesla';
  const apiKeyFromPage = 'baa031dca91c490198d74c5eb0183724'; // sama seperti di HTML
  const searchForm = document.getElementById('searchForm');
  const queryInput = document.getElementById('query');
  const alertBox = document.getElementById('alertBox');
  const newsCards = document.getElementById('newsCards');

  // Debounce helper
  function debounce(fn, wait = 350) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Show loading
  function showLoading() {
    alertBox.innerHTML = '';
    newsCards.innerHTML = `<div id="loadingSpinner" class="w-100"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div>`;
  }

  function displayError(message) {
    newsCards.innerHTML = '';
    alertBox.innerHTML = `<div class="alert alert-danger text-center">${message}</div>`;
  }

  function displayNews(articles) {
    alertBox.innerHTML = '';
    newsCards.innerHTML = '';
    articles.forEach(article => {
      const img = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
      const title = article.title || 'Tidak ada judul';
      const author = article.author || 'Tidak diketahui';
      const desc = article.description || 'Tidak ada deskripsi.';
      const url = article.url || '#';
      const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID') : '';
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${img}" class="card-img-top" alt="Gambar berita">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${escapeHtml(title)}</h5>
            <h6 class="text-muted">${escapeHtml(author)}</h6>
            <p class="card-text">${escapeHtml(desc)}</p>
            <a href="${url}" target="_blank" class="btn btn-primary mt-auto">Baca Selengkapnya</a>
          </div>
          <div class="card-footer text-muted">${date}</div>
        </div>
      `;
      newsCards.appendChild(col);
    });
  }

  // basic sanitizer for text nodes (prevents accidental HTML injection)
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"'`=\/]/g, function(s) {
      return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#96;','=':'&#x3D;'
      })[s];
    });
  }

  async function fetchNews(query = DEFAULT_QUERY) {
    if (!query) {
      displayError('Silakan masukkan kata kunci pencarian.');
      return;
    }
    showLoading();
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${apiKeyFromPage}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'error') {
        displayError(data.message || 'Terjadi kesalahan saat memuat berita.');
      } else if (!data.articles || data.articles.length === 0) {
        displayError('Berita tidak ditemukan untuk kata kunci tersebut.');
      } else {
        displayNews(data.articles);
      }
    } catch (err) {
      displayError('Terjadi kesalahan saat memuat berita. Periksa koneksi internet Anda.');
    }
  }

  // debounce on input so user can get preview while typing (optional)
  const debouncedFetch = debounce((q) => {
    if (q && q.length >= 2) fetchNews(q);
  }, 600);

  queryInput.addEventListener('input', (e) => {
    const v = e.target.value.trim();
    if (!v) return;
    debouncedFetch(v);
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = queryInput.value.trim();
    fetchNews(q || DEFAULT_QUERY);
  });

  // Initial load: use last query saved in localStorage jika ada
  const lastQuery = localStorage.getItem('rafanews_last_q') || '';
  if (lastQuery) {
    queryInput.value = lastQuery;
    fetchNews(lastQuery);
  } else {
    fetchNews(DEFAULT_QUERY);
  }

  // simpan query ke localStorage setiap submit
  searchForm.addEventListener('submit', () => {
    const q = queryInput.value.trim();
    if (q) localStorage.setItem('rafanews_last_q', q);
  });

})();
