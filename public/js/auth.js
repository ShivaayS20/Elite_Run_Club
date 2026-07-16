// Handles: checking if someone is logged in, showing/hiding navbar links,
// and logging out. This file needs api.js loaded before it.

let currentUser = null;

// Checks with the backend if someone is logged in right now
async function checkAuth() {
  try {
    currentUser = await apiGet("/api/auth/me");
  } catch (err) {
    currentUser = null; // not logged in, or session expired — totally normal
  }
  updateNavbar();
  return currentUser;
}

// Shows/hides navbar links based on login status
function updateNavbar() {
  const guestOnlyEls = document.querySelectorAll(".guest-only"); // e.g. "Login" link
  const authOnlyEls = document.querySelectorAll(".auth-only");   // e.g. "My Profile" link
  const adminOnlyEls = document.querySelectorAll(".admin-only"); // e.g. "Admin" link

  guestOnlyEls.forEach((el) => {
    el.style.display = currentUser ? "none" : "";
  });

  authOnlyEls.forEach((el) => {
    el.style.display = currentUser ? "" : "none";
  });

  adminOnlyEls.forEach((el) => {
    el.style.display = currentUser && currentUser.role === "admin" ? "" : "none";
  });

  // If there's an element meant to show the user's name/avatar, fill it in
  const nameEl = document.querySelector("[data-user-name]");
  if (nameEl && currentUser) nameEl.textContent = currentUser.name;

  const avatarEl = document.querySelector("[data-user-avatar]");
  if (avatarEl && currentUser?.avatar) avatarEl.src = currentUser.avatar;
}

// Logs the person out
async function logout() {
  try {
    await apiPost("/api/auth/logout");
  } catch (err) {
    // even if this fails, we still clear the local state below
  }
  currentUser = null;
  window.location.href = "/login";
}

// For pages that REQUIRE login (like profile.html) — redirects if not logged in
async function requireLogin() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = "/login";
  }
  return user;
}

// Automatically check login status on every page as soon as it loads
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});