const postsContainer = document.getElementById("postsContainer");

fetch("posts.json?v=" + new Date().getTime()) // <-- cache buster eklendi
  .then(response => response.json())
  .then(posts => {
    // Önce eski postları temizle
    postsContainer.innerHTML = "";

    posts.forEach((post, index) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post";

      // Animasyon delay ekleme
      postDiv.style.animation = `postFadeUp 0.6s forwards`;
      postDiv.style.animationDelay = `${index * 0.15}s`;

      let linkText = "";
      if (post.link) {
        linkText = `<span class="post-link-text">Click for the additional link</span>`;
        postDiv.addEventListener("click", () => {
          window.open(post.link, "_blank");
        });
      }

      postDiv.innerHTML = `
        ${post.img ? `<img src="${post.img}" alt="post image" class="post-img">` : ""}
        <p class="post-text">${post.text}</p>
        <span class="post-date">${post.date}</span>
        ${linkText}
      `;

      postsContainer.appendChild(postDiv);
    });
  })
  .catch(err => console.error("Postları yüklerken hata:", err));
