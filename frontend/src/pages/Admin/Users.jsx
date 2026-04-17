import { useEffect, useState } from "react";
import { useOrderStore } from "../../store/store";
import { getApiMessage } from "../../utils/helpers";

function Users() {
  const users = useOrderStore((state) => state.users);
  const fetchAdminDashboard = useOrderStore((state) => state.fetchAdminDashboard);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setMessage("");
        await fetchAdminDashboard();
      } catch (error) {
        setMessage(getApiMessage(error, "Unable to load users"));
      }
    };

    loadUsers();
  }, [fetchAdminDashboard]);

  return (
    <div className="glass-panel p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Users</p>
      <h1 className="mt-3 font-display text-4xl">Registered customers and admins</h1>

      {message ? <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{message}</p> : null}

      <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10">
        <div className="grid grid-cols-[1.2fr_1.4fr_140px] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-smoke">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
        </div>
        {users.map((user) => (
          <div key={user._id} className="grid grid-cols-[1.2fr_1.4fr_140px] gap-4 border-b border-white/10 px-4 py-4 text-sm last:border-b-0">
            <span>{user.name}</span>
            <span className="text-smoke">{user.email}</span>
            <span className="text-gold">{user.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;
