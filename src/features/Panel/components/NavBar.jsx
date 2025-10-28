import { useGlobal } from 'reactn';
import './NavBar.sass';
import {
  FiMessageCircle, FiStar, FiUsers, FiSearch,
} from 'react-icons/fi';

function NavBar() {
  const [nav, setNav] = useGlobal('nav');

  const activeColor = '#0047AB'; // cobalt blue
  const inactiveColor = '#888';

  return (
    <div className="nav-bar uk-flex">
      <div
        className={`item${nav === 'rooms' ? ' active' : ''}`}
        onClick={() => setNav('rooms')}
        style={{ color: nav === 'rooms' ? activeColor : inactiveColor, cursor: 'pointer' }}
      >
        <div className="icon">
          <FiMessageCircle stroke={nav === 'rooms' ? activeColor : inactiveColor} />
        </div>
        <div className="text">Rooms</div>
      </div>

      <div
        className={`item${nav === 'search' ? ' active' : ''}`}
        onClick={() => setNav('search')}
        style={{ color: nav === 'search' ? activeColor : inactiveColor, cursor: 'pointer' }}
      >
        <div className="icon">
          <FiSearch stroke={nav === 'search' ? activeColor : inactiveColor} />
        </div>
        <div className="text">Search</div>
      </div>

      <div
        className={`item${nav === 'favorites' ? ' active' : ''}`}
        onClick={() => setNav('favorites')}
        style={{ color: nav === 'favorites' ? activeColor : inactiveColor, cursor: 'pointer' }}
      >
        <div className="icon">
          <FiStar
            stroke={nav === 'favorites' ? activeColor : inactiveColor}
            strokeWidth={2.5}
            fill="none"
          />
        </div>
        <div className="text">Favorites</div>
      </div>

      <div
        className={`item${nav === 'meetings' ? ' active' : ''}`}
        onClick={() => setNav('meetings')}
        style={{ color: nav === 'meetings' ? activeColor : inactiveColor, cursor: 'pointer' }}
      >
        <div className="icon">
          <FiUsers stroke={nav === 'meetings' ? activeColor : inactiveColor} />
        </div>
        <div className="text">Meetings</div>
      </div>
    </div>
  );
}

export default NavBar;
