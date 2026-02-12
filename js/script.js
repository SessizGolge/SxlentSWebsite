let postsContainer = document.getElementById("postsContainer");

// MODAL ELEMENTS
const modal = document.getElementById("postModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalDate = document.getElementById("modalDate");
const modalLink = document.getElementById("modalLink");
const modalClose = document.querySelector(".post-modal-close");
const modalOverlay = document.querySelector(".post-modal-overlay");

// POSTS
fetch("jsons/posts.json?v=" + Date.now())
  .then(res => res.json())
  .then(posts => {
    postsContainer.innerHTML = "";
    const today = new Date();

    posts.forEach((post, index) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post";

      postDiv.style.animation = `postFadeUp 0.6s forwards`;
      postDiv.style.animationDelay = `${index * 0.15}s`;

      const postDate = new Date(post.date);
      const isToday =
        postDate.getFullYear() === today.getFullYear() &&
        postDate.getMonth() === today.getMonth() &&
        postDate.getDate() === today.getDate();

      const displayTitle = post.title || "Update";

      postDiv.innerHTML = `
        ${isToday ? `<span class="new-post-badge">New post!</span>` : ""}
        ${post.img ? `<img src="${post.img}" class="post-img">` : ""}
        <p class="post-text">${displayTitle}</p>
        <span class="post-date">${post.date}</span>
      `;

      // MODAL AÇ
      postDiv.addEventListener("click", () => {
        modalImg.src = post.img || "";
        modalImg.style.display = post.img ? "block" : "none";

        modalTitle.textContent = displayTitle;
        modalDesc.textContent = post.description || post.text || "";
        modalDate.textContent = post.date;

        if (post.link) {
          modalLink.href = post.link;
          modalLink.style.display = "inline-block";
        } else {
          modalLink.style.display = "none";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      });

      postsContainer.appendChild(postDiv);
    });
  })
  .catch(err => console.error("Posts error:", err));

// MODAL CLOSE
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// GREETING
function updateGreeting() {
  const title = document.querySelector(".home-title");
  const subtitle = document.querySelector(".home-subtitle");

  const hour = new Date().getHours();

  if (hour < 5) {
    title.textContent = "Still up, huh?";
    subtitle.textContent = "Running on pure willpower right now.";
  } else if (hour < 12) {
    title.textContent = "Good morning.";
    subtitle.textContent = "Fresh start, clean mind.";
  } else if (hour < 18) {
    title.textContent = "Good afternoon.";
    subtitle.textContent = "Chill vibe hours.";
  } else {
    title.textContent = "Good evening.";
    subtitle.textContent = "Long day, sit back for a sec.";
  }
}
updateGreeting();
