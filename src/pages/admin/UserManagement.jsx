import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function UserManagement() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const headers = () => ({ headers: { Authorization: `Bearer ${authUser?.token}` } });

  const load = async () => {
    try {
      const roleParam = filterRole === 'all' ? '' : `?role=${filterRole}`;
      const resp = await axios.get(`${API_BASE}/api/v1/users${roleParam}`, headers());
      setUsers(resp.data.users || []);
    } catch (err) {
      console.error('load users', err);
      toast.error('Failed to load users');
    }
  };

  useEffect(()=>{ if (authUser) load(); }, [authUser, filterRole]);

  const openCreate = () => { setForm({ name:'', email:'', password:'', role:'client' }); setShowCreate(true); };
  const closeCreate = () => setShowCreate(false);

  const openEdit = (u) => { setEditUser(u); setShowEdit(true); }
  const closeEdit = () => { setEditUser(null); setShowEdit(false); }

  const submitCreate = async (e) => {
    e.preventDefault();
    try{
      await axios.post(`${API_BASE}/api/v1/users`, form, headers());
      toast.success('User created');
      closeCreate();
      load();
    }catch(err){ console.error(err); toast.error('Create failed'); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try{
      await axios.put(`${API_BASE}/api/v1/users/${editUser._id}`, { name: editUser.name, email: editUser.email, role: editUser.role }, headers());
      toast.success('User updated');
      closeEdit();
      load();
    }catch(err){ console.error(err); toast.error('Update failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete user?')) return;
    try{
      await axios.delete(`${API_BASE}/api/v1/users/${id}`, headers());
      toast.info('User deleted');
      load();
    }catch(err){ console.error(err); toast.error('Delete failed'); }
  };

  const filtered = users.filter(u => {
    if (query) {
      const q = query.toLowerCase();
      return (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5>Users</h5>
          <div className="small-muted">Manage clients & delivery staff</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Select value={filterRole} onChange={(e)=>setFilterRole(e.target.value)} style={{width:160}}>
            <option value="all">All roles</option>
            <option value="client">Clients</option>
            <option value="delivery">Delivery Persons</option>
            <option value="admin">Admins</option>
          </Form.Select>
          <InputGroup style={{width:260}}>
            <FormControl placeholder="Search name or email" value={query} onChange={e=>setQuery(e.target.value)} />
          </InputGroup>
          <Button onClick={openCreate}><FaPlus />&nbsp;Create</Button>
        </div>
      </div>

      <Table hover>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.length===0 && (
            <tr><td colSpan={4} className="text-center">No users found</td></tr>
          )}
          {filtered.map(u=> (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <div className="table-actions">
                  <Button size="sm" variant="light" title="Edit" onClick={()=>openEdit(u)}><FaEdit /></Button>
                  <Button size="sm" variant="light" title="Delete" onClick={()=>remove(u._id)}><FaTrashAlt style={{color:'#d9534f'}} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={closeCreate}>
        <Form onSubmit={submitCreate}>
          <Modal.Header closeButton><Modal.Title>Create User</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control required type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control required minLength={6} type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={(e)=>setForm({...form, role: e.target.value})}>
                <option value="client">Client</option>
                <option value="delivery">Delivery Person</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeCreate}>Cancel</Button>
            <Button type="submit">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={closeEdit}>
        <Form onSubmit={submitEdit}>
          <Modal.Header closeButton><Modal.Title>Edit User</Modal.Title></Modal.Header>
          <Modal.Body>
            {editUser && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={editUser.name} onChange={(e)=>setEditUser({...editUser, name: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={editUser.email} onChange={(e)=>setEditUser({...editUser, email: e.target.value})} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={editUser.role} onChange={(e)=>setEditUser({...editUser, role: e.target.value})}>
                    <option value="client">Client</option>
                    <option value="delivery">Delivery Person</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEdit}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
