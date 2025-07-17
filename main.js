document.getElementById("discord-login").addEventListener("click", () => {
  const clientId = "1395303543832969337";
  const redirectUri = encodeURIComponent("https://ethernity.vercel.app/");
  const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;
  window.location.href = discordUrl;
});

window.addEventListener("load", () => {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    // Удаляем access_token из адресной строки
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
        loginBtn.style.display = "none"; // скрыть кнопку входа

        const profile = document.createElement("div");
        profile.className = "profile";
        profile.innerHTML = `
          <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="36" height="36" />
          <span>${user.username}#${user.discriminator}</span>
        `;
        header.appendChild(profile);
      });
  }
});
