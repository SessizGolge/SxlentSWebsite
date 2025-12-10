const postsContainer = document.getElementById("postsContainer");

// Backend URL’in buraya gelecek
const BACKEND_URL = "https://sxlents-backend.onrender.com";

fetch(`${BACKEND_URL}/posts?v=${new Date().getTime()}`)
  .then(res => res.json())
  .then(posts => {
    postsContainer.innerHTML = "";

    posts.forEach((post, index) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post";
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
