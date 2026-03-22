const booksKey = 'bookshelf_books';

// Toast notification function
function showToast(message, duration = 3000) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, duration);
}

function getBooks() {
  return JSON.parse(localStorage.getItem(booksKey) || '[]');
}

function saveBooks(books) {
  localStorage.setItem(booksKey, JSON.stringify(books));
}

// --- Library Section ---

function renderLibraryBooks(books) {
  const list = document.getElementById('books-list');
  list.innerHTML = '';
  if (books.length === 0) {
    list.innerHTML = '<li>Немає доданих книг</li>';
    return;
  }
  books.forEach((book, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span><strong>${book.title}</strong> автор: ${book.author} (жанр: ${book.genre})</span> <button data-idx="${idx}">Видалити</button>`;
    list.appendChild(li);
  });
}

function updateLibraryUI(filter = '', genreFilter = '') {
  let books = getBooks();
  // Filter by search filter
  const s = filter.toLowerCase();
  books = books.filter(b => {
    return b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s) || b.genre.toLowerCase().includes(s);
  });
  // Filter by genre if selected and not empty string or 'all'
  if (genreFilter && genreFilter !== 'all') {
    books = books.filter(b => b.genre === genreFilter);
  }
  renderLibraryBooks(books);
  updateGenreFilterOptions();
}

// Fill genre filter dropdown based on current books
function updateGenreFilterOptions() {
  const select = document.getElementById('genre-filter');
  if (!select) return;
  const books = getBooks();
  const genresSet = new Set(books.map(b => b.genre));
  const currentOptions = Array.from(select.options).map(o => o.value);
  // If genres changed then update options
  if (genresSet.size !== currentOptions.length - 1 || // -1 because of 'all' option
    ![...genresSet].every(g => currentOptions.includes(g))) {
    // Clear all except first option
    while (select.options.length > 1) select.options.remove(1);
    // Add genres sorted
    [...genresSet].sort().forEach(genre => {
      const opt = document.createElement('option');
      opt.value = genre;
      opt.textContent = genre;
      select.appendChild(opt);
    });
  }
}

// --- Recommendations Section ---

function renderRecommendations(books) {
  const genres = {};
  books.forEach(b => { genres[b.genre] = (genres[b.genre]||0)+1; });
  const sorted = Object.entries(genres).sort((a,b) => b[1]-a[1]);
  const list = document.getElementById('recommendations-list');
  list.innerHTML = sorted.length > 0
    ? sorted.slice(0,3).map(([genre,count]) => `<li>${genre} — ${count} книг(и)</li>`).join('')
    : '<li>Поки що немає рекомендацій</li>';
}

function updateRecommendUI() {
  const books = getBooks();
  renderRecommendations(books);
}

// --- External Books Section ---

async function fetchBooksFromAPI(query = 'bestsellers') {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=15`);
    const data = await res.json();
    return data.docs.map(book => ({
      title: book.title,
      author: (book.author_name && book.author_name[0]) || 'Невідомо',
      genre: (book.subject && book.subject[0]) || 'Без жанру'
    }));
  } catch {
    return [];
  }
}

