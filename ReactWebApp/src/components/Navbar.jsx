import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome } from '@fortawesome/free-solid-svg-icons';
import logoImage from '../assets/faceattend-logo.png';

function Navbar({ onProfileClick }) {

    

    return (
        <header className="header py-3">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="logo-container">
                    
                        <img src={logoImage} alt="logo" className="logo" />
                    </div>

                    <div className="d-flex">
                        <button className="nav-btn" title="Home" onClick={() => onProfileClick(false)}>
                            <FontAwesomeIcon icon={faHome} />
                        </button>
                        <button className="nav-btn profile-btn" title="Profile" onClick={() => onProfileClick(true)}>
                            <FontAwesomeIcon icon={faUser} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
