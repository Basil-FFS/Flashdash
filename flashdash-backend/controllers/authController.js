const db = require("../db");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, 'user']  // default role 'user'
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: "1d" });
    res.json({ token, role: user.role, name: user.name });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error('Signup error:', e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    console.log('Attempting login for email:', email);
    const result = await db.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    const user = result.rows[0];
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log('✅ User found:', { id: user.id, name: user.name, email: user.email, role: user.role });
    console.log('🔍 Checking password...');

    const match = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Password match result:', match);
    
    if (!match) {
      console.log('❌ Password does not match for user:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log('✅ Password verified successfully');
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: "1d" });
    console.log('🎫 JWT token generated successfully');
    
    res.json({ token, role: user.role, name: user.name });
  } catch (e) {
    console.error('❌ Login error:', e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const result = await db.query("SELECT id, name, email, role FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Only admins can create users
exports.adminCreateUser = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role]
    );
    res.json(result.rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user settings (admin only)
exports.adminUpdateUser = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    let query = "UPDATE users SET ";
    const params = [];
    let idx = 1;
    if (name) { query += `name = $${idx++}, `; params.push(name); }
    if (email) { query += `email = $${idx++}, `; params.push(email); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += `password_hash = $${idx++}, `;
      params.push(hashed);
    }
    if (params.length === 0) return res.status(400).json({ message: "No fields to update" });
    query = query.slice(0, -2) + ` WHERE id = $${idx} RETURNING id, name, email, role`;
    params.push(id);
    const result = await db.query(query, params);
    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

