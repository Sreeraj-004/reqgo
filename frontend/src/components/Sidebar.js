import { useState } from "react";

export default function Sidebar({ setActiveView }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [active, setActive] = useState("requests");

  // 🔹 Central menu config (future-proof)
  const MENU_CONFIG = [
    {
      label: "Requests",
      key: "requests",
      roles: ["principal", "vice_principal", "hod", "student"],
    },
    {
      label: "Edit College Details",
      key: "editCollege",
      roles: ["principal"],
    },
  ];

  const menu = MENU_CONFIG.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="sidebar pl-8 pt-11 bg-black h-screen flex flex-col justify-between">

      {/* Profile */}
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-50">{user?.name}</p>
            <p className="text-gray-200">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 text-white pt-10 text-2xl text-center">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActive(item.key);
              setActiveView(item.key);
            }}
            className={`w-full text-left sidebar-item py-5 ${
              active === item.key
                ? "sidebar-item-active scale-110 pl-5 font-extrabold transition-all"
                : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pb-10 text-xs text-gray-500">
        © 2025 College Portal
      </div>
    </aside>
  );
}
