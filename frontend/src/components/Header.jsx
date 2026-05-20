import { NavLink, useNavigate } from "react-router";

function Header() {
//   const isAuthenticated = useAuth((state) => state.isAuthenticated);
//   const user = useAuth((state) => state.currentUser);
//   const logout = useAuth((state) => state.logout);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // decide profile route based on role
  const getProfilePath = () => {
    if (!user) return "/";
    console.log("current user", user);
  };

  return (
    <nav className="bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-[#e8e8ed] px-8  flex items-center sticky top-0 z-50">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-base font-semibold text-[#1d1d1f] tracking-tight">
          MyBlog
        </NavLink>

        <ul className="text-[0.8rem] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-normal">
          {/* Always visible */}
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "" : "text-[0.8rem] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-normal")}>
              Home
            </NavLink>
          </li>

          {/* Not logged in */}
            <>
              <li>
                <NavLink to="/register" className={({ isActive }) => (isActive ? "text-[0.8rem] text-[#0066cc] font-medium" : "text-[0.8rem] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-normal")}>
                  Register
                </NavLink>
              </li>

              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? "text-[0.8rem] text-[#0066cc] font-medium" : "text-[0.8rem] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-normal")}>
                  Login
                </NavLink>
              </li>
            </>

          {/* Logged in */}
            <>
              <li>
                <NavLink
                  to={getProfilePath()}
                  className={({ isActive }) => (isActive ? "text-[0.8rem] text-[#0066cc] font-medium" : "text-[0.8rem] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-normal")}
                >
                  Profile
                </NavLink>
              </li>

              <li>
                <button className="text-[0.8rem] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-normal" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
        </ul>
      </div>
    </nav>
  );
}

export default Header;