import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/LoginPage'); 
  };

  const handleSignupClick = () => {
    router.push('/SignupPage');
  };

  return (
    <header className="bg-base-100 py-4 px-6 md:px-12 shadow-md">
      <nav className="flex justify-between items-center">
        <div className="text-xl font-bold text-primary">
          <Link href="/" className="hover:text-primary-focus">
            Crisis-Cap
          </Link>
        </div>

        <ul className="hidden md:flex space-x-6">
          <li>
            <Link href="/" className="text-base-content hover:text-primary">
              Accueil
            </Link>
          </li>
          <li className="relative group">
            <span className="text-base-content font-semibold hover:text-primary cursor-pointer">
              À Propos
            </span>
            <ul className="absolute left-0 hidden mt-2 space-y-2 bg-base-100 shadow-lg rounded-box group-hover:block z-10">
              <li>
                <Link href="/about#who-we-are" className="block px-4 py-2 hover:bg-base-200 rounded-t-box">
                  Qui Sommes-Nous
                </Link>
              </li>
              <li>
                <Link href="/about#our-mission" className="block px-4 py-2 hover:bg-base-200 rounded-b-box">
                  Notre Mission
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/modules" className="text-base-content hover:text-primary">
              Fonctionnalités
            </Link>
          </li>
          <li>
            <Link href="/integration" className="text-base-content hover:text-primary">
              Intégration
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-base-content hover:text-primary">
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline btn-primary hidden md:flex"
            onClick={handleSignupClick}
          >
            <FaUserPlus className="mr-1" />
            S'inscrire
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleLoginClick}
          >
            <FaSignInAlt className="mr-1" />
            Se connecter
          </button>
          
          {/* Mobile menu button */}
          <div className="dropdown dropdown-end md:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link href="/">Accueil</Link></li>
              <li>
                <a>À Propos</a>
                <ul className="p-2">
                  <li><Link href="/about#who-we-are">Qui Sommes-Nous</Link></li>
                  <li><Link href="/about#our-mission">Notre Mission</Link></li>
                </ul>
              </li>
              <li><Link href="/modules">Fonctionnalités</Link></li>
              <li><Link href="/integration">Intégration</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/SignupPage">S'inscrire</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;