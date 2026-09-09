import React, { useState } from 'react';
import { Business, UserRole } from '../types/business';
import { Users, Shield, Building2, Check, X, Lock, Plus } from 'lucide-react';

interface UserAccessPageProps {
  businesses: Business[];
  currentUserRole: string;
}

interface DemoUser {
  userId: string;
  name: string;
  role: UserRole;
  allowedBusinessIds: number[];
}

export const UserAccessPage: React.FC<UserAccessPageProps> = ({
  businesses,
  currentUserRole,
}) => {
  const [users, setUsers] = useState<DemoUser[]>([
    {
      userId: 'admin',
      name: 'Admin User (Owner)',
      role: 'Owner',
      allowedBusinessIds: [1, 2, 3, 4],
    },
    {
      userId: 'rental_staff',
      name: 'Rental Property Staff',
      role: 'Staff',
      allowedBusinessIds: [1],
    },
    {
      userId: 'laundry_staff',
      name: 'Laundry Shop Staff',
      role: 'Staff',
      allowedBusinessIds: [2],
    },
    {
      userId: 'manager_jessa',
      name: 'Jessa Yangyang (Manager)',
      role: 'Manager',
      allowedBusinessIds: [1, 2],
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const toggleBusinessForUser = (userId: string, businessId: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          const exists = u.allowedBusinessIds.includes(businessId);
          const updatedIds = exists
            ? u.allowedBusinessIds.filter((id) => id !== businessId)
            : [...u.allowedBusinessIds, businessId];
          return { ...u, allowedBusinessIds: updatedIds };
        }
        return u;
      })
    );
  };

  const updateRoleForUser = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            User Administration & Business Access
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Manage user accounts, system roles, and business unit access permissions for JMP Enterprises.
          </p>
        </div>
      </div>

      {/* Role Hierarchy Notice */}
      <div className="card" style={{ padding: '16px 20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>
            <span style={{ fontWeight: 700 }}>Access Model:</span> Users are granted access per <strong>Business Unit</strong> (Rental, Laundry, Piso Print, Mini-Mart) based on their assigned role and explicit business access configuration.
          </div>
        </div>
      </div>

      {/* Users & Business Access Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--primary-color)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            User Accounts & Business Permissions
          </h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Account</th>
                <th>Assigned Role</th>
                {businesses.map((b) => (
                  <th key={b.businessId} style={{ textAlign: 'center' }}>
                    {b.businessName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      @{u.userId}
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => updateRoleForUser(u.userId, e.target.value as UserRole)}
                    >
                      <option value="SuperAdmin">SuperAdmin</option>
                      <option value="Owner">Owner</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  {businesses.map((b) => {
                    const isGranted = u.allowedBusinessIds.includes(b.businessId);
                    return (
                      <td key={b.businessId} style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleBusinessForUser(u.userId, b.businessId)}
                          style={{
                            background: isGranted ? '#dcfce7' : '#f1f5f9',
                            color: isGranted ? '#15803d' : '#94a3b8',
                            border: `1px solid ${isGranted ? '#86efac' : '#cbd5e1'}`,
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isGranted ? <Check size={14} /> : <X size={14} />}
                          <span>{isGranted ? 'Access Granted' : 'No Access'}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
