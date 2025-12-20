import { useState } from "react";

export default function Sidebar() {
  const [active, setActive] = useState("Requests");

  const menu = [
    "Requests",
    "Chats",
    "Students",
    "Settings",
  ];

  return (
    <aside className="sidebar pl-8 -mr-28 pt-11 bg-black h-screen flex flex-col justify-between">
      
      {/* Profile */}
      <div className="mb-10 ">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-semibold">A</span>
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-50">Admin</p>
            <p className=" text-gray-200">admin@college.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 text-white pt-10 text-3xl text-center">
        {menu.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`w-full text-left sidebar-item py-5 ${
              active === item ? "sidebar-item-active scale-110 pl-5 font-extrabold transition-all" : ""
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pb-10 text-xs justify-start text-gray-500">
        © 2025 College Portal
      </div>
    </aside>
  );
}
