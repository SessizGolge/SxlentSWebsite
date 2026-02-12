const postsContainer = document.getElementById("postsContainer");

const modal = document.getElementById("postModal");
const modalMedia = document.getElementById("modalMedia");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalDate = document.getElementById("modalDate");
const modalLink = document.getElementById("modalLink");
const modalClose = document.querySelector(".post-modal-close");
const modalOverlay = document.querySelector(".post-modal-overlay");

fetch("jsons/posts.json?v=" + Date.now())
  .then(res => res.json())
  .then(posts => {

    posts.forEach((p, i) => {
      p._dateObj = new Date(p.timestamp || p.date);
      p._i = i;
    });

    posts.sort((a, b) => {
      const d = b._dateObj - a._dateObj;
      return d !== 0 ? d : a._i - b._i;
    });

    postsContainer.innerHTML = "";

    posts.forEach((post, index) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post-row";
      postDiv.style.animation = `postFadeUp 0.5s forwards`;
      postDiv.style.animationDelay = `${index * 0.1}s`;

      const displayDate = post._dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      // LISTEDE EMBED YOK
      let thumbHTML = "";
      if (post.img) {
        thumbHTML = `<img src="${post.img}" class="post-thumb">`;
      } else if (post.embed) {
        thumbHTML = `<div class="post-embed-placeholder">▶</div>`;
      }

      postDiv.innerHTML = `
        ${thumbHTML}
        <div class="post-info">
          <h3 class="post-title">${post.title || "Update"}</h3>
          <p class="post-desc">${post.description || ""}</p>
          <span class="post-date">${displayDate}</span>
        </div>
      `;

      postDiv.addEventListener("click", () => {
        modalMedia.innerHTML = "";

        if (post.embed) {
          modalMedia.innerHTML = `
            <div class="modal-embed">
              ${post.embed}
            </div>
          `;
          modalLink.style.display = "none";
        } else if (post.img) {
          modalMedia.innerHTML = `<img src="${post.img}">`;
          modalLink.style.display = post.link ? "inline-block" : "none";
        }

        modalTitle.textContent = post.title || "Update";
        modalDesc.textContent = post.description || "";
        modalDate.textContent = displayDate;

        if (post.link && !post.embed) {
          modalLink.href = post.link;
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      });

      postsContainer.appendChild(postDiv);
    });
  });

modalClose.onclick = closeModal;
modalOverlay.onclick = closeModal;

function closeModal() {
  modal.classList.add("hidden");
  modalMedia.innerHTML = "";
  document.body.style.overflow = "";
}
