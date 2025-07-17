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

    fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(user => {
        const userInfo = document.getElementById("user-info");
        userInfo.innerHTML = `
          <div class="profile-block">
            <p>Вы вошли как <b>${user.username}#${user.discriminator}</b></p>
            <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="100" style="border-radius: 50%;" />
          </div>
        `;
      });
  }
});
