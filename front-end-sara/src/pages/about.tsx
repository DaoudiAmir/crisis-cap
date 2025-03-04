import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { FaSignInAlt } from "react-icons/fa";
import { useRouter } from "next/router";


const Home = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/LoginPage");
  };

  return (
    <div className="bg-gray-100">
      <Navbar />   

      <section className="relative flex items-center justify-center py-32 px-48 bg-gradient-to-r from-red-600 to-pink-500">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center filter blur"
          style={{ backgroundImage: 'url(/France.jpeg)' }}
        ></div>
        
        <div className="relative z-10 max-w-3xl text-white text-center">
          <h1 className="text-5xl font-extrabold tracking-wide leading-tight mb-4">About FireSphere</h1>
          <h3 className="mt-4 text-white-600 text-lg">Home/About us </h3>
        </div>
      </section>

      <section className="flex items-center py-16 px-24 bg-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800">Product Overview</h2>
          <p className="mt-4 text-gray-600 text-lg text-justify">
            FireSphere is a state-of-the-art, web-based platform designed to revolutionize emergency response operations for fire and rescue services. Combining advanced technologies such as real-time incident tracking, AI-powered call transcriptions, predictive analytics, and weather monitoring, FireSphere provides a comprehensive solution for managing emergencies efficiently and effectively.

            The platform is tailored to meet the needs of all key stakeholders, including firefighters, team leaders, and regional coordinators. Firefighters can access real-time incident details, update their status, and share their location, ensuring seamless coordination. Team leaders can monitor their squad's health, assign roles, and communicate with command centers, while coordinators gain a high-level overview of ongoing interventions and resource allocation across multiple regions.

            FireSphere's predictive analytics module uses historical data and AI to forecast resource needs, helping teams prepare for potential shortages before they occur. Additionally, the platform integrates automatic call transcriptions, providing responders with critical context before arriving on-site.

            Designed with scalability and security in mind, FireSphere is accessible even in low-connectivity areas through its offline mode, ensuring uninterrupted operations. Trusted by emergency services worldwide, FireSphere is not just a tool—it's a lifeline for those on the frontlines, empowering them to save lives and respond to emergencies with unmatched precision and speed.
          </p>
        </div>
        <div className="ml-12 flex-1 translate-x-10">
          <Image src="/logo.png" alt="logo" width={350} height={200} className="rounded-xl shadow-xl w-[80%] h-auto"/>
        </div>
      </section>

      <section className="flex items-center py-16 px-24 bg-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800">FireSphere Connect</h2>
          <p className="mt-4 text-gray-600 text-lg text-justify">
            With FireSphere Connect, firefighters can quickly update their intervention status (en route, on-site, finished) and share their GPS location, enhancing situational awareness for the entire team. Team leaders can monitor their squad’s progress, assign tasks, and communicate resource needs directly to the command center. Meanwhile, command officers can oversee multiple interventions simultaneously, ensuring efficient resource allocation and rapid escalation when necessary.

            FireSphere Connect also integrates with other key features of the platform, such as AI-powered call transcriptions and predictive alerts, providing a unified and intuitive interface for all communication needs. Whether in high-pressure scenarios or routine operations, FireSphere Connect ensures that every team member stays connected, informed, and ready to act.
          </p>
        </div>
        <div className="ml-12 flex-1">
          <Image src="/centres.jpeg" alt="logo" width={500} height={300} className="rounded-xl shadow-xl w-full h-auto"/>
        </div>
      </section>

      <section className="flex items-center py-16 px-24 bg-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800">Our History</h2>
          <p className="mt-4 text-gray-600 text-lg text-justify">
            FireSphere was born out of a project we undertook at engineering school, focused on the theme of natural risks. Among the many challenges to address, we chose to concentrate on fires, a critical issue demanding innovative and effective solutions. As we delved deeper, we identified a crucial need: to revolutionize emergency response systems and equip firefighters and first responders with cutting-edge technology to enhance their efficiency and safety.

            What began as an academic project quickly evolved into a broader mission. We realized that emergency services often lacked modern tools to manage real-time interventions, allocate resources optimally, and anticipate future needs. This is how the idea of FireSphere took shape—a platform integrating advanced features such as real-time incident tracking, AI-powered call transcriptions, predictive analytics, and seamless team communication.

            Today, FireSphere is much more than a school project: it is a concrete and operational solution, adopted by emergency services to transform how interventions are managed. Our goal remains unchanged: to provide firefighters and first responders with the tools they need to save lives and protect communities, making every second count in the process.
          </p>
        </div>
        <div className="ml-12 flex-1">
          <Image src="/pompier.jpeg" alt="logo" width={500} height={300} className="rounded-xl shadow-xl w-full h-auto"/>
        </div>
      </section>

      <section className="flex items-center py-16 px-24 bg-white shadow-lg">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800">Resources</h2>
          <p className="mt-4 text-gray-600 text-lg text-justify">
            FireSphere simplifies the management of essential resources like water, fuel, and equipment with innovative tools:

            Real-Time Tracking: Monitor stocks and receive alerts for shortages.
            Predictive Management: Anticipate future needs with AI-driven analytics.
            Optimized Maintenance: Schedule repairs and track vehicle/equipment status.
            Dynamic Reallocation: Quickly reallocate resources between regions when needed.

            With FireSphere, emergency services gain efficiency, reduce costs, and avoid shortages, ensuring safer and more effective interventions.
          </p>
        </div>
        <div className="ml-12 flex-1">
          <Image src="/Heli.jpeg" alt="logo" width={500} height={300} className="rounded-xl shadow-xl w-full h-auto"/>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;