/* ==========================================================================
   PENGUIN'S FRAGRANCE — AUTH.JS
   FRONTEND DEMONSTRATION AUTHENTICATION ONLY.

   IMPORTANT: This stores account info (including password) in plain
   localStorage on the user's own browser. This is NOT secure and is NOT
   how real authentication should work — it exists purely so this
   college project can demonstrate a login/session flow without a
   backend. To make this production-ready later: replace every function
   below with calls to a real backend (hashed passwords, HTTP-only
   session cookies or JWTs, server-side validation). Never store real
   passwords like this in a real application.
   ========================================================================== */

const PF_USERS_KEY = "pf_users";
const PF_SESSION_KEY = "pf_current_user";

/* ------------------------------------------------------------------
   STORAGE HELPERS
   ------------------------------------------------------------------ */

function pfGetUsers() {
  try {
    return JSON.parse(localStorage.getItem(PF_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function pfSaveUsers(users) {
  localStorage.setItem(PF_USERS_KEY, JSON.stringify(users));
}

/** Returns the currently logged-in user's public info, or null. */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(PF_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
   REGISTER
   ------------------------------------------------------------------ */

/**
 * Registers a new demo account. Returns { success, message }.
 * On success, also logs the user in immediately.
 */
function registerUser({ fullName, email, password }) {
  const users = pfGetUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    return { success: false, message: "An account with this email already exists." };
  }

  const newUser = {
    id: "user_" + Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password, // DEMO ONLY — see file header notice
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  pfSaveUsers(users);

  setSession(newUser);
  return { success: true, message: "Account created successfully." };
}

/* ------------------------------------------------------------------
   LOGIN
   ------------------------------------------------------------------ */

/** Attempts to log in. Returns { success, message }. */
function loginUser(email, password) {
  const users = pfGetUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (u) => u.email === normalizedEmail && u.password === password
  );

  if (!user) {
    return { success: false, message: "Incorrect email or password." };
  }

  setSession(user);
  return { success: true, message: "Welcome back!" };
}

/* ------------------------------------------------------------------
   SESSION
   ------------------------------------------------------------------ */

function setSession(user) {
  // Never store the password in the session object — only what the
  // UI needs to display (name/email/id).
  const sessionData = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
  localStorage.setItem(PF_SESSION_KEY, JSON.stringify(sessionData));
}

function logoutUser() {
  localStorage.removeItem(PF_SESSION_KEY);
  window.location.href = "index.html";
}

/**
 * Call at the top of any page that requires login (account.html,
 * orders.html, order-details.html). Redirects to login.html with a
 * return path if no session exists.
 */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    const currentPage = window.location.pathname.split("/").pop();
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
    return null;
  }
  return user;
}

/* ------------------------------------------------------------------
   HEADER SYNC — swap the account icon link based on session state
   ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  const accountLinks = document.querySelectorAll('a[aria-label="Account"]');
  const user = getCurrentUser();

  if (user) {
    accountLinks.forEach((link) => {
      link.setAttribute("href", "account.html");
      link.setAttribute("aria-label", `Account — ${user.fullName}`);
    });
  }
});
