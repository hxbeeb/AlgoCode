'use client';

import { useEffect, useState } from "react";
import { auth, firestore } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { problems, Problem } from "../problems/problems";
import YouTube from "react-youtube";
import { IoClose } from "react-icons/io5";
import { AiFillYoutube } from "react-icons/ai";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

export default function Dashboard() {
	const [user, setUser] = useState<any>(null);
	const [loadingProblems, setLoadingProblems] = useState(true);
	const [data, setData] = useState<Problem[]>([]);
	const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
	const [youtubePlayer, setYoutubePlayer] = useState({ open: false, id: "" });

	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setUser(currentUser);
			if (!currentUser) {
				router.replace("/");
			} else {
				// Fetch problems
				const q = query(collection(firestore, "problems"), orderBy("order", "asc"));
				const querySnapshot = await getDocs(q);
				const fetchedProblems = querySnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				})) as Problem[];
				setData(fetchedProblems);

				// Fetch solved problems
				const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
				if (userDoc.exists()) {
					const userData = userDoc.data();
					setSolvedProblems(userData.solved || []);
				}

				setLoadingProblems(false);
			}
		});

		return () => unsubscribe();
	}, [router]);

	if (!user) return null;

	return (
		<div className="min-h-screen bg-black text-white bg-cover bg-center bg-no-repeat"
		style={{ backgroundImage: 'url("/hero.png")' }} >
			<Topbar user={user} />

			<h1 className="text-2xl text-center text-gray-200 font-semibold uppercase mt-10 mb-6">
				Problems
			</h1>

			{loadingProblems ? (
				<div className="overflow-x-auto px-4 pb-10 animate-pulse">
					 <table className="w-full max-w-6xl mx-auto text-sm text-left text-gray-300 border border-gray-700 animate-pulse">
      <thead className="text-xs uppercase bg-gray-800 text-gray-300">
        <tr>
          <th className="px-3 py-3">Status</th>
          <th className="px-6 py-3">Title</th>
          <th className="px-6 py-3">Difficulty</th>
          <th className="px-6 py-3">Category</th>
          <th className="px-6 py-3">Solution</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(6)].map((_, i) => (
          <tr key={i} className="border-t border-gray-700 bg-black">
            <td className="px-3 py-3 text-center">
              <div className="h-4 w-4 bg-gray-600 rounded-full mx-auto" />
            </td>
            <td className="px-6 py-3">
              <div className="h-4 bg-gray-700 rounded w-48"></div>
            </td>
            <td className="px-6 py-3">
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            </td>
            <td className="px-6 py-3">
              <div className="h-4 bg-gray-700 rounded w-24"></div>
            </td>
            <td className="px-6 py-3">
              <div className="h-5 w-5 bg-gray-600 rounded-full" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
					{/* Skeleton table */}
					{/* ...same as before */}
				</div>
			) : (
				<div className="overflow-x-auto px-4 pb-10 relative">
					<table className="w-full max-w-6xl mx-auto text-sm text-left text-gray-300 border border-gray-700">
						<thead className="text-xs uppercase bg-gray-800 text-gray-300">
							<tr>
								<th className="px-3 py-3">Status</th>
								<th className="px-6 py-3">Title</th>
								<th className="px-6 py-3">Difficulty</th>
								<th className="px-6 py-3">Category</th>
								<th className="px-6 py-3">Solution</th>
							</tr>
						</thead>
						<tbody>
							{data.map((problem: Problem, index: number) => (
								<tr
									key={problem.id}
									className={`border-t border-gray-700  hover:bg-gray-700 transition-colors bg-black`}
								>
									<td className="px-3 py-3 text-center text-lg">
										{solvedProblems.includes(problem.id) ? "✅" : "❌"}
									</td>
									<td
										onClick={() => router.push("/problem/" + problem.id)}
										className="cursor-pointer px-6 py-3 font-medium text-white"
									>
										{index+1}. {problem.title}
									</td>
									<td className="px-6 py-3">
										<span
											className={`px-2 py-1 rounded text-white text-xs font-semibold ${
												problem.difficulty === "Easy"
													? "bg-green-600"
													: problem.difficulty === "Medium"
													? "bg-yellow-600"
													: "bg-red-600"
											}`}
										>
											{problem.difficulty}
										</span>
									</td>
									<td className="px-6 py-3">{problem.category}</td>
									<td className="px-6 py-3">
										{problem.videoId ? (
											<AiFillYoutube
												className="cursor-pointer"
												onClick={() => setYoutubePlayer({ open: true, id: problem.videoId! })}
												color="red"
												fontSize={28}
											/>
										) : (
											<span className="text-gray-500">Coming soon</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* YouTube Modal */}
					{youtubePlayer.open && (
						<div className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center z-50">
							<div className="absolute inset-0 bg-black opacity-70" />
							<div className="relative w-full max-w-4xl p-4">
								<IoClose
									onClick={() => setYoutubePlayer({ open: false, id: "" })}
									fontSize={35}
									className="absolute -top-10 right-0 text-white cursor-pointer z-50"
								/>
								<YouTube
									videoId={youtubePlayer.id}
									loading="lazy"
									iframeClassName="w-full min-h-[500px] rounded-md z-50"
								/>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
