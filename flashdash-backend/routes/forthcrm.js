const express = require('express');
const axios = require('axios');
const { fetchApiToken } = require('../utils/forthAPI');
const router = express.Router();

const CENTREX_BASE_URL = 'https://api.centrexsoftware.com/v1';

// POST credit report by contact ID (fetch all debts for a contact)
router.post('/credit-report', async (req, res) => {
  try {
    const { clientIdOrName } = req.body;
    if (!clientIdOrName) {
      return res.status(400).json({ error: 'Missing clientIdOrName in request body' });
    }
    const apiKey = await fetchApiToken();
    // Fetch debts
    const debtsResponse = await axios.get(`${CENTREX_BASE_URL}/contacts/${clientIdOrName}/debts`, {
      headers: { 'Api-Key': apiKey }
    });
    // Fetch contact details
    const contactResponse = await axios.get(`${CENTREX_BASE_URL}/contacts/${clientIdOrName}`, {
      headers: { 'Api-Key': apiKey }
    });
    
    const result = {
      ...debtsResponse.data,
      contact: contactResponse.data.response || null
    };
    res.json(result);
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch debts or contact from Centrex' });
  }
});

module.exports = router;
