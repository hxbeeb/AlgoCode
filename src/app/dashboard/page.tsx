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
import { IoChevronDown } from "react-icons/io5";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

export default function Dashboard() {
	const [user, setUser] = useState<any>(null);
	const [loadingProblems, setLoadingProblems] = useState(true);
	const [data, setData] = useState<Problem[]>([]);
	const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
	const [youtubePlayer, setYoutubePlayer] = useState({ open: false, id: "" });
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

	const router = useRouter();

	// Get unique categories and group problems by category
	const categories = Array.from(new Set(data.map(problem => problem.category)));
	const problemsByCategory = categories.reduce((acc, category) => {
		acc[category] = data.filter(problem => problem.category === category);
		return acc;
	}, {} as Record<string, Problem[]>);

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

	const toggleCategory = (category: string) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(category)) {
			newExpanded.delete(category);
		} else {
			newExpanded.add(category);
		}
		setExpandedCategories(newExpanded);
	};

	if (!user) return null;

	return (
		<div className="min-h-screen bg-black text-white bg-cover bg-center bg-no-repeat"
		style={{ backgroundImage: 'url("/hero.png")' }} >
			<Topbar user={user} />

			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-2xl text-center text-gray-200 font-semibold uppercase mt-10 mb-6">
					Problems by Category
				</h1>

				{loadingProblems ? (
					<div className="space-y-4 pb-10">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="border border-gray-700 rounded-lg overflow-hidden">
								<div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
									<div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
									<div className="h-6 w-6 bg-gray-700 rounded animate-pulse"></div>
								</div>
								<div className="bg-black p-6">
									{[...Array(3)].map((_, j) => (
										<div key={j} className="mb-4 last:mb-0">
											<div className="grid grid-cols-5 gap-4 items-center">
												<div className="flex justify-center">
													<div className="h-4 w-4 bg-gray-600 rounded-full animate-pulse"></div>
												</div>
												<div className="h-4 bg-gray-700 rounded animate-pulse"></div>
												<div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
												<div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
												<div className="h-5 w-5 bg-gray-600 rounded-full animate-pulse"></div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="space-y-4 pb-10">
						{categories.map((category) => (
							<div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
								<button
									onClick={() => toggleCategory(category)}
									className="w-full bg-gray-800 px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
								>
									<div className="flex items-center space-x-3">
										<span className="text-lg font-semibold text-white">{category}</span>
										<span className="text-sm text-gray-400">
											({problemsByCategory[category]?.length || 0} problems)
										</span>
									</div>
									<IoChevronDown 
										className={`text-white transition-transform duration-200 ${
											expandedCategories.has(category) ? 'rotate-180' : ''
										}`}
									/>
								</button>
								
								{expandedCategories.has(category) && (
									<div className="bg-black">
										<div className="px-6 py-4 border-b border-gray-700">
											<div className="grid grid-cols-5 gap-4 text-xs uppercase text-gray-400 font-semibold">
												<div>Status</div>
												<div>Title</div>
												<div>Difficulty</div>
												<div>Category</div>
												<div>Solution</div>
											</div>
										</div>
										<div className="divide-y divide-gray-700">
											{problemsByCategory[category]?.map((problem: Problem, index: number) => (
												<div
													key={problem.id}
													className="px-6 py-4 hover:bg-gray-700 transition-colors"
												>
													<div className="grid grid-cols-5 gap-4 items-center">
														<div className="flex justify-center text-lg">
															{solvedProblems.includes(problem.id) ? "✅" : "❌"}
														</div>
														<div
															onClick={() => router.push("/problem/" + problem.id)}
															className="cursor-pointer font-medium text-white hover:text-blue-400 transition-colors"
														>
															{index+1}. {problem.title}
														</div>
														<div>
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
														</div>
														<div className="text-gray-300">{problem.category}</div>
														<div>
															{problem.videoId ? (
																<AiFillYoutube
																	className="cursor-pointer hover:scale-110 transition-transform"
																	onClick={() => setYoutubePlayer({ open: true, id: problem.videoId! })}
																	color="red"
																	fontSize={28}
																/>
															) : (
																<span className="text-gray-500">Coming soon</span>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}

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
		</div>
	);
}
