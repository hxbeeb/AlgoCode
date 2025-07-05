'use client';

import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { useRouter, notFound } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProblemLayout from "@/components/ProblemLayout";

export default function ProblemPage({ params }: { params: Promise<{ pid: string }> }) {
  const paramsObj = React.use(params);
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function fetchProblem() {
      setLoading(true);
      const docRef = doc(firestore, "problems", paramsObj.pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProblem(docSnap.data());
      } else {
        setProblem(null);
      }
      setLoading(false);
    }
    fetchProblem();
  }, [paramsObj.pid]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  if (!user || !problem) return null;

  return <ProblemLayout problem={problem} />;
}
