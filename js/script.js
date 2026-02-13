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

      // 🔥 NEW POST KONTROLÜ
      const today = new Date();
      const isNewPost =
        post._dateObj.toDateString() === today.toDateString();

      if (isNewPost) {
        postDiv.classList.add("is-new");
      }

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
        ${isNewPost ? `<div class="new-post-badge">New post!</div>` : ""}
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
      } else if (post.img) {
        modalMedia.innerHTML = `<img src="${post.img}">`;
      }

      // 🔗 LINK KONTROLÜ AYRI
      if (post.link) {
        modalLink.href = post.link;
        modalLink.style.display = "inline-block";
      } else {
        modalLink.style.display = "none";
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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker error:", err);
    });
}

// ===============================
// 🔔 PUSH NOTIFICATION TOGGLE
// ===============================

const notifBtn = document.getElementById("notifToggle");
const notifCheck = document.querySelector(".notif-check");

const messaging = firebase.messaging();

// VAPID PUBLIC KEY BURAYA
const VAPID_KEY = "BGU2enzMZuJIvMvBgbRIlb2Xqvs0z7Bg1B8EAIXwYynJYzi_FwKnV8Gdb65XkGItlHVlHDYrLFJC_JOMvXE1N6o";

function updateUI(enabled) {
  if (enabled) {
    notifCheck.classList.remove("hidden");
  } else {
    notifCheck.classList.add("hidden");
  }
}

async function enableNotifications() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notifications blocked.");
      return;
    }

    const token = await messaging.getToken({
      vapidKey: VAPID_KEY
    });

    if (token) {
      console.log("FCM Token:", token);

      // 🔥 BURAYA İSTERSEN TOKEN'I DATABASE'E GÖNDERİRSİN
      // fetch("/save-token", { method: "POST", body: JSON.stringify({ token }) })

      localStorage.setItem("notifEnabled", "true");
      updateUI(true);
    }

  } catch (err) {
    console.error("Notification error:", err);
  }
}

notifBtn.addEventListener("click", () => {
  const enabled = localStorage.getItem("notifEnabled") === "true";

  if (!enabled) {
    enableNotifications();
  }
});

// Sayfa açılınca check göster
if (localStorage.getItem("notifEnabled") === "true") {
  updateUI(true);
}