function renderExternalBooks(books) {
  const list = document.getElementById('external-books-list');
  list.innerHTML = '';
  if (books.length === 0) {
    list.innerHTML = '<li>Немає книг за цим запитом</li>';
    return;
  }
  books.forEach((book, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span><strong>${book.title}</strong> автор: ${book.author} (жанр: ${book.genre})</span> <button data-external-idx="${idx}">Додати</button>`;
    list.appendChild(li);
  });
}

async function updateExternalUI(query = 'bestsellers') {
  const books = await fetchBooksFromAPI(query);
  renderExternalBooks(books);
  window.currentExternalBooks = books; // збережемо для додавання
}

// --- Search Section ---

async function updateSearchUI(query = '') {
  if (!query) {
    // If empty query show no results or a message
    document.getElementById('search-results-list').innerHTML = '<li>Введіть пошуковий запит для пошуку книг</li>';
    return;
  }
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=15`);
    const data = await res.json();
    const books = data.docs.map(book => ({
      title: book.title,
      author: (book.author_name && book.author_name[0]) || 'Невідомо',
      genre: (book.subject && book.subject[0]) || 'Без жанру'
    }));
    const list = document.getElementById('search-results-list');
    list.innerHTML = '';
    if (books.length === 0) {
      list.innerHTML = '<li>Немає книг за цим запитом</li>';
      return;
    }
    books.forEach((book, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<span><strong>${book.title}</strong> автор: ${book.author} (жанр: ${book.genre})</span> <button data-search-idx="${idx}">Додати</button>`;
      list.appendChild(li);
    });
    window.currentSearchBooks = books;
  } catch {
    document.getElementById('search-results-list').innerHTML = '<li>Помилка при отриманні даних</li>';
    window.currentSearchBooks = [];
  }
}

// --- Section Navigation ---

function showSection(sectionId) {
  const sections = document.querySelectorAll('section');
  const navButtons = document.querySelectorAll('nav button, nav [data-nav]');
  sections.forEach(sec => {
    if (sec.id === sectionId) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });
  navButtons.forEach(btn => {
    if (btn.dataset.nav === sectionId) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.classList.remove('active');
      btn.removeAttribute('aria-current');
    }
  });

  // On section show, update related UI
  switch (sectionId) {
    case 'library':
      updateLibraryUI(
        document.getElementById('search-input').value.trim(),
        document.getElementById('genre-filter').value
      );
      break;
    case 'recommendations':
      updateRecommendUI();
      break;
    case 'external':
      updateExternalUI(document.getElementById('external-search-input').value.trim() || 'bestsellers');
      break;
    case 'search':
      updateSearchUI(document.getElementById('search-query-input').value.trim());
      break;
  }
}

// --- Event Listeners ---

// Nav buttons click (assumed buttons or elements with data-nav attribute)
document.querySelectorAll('nav button[data-nav], nav [data-nav]').forEach(btn => {
  btn.addEventListener('click', e => {
    const targetSection = btn.dataset.nav;
    if (targetSection) {
      showSection(targetSection);
    }
  });
});

// Add book form submit
document.getElementById('add-book-form').addEventListener('submit', e => {
  e.preventDefault();
  const titleEl = document.getElementById('title');
  const authorEl = document.getElementById('author');
  const genreEl = document.getElementById('genre');
  const title = titleEl.value.trim();
  const author = authorEl.value.trim();
  const genre = genreEl.value.trim();

  // Validation with hints
  if (!title) {
    showToast('Будь ласка, введіть назву книги');
    titleEl.focus();
    return;
  }
  if (!author) {
    showToast('Будь ласка, введіть автора книги');
    authorEl.focus();
    return;
  }
  if (!genre) {
    showToast('Будь ласка, введіть жанр книги');
    genreEl.focus();
    return;
  }

  const books = getBooks();
  books.push({ title, author, genre });
  saveBooks(books);
  showToast(`Книгу "${title}" додано до вашої бібліотеки`);
  document.getElementById('add-book-form').reset();

  updateLibraryUI(
    document.getElementById('search-input').value.trim(),
    document.getElementById('genre-filter').value
  );
});

// Delete book from library
document.getElementById('books-list').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.idx != null) {
    const idx = +e.target.dataset.idx;
    const books = getBooks();
    if (idx >= 0 && idx < books.length) {
      const bookTitle = books[idx].title;
      showToast(`Видалити книгу "${bookTitle}"? Натисніть повторно для підтвердження`, 5000);
      if (e.target.dataset.confirmed === 'true') {
        books.splice(idx, 1);
        saveBooks(books);
        showToast(`Книгу "${bookTitle}" видалено`);
        updateLibraryUI(
          document.getElementById('search-input').value.trim(),
          document.getElementById('genre-filter').value
        );
      } else {
        e.target.dataset.confirmed = 'true';
        setTimeout(() => {
          if (e.target) e.target.dataset.confirmed = 'false';
        }, 5000);
      }
    }
  }
});

// Clear entire library button
const clearLibraryBtn = document.getElementById('clear-library');
if (clearLibraryBtn) {
  clearLibraryBtn.addEventListener('click', () => {
    if (getBooks().length === 0) {
      showToast('Ваша бібліотека вже порожня');
      return;
    }
    // Confirm with toast with confirm buttons
    if (confirm('Ви впевнені, що хочете повністю очистити бібліотеку? Цю дію не можна скасувати.')) {
      localStorage.removeItem(booksKey);
      showToast('Бібліотеку очищено');
      updateLibraryUI(
        document.getElementById('search-input').value.trim(),
        document.getElementById('genre-filter').value
      );
    }
  });
}

// Library search input
document.getElementById('search-input').addEventListener('input', e => {
  updateLibraryUI(e.target.value.trim(), document.getElementById('genre-filter').value);
});

// Genre filter change
const genreFilterSelect = document.getElementById('genre-filter');
if (genreFilterSelect) {
  genreFilterSelect.addEventListener('change', e => {
    updateLibraryUI(document.getElementById('search-input').value.trim(), e.target.value);
  });
}

// External books search input
document.getElementById('external-search-input').addEventListener('input', e => {
  const query = e.target.value.trim();
  updateExternalUI(query || 'bestsellers');
});

// Add external book to library
document.getElementById('external-books-list').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.externalIdx != null) {
    const idx = +e.target.dataset.externalIdx;
    const externalBooks = window.currentExternalBooks || [];
    if (idx >= 0 && idx < externalBooks.length) {
      const bookToAdd = externalBooks[idx];
      const books = getBooks();
      // Check for duplicates by title+author+genre
      const exists = books.some(b =>
        b.title === bookToAdd.title &&
        b.author === bookToAdd.author &&
        b.genre === bookToAdd.genre
      );
      if (exists) {
        showToast(`Книга "${bookToAdd.title}" вже є у вашій бібліотеці`);
        return;
      }
      books.push(bookToAdd);
      saveBooks(books);
      showToast(`Книгу "${bookToAdd.title}" додано до вашої бібліотеки`);
      updateLibraryUI(
        document.getElementById('search-input').value.trim(),
        document.getElementById('genre-filter').value
      );
    }
  }
});

// Search section: add book from search results to library
document.getElementById('search-results-list').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.searchIdx != null) {
    const idx = +e.target.dataset.searchIdx;
    const searchBooks = window.currentSearchBooks || [];
    if (idx >= 0 && idx < searchBooks.length) {
      const bookToAdd = searchBooks[idx];
      const books = getBooks();
      // Check for duplicates
      const exists = books.some(b =>
        b.title === bookToAdd.title &&
        b.author === bookToAdd.author &&
        b.genre === bookToAdd.genre
      );
      if (exists) {
        showToast(`Книга "${bookToAdd.title}" вже є у вашій бібліотеці`);
        return;
      }
      books.push(bookToAdd);
      saveBooks(books);
      showToast(`Книгу "${bookToAdd.title}" додано до вашої бібліотеки`);
      updateLibraryUI(
        document.getElementById('search-input').value.trim(),
        document.getElementById('genre-filter').value
      );
    }
  }
});

// Search query input (separate input under Search section)
document.getElementById('search-query-input').addEventListener('input', e => {
  updateSearchUI(e.target.value.trim());
});
// --- Initialization ---

// Initialize genre filter options and UI
updateGenreFilterOptions();

// Show default section (library)
showSection('library');

