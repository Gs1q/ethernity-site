(() => {
  const LS_USERS = 'forum_users';
  const LS_TOPICS = 'forum_topics';
  const LS_CURRENT_USER = 'forum_current_user';

  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authError = document.getElementById('auth-error');
  const authSection = document.getElementById('auth-section');
  const userInfo = document.getElementById('user-info');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');

  const topicsList = document.getElementById('topics-list');
  const topicView = document.getElementById('topic-view');
  const topicViewTitle = document.getElementById('topic-view-title');
  const closeTopicBtn = document.getElementById('close-topic-view');
  const backBtn = document.getElementById('back-to-topics-btn');
  const postsList = document.getElementById('posts-list');
  const postText = document.getElementById('post-text');
  const addPostBtn = document.getElementById('add-post-btn');
  const postError = document.getElementById('post-error');
  const createPostSection = document.getElementById('create-post-section');

  const newTopicTitle = document.getElementById('new-topic-title');
  const createTopicBtn = document.getElementById('create-topic-btn');
  const createTopicError = document.getElementById('create-topic-error');
  const searchInput = document.getElementById('search-input');

  let users = [];
  let topics = [];
  let currentUser = null;
  let currentTopicId = null;

  // --- Хранилище ---
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function load(key, fallback) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  }

  // --- Форматирование ---
  function formatDate(date) {
    return new Date(date).toLocaleString('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  function renderUserInfo() {
    if (currentUser) {
      userAvatar.textContent = currentUser.login[0].toUpperCase();
      userName.textContent = currentUser.login;
      userRole.textContent = currentUser.role === 'admin' ? 'Администратор' : '';
      authSection.classList.add('hidden');
      userInfo.classList.remove('hidden');
      userInfo.classList.toggle('admin', currentUser.role === 'admin');
    } else {
      userInfo.classList.add('hidden');
      authSection.classList.remove('hidden');
    }
  }

  function renderTopics() {
    topicsList.innerHTML = '';
    const query = searchInput.value.trim().toLowerCase();

    topics
      .filter(t => t.title.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(topic => {
        const div = document.createElement('div');
        div.className = 'topic';
        div.innerHTML = `
          <div class="topic-title">${topic.title}</div>
          <div class="topic-meta">Создано: ${formatDate(topic.createdAt)} — ${topic.posts.length} сообщений</div>
        `;
        div.addEventListener('click', () => openTopic(topic.id));

        // Только админ может удалить
        if (currentUser?.role === 'admin') {
          const delBtn = document.createElement('button');
          delBtn.textContent = '✖';
          delBtn.title = 'Удалить тему';
          delBtn.style.marginLeft = '10px';
          delBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Удалить тему?')) {
              topics = topics.filter(t => t.id !== topic.id);
              save(LS_TOPICS, topics);
              renderTopics();
            }
          };
          div.appendChild(delBtn);
        }

        topicsList.appendChild(div);
      });

    if (!topicsList.innerHTML) {
      topicsList.innerHTML = `<p style="text-align:center;color:#777">Тем пока нет</p>`;
    }
  }

  function renderPosts() {
    postsList.innerHTML = '';
    const topic = topics.find(t => t.id === currentTopicId);
    if (!topic) return;

    topic.posts.forEach(post => {
      const div = document.createElement('div');
      div.className = 'post';
      div.innerHTML = `
        <div class="post-header">
          <span><b>${post.author}</b></span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
        <div class="post-content">${post.content}</div>
      `;

      // Удаление постов для админа
      if (currentUser?.role === 'admin') {
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Удалить';
        delBtn.style.marginTop = '5px';
        delBtn.onclick = () => {
          if (confirm('Удалить пост?')) {
            topic.posts = topic.posts.filter(p => p.id !== post.id);
            save(LS_TOPICS, topics);
            renderPosts();
          }
        };
        div.appendChild(delBtn);
      }

      postsList.appendChild(div);
    });

    if (!topic.posts.length) {
      postsList.innerHTML = `<p style="text-align:center;color:#777;">Постов пока нет</p>`;
    }
  }

  function openTopic(id) {
    currentTopicId = id;
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    topicViewTitle.textContent = topic.title;
    topicView.classList.remove('hidden');
    renderPosts();
    createPostSection.classList.toggle('hidden', !currentUser);
    postText.value = '';
  }

  function closeTopic() {
    topicView.classList.add('hidden');
    currentTopicId = null;
  }

  // --- События ---
  loginBtn.onclick = () => {
    const login = loginInput.value.trim();
    const pass = passwordInput.value;
    const user = users.find(u => u.login === login && u.password === pass);
    if (!user) {
      authError.textContent = 'Неверный логин или пароль';
      authError.classList.remove('hidden');
      return;
    }
    currentUser = { login: user.login, role: user.role };
    save(LS_CURRENT_USER, currentUser);
    renderUserInfo();
    renderTopics();
  };

  registerBtn.onclick = () => {
    const login = loginInput.value.trim();
    const pass = passwordInput.value;
    if (users.find(u => u.login === login)) {
      authError.textContent = 'Пользователь уже существует';
      authError.classList.remove('hidden');
      return;
    }
    const role = login === 'admin' ? 'admin' : 'user';
    const newUser = { login, password: pass, role };
    users.push(newUser);
    save(LS_USERS, users);
    currentUser = { login, role };
    save(LS_CURRENT_USER, currentUser);
    renderUserInfo();
    renderTopics();
  };

  logoutBtn.onclick = () => {
    currentUser = null;
    save(LS_CURRENT_USER, null);
    renderUserInfo();
    renderTopics();
  };

  createTopicBtn.onclick = () => {
    const title = newTopicTitle.value.trim();
    if (!title) return;
    if (!currentUser) {
      createTopicError.textContent = 'Требуется авторизация';
      createTopicError.classList.remove('hidden');
      return;
    }
    const newTopic = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      posts: [],
    };
    topics.unshift(newTopic);
    save(LS_TOPICS, topics);
    renderTopics();
    newTopicTitle.value = '';
  };

  addPostBtn.onclick = () => {
    const text = postText.value.trim();
    if (!text || !currentUser || !currentTopicId) return;
    const topic = topics.find(t => t.id === currentTopicId);
    if (!topic) return;
    topic.posts.push({
      id: Date.now().toString(),
      author: currentUser.login,
      content: text,
      createdAt: new Date().toISOString(),
    });
    save(LS_TOPICS, topics);
    postText.value = '';
    renderPosts();
  };

  closeTopicBtn.onclick = closeTopic;
  backBtn.onclick = closeTopic;
  searchInput.oninput = renderTopics;

  // --- Инициализация ---
  function init() {
    users = load(LS_USERS, []);
    topics = load(LS_TOPICS, []);
    currentUser = load(LS_CURRENT_USER, null);
    renderUserInfo();
    renderTopics();
  }

  init();
})();
