document.getElementById("discord-login").addEventListener("click", () => {
  const clientId = "1080748181752651776";
  const redirectUri = encodeURIComponent("https://ethernity.vercel.app/");
  const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;

  window.location.href = discordUrl;
});
