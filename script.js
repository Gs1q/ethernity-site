// script.js — Общая логика авторизации на всех страницах

const clientId = "1395303543832969337";
const redirectUri = encodeURIComponent(window.location.origin + "/");

// Сохраняем токен
function saveToken(token) {
  sessionStorage.setItem("discord_token", token);
}

// Получаем токен
function getToken() {
  return sessionStorage.getItem("discord_token");
}

// Удаляем токен
function clearToken() {
  sessionStorage.removeItem("discord_token");
}

// Показываем профиль после входа
function showProfile(user) {
  const loginBtn = document.getElementById("discord-login");
  if (loginBtn) loginBtn.style.display = "none";

  const nav = document.querySelector(".header-right");
  if (!nav) return;

  // Удаляем если уже есть профиль
  const existing = nav.querySelector(".profile-menu");
  if (existing) existing.remove();

  const profile = document.createElement("div");
  profile.className = "profile-menu";
  profile.innerHTML = `
    <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64" />
    <span>${user.username}#${user.discriminator}</span>
    <div class="dropdown">
      <a href="#" id="settings">Настройки</a>
      <a href="#" id="logout">Выйти</a>
    </div>
  `;
  nav.appendChild(profile);

  profile.addEventListener("click", e => {
    e.stopPropagation();
    const dd = profile.querySelector(".dropdown");
    dd.style.display = dd.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    const dd = profile.querySelector(".dropdown");
    if (dd) dd.style.display = "none";
  });

  nav.querySelector("#logout").onclick = () => {
    clearToken();
    location.reload();
  };

  nav.querySelector("#settings").onclick = e => {
    e.preventDefault();
    alert("Настройки пока не реализованы.");
  };
}

// Получаем пользователя
async function fetchUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Не удалось загрузить профиль");
  return await res.json();
}

// Проверяем логин
async function checkLogin() {
  const token = getToken();
  if (!token) return;
  try {
    const user = await fetchUser(token);
    showProfile(user);
  } catch {
    clearToken();
  }
}

// Обработка хэша с токеном
function parseTokenFromUrl() {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get("access_token");
    if (token) {
      saveToken(token);
      window.history.replaceState(null, null, window.location.pathname);
      location.href = window.location.pathname;
      return true;
    }
  }
  return false;
}

// Запуск входа
function login() {
  const scope = "identify";
  const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  location.href = url;
}

// Настраиваем кнопку и проверяем авторизацию
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("discord-login")?.addEventListener("click", login);
  parseTokenFromUrl();
  checkLogin();
});
