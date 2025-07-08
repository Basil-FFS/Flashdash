const axios = require("axios");

exports.getCreditReport = async (req, res) => {
  const clientId = req.params.clientId;

  try {
    const response = await axios.get(`https://api.forthcrm.com/v1/debts`, {
      headers: {
        "Api-Key": process.env.FORTH_API_SECRET,
      },
      params: {
        client_id: clientId
      }
    });

    // Filter debt(s)
    const debts = response.data.response || [];
    const simplified = debts.map(debt => ({
      creditor: debt.creditor?.name || "Unknown",
      currentBalance: debt.current_debt_amount,
      currentPayment: debt.current_payment
    }));

    res.json({
      clientId,
      debts: simplified
    });

  } catch (err) {
    console.error("Error fetching credit report:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch credit report" });
  }
};
