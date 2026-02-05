import { useState } from "react";

export default function Sidebar({ setActiveView }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [active, setActive] = useState("requests");

  const MENU_CONFIG = [
    {
      label: "Requests",
      key: "requests",
      roles: ["principal", "vice_principal", "hod", "student","superintendent"],
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
    <aside className="pl-8 pt-11 bg-gray-950 h-screen flex flex-col justify-between">

      {/* Profile */}
      <div className="mb-10 mr-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-900">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-100">
              {user?.name}
            </p>
            <p className="text-gray-400 text-sm">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 pt-10 text-lg">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActive(item.key);
              setActiveView(item.key);
            }}
            className={`w-full text-left py-4 transition-all rounded-l-xl
              ${
                active === item.key
                  ? "bg-primary-gradient text-gray-900 pl-6 font-extrabold  shadow"
                  : "text-gray-300 hover:text-yellow-400 hover:pl-6"
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pb-10 text-xs text-gray-500">
        © 2026 Reqgo
      </div>
    </aside>
  );
}
