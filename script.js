// Конфиг — укажи свой Client ID и Redirect URI (должен быть в Discord Dev Portal)
const CLIENT_ID = '1395303543832969337';
const REDIRECT_URI = "https://ethernity.vercel.app/";
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

// Элементы DOM
const loginBtn = document.getElementById('discord-login');
const headerRight = document.querySelector('.header-right');

// Навигация по кнопкам
const serversBtn = document.getElementById('servers-btn');
const newsBtn = document.getElementById('news-btn');
const forumBtn = document.getElementById('forum-btn');

if (serversBtn) serversBtn.addEventListener('click', () => window.location.href = 'servers.html');
if (newsBtn) newsBtn.addEventListener('click', () => window.location.href = 'news.html');
if (forumBtn) forumBtn.addEventListener('click', () => window.location.href = 'forum.html');

// Обработчик кнопки входа через Discord
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = DISCORD_OAUTH_URL;
  });
}

// Функция для парсинга хэша из URL (для access_token)
function parseHashParams() {
  const hash = window.location.hash.substring(1); // убираем #
  return hash.split('&').reduce((result, item) => {
    const parts = item.split('=');
    if(parts[0]) result[parts[0]] = decodeURIComponent(parts[1]);
    return result;
  }, {});
}

// Убираем хэш из адресной строки без перезагрузки страницы
function clearUrlHash() {
  history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

// Работа с токеном в localStorage
function saveToken(token) {
  localStorage.setItem('discord_access_token', token);
}
function getToken() {
  return localStorage.getItem('discord_access_token');
}
function removeToken() {
  localStorage.removeItem('discord_access_token');
}

// Запрос данных пользователя Discord
async function fetchDiscordUser(token) {
  try {
    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Ошибка авторизации');
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Создаем меню профиля с аватаром и кнопкой выхода
function createProfileMenu(user) {
  const container = document.createElement('div');
  container.classList.add('profile-menu');

  const avatar = document.createElement('img');
  avatar.src = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : 'default-avatar.png';
  avatar.alt = 'Аватар пользователя';
  avatar.classList.add('avatar');

  const username = document.createElement('span');
  username.textContent = `${user.username}#${user.discriminator}`;
  username.classList.add('username');

  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Выйти';
  logoutBtn.classList.add('logout-btn');
  logoutBtn.addEventListener('click', () => {
    removeToken();
    window.location.reload();
  });

  container.appendChild(avatar);
  container.appendChild(username);
  container.appendChild(logoutBtn);

  return container;
}

// Основная логика после загрузки страницы
window.addEventListener('DOMContentLoaded', async () => {
  // Парсим токен из хэша URL (если есть)
  const params = parseHashParams();

  if (params.access_token) {
    saveToken(params.access_token);
    clearUrlHash(); // <-- очищаем адресную строку от токена
  }

  const token = getToken();

  if (token) {
    const user = await fetchDiscordUser(token);
    if (user) {
      // Убираем кнопку входа
      if (loginBtn) loginBtn.style.display = 'none';
      // Добавляем профиль
      if (headerRight) {
        const profileMenu = createProfileMenu(user);
        headerRight.appendChild(profileMenu);
      }
    } else {
      // Если токен просрочен или невалидный - удалить и показать кнопку
      removeToken();
      if (loginBtn) loginBtn.style.display = 'inline-block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
  }
});
