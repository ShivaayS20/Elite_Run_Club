// Base helper for talking to our backend.
// Every fetch call in the project should go through this function instead of
// writing raw fetch() calls on each page.

const API_BASE = ""; // empty string = same domain, works both locally and once deployed

async function api(endpoint, options = {}) {
  const config = {
    method: options.method || "GET",
    credentials: "include", // always send the login cookie
    headers: {},
  };

  // Only set JSON headers/body if we're NOT sending a file (FormData)
  if (options.body && !(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    config.body = options.body; // browser sets the correct headers automatically
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (networkErr) {
    // This happens if the server is down or there's no internet
    throw new Error("Could not reach the server. Please check your connection.");
  }

  const data = await response.json().catch(() => null);

  if (!data) {
    throw new Error("Unexpected response from server.");
  }

  if (!data.success) {
    // This is where every page will get its error message from
    throw new Error(data.message || "Something went wrong.");
  }

  return data.data; // only return the useful part, not the whole envelope
}

// Shortcut helpers so pages don't need to remember the "method" option every time
const apiGet = (endpoint) => api(endpoint);
const apiPost = (endpoint, body) => api(endpoint, { method: "POST", body });
const apiPatch = (endpoint, body) => api(endpoint, { method: "PATCH", body });
const apiDelete = (endpoint) => api(endpoint, { method: "DELETE" });