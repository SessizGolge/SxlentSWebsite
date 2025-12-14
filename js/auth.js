// SUPABASE SETUP
const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZlaG13cHJ5enViaHZ3dnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTQyMjIsImV4cCI6MjA4MTI5MDIyMn0.tK35WCIraPDxFtYc_YsMx07D3AFIgrhCgjiYHBzvAas";

// Burada supabaseJs yerine "supabase" olarak başlatmalıyız
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SESSION CHECK
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
