// ==========================
// ACCOUNT.JS
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  // -------------------------
  // SUPABASE
  // -------------------------
  const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZlaG13cHJ5enViaHZ3dnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTQyMjIsImV4cCI6MjA4MTI5MDIyMn0.tK35WCIraPDxFtYc_YsMx07D3AFIgrhCgjiYHBzvAas";

  const supabaseClient = window.supabaseClient || supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // -------------------------
  // ELEMENTS
  // -------------------------
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profilePic = document.getElementById("profilePic");
  const logoutBtn = document.getElementById("logoutBtn");

  // Change password inputs & button
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmNewPassword = document.getElementById("confirmNewPassword");
  const confirmChangePassword = document.getElementById("confirmChangePassword");
  const passwordMsg = document.getElementById("passwordMsg");

  // -------------------------
  // LOAD PROFILE
  // -------------------------
  async function loadProfile() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      window.location.href = "auth.html";
      return;
    }

    const user = session.user;
    profileName.textContent = user.user_metadata.full_name || "No Name";
    profileEmail.textContent = user.email;
    profilePic.src = user.user_metadata.avatar_url || "images/default-avatar.png";
  }

  await loadProfile();

  // -------------------------
  // LOGOUT
  // -------------------------
  logoutBtn?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
  });

  // -------------------------
  // CHANGE PASSWORD
  // -------------------------
  confirmChangePassword?.addEventListener("click", async () => {
    passwordMsg.textContent = "";
    
    if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) {
      passwordMsg.textContent = "Please fill all fields.";
      return;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      passwordMsg.textContent = "New passwords do not match!";
      return;
    }

    try {
      // --- Re-authenticate with current password ---
      const { data: { session } } = await supabaseClient.auth.getSession();
      const userEmail = session.user.email;

      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword.value
      });

      if (signInError || !signInData.session) {
        passwordMsg.textContent = "Current password is incorrect.";
        return;
      }

      // --- Update password ---
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: newPassword.value
      });

      if (updateError) {
        passwordMsg.textContent = "Error updating password: " + updateError.message;
        return;
      }

      passwordMsg.style.color = "#00f2ea";
      passwordMsg.textContent = "Password successfully updated!";
      
      // Clear input fields
      currentPassword.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";

    } catch (err) {
      passwordMsg.textContent = "An error occurred. Try again.";
      console.error(err);
    }
  });
});
