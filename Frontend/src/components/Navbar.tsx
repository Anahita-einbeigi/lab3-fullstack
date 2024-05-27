import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function toggleDropdown(){
     setDropdownOpen(!dropdownOpen)
    }

  useEffect(() => {
    const fetchFavoritesCount = () => {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoritesCount(favs.length);
    };
    fetchFavoritesCount();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('storage', fetchFavoritesCount);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', fetchFavoritesCount);
    };
  }, []);

  const closeDropdown = () => setDropdownOpen(false);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', height: '75px' }}>
      <div>
        <Link to="/" onClick={closeDropdown}>Home</Link>
        <Link to="/favorites" style={{ marginLeft: '10px' }} onClick={closeDropdown}>Favoriter</Link>
        <Link to="/book-session">BookSession</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/favorites" style={{ position: 'relative', marginRight: '5px' }}>
          <img width="20" height="20" src="https://img.icons8.com/ios-filled/50/FFFFFF/like.png" alt="favorites" />
          {favoritesCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-10px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
            }}>
              {favoritesCount}
            </span>
          )}
        </Link>
        <div ref={dropdownRef}>
          <button onClick={toggleDropdown} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img width="25" height="25" src="https://img.icons8.com/forma-bold-filled/48/FFFFFF/guest-male.png" alt="guest-male" />
          </button>
          {dropdownOpen && (
            <div style={{ position: 'absolute', right: 20, top: '100%', backgroundColor: 'white', boxShadow: '0px 8px 16px 0px rgba(55, 24, 126, 0.2)', zIndex: 1 }}>
              <Link to="/login" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: 'black' }} onClick={closeDropdown}>Log in</Link>
              <Link to="/register" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: 'black' }} onClick={closeDropdown}>Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
