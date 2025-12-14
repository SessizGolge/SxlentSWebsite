// ==========================
// AUTH.JS
// ==========================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.87.1/dist/module/SupabaseClient.js";

// 🔐 SUPABASE SETUP
const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZlaG13cHJ5enViaHZ3dnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTQyMjIsImV4cCI6MjA4MTI5MDIyMn0.tK35WCIraPDxFtYc_YsMx07D3AFIgrhCgjiYHBzvAas";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------------
// DEBUG PANEL
// -------------------------
const consolePanel = document.getElementById("consolePanel");

(function() {
  if (!consolePanel) return;
  const oldLog = console.log;
  const oldErr = console.error;

  console.log = function(...args) {
    oldLog.apply(console, args);
    consolePanel.innerHTML += args.map(a => a instanceof Object ? JSON.stringify(a) : a).join(" ") + "<br>";
    consolePanel.scrollTop = consolePanel.scrollHeight;
  }

  console.error = function(...args) {
    oldErr.apply(console, args);
    consolePanel.innerHTML += "<span style='color:red;'>" + args.map(a => a instanceof Object ? JSON.stringify(a) : a).join(" ") + "</span><br>";
    consolePanel.scrollTop = consolePanel.scrollHeight;
  }
})();

// -------------------------
// DOM ELEMENTS
// -------------------------
const msg = document.getElementById("authMsg");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const googleBtn = document.getElementById("googleBtn");

// -------------------------
// AUTH FUNCTIONS
// -------------------------
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    msg.textContent = error.message;
    return;
  }
  location.href = "/";
}

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    msg.textContent = error.message;
    return;
  }
  msg.textContent = "Check your email for confirmation link.";
}

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin }
  });
}

// -------------------------
// BUTTON LISTENERS
// -------------------------
loginBtn?.addEventListener("click", login);
registerBtn?.addEventListener("click", register);
googleBtn?.addEventListener("click", loginWithGoogle);

// -------------------------
// SESSION CHECK
// -------------------------
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    location.href = "/";
  }
});
