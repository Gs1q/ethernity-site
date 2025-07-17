// Конфиг — укажи свой Client ID и Redirect URI (в Discord Dev Portal)
const CLIENT_ID = '1395303543832969337';
const REDIRECT_URI = "https://ethernity.vercel.app/"; // без `index.html`, редирект сюда
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

// DOM-элементы
const loginBtn = document.getElementById('discord-login');
const headerRight = document.querySelector('.header-right');
const serversBtn = document.getElementById('servers-btn');
const newsBtn = document.getElementById('news-btn');
const forumBtn = document.getElementById('forum-btn');

// Навигация
if (serversBtn) serversBtn.onclick = () => { window.location.href = 'servers.html'; };
if (newsBtn)    newsBtn.onclick = ()    => { window.location.href = 'news.html'; };
if (forumBtn)   forumBtn.onclick = ()   => { window.location.href = 'forum.html'; };

// Кнопка входа
if (loginBtn) {
  loginBtn.onclick = () => {
    window.location.href = DISCORD_OAUTH_URL;
  };
}

// Парсинг хэша
function parseHashParams() {
  const hash = window.location.hash.substring(1);
  return hash.split('&').reduce((res, part) => {
    const [key, val] = part.split('=');
    if (key) res[key] = decodeURIComponent(val);
    return res;
  }, {});
}

// Очищает хэш и редиректит на главную
function handleRedirect() {
  const params = parseHashParams();
  if (params.access_token) {
    localStorage.setItem('discord_access_token', params.access_token);
    // удаляем хэш из URL
    history.replaceState(null, document.title, window.location.origin + window.location.pathname);
    // редиректим на главную без хэша
    window.location.href = 'index.html';
    return true;
  }
  return false;
}

// Получение токена из localStorage
function getToken() {
  return localStorage.getItem('discord_access_token');
}

function removeToken() {
  localStorage.removeItem('discord_access_token');
}

async function fetchDiscordUser(token) {
  try {
    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Auth error');
    return await res.json();
  } catch {
    return null;
  }
}

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

window.addEventListener('DOMContentLoaded', async () => {
  if (handleRedirect()) return;

  const token = getToken();
  if (token) {
    const user = await fetchDiscordUser(token);
    if (user) {
      loginBtn.style.display = 'none';
      headerRight.appendChild(createProfileMenu(user));
    } else {
      removeToken();
      loginBtn.style.display = 'inline-block';
    }
  } else {
    loginBtn.style.display = 'inline-block';
  }
});
