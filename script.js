// ==== Конфигурация Discord OAuth ====
const CLIENT_ID = '1395303543832969337';
const REDIRECT_URI = 'https://ethernity-site.vercel.app';
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

// ==== DOM-элементы ====
const loginBtn = document.getElementById('discord-login');
const headerRight = document.querySelector('.header-right');
const serversBtn = document.getElementById('servers-btn');
const newsBtn = document.getElementById('news-btn');
const forumBtn = document.getElementById('forum-btn');

// ==== Навигация ====
const navMap = {
  serversBtn: 'servers.html',
  newsBtn: 'news.html',
  forumBtn: 'forum.html',
};

Object.entries(navMap).forEach(([btnId, url]) => {
  const btn = document.getElementById(btnId);
  if (btn) btn.onclick = () => (window.location.href = url);
});

// ==== Кнопка входа через Discord ====
if (loginBtn) {
  loginBtn.onclick = () => {
    window.location.href = DISCORD_OAUTH_URL;
  };
}

// ==== Парсинг параметров из URL-хэша ====
function parseHashParams(hash = window.location.hash) {
  if (!hash.startsWith('#')) return {};
  return hash
    .substring(1)
    .split('&')
    .reduce((acc, param) => {
      const [key, val] = param.split('=');
      if (key) acc[key] = decodeURIComponent(val);
      return acc;
    }, {});
}

// ==== Обработка редиректа после логина ====
function handleRedirect() {
  const params = parseHashParams();
  if (params.access_token) {
    localStorage.setItem('discord_access_token', params.access_token);
    // Убираем хэш из URL без перезагрузки страницы
    history.replaceState(null, document.title, window.location.origin + window.location.pathname);
    return true;
  }
  return false;
}

// ==== Работа с токеном ====
const tokenStorageKey = 'discord_access_token';

function getToken() {
  return localStorage.getItem(tokenStorageKey);
}

function removeToken() {
  localStorage.removeItem(tokenStorageKey);
}

// ==== Получение данных пользователя из Discord API ====
async function fetchDiscordUser(token) {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка авторизации');
    return await response.json();
  } catch (error) {
    console.error('[DEBUG] Ошибка при получении профиля:', error);
    return null;
  }
}

// ==== Создание меню профиля пользователя ====
function createProfileMenu(user) {
  const container = document.createElement('div');
  container.className = 'profile-menu';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '12px';

  // Формируем URL аватарки (gif или png)
  const isGif = user.avatar?.startsWith('a_');
  const ext = isGif ? 'gif' : 'png';
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`
    : 'default-avatar.png';

  const avatarImg = document.createElement('img');
  avatarImg.src = avatarUrl;
  avatarImg.alt = `${user.username} avatar`;
  avatarImg.style.width = '32px';
  avatarImg.style.height = '32px';
  avatarImg.style.borderRadius = '50%';

  const usernameSpan = document.createElement('span');
  usernameSpan.textContent = `${user.username}#${user.discriminator}`;

  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Выйти';
  logoutBtn.onclick = () => {
    removeToken();
    window.location.reload();
  };

  container.append(avatarImg, usernameSpan, logoutBtn);
  return container;
}

// ==== Инициализация страницы ====
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[DEBUG] DOM загружен');

  handleRedirect();

  const token = getToken();

  if (token) {
    console.log('[DEBUG] Токен найден:', token);

    const user = await fetchDiscordUser(token);

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (headerRight) {
        // Можно убрать или оставить навигацию по желанию
        // headerRight.innerHTML = ''; 
        headerRight.appendChild(createProfileMenu(user));
      }
    } else {
      console.warn('[DEBUG] Невалидный токен, удаляем...');
      removeToken();
      if (loginBtn) loginBtn.style.display = 'inline-block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
  }
});
