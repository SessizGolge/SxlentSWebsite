// ==========================
// ACCOUNT.JS
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  // -------------------------
  // SUPABASE
  // -------------------------
  const SUPABASE_URL = "https://tzbfehmwpryzubhvwvrz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZlaG13cHJ5enViaHZ3dnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTQyMjIsImV4cCI6MjA4MTI5MDIyMn0.tK35WCIraPDxFtYc_YsMx07D3AFIgrhCgjiYHBzvAas";

  const supabaseClient =
    window.supabaseClient ||
    supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // -------------------------
  // ELEMENTS
  // -------------------------
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profilePic = document.getElementById("profilePic");
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const deleteMsg = document.getElementById("deleteMsg");


  // Change password
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmNewPassword = document.getElementById("confirmNewPassword");
  const confirmChangePassword = document.getElementById("confirmChangePassword");
  const passwordMsg = document.getElementById("passwordMsg");
  const changePasswordContainer = document.querySelector(".change-password-container");

  // Avatar
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const avatarInput = document.getElementById("avatarInput");

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

    // 🔥 GOOGLE LOGIN CHECK
    const providers = user.app_metadata?.providers || [];
    if (providers.includes("google")) {
      changePasswordContainer.style.display = "none";
    }
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
      const { data: { session } } = await supabaseClient.auth.getSession();
      const userEmail = session.user.email;

      const { data: signInData, error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: userEmail,
          password: currentPassword.value,
        });

      if (signInError || !signInData.session) {
        passwordMsg.textContent = "Current password is incorrect.";
        return;
      }

      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: newPassword.value,
      });

      if (updateError) {
        passwordMsg.textContent = updateError.message;
        return;
      }

      passwordMsg.style.color = "#00f2ea";
      passwordMsg.textContent = "Password successfully updated!";

      currentPassword.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
    } catch (err) {
      passwordMsg.textContent = "An error occurred.";
      console.error(err);
    }
  });

  // -------------------------
  // CHANGE AVATAR
  // -------------------------
  changeAvatarBtn?.addEventListener("click", () => {
    avatarInput.click();
  });

  avatarInput?.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const { data: { user } } = await supabaseClient.auth.getUser();

    const ext = file.name.split(".").pop();
    const fileName = `${user.id}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed");
      return;
    }

    const { data } = supabaseClient.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = data.publicUrl;

    await supabaseClient.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    profilePic.src = avatarUrl;
  });
});

  // -------------------------
  // DELETE ACCOUNT
  // -------------------------
  deleteAccountBtn?.addEventListener("click", async () => {
    const confirmDelete = confirm(
      "Are you sure? This action is PERMANENT and cannot be undone."
    );
    if (!confirmDelete) return;

    deleteMsg.textContent = "Deleting account...";

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      deleteMsg.textContent = "Not authenticated.";
      return;
    }

    const res = await fetch(
      "https://tzbfehmwpryzubhvwvrz.supabase.co/functions/v1/delete-user",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!res.ok) {
      deleteMsg.textContent = "Failed to delete account.";
      return;
    }

    deleteMsg.style.color = "#ff4d6d";
    deleteMsg.textContent = "Account deleted.";

    await supabaseClient.auth.signOut();
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });


