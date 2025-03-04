import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6">

        <div className="flex items-center">
          <Image src="/logo.png" alt="Fire Sphere Logo" width={50} height={50} />
          <h2 className="text-xl font-bold ml-2">Fire Sphere</h2>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Pages</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/"><span className="hover:text-red-500 cursor-pointer">Accueil</span></Link></li>
            <li><Link href="/about"><span className="hover:text-red-500 cursor-pointer">À propos</span></Link></li>
            <li><Link href="/contact"><span className="hover:text-red-500 cursor-pointer">Contact</span></Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Services</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Surveillance des incendies</li>
            <li>Alertes en temps réel</li>
            <li>Cartographie des incidents</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Email : contact@firesphere.com</li>
            <li>Téléphone : +33 1 23 45 67 89</li>
            <li>Adresse : Paris, France</li>
          </ul>
        </div>

        <div className="flex space-x-4 text-xl">
          <FaFacebook className="hover:text-blue-500 cursor-pointer" />
          <FaTwitter className="hover:text-blue-400 cursor-pointer" />
          <FaInstagram className="hover:text-pink-500 cursor-pointer" />
          <FaLinkedin className="hover:text-blue-700 cursor-pointer" />
        </div>
      </div>

      <div className="border-t border-gray-700 text-center mt-8 pt-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} Fire Sphere. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
