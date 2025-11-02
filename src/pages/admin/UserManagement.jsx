import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function UserManagement() {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
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
      toast.error(t('admin.failedToLoadUsers'));
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
      toast.success(t('admin.userCreated'));
      closeCreate();
      load();
    }catch(err){ console.error(err); toast.error(t('admin.createFailed')); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try{
      await axios.put(`${API_BASE}/api/v1/users/${editUser._id}`, { name: editUser.name, email: editUser.email, role: editUser.role }, headers());
      toast.success(t('admin.userUpdated'));
      closeEdit();
      load();
    }catch(err){ console.error(err); toast.error(t('admin.updateFailed')); }
  };

  const remove = async (id) => {
    const userToDelete = users.find(u => u._id === id);
    let confirmMessage = t('admin.deleteUser');
    
    // Add specific warnings based on user role
    if (userToDelete?.role === 'client') {
      confirmMessage += '\n\n⚠️ ' + t('admin.deleteClientWarning');
    } else if (userToDelete?.role === 'delivery') {
      confirmMessage += '\n\n⚠️ ' + t('admin.deleteDeliveryWarning');
    }
    
    if (!confirm(confirmMessage)) return;
    
    try{
      const response = await axios.delete(`${API_BASE}/api/v1/users/${id}`, headers());
      
      // Show success message with cascade information
      if (response.data.cascadeInfo) {
        toast.success(`${t('admin.cascadeCompleted')}: ${response.data.cascadeInfo}`, {
          autoClose: 5000 // Show longer for important cascade info
        });
      } else {
        toast.success(t('admin.userDeleted'));
      }
      
      load();
    }catch(err){ 
      console.error(err); 
      toast.error(t('admin.deleteFailed')); 
    }
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
          <h5>{t('admin.users')}</h5>
          <div className="small-muted">{t('admin.manageClientsAndStaff')}</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Select value={filterRole} onChange={(e)=>setFilterRole(e.target.value)} style={{width:160}}>
            <option value="all">{t('admin.allRoles')}</option>
            <option value="client">{t('admin.clients')}</option>
            <option value="delivery">{t('admin.deliveryPersons')}</option>
            <option value="admin">{t('admin.admins')}</option>
          </Form.Select>
          <InputGroup style={{width:260}}>
            <FormControl placeholder={t('admin.searchNameOrEmail')} value={query} onChange={e=>setQuery(e.target.value)} />
          </InputGroup>
          <Button onClick={openCreate}><FaPlus />&nbsp;{t('admin.create')}</Button>
        </div>
      </div>

      <Table hover>
        <thead>
          <tr><th>{t('common.name')}</th><th>{t('common.email')}</th><th>{t('admin.role')}</th><th>{t('common.actions')}</th></tr>
        </thead>
        <tbody>
          {filtered.length===0 && (
            <tr><td colSpan={4} className="text-center">{t('admin.noUsersFound')}</td></tr>
          )}
          {filtered.map(u=> (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <div className="table-actions">
                  <Button size="sm" variant="light" title={t('common.edit')} onClick={()=>openEdit(u)}><FaEdit /></Button>
                  <Button size="sm" variant="light" title={t('common.delete')} onClick={()=>remove(u._id)}><FaTrashAlt style={{color:'#d9534f'}} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={closeCreate}>
        <Form onSubmit={submitCreate}>
          <Modal.Header closeButton><Modal.Title>{t('admin.createUser')}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>{t('common.name')}</Form.Label>
              <Form.Control required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>{t('common.email')}</Form.Label>
              <Form.Control required type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>{t('common.password')}</Form.Label>
              <Form.Control required minLength={6} type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
            </Form.Group>
            <Form.Group>
              <Form.Label>{t('admin.role')}</Form.Label>
              <Form.Select value={form.role} onChange={(e)=>setForm({...form, role: e.target.value})}>
                <option value="client">{t('common.client')}</option>
                <option value="delivery">{t('admin.deliveryPerson')}</option>
                <option value="admin">{t('admin.admins')}</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeCreate}>{t('common.cancel')}</Button>
            <Button type="submit">{t('common.create')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={closeEdit}>
        <Form onSubmit={submitEdit}>
          <Modal.Header closeButton><Modal.Title>{t('admin.editUser')}</Modal.Title></Modal.Header>
          <Modal.Body>
            {editUser && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>{t('common.name')}</Form.Label>
                  <Form.Control value={editUser.name} onChange={(e)=>setEditUser({...editUser, name: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>{t('common.email')}</Form.Label>
                  <Form.Control type="email" value={editUser.email} onChange={(e)=>setEditUser({...editUser, email: e.target.value})} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>{t('admin.role')}</Form.Label>
                  <Form.Select value={editUser.role} onChange={(e)=>setEditUser({...editUser, role: e.target.value})}>
                    <option value="client">{t('common.client')}</option>
                    <option value="delivery">{t('admin.deliveryPerson')}</option>
                    <option value="admin">{t('admin.admins')}</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEdit}>{t('common.cancel')}</Button>
            <Button type="submit">{t('common.save')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
