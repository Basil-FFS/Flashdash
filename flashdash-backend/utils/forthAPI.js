const axios = require("axios");
const FormData = require("form-data");

let cachedToken = null;
let tokenExpiry = 0;

async function fetchApiToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  console.log("Attempting to fetch API token with credentials:", {
    client_id: process.env.FORTH_API_CLIENT_ID,
    client_secret: process.env.FORTH_API_SECRET ? "***" : "undefined"
  });

  // Try different authentication methods
  const methods = [
    // Method 1: Form data with client_id and client_secret
    async () => {
      const form = new FormData();
      form.append("client_id", process.env.FORTH_API_CLIENT_ID);
      form.append("client_secret", process.env.FORTH_API_SECRET);
      
      return axios.post("https://api.forthcrm.com/v1/auth/token", form, {
        headers: form.getHeaders(),
      });
    },
    // Method 2: JSON payload
    async () => {
      return axios.post("https://api.forthcrm.com/v1/auth/token", {
        client_id: process.env.FORTH_API_CLIENT_ID,
        client_secret: process.env.FORTH_API_SECRET
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    },
    // Method 3: Different endpoint
    async () => {
      const form = new FormData();
      form.append("client_id", process.env.FORTH_API_CLIENT_ID);
      form.append("client_secret", process.env.FORTH_API_SECRET);
      
      return axios.post("https://api.forthcrm.com/v1/oauth/token", form, {
        headers: form.getHeaders(),
      });
    }
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying authentication method ${i + 1}...`);
      const response = await methods[i]();
      
      console.log("Authentication successful with method", i + 1);
      console.log("Response structure:", Object.keys(response.data));
      
      // Handle different response structures
      let apiKey, expiresIn;
      
      if (response.data.api_key) {
        apiKey = response.data.api_key;
        expiresIn = response.data.expires_in || 3600;
      } else if (response.data.response && response.data.response.api_key) {
        apiKey = response.data.response.api_key;
        expiresIn = response.data.response.expires_in || 3600;
      } else if (response.data.access_token) {
        apiKey = response.data.access_token;
        expiresIn = response.data.expires_in || 3600;
      } else {
        console.log("Unexpected response structure:", JSON.stringify(response.data, null, 2));
        continue;
      }

      cachedToken = apiKey;
      tokenExpiry = Date.now() + expiresIn * 1000 - 60000; // refresh 1 min before expiry

      return apiKey;
    } catch (error) {
      console.log(`Method ${i + 1} failed:`, error.response?.data || error.message);
      if (i === methods.length - 1) {
        console.error("All authentication methods failed");
        throw new Error("Authorization failed - all methods tried");
      }
    }
  }
}

async function getClientData(clientIdOrName) {
  const token = await fetchApiToken();

  try {
    const response = await axios.get("https://api.forthcrm.com/v1/clients/search", {
      params: { query: clientIdOrName },
      headers: {
        Authorization: `Bearer ${token}`, // or "Api-Key": token if docs say so
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching client data:", error.response?.data || error.message);
    throw new Error("Failed to fetch client data");
  }
}

async function getDebtById(debtId) {
  const token = await fetchApiToken();

  try {
    const response = await axios.get(`https://api.forthcrm.com/v1/debts/${debtId}`, {
      headers: {
        "Api-Key": token,  // Use "Api-Key" header as per docs
      },
    });

    const debt = response.data.response.debt;

    return {
      creditorName: debt.creditor?.name || null,
      currentDebtAmount: debt.current_debt_amount,
      lastPaymentDate: debt.last_payment_date,
    };
  } catch (error) {
    console.error("Error fetching debt by ID:", error.response?.data || error.message);
    throw new Error("Failed to fetch debt record");
  }
}

async function getDebtTypes() {
  const token = await fetchApiToken();
  try {
    const response = await axios.get("https://api.forthcrm.com/v1/debts/types", {
      headers: {
        "Api-Key": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching debt types:", error.response?.data || error.message);
    throw new Error("Failed to fetch debt types");
  }
}

module.exports = {
  getClientData,
  getDebtById,
  fetchApiToken,
  getDebtTypes,
};
