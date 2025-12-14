const consolePanel = document.getElementById("consolePanel");

// Konsola yazan her şeyi buraya da yaz
(function() {
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

const msg = document.getElementById("authMsg");

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
  } else {
    location.href = "/";
  }
}

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
  } else {
    msg.textContent = "Check your email for confirmation link.";
  }
}

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  });
}
