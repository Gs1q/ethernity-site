document.getElementById("discord-login").addEventListener("click", () => {
  const clientId = "1395303543832969337"; // Ваш Client ID
  const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
  const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;

  window.location.href = discordUrl;
});

window.addEventListener("load", () => {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    // Убираем токен из URL (чтобы не висел)
    window.history.replaceState(null, null, window.location.pathname);

    fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(user => {
        const header = document.querySelector("header");
        const loginBtn = document.getElementById("discord-login");
        loginBtn.style.display = "none";

        // Создаём кнопку профиля
        const profileBtn = document.createElement("div");
        profileBtn.className = "profile-menu";
        profileBtn.innerHTML = `
          <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar" />
          <span>${user.username}</span>
          <div class="dropdown">
            <a href="#">⚙ Настройки</a>
            <a href="#" id="logout">🚪 Выйти</a>
          </div>
        `;
        header.appendChild(profileBtn);

        // Тоггл меню
        profileBtn.addEventListener("click", () => {
          profileBtn.classList.toggle("open");
        });

        // Выход — просто очистка URL и показ кнопки
        document.getElementById("logout").addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = window.location.pathname;
        });
      })
      .catch(() => {
        alert("Ошибка получения данных пользователя. Попробуйте войти снова.");
        window.location.href = window.location.pathname;
      });
  }
});
