// ==== Конфигурация Discord OAuth ====
const CLIENT_ID = '1395303543832969337';
const REDIRECT_URI = 'https://ethernity.vercel.app/';
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

// ==== DOM-элементы ====
const loginBtn = document.getElementById('discord-login');
const headerRight = document.querySelector('.header-right');
const serversBtn = document.getElementById('servers-btn');
const newsBtn = document.getElementById('news-btn');
const forumBtn = document.getElementById('forum-btn');

// ==== Навигация ====
if (serversBtn) serversBtn.onclick = () => { window.location.href = 'servers.html'; };
if (newsBtn)    newsBtn.onclick = ()    => { window.location.href = 'news.html'; };
if (forumBtn)   forumBtn.onclick = ()   => { window.location.href = 'forum.html'; };

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
    // Удаляем хэш из URL
    history.replaceState(null, document.title, window.location.origin + window.location.pathname);
    // Перезагружаем страницу без хэша
    window.location.reload();
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

  const img = document.createElement('img');
  img.src = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : 'default-avatar.png';
  img.alt = user.username;
  cont.appendChild(img);

  const span = document.createElement('span');
  span.textContent = `${user.username}#${user.discriminator}`;
  cont.appendChild(span);

  const btn = document.createElement('button');
  btn.textContent = 'Выйти';
  btn.onclick = () => {
    removeToken();
    window.location.reload();
  };
  cont.appendChild(btn);

  return cont;
}

// ==== Главный запуск после загрузки страницы ====
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[DEBUG] DOM загружен');
  if (handleRedirect()) return;

  const token = getToken();
  if (token) {
    console.log('[DEBUG] Найден токен в localStorage:', token);
    const user = await fetchDiscordUser(token);
    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      headerRight.appendChild(createProfileMenu(user));
    } else {
      console.warn('[DEBUG] Невалидный токен, удаляю...');
      removeToken();
      if (loginBtn) loginBtn.style.display = 'inline-block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
  }
});
