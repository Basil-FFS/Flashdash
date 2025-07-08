import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, createUser, updateUser, deleteUser } from "../utils/api";
// import Sidebar from "./Sidebar";

function AdminPanel({ user, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getUsers(token);
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch users");
    }
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createUser(form, token);
      setForm({ name: "", email: "", password: "", role: "agent" });
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to add user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id, token);
      fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const startEdit = (user) => {
    setEditId(user.id);
    setEditForm({ name: user.name, email: user.email, password: "", role: user.role });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editId, editForm, token);
      setEditId(null);
      setEditForm({ name: "", email: "", password: "", role: "agent" });
      fetchUsers();
    } catch (err) {
      setError("Failed to update user");
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="p-6 text-white">Access denied.</div>;
  }

  return (
    <main className="flex-1 p-3 md:p-6">
      <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-lg text-white text-opacity-80">Add, edit, and manage system users</p>
      </div>

      {error && <div className="mb-4 text-red-300 bg-red-600 bg-opacity-20 p-3 rounded">{error}</div>}
      
      <div className="bg-white bg-opacity-10 rounded-xl p-6 shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        <form onSubmit={handleAdd} className="flex gap-4 flex-wrap">
          <input 
            type="text" 
            placeholder="Name" 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            className="p-2 rounded text-black" 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            className="p-2 rounded text-black" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })} 
            className="p-2 rounded text-black" 
            required 
          />
          <select 
            value={form.role} 
            onChange={e => setForm({ ...form, role: e.target.value })} 
            className="p-2 rounded text-black"
          >
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="viewer">Viewer</option>
          </select>
          <button 
            type="submit" 
            className="bg-white text-[#004845] px-4 py-2 rounded hover:bg-gray-200 font-semibold"
          >
            Add User
          </button>
        </form>
      </div>

      <div className="bg-white bg-opacity-10 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Current Users</h2>
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white bg-opacity-20">
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Role</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white hover:bg-opacity-10 border-b border-white border-opacity-20">
                    <td className="border px-4 py-2">
                      {editId === u.id ? (
                        <input 
                          type="text" 
                          value={editForm.name} 
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                          className="p-1 rounded text-black w-full" 
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {editId === u.id ? (
                        <input 
                          type="email" 
                          value={editForm.email} 
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                          className="p-1 rounded text-black w-full" 
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {editId === u.id ? (
                        <select 
                          value={editForm.role} 
                          onChange={e => setEditForm({ ...editForm, role: e.target.value })} 
                          className="p-1 rounded text-black"
                        >
                          <option value="admin">Admin</option>
                          <option value="agent">Agent</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {editId === u.id ? (
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            placeholder="New Password" 
                            value={editForm.password} 
                            onChange={e => setEditForm({ ...editForm, password: e.target.value })} 
                            className="p-1 rounded text-black" 
                          />
                          <button 
                            onClick={handleEdit} 
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditId(null)} 
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startEdit(u)} 
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)} 
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminPanel;
