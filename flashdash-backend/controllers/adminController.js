const db = require("../db");

// Get all users with basic info
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a user's role
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ["admin", "agent", "viewer"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const result = await db.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Server error" });
  }
};
