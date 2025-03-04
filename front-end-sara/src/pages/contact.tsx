import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { FaSignInAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import Image from "next/image";


const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact - FireSphere</title>
        <meta name="description" content="Contactez-nous pour en savoir plus sur notre solution de gestion des incendies." />
      </Head>
      <Navbar />
      <section className="relative w-full h-80 bg-cover bg-center" style={{ backgroundImage: "url('/Helic.jpeg')" }}>
        <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <h1 className="text-white text-4xl font-bold">Contactez-nous</h1>
        </div>
      </section>

      <section className="flex items-center py-16 px-24 bg-white shadow-lg">
  <div className="flex flex-col space-y-8">
    <div className="flex items-center space-x-8">
      <div className="max-w-xl">
        <h2 className="text-4xl font-bold text-gray-800">Our Locations</h2>
        <p className="mt-4 text-gray-600 text-lg text-justify">
          FireSphere is based in France, where our team develops and supports our innovative platform for fire and rescue services across the country. From our headquarters, we empower emergency responders nationwide to save lives and protect communities.
        </p>
      </div>

      <div className="ml-32 flex-1 translate-x-10">
      <Image 
        src="/Drapeau.png" 
        alt="France" 
        width={500} 
        height={300} 
        className="rounded-xl"
      />
    </div>
    </div>

   
  </div>
</section>


<div className="max-w-6xl mx-auto p-6 space-y-6">
  <div className="flex space-x-8">
    <div className="flex-1">
      <h2 className="text-2xl font-bold">Laissez-nous un message</h2>
      <form className="bg-gray-100 p-6 rounded-lg space-y-4">
        <input type="text" placeholder="Votre nom" className="w-full p-3 border rounded-lg" />
        <input type="email" placeholder="Votre email" className="w-full p-3 border rounded-lg" />
        <textarea placeholder="Votre message" className="w-full p-3 border rounded-lg"></textarea>
        <button className="w-full bg-red-600 text-white py-3 rounded-lg">Envoyer</button>
      </form>
    </div>
    <div className="flex-1">
    <h2 className="text-2xl font-bold">Nos emplacements</h2>

      <Map />
    </div>
  </div>
</div>
      <Footer />
    </>
  );
}
