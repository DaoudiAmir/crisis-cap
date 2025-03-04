import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClipLoader } from "react-spinners";
import Link from "next/link";

// Define user roles for the dropdown
const userRoles = [
  { value: "FIREFIGHTER", label: "Pompier (Sapeur-pompier)" },
  { value: "TEAM_LEADER", label: "Chef d'équipe (Chef-agres)" },
  { value: "OFFICER", label: "Officier" },
  { value: "REGIONAL_COORDINATOR", label: "Coordinateur régional" }
];

const SignupPage = () => {
  // Form state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [badgeNumber, setBadgeNumber] = useState<string>("");
  const [role, setRole] = useState<string>("FIREFIGHTER");
  const [department, setDepartment] = useState<string>("");
  const [station, setStation] = useState<string>("");
  
  // Form validation state
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  
  const router = useRouter();
  const { register, error, isLoggedIn, isLoading, clearError } = useAuth();

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
      setFormSuccess("");
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
  }, [firstName, lastName, email, password, confirmPassword, badgeNumber, role, department, station, clearError, error]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateBadgeNumber = (badgeNumber: string): boolean => {
    // Badge number should be alphanumeric and at least 4 characters
    return badgeNumber.length >= 4;
  };

  // Handle form submission for step 1
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 1 fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setFormError("Tous les champs doivent être remplis.");
      return;
    }
    
    if (!validateEmail(email)) {
      setFormError("L'adresse email est invalide.");
      return;
    }

    if (!validatePassword(password)) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Move to step 2
    setFormError("");
    setStep(2);
  };

  // Handle final form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 2 fields
    if (!badgeNumber || !role) {
      setFormError("Le numéro de badge et le rôle sont obligatoires.");
      return;
    }
    
    if (!validateBadgeNumber(badgeNumber)) {
      setFormError("Le numéro de badge doit contenir au moins 4 caractères.");
      return;
    }

    // Additional validation for officers and coordinators
    if ((role === "OFFICER" || role === "REGIONAL_COORDINATOR") && (!department || !station)) {
      setFormError("Le département et la caserne sont obligatoires pour les officiers et coordinateurs.");
      return;
    }

    try {
      // Prepare user data
      const userData = {
        firstName,
        lastName,
        email,
        password,
        badgeNumber,
        role,
        department: department || undefined,
        station: station || undefined
      };

      // Call register function from auth context
      await register(userData);
      
      // Show success message (will redirect automatically if successful)
      setFormSuccess("Inscription réussie! Redirection vers le tableau de bord...");
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  // Go back to step 1
  const handleBack = () => {
    setStep(1);
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
      <Navbar />

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
            <h2 className="card-title text-2xl font-bold mb-2">Créer un compte Crisis-Cap</h2>
            <p className="text-gray-600 mb-6">
              {step === 1 
                ? "Étape 1: Informations personnelles" 
                : "Étape 2: Informations professionnelles"}
            </p>
            
            {formError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="alert alert-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Prénom</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Entrez votre prénom"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nom</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Entrez votre nom"
                      required
                    />
                  </div>
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Entrez votre email professionnel"
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Mot de passe</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Créez un mot de passe sécurisé"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-info">Au moins 8 caractères, une majuscule, une minuscule et un chiffre</span>
                  </label>
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Confirmer le mot de passe</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>

                <div className="form-control">
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <ClipLoader color="#ffffff" size={20} /> : "Continuer"}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p>
                    Vous avez déjà un compte?{" "}
                    <Link href="/LoginPage" className="link link-primary">
                      Connectez-vous
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Numéro de badge</span>
                  </label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Entrez votre numéro de badge"
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Rôle</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="select select-bordered w-full"
                    required
                  >
                    {userRoles.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional fields based on role */}
                {(role === "OFFICER" || role === "REGIONAL_COORDINATOR") && (
                  <>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Département</span>
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Entrez votre département"
                        required
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Caserne</span>
                      </label>
                      <input
                        type="text"
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Entrez votre caserne"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-outline flex-1"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? <ClipLoader color="#ffffff" size={20} /> : "S'inscrire"}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p>
                    Vous avez déjà un compte?{" "}
                    <Link href="/LoginPage" className="link link-primary">
                      Connectez-vous
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SignupPage;
