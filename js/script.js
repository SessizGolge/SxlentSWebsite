const postsContainer = document.getElementById("postsContainer");

fetch("jsons/posts.json?v=" + new Date().getTime()) // cache buster
  .then(response => response.json())
  .then(posts => {
    postsContainer.innerHTML = "";

    const today = new Date();

    posts.forEach((post, index) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post";

      // Animasyon
      postDiv.style.animation = `postFadeUp 0.6s forwards`;
      postDiv.style.animationDelay = `${index * 0.15}s`;

      // Link varsa click event
      if (post.link) {
        postDiv.addEventListener("click", () => {
          window.open(post.link, "_blank");
        });
      }

      // Tarihi parse et
      const postDate = new Date(post.date);

      // Aynı gün mü?
      const isToday =
        postDate.getFullYear() === today.getFullYear() &&
        postDate.getMonth() === today.getMonth() &&
        postDate.getDate() === today.getDate();

      // HTML yazdır
      postDiv.innerHTML = `
        ${isToday ? `<span class="new-post-badge">New post!</span>` : ""}
        ${post.img ? `<img src="${post.img}" alt="post image" class="post-img">` : ""}
        <p class="post-text">${post.text}</p>
        <span class="post-date">${post.date}</span>
      `;

      postsContainer.appendChild(postDiv);
    });
  })
  .catch(err => console.error("Postları yüklerken hata:", err));


//-------------------------
//   G R E E T I N G
//-------------------------
function updateGreeting() {
  const title = document.querySelector(".home-title");
  const subtitle = document.querySelector(".home-subtitle");

  const hour = new Date().getHours();

  let titleText = "Welcome!";
  let subtitleText = "This is my little chilling zone. I usually upload some posts here. Take a look below!";

  if (hour >= 0 && hour < 5) {
    titleText = "Still up, huh?";
    subtitleText = "Not judging, just… you're definitely running on pure willpower right now.";
  } 
  else if (hour >= 5 && hour < 12) {
    titleText = "Good morning.";
    subtitleText = "Fresh start, clean mind. Scroll down if you want something to warm up the day.";
  } 
  else if (hour >= 12 && hour < 18) {
    titleText = "Good afternoon.";
    subtitleText = "Chill vibe hours. I drop updates here sometimes, feel free to check.";
  } 
  else if (hour >= 18 && hour <= 23) {
    titleText = "Good evening.";
    subtitleText = "Long day, huh. Sit back for a sec, I got some stuff down below.";
  }

  title.textContent = titleText;
  subtitle.textContent = subtitleText;
}

updateGreeting();
