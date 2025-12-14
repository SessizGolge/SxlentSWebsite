import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.35.0/dist/supabase.js";

// 🔐 SUPABASE SETUP
const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZlaG13cHJ5enViaHZ3dnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTQyMjIsImV4cCI6MjA4MTI5MDIyMn0.tK35WCIraPDxFtYc_YsMx07D3AFIgrhCgjiYHBzvAas";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DEBUG PANEL
const debugPanel = document.getElementById("debugPanel");
function logDebug(msg) {
  console.log(msg);
  if (debugPanel) {
    const el = document.createElement("div");
    el.className = "log";
    el.textContent = msg;
    debugPanel.appendChild(el);
    debugPanel.scrollTop = debugPanel.scrollHeight;
  }
}

// -------------------------
// AUTH HELPERS
// -------------------------
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logDebug("Login error: " + error.message);
      return;
    }
    logDebug("Login successful!");
    location.href = "/";
  } catch (err) {
    logDebug("Login exception: " + err);
  }
}

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      logDebug("Register error: " + error.message);
      return;
    }
    logDebug("Check your email for confirmation link.");
  } catch (err) {
    logDebug("Register exception: " + err);
  }
}

async function loginWithGoogle() {
  try {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    logDebug("Redirecting to Google login...");
  } catch (err) {
    logDebug("Google login error: " + err);
  }
}

// Butonlara bağla
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("registerBtn").addEventListener("click", register);
document.getElementById("googleBtn").addEventListener("click", loginWithGoogle);

// SESSION CHECK
supabase.auth.onAuthStateChange((event, session) => {
  logDebug("Auth event: " + event);
  if (event === "SIGNED_IN") {
    logDebug("User signed in: " + JSON.stringify(session.user));
    document.body.classList.add("logged-in");
    location.href = "/";
  }
  if (event === "SIGNED_OUT") {
    document.body.classList.remove("logged-in");
  }
});
