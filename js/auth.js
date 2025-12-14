// ==========================
// COMMON AUTH HANDLER & SESSION MANAGER
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // SUPABASE SETUP
  // -------------------------
  const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZlaG13cHJ5enViaHZ3dnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTQyMjIsImV4cCI6MjA4MTI5MDIyMn0.tK35WCIraPDxFtYc_YsMx07D3AFIgrhCgjiYHBzvAas";

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient; // global
  console.log("Supabase loaded:", supabaseClient);

  // -------------------------
  // LOGIN/REGISTER FORM (auth.html)
  // -------------------------
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const msg = document.getElementById("authMsg");

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const googleBtn = document.getElementById("googleBtn");

  async function login() {
    if (!emailInput || !passwordInput) return;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      msg.textContent = "Email & password required";
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      msg.textContent = error.message;
      console.error(error.message);
      return;
    }
    console.log("Login success:", data);
    window.location.href = "/";
  }

  async function registerUser() {
    if (!emailInput || !passwordInput) return;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      msg.textContent = "Email & password required";
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      msg.textContent = error.message;
      console.error(error.message);
      return;
    }

    msg.textContent = "Check your email for confirmation.";
    console.log("Register success:", data);
  }

  async function googleLogin() {
    await supabaseClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  loginBtn?.addEventListener("click", login);
  registerBtn?.addEventListener("click", registerUser);
  googleBtn?.addEventListener("click", googleLogin);

  // -------------------------
  // GLOBAL AUTH UI HANDLER
  // -------------------------
  const loginButtons = document.querySelectorAll(".login-only");
  const accountButtons = document.querySelectorAll(".logged-in-only");
  const logoutBtn = document.getElementById("logoutBtn");

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

  // İlk kontrol
  updateAuthUI();

  // Auth state değiştiğinde UI güncelle
  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session);
      updateAuthUI();
      // auth.html’den login sonrası yönlendirme
      if (event === "SIGNED_IN" && window.location.pathname.includes("auth.html")) {
        window.location.href = "/";
      }
    });
  }

  // Login buttonları
  loginButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const user = await updateAuthUI();
      if (user) return; // zaten login
      window.location.href = "auth.html";
    });
  });

  // Logout
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

  console.log("Common auth handler initialized ✅");
});
