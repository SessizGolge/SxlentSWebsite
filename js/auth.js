// 🔐 SUPABASE SETUP
const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yXDanWtrvOHNOzj6PY2uiA_4K4voP1k";

const supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// -------------------------
// AUTH HELPERS
// -------------------------

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

// -------------------------
// SESSION CHECK
// -------------------------
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);

  if (event === "SIGNED_IN") {
    console.log("User signed in:", session.user);
    document.body.classList.add("logged-in");
    location.href = "/";
  }

  if (event === "SIGNED_OUT") {
    document.body.classList.remove("logged-in");
  }
});
