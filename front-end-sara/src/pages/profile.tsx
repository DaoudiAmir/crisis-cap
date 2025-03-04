import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaBuilding, FaMapMarkerAlt, FaEdit, FaKey, FaShieldAlt } from "react-icons/fa";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const Profile = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        address: user.address || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  }, [user]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setMessage({ type: "", text: "" });
      
      // In a real app, this would send the updated profile data to the backend
      // const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`, 
      //   {
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     email: formData.email,
      //     phone: formData.phone,
      //     department: formData.department,
      //     address: formData.address
      //   },
      //   { withCredentials: true }
      // );
      
      // Simulate successful update
      setTimeout(() => {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setIsEditing(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Erreur lors de la mise à jour du profil" });
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }
    
    try {
      setMessage({ type: "", text: "" });
      
      // In a real app, this would send the password change request to the backend
      // const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/change-password`, 
      //   {
      //     currentPassword: formData.currentPassword,
      //     newPassword: formData.newPassword
      //   },
      //   { withCredentials: true }
      // );
      
      // Simulate successful password change
      setTimeout(() => {
        setMessage({ type: "success", text: "Mot de passe modifié avec succès" });
        setIsChangingPassword(false);
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Erreur lors du changement de mot de passe" });
    }
  };
  
  // Redirect if not logged in
  if (!isLoading && !isLoggedIn) {
    router.push("/LoginPage");
    return null;
  }
  
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base-100">
      <Head>
        <title>Mon Profil | Crisis-Cap</title>
      </Head>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
            <p className="text-base-content/70">
              Consultez et modifiez vos informations personnelles
            </p>
          </div>
          
          {/* Message display */}
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} mb-6`}>
              <div>
                {message.type === "success" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col items-center">
                  <div className="avatar placeholder mb-4">
                    <div className="bg-primary text-primary-content rounded-full w-24">
                      <span className="text-3xl">{user.firstName?.charAt(0) || ""}{user.lastName?.charAt(0) || ""}</span>
                    </div>
                  </div>
                  <h2 className="card-title text-2xl">{user.firstName} {user.lastName}</h2>
                  <div className="badge badge-primary mt-2">{user.role}</div>
                  
                  <div className="divider"></div>
                  
                  <div className="w-full space-y-3">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 text-primary" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-primary" />
                      <span>{formData.phone || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBuilding className="mr-3 text-primary" />
                      <span>{formData.department || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-3 text-primary" />
                      <span>{formData.address || "Non renseigné"}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions justify-center mt-6">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <FaEdit className="mr-2" /> Modifier le profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Edit Form */}
            <div className="lg:col-span-2">
              {isEditing ? (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Modifier mon profil</h2>
                    
                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Prénom</span>
                          </label>
                          <input 
                            type="text" 
                            name="firstName"
                            className="input input-bordered" 
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Nom</span>
                          </label>
                          <input 
                            type="text" 
                            name="lastName"
                            className="input input-bordered" 
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Email</span>
                          </label>
                          <input 
                            type="email" 
                            name="email"
                            className="input input-bordered" 
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Téléphone</span>
                          </label>
                          <input 
                            type="tel" 
                            name="phone"
                            className="input input-bordered" 
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Département</span>
                          </label>
                          <input 
                            type="text" 
                            name="department"
                            className="input input-bordered" 
                            value={formData.department}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Adresse</span>
                          </label>
                          <input 
                            type="text" 
                            name="address"
                            className="input input-bordered" 
                            value={formData.address}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <button 
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setIsEditing(false)}
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit"
                          className="btn btn-primary"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : isChangingPassword ? (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Changer de mot de passe</h2>
                    
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Mot de passe actuel</span>
                          </label>
                          <input 
                            type="password" 
                            name="currentPassword"
                            className="input input-bordered" 
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Nouveau mot de passe</span>
                          </label>
                          <input 
                            type="password" 
                            name="newPassword"
                            className="input input-bordered" 
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                          />
                          <label className="label">
                            <span className="label-text-alt">Minimum 8 caractères</span>
                          </label>
                        </div>
                        
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Confirmer le nouveau mot de passe</span>
                          </label>
                          <input 
                            type="password" 
                            name="confirmPassword"
                            className="input input-bordered" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <button 
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setIsChangingPassword(false)}
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit"
                          className="btn btn-primary"
                        >
                          Changer le mot de passe
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <>
                  {/* Security Settings Card */}
                  <div className="card bg-base-200 shadow-xl mb-6">
                    <div className="card-body">
                      <h2 className="card-title text-xl mb-4">
                        <FaShieldAlt className="mr-2" /> Sécurité
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Mot de passe</h3>
                            <p className="text-sm text-base-content/70">Dernière modification il y a 30 jours</p>
                          </div>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => setIsChangingPassword(true)}
                          >
                            <FaKey className="mr-2" /> Modifier
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Authentification à deux facteurs</h3>
                            <p className="text-sm text-base-content/70">Non activée</p>
                          </div>
                          <button className="btn btn-outline btn-sm">
                            Activer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preferences Card */}
                  <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title text-xl mb-4">Préférences</h2>
                      
                      <div className="space-y-4">
                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Notifications par email</span> 
                            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                          </label>
                        </div>
                        
                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Notifications push</span> 
                            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                          </label>
                        </div>
                        
                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Alertes d'intervention</span> 
                            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                          </label>
                        </div>
                        
                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Mode sombre</span> 
                            <input type="checkbox" className="toggle toggle-primary" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-6">
                        <button className="btn btn-primary">
                          Enregistrer les préférences
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
