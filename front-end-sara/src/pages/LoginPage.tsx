import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from 'next/image'; 
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClipLoader } from "react-spinners";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const router = useRouter(); 
  const { login, error, isLoggedIn, isLoading, clearError } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  // Set form error from auth context error
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  // Clear errors when form changes
  useEffect(() => {
    if (formError) {
      setFormError("");
    }
    if (error) {
      clearError();
    }
  }, [email, password, clearError, error]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setFormError("Tous les champs doivent être remplis.");
      return;
    }
    
    if (!validateEmail(email)) {
      setFormError("L'adresse email est invalide.");
      return;
    }

    if (!validatePassword(password)) {
      setFormError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      await login(email, password);
      // Redirect is handled in the auth context
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#0066CC" size={50} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>

      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="card lg:card-side bg-base-100 shadow-xl max-w-6xl w-full">
          <figure className="lg:w-1/2 relative h-[400px] lg:h-auto">
            <Image
              src="/ima1.png" 
              alt="Crisis Management"
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg lg:rounded-l-lg lg:rounded-t-none" 
            />
          </figure>
          
          <div className="card-body lg:w-1/2 flex flex-col justify-center p-8">
            <h2 className="card-title text-2xl font-bold mb-2">Bienvenue sur Crisis-Cap</h2>
            <p className="text-gray-600 mb-6">Plateforme de gestion des interventions d'urgence</p>
            
            {formError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Entrez votre email"
                  required
                />
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Mot de passe</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <label className="label">
                  <a href="/forgot-password" className="label-text-alt link link-hover">Mot de passe oublié ?</a>
                </label>
              </div>

              <div className="form-control">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <ClipLoader color="#ffffff" size={20} /> : "Se connecter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  );
};

export default LoginPage;