'use client'

import Navbar from "@/components/Navbar";
import Auth from "@/components/auth";
import { useState, useEffect } from "react";
import { auth, firestore } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [login, setLogin] = useState(false);
  const[data,setData]=useState<any>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const dbRef=doc(firestore,"users",currentUser!.uid);
      const snap=await getDoc(dbRef);
      const data=snap.data();
     
      setData(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {/* Hero Background Image */}
      <Image
        src="/hero-bg.jpg" // Make sure to add this image to your public folder
        alt="Hero Background"
        layout="fill"
        objectFit="cover"
        className="z-0 opacity-30"
      />

      {/* Overlay Content */}
      <div className="relative z-10">
      <Navbar login={login} setLogin={setLogin} user={user} data={user ? data : null} />

        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-6 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-300 drop-shadow-lg">
            Welcome to AlgoElevate 🚀
          </h1>
          <p className="max-w-xl text-lg md:text-xl text-gray-200">
            Master DSA with real coding challenges. Track progress. Compete on the leaderboard. Level up.
          </p>

          {login && <Auth login={login} setLogin={setLogin} />}

          <div className="flex gap-4">
            {user && (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold shadow-md"
                >
                  Dashboard
                </button>
                
              </>
            )}
            {!user && (
              <button
                onClick={() => setLogin(true)}
                className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-white font-semibold shadow-md"
              >
                Login to Get Started
              </button>
            )}
            <button
                  onClick={() => router.push("/leaderboard")}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-semibold shadow-md"
                >
                  Leaderboard
                </button>
          </div>
        </div>
      </div>
    </div>
  );
}
