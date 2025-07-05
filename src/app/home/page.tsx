'use client'
import Navbar from "@/components/Navbar";
import Auth from "@/components/auth";
import { useState,useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
export default function Home() {
    const  router=useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });   
      return () => unsubscribe(); // cleanup on unmount
    }, []);
    const [login,setLogin]=useState(false);
  return (
    <div className="">
      
      <Navbar login={login} setLogin={setLogin} user={user} />
      <div className="flex items-center justify-center h-screen">
        {login?<Auth login={login} setLogin={setLogin} />:null}
        {user&&<button onClick={()=>router.push("/dashboard")} className="bg-blue-400 rounded text-white">Dashboard</button>}
      </div>
    </div>
  );
}