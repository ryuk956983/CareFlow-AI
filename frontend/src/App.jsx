import React from "react";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const { user } = useAuth();
 const dropdownRef = React.useRef(null);
  return <div className="relative ">
    {user ? <Dashboard /> : <Login />}
    <div className="fixed bottom-10 right-10 z-999 overflow-hidden" >

      <button
        className="focus:outline-none relative z-9 flex gap-2 items-center text-white"

        aria-label="Select Language"
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQadidhcrDRq9goW5I0-lqPwkAH_cB0E8H04Q&s"
          alt="Language"
          className="h-8 w-8 rounded-full object-cover border-2 border-white hover:border-orange-500 transition"
        />
        <div id="google_translate_element" ref={dropdownRef} className="h-4 absolute top-0 "></div>
      </button>

    </div>
  </div>


}
