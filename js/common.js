// -------------------------
// COMMON AUTH HANDLER (v2.0)
// -------------------------
document.addEventListener("DOMContentLoaded", () => {

  const loginButtons = document.querySelectorAll(".login-only");
  const accountButtons = document.querySelectorAll(".logged-in-only");
  const logoutBtn = document.getElementById("logoutBtn");

  // -------------------------
  // AUTH UI GÜNCELLEME
  // -------------------------
  async function updateAuthUI() {
    if (!window.supabaseClient) return null;

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (user) {
      loginButtons.forEach(btn => btn.style.display = "none");
      accountButtons.forEach(btn => btn.style.display = "inline-block");
    } else {
      loginButtons.forEach(btn => btn.style.display = "inline-block");
      accountButtons.forEach(btn => btn.style.display = "none");
    }

    return user;
  }

  // -------------------------
  // INITIAL CHECK
  // -------------------------
  (async () => {
    await updateAuthUI();
  })();

  // -------------------------
  // AUTH STATE CHANGE
  // -------------------------
  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session);
      updateAuthUI();
    });
  }

  // -------------------------
  // LOGIN BUTTONS
  // -------------------------
  loginButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const user = await updateAuthUI();
      if (user) return; // zaten login
      window.location.href = "auth.html";
    });
  });

  // -------------------------
  // LOGOUT BUTTON
  // -------------------------
  if (logoutBtn && window.supabaseClient) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await window.supabaseClient.auth.signOut();
        window.location.href = "index.html";
      } catch (err) {
        console.error("Logout error:", err);
        alert("Çıkış yapılamadı!");
      }
    });
  }

});
