import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    villageId: '',
    email: '',
    name: '',
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/gov/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const generatePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    return password;
  };

  const generateUserId = () => {
    return 'USR' + Date.now() + Math.floor(Math.random() * 1000);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newUser = {
      ...formData,
      userId: generateUserId(),
      password: generatedPassword,
    };

    try {
      const token = localStorage.getItem('govToken');
      await axios.post('http://localhost:5001/api/gov/users', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`User added!\nID: ${newUser.userId}\nPassword: ${generatedPassword}`);
      fetchUsers();
      setShowForm(false);
      setFormData({ villageId: '', email: '', name: '' });
      setGeneratedPassword('');
    } catch (err) {
      alert('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('govToken');
        await axios.delete(`http://localhost:5001/api/gov/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('User deleted successfully');
        fetchUsers();
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Village ID</label>
              <input
                type="text"
                value={formData.villageId}
                onChange={(e) => setFormData({ ...formData, villageId: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Generated Password</label>
              <div className="password-gen">
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  placeholder="Click Generate Password"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="gen-btn"
                >
                  Generate
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Village ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.villageId}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span></td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
