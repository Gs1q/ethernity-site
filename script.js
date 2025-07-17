// Discord OAuth конфиг — замените CLIENT_ID на свой
const CLIENT_ID = 'ТВОЙ_CLIENT_ID'; // <-- ВАЖНО: укажи свой ID!
const REDIRECT_URI = window.location.origin + window.location.pathname;
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;

// Элементы
const loginBtn = document.getElementById('discord-login');
const headerRight = document.querySelector('.header-right');

// Навигация по кнопкам
document.getElementById('servers-btn').addEventListener('click', () => {
  window.location.href = 'servers.html';
});
document.getElementById('news-btn').addEventListener('click', () => {
  window.location.href = 'news.html';
});
document.getElementById('forum-btn').addEventListener('click', () => {
  window.location.href = 'forum.html';
});

// Парсим хэш токена из URL после редиректа
function parseHashParams() {
  const hash = window.location.hash.substring(1);
  return hash.split('&').reduce((result, item) => {
    const parts = item.split('=');
    if(parts[0]) result[parts[0]] = decodeURIComponent(parts[1]);
    return result;
  }, {});
}

// Убираем хэш из адресной строки без перезагрузки
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
    if(!res.ok) throw new Error('Ошибка авторизации');
    return await res.json();
  } catch(e) {
    console.error(e);
    return null;
  }
}

// Создаем меню профиля с аватаром и выпадающим меню
function createProfileMenu(user) {
  const container = document.createElement('div');
  container.classList.add('profile-menu');

  const avatar = document.createElement('img');
  avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  avatar.alt = user.username;

  const nameSpan = document.createElement('span');
  nameSpan.textContent = user.username;

  container.appendChild(avatar);
  container.appendChild(nameSpan);

  const dropdown = document.createElement('div');
  dropdown.classList.add('dropdown');

  const profileLink = document.createElement('a');
  profileLink.href = `https://discord.com/users/${user.id}`;
  profileLink.target = '_blank';
  profileLink.textContent = 'Профиль Discord';

  const logoutLink = document.createElement('a');
  logoutLink.href = '#';
  logoutLink.textContent = 'Выйти';
  logoutLink.addEventListener('click', e => {
    e.preventDefault();
    removeToken();
    window.location.reload();
  });

  dropdown.appendChild(profileLink);
  dropdown.appendChild(logoutLink);
  container.appendChild(dropdown);

  container.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', e => {
    if (!container.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  return container;
}

// Инициализация страницы
async function init() {
  const params = parseHashParams();

  if(params.access_token) {
    saveToken(params.access_token);
    clearUrlHash();
  }

  const token = getToken();

  if(token) {
    const user = await fetchDiscordUser(token);
    if(user) {
      loginBtn.style.display = 'none';
      const profileMenu = createProfileMenu(user);
      headerRight.appendChild(profileMenu);
    } else {
      removeToken();
      loginBtn.style.display = 'inline-block';
    }
  } else {
    loginBtn.style.display = 'inline-block';
  }
}

loginBtn.addEventListener('click', () => {
  window.location.href = DISCORD_OAUTH_URL;
});

init();
