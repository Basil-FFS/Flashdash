import { getApiUrl, API_ENDPOINTS } from '../config';

export async function login(email, password) {
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Login endpoint not found. Please check API configuration.");
      }
      throw new Error(`Login failed: ${res.status} ${res.statusText}`);
    }
    return res.json(); // returns { token, role, name }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}

export async function getCurrentUser(token) {
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.ME), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Invalid or expired token");
      }
      throw new Error(`Failed to get user: ${res.status} ${res.statusText}`);
    }
    return res.json(); // returns user info
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}

// Admin functions for user management
export async function getUsers(token) {
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.ADMIN_USERS), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      }
      throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}

export async function createUser(userData, token) {
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.ADMIN_USERS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to create user: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}

export async function updateUser(id, userData, token) {
  try {
    const res = await fetch(`${getApiUrl(API_ENDPOINTS.ADMIN_USERS)}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to update user: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}

export async function deleteUser(id, token) {
  try {
    const res = await fetch(`${getApiUrl(API_ENDPOINTS.ADMIN_USERS)}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to delete user: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}

export async function fetchCreditReport(clientIdOrName, token) {
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.CREDIT_REPORT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clientIdOrName }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Client not found. Please check the contact ID.");
      }
      throw new Error(`Failed to fetch credit report: ${res.status} ${res.statusText}`);
    }
    return res.json(); // should return { name, file_id, debts: [...] }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and API URL.");
    }
    throw error;
  }
}
