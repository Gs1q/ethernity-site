// ==== Конфигурация Discord OAuth ====
const CLIENT_ID = '1395303543832969337';
const REDIRECT_URI = 'https://ethernity.vercel.app/index.html'; // <-- редирект на index.html
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

// ==== DOM-элементы ====
const loginBtn = document.getElementById('discord-login');
const headerRight = document.querySelector('.header-right');
const serversBtn = document.getElementById('servers-btn');
const newsBtn = document.getElementById('news-btn');
const forumBtn = document.getElementById('forum-btn');

// ==== Навигация ====
if (serversBtn) serversBtn.onclick = () => { window.location.href = 'servers.html'; };
if (newsBtn)    newsBtn.onclick = () => { window.location.href = 'news.html'; };
if (forumBtn)   forumBtn.onclick = () => { window.location.href = 'forum.html'; };

// ==== Кнопка входа через Discord ====
if (loginBtn) {
  loginBtn.onclick = () => {
    window.location.href = DISCORD_OAUTH_URL;
  };
}

// ==== Парсинг токена из URL-хэша ====
function parseHashParams() {
  const hash = window.location.hash.substring(1); // убираем #
  return hash.split('&').reduce((res, part) => {
    const [key, val] = part.split('=');
    if (key) res[key] = decodeURIComponent(val);
    return res;
  }, {});
}

// ==== Обработка редиректа после логина ====
function handleRedirect() {
  const params = parseHashParams();
  if (params.access_token) {
    console.log('[DEBUG] Токен получен из URL-хэша:', params.access_token);
    localStorage.setItem('discord_access_token', params.access_token);
    // Убираем хэш из URL, сохраняя текущий путь (например '/' или '/index.html')
    history.replaceState(null, document.title, window.location.origin + window.location.pathname);
    return true;
  }
  return false;
}

// ==== Работа с токеном ====
function getToken() {
  return localStorage.getItem('discord_access_token');
}

function removeToken() {
  localStorage.removeItem('discord_access_token');
}

// ==== Получение информации о пользователе из Discord ====
async function fetchDiscordUser(token) {
  try {
    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Ошибка авторизации');
    return await res.json();
  } catch (err) {
    console.error('[DEBUG] Ошибка при получении профиля:', err);
    return null;
  }
}

// ==== Создание меню профиля ====
function createProfileMenu(user) {
  const cont = document.createElement('div');
  cont.className = 'profile-menu';

  // Формируем URL аватарки
  const isGif = user.avatar && user.avatar.startsWith('a_');
  const ext = isGif ? 'gif' : 'png';
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`
    : 'default-avatar.png';

  const img = document.createElement('img');
  img.src = avatarUrl;
  img.alt = user.username;
  img.style.width = '32px';
  img.style.height = '32px';
  img.style.borderRadius = '50%';
  img.style.marginRight = '8px';
  img.style.verticalAlign = 'middle';
  cont.appendChild(img);

  const span = document.createElement('span');
  span.textContent = `${user.username}#${user.discriminator}`;
  span.style.marginRight = '12px';
  cont.appendChild(span);

  const btn = document.createElement('button');
  btn.textContent = 'Выйти';
  btn.onclick = () => {
    removeToken();
    window.location.reload();
  };
  cont.appendChild(btn);

  // Стиль контейнера (можешь вынести в CSS)
  cont.style.display = 'flex';
  cont.style.alignItems = 'center';

  return cont;
}

// ==== Главный запуск после загрузки страницы ====
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[DEBUG] DOM загружен');

  handleRedirect(); // Обрабатываем возможный токен в URL

  const token = getToken();
  if (token) {
    console.log('[DEBUG] Найден токен в localStorage:', token);
    const user = await fetchDiscordUser(token);
    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (headerRight) {
        // Убираем кнопки навигации, если нужно, или оставляем как есть
        // headerRight.innerHTML = ''; // если хочешь убрать все элементы внутри
        headerRight.appendChild(createProfileMenu(user));
      }
    } else {
      console.warn('[DEBUG] Невалидный токен, удаляю...');
      removeToken();
      if (loginBtn) loginBtn.style.display = 'inline-block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
  }
});
