const DEV_KEY = "musabsecret123"; // bu frontend'de olacak ama yeterince gizli tut
const API_URL = "https://sxlents-backend.onrender.com"; // Railway / Vercel / localhost

let isDevMode = false;

if(prompt("Enter dev password (leave empty for normal mode):") === "SxlentDev123"){
  isDevMode = true;
  document.getElementById("devPanel").style.display = "block";
  alert("Developer Mode Active!");
}

if(isDevMode){
  const addBtn = document.getElementById("addPostBtn");

  addBtn.addEventListener("click", async () => {
    const text = document.getElementById("postText").value.trim();
    const img = document.getElementById("postImg").value.trim();
    const link = document.getElementById("postLink").value.trim();

    if(!text) return alert("Post text cannot be empty!");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: DEV_KEY,
          description: text,
          image: img,
          link: link
        })
      });

      const result = await response.json();

      if(result.status === "ok"){
        // sayfaya da ekleyelim
        const postsContainer = document.getElementById("postsContainer");
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.style.animation = `postFadeUp 0.6s forwards`;
        postDiv.innerHTML = `
          ${img ? `<img src="${img}" class="post-img">` : ""}
          <p class="post-text">${text}</p>
          <span class="post-date">${new Date().toDateString()}</span>
          ${link ? `<span class="post-link-text">Click for the additional link</span>` : ""}
        `;
        if(link) postDiv.addEventListener("click", () => window.open(link, "_blank"));

        postsContainer.prepend(postDiv);

        document.getElementById("postText").value = "";
        document.getElementById("postImg").value = "";
        document.getElementById("postLink").value = "";

        alert("Post added successfully!");
      } else {
        alert("Error: " + result.message);
      }
    } catch(e) {
      console.error(e);
      alert("Request failed.");
    }
  });
}
