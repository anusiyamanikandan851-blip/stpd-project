import React from 'react';

export default function UsersTable({ users }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-2xl font-black text-gray-800">User Account Details</h3>
      <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-5">Name</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Last Login</th>
              <th className="px-6 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-black text-gray-800">{u.name}</td>
                <td className="px-6 py-4 text-gray-500 font-medium">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role || 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                    {u.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
