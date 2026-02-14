const postsContainer = document.getElementById("postsContainer");

const modal = document.getElementById("postModal");
const modalMedia = document.getElementById("modalMedia");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalDate = document.getElementById("modalDate");
const modalLink = document.getElementById("modalLink");
const modalClose = document.querySelector(".post-modal-close");
const modalOverlay = document.querySelector(".post-modal-overlay");

fetch("/jsons/posts.json?v=" + Date.now())
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
        ${isNewPost ? `<div class="new-post-badge">New!</div>` : ""}
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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((err) => {
        console.error("Service Worker error:", err);
      });
  });
}

// ===============================
// 🔔 PUSH NOTIFICATION TOGGLE (CLEAN VERSION)
// ===============================

const notifBtn = document.getElementById("notifToggle");
const notifCheck = document.querySelector(".notif-check");

let messaging = null;

if (firebase.apps.length) {
  messaging = firebase.messaging();
}

const VAPID_KEY = "BGU2enzMZuJIvMvBgbRIlb2Xqvs0z7Bg1B8EAIXwYynJYzi_FwKnV8Gdb65XkGItlHVlHDYrLFJC_JOMvXE1N6o";

function setUI(enabled) {
  if (enabled) {
    notifCheck.classList.remove('hidden');
    notifBtn.title = 'Disable notifications';
  } else {
    notifCheck.classList.add('hidden');
    notifBtn.title = 'Enable notifications';
  }
}

async function getCurrentToken() {
  if (Notification.permission !== "granted") return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await messaging.getToken({
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    return token;
  } catch (e) {
    console.error('Error getting token:', e);
    return null;
  }
}

async function enableNotifications() {
  console.log("📢 Enabling notifications...");

  const permission = await Notification.requestPermission();
  console.log("Permission result:", permission);

  if (permission !== "granted") {
    console.warn("Notification permission denied");
    return;
  }

  const token = await getCurrentToken();
  console.log("Got token:", token);

  if (!token) {
    console.error("Failed to get messaging token");
    return;
  }

  try {
    const existingDoc = await firebase.firestore()
      .collection("tokens")
      .doc(token)
      .get();

    if (!existingDoc.exists) {
      await firebase.firestore()
        .collection("tokens")
        .doc(token)
        .set({
          token,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          userAgent: navigator.userAgent
        });
      console.log("✅ Token saved to Firestore!");
    } else {
      console.log("✓ Token already exists in Firestore");
    }

    setUI(true);
    localStorage.setItem('notificationsEnabled', 'true');
  } catch (e) {
    console.error("Firestore write error:", e);
  }
}


async function disableNotifications() {
  console.log("🔕 Disabling notifications...");

  const token = await getCurrentToken();

  if (token) {
    try {
      await firebase.firestore()
        .collection("tokens")
        .doc(token)
        .delete();
      console.log("✓ Token removed from Firestore");

      await messaging.deleteToken();
      console.log("✓ Token deleted from messaging");
    } catch (e) {
      console.error("Error disabling notifications:", e);
    }
  }

  setUI(false);
  localStorage.setItem('notificationsEnabled', 'false');
}

async function initNotificationState() {
  const token = await getCurrentToken();
  setUI(token);
}

notifBtn.addEventListener("click", async () => {
  const token = await getCurrentToken();

  if (!token) {
    // Notifications disabled → enable them
    await enableNotifications();
  } else {
    // Notifications enabled → disable them
    await disableNotifications();
  }
});

// Sayfa açılınca gerçek state’i belirle
initNotificationState();
