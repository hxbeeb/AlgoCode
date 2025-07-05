"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";

interface User {
  displayName: string;
  points: number;
  solved: string[];
}

interface Problem {
  id: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface LeaderboardEntry {
  name: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
  points: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(firestore, "users"));
      const problemsSnap = await getDocs(collection(firestore, "problems"));

      const problemsMap: Record<string, Problem> = {};
      problemsSnap.forEach((doc) => {
        const problem = doc.data() as Problem;
        problemsMap[problem.id] = problem;
      });

      const leaderboard: LeaderboardEntry[] = [];

      usersSnap.forEach((doc) => {
        const user = doc.data() as User;
        let easy = 0;
        let medium = 0;
        let hard = 0;

        user.solved?.forEach((pid) => {
          const prob = problemsMap[pid];
          if (!prob) return;
          if (prob.difficulty === "Easy") easy++;
          else if (prob.difficulty === "Medium") medium++;
          else if (prob.difficulty === "Hard") hard++;
        });

        leaderboard.push({
          name: user.displayName,
          easy,
          medium,
          hard,
          total: easy + medium + hard,
          points: user.points || 0,
        });
      });

      leaderboard.sort((a, b) => b.points - a.points);
      setData(leaderboard);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/hero.png")' }}>
      <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3">Position</th>
              <th className="p-3">Name</th>
              <th className="p-3">Easy</th>
              <th className="p-3">Medium</th>
              <th className="p-3">Hard</th>
              <th className="p-3">Total</th>
              <th className="p-3">Points</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-t border-gray-800 bg-black">
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-8 mx-auto" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-24 mx-auto" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-10 mx-auto" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-10 mx-auto" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-10 mx-auto" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-10 mx-auto" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-gray-700 rounded w-12 mx-auto" />
                    </td>
                  </tr>
                ))
              : data.map((entry, idx) => (
                  <tr key={idx} className="text-center border-t border-gray-800 bg-black">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{entry.name}</td>
                    <td className="p-2">{entry.easy}</td>
                    <td className="p-2">{entry.medium}</td>
                    <td className="p-2">{entry.hard}</td>
                    <td className="p-2">{entry.total}</td>
                    <td className="p-2">{entry.points}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
