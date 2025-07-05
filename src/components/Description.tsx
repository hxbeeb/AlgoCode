import { Problem } from "@/app/problems/problems";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline, TiStarFullOutline } from "react-icons/ti";

export default function Description({ problem }: { problem: Problem }) {
	const [user] = useAuthState(auth);
	const {
		currentProblem,
		setCurrentProblem,
		loading,
		problemDifficulty,
	} = useGetCurrentProblem(problem.id);
	const { liked, disliked, starred, solved, setData } = userProblem(problem.id);
	const[liking,setLiking]=useState(false);

	if (loading || !currentProblem) return null;

	const handleLike = async () => {
		if(liking)
			return;
		setLiking(true);
		await runTransaction(firestore, async (transaction) => {
			const userRef = doc(firestore, "users", user!.uid);
			const problemRef = doc(firestore, "problems", currentProblem.id);
			const userDoc = await getDoc(userRef);
			const problemDoc = await getDoc(problemRef);

			if (userDoc.exists() && problemDoc.exists()) {
				const userData = userDoc.data();
				const problemData = problemDoc.data();

				if (liked) {
					transaction.update(userRef, {
						likedProblems: userData.likedProblems.filter((id: string) => id !== currentProblem.id),
					});
					transaction.update(problemRef, { likes: problemData.likes - 1 });
					setData((prev) => ({ ...prev, liked: false }));
					setCurrentProblem((prev) => prev ? { ...prev, likes: prev.likes - 1 } : prev);
				} else {
					const update: any = {
						likedProblems: [...userData.likedProblems, currentProblem.id],
					};
					let likes = problemData.likes + 1;
					let dislikes = problemData.dislikes;

					if (disliked) {
						update.dislikedProblems = userData.dislikedProblems.filter((id: string) => id !== currentProblem.id);
						dislikes -= 1;
					}

					transaction.update(userRef, update);
					transaction.update(problemRef, { likes, dislikes });
					setData((prev) => ({ ...prev, liked: true, disliked: false }));
					setCurrentProblem((prev) => prev ? { ...prev, likes, dislikes } : prev);
				}
			}
		});
		setLiking(false);
	};

	const handleDislike = async () => {
		if(liking)
			return;
		setLiking(true);
		await runTransaction(firestore, async (transaction) => {
			const userRef = doc(firestore, "users", user!.uid);
			const problemRef = doc(firestore, "problems", currentProblem.id);
			const userDoc = await getDoc(userRef);
			const problemDoc = await getDoc(problemRef);

			if (userDoc.exists() && problemDoc.exists()) {
				const userData = userDoc.data();
				const problemData = problemDoc.data();

				if (disliked) {
					transaction.update(userRef, {
						dislikedProblems: userData.dislikedProblems.filter((id: string) => id !== currentProblem.id),
					});
					transaction.update(problemRef, { dislikes: problemData.dislikes - 1 });
					setData((prev) => ({ ...prev, disliked: false }));
					setCurrentProblem((prev) => prev ? { ...prev, dislikes: prev.dislikes - 1 } : prev);
				} else {
					const update: any = {
						dislikedProblems: [...userData.dislikedProblems, currentProblem.id],
					};
					let dislikes = problemData.dislikes + 1;
					let likes = problemData.likes;

					if (liked) {
						update.likedProblems = userData.likedProblems.filter((id: string) => id !== currentProblem.id);
						likes -= 1;
					}

					transaction.update(userRef, update);
					transaction.update(problemRef, { dislikes, likes });
					setData((prev) => ({ ...prev, disliked: true, liked: false }));
					setCurrentProblem((prev) => prev ? { ...prev, dislikes, likes } : prev);
				}
			}
		});
		setLiking(false);
	};

	const handleStar = async () => {
		const userRef = doc(firestore, "users", user!.uid);
		const userDoc = await getDoc(userRef);

		if (userDoc.exists()) {
			const userData = userDoc.data();
			const currentStarred = userData.starred || [];

			if (starred) {
				await runTransaction(firestore, async (transaction) => {
					transaction.update(userRef, {
						starred: currentStarred.filter((id: string) => id !== currentProblem.id),
					});
				});
				setData((prev) => ({ ...prev, starred: false }));
			} else {
				await runTransaction(firestore, async (transaction) => {
					transaction.update(userRef, {
						starred: [...currentStarred, currentProblem.id],
					});
				});
				setData((prev) => ({ ...prev, starred: true }));
			}
		}
	};

	return (
		<div className='bg-black text-white h-full'>
			{/* Tabs */}
			<div className='flex h-11 w-full flex-wrap items-center border-b border-gray-700 text-sm'>
				<div className='bg-[#262626] text-white font-semibold px-5 py-2 rounded-t-md'>
					Description
				</div>
				{/* <div className='ml-2 px-4 py-2 text-gray-400 cursor-pointer hover:text-white'>Solution</div>
				<div className='ml-2 px-4 py-2 text-gray-400 cursor-pointer hover:text-white'>Submissions</div> */}
			</div>

			<div className='p-4 md:p-6'>
				{/* Title and Stats */}
				<div className='mb-4 flex flex-wrap justify-between items-center gap-4'>
					<h1 className='text-lg font-semibold'>{currentProblem.title}</h1>
					<div className='flex items-center flex-wrap gap-4 text-sm'>
						<span className='px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium'>
							{currentProblem.difficulty}
						</span>
						{solved && (
							<span className='flex items-center text-green-400'>
								<BsCheck2Circle className='mr-1 text-lg' /> Solved
							</span>
						)}
						<span className='flex items-center cursor-pointer' onClick={handleLike}>
							<AiFillLike className={`mr-1 text-xl ${liked ? "text-blue-500" : "text-gray-400"}`} />
							{currentProblem.likes}
						</span>
						<span className='flex items-center cursor-pointer' onClick={handleDislike}>
							<AiFillDislike className={`mr-1 text-xl ${disliked ? "text-red-500" : "text-gray-400"}`} />
							{currentProblem.dislikes}
						</span>
						<span className='flex items-center cursor-pointer' onClick={handleStar}>
							{starred ? (
								<TiStarFullOutline className='text-yellow-400 text-xl' />
							) : (
								<TiStarOutline className='text-white text-xl' />
							)}
						</span>
					</div>
				</div>

				{/* Description */}
				<div className='bg-[#2C2C2E] rounded-lg p-5 mb-6 border border-gray-700'>
					<p className='whitespace-pre-wrap text-sm text-gray-200'>{currentProblem.description}</p>
				</div>

				{/* Examples */}
				{currentProblem.examples && (
	<div className="space-y-6">
		{currentProblem.examples.map((example, idx) => {
			
			const inputObj = example.input?.[0]; // first key
			const metaObj = example.output ; // second key, explanation/output

			const formattedInput =
	inputObj &&
	Object.entries(inputObj)
		.map(([key, value]) => {
			let val: string;

			const isMatrix =
				typeof value === "object" &&
				value !== null &&
				Object.values(value).every(
					(row: any) =>
						typeof row === "object" &&
						row !== null &&
						Object.values(row).every((n) => typeof n === "number")
				);

			if (Array.isArray(value)) {
				if (Array.isArray(value[0])) {
					val = "[\n" + value.map((row) => `  [${row.join(", ")}]`).join(",\n") + "\n]";
				} else {
					val = `[${value.join(", ")}]`;
				}
			} else if (isMatrix) {
				const matrix = Object.keys(value)
					.sort((a, b) => Number(a) - Number(b))
					.map((rowKey) => {
						const row = value[rowKey as keyof typeof value];
						return Object.keys(row)
							.sort((a, b) => Number(a) - Number(b))
							.map((colKey) => row[colKey as keyof typeof row]);
					});
				val = "[\n" + matrix.map((row) => `  [${row.join(", ")}]`).join(",\n") + "\n]";
			} else {
				val = JSON.stringify(value, null, 2);
			}

			return `${key} = ${val}`;
		})
		.join("\n");


			const output = metaObj || "";
			const explanation = example.explanation || "";

			return (
				<div
					key={example.id || idx}
					className="bg-[#1E1E1E] border border-gray-700 rounded-lg p-5 shadow-sm text-sm text-gray-200"
				>
					<p className="text-lg font-semibold text-white mb-3">Example {idx + 1}</p>

					{formattedInput && (
						<p className="mb-2">
							<strong className="text-gray-300">Input:</strong> {formattedInput}
						</p>
					)}

					{output && (
						<p className="mb-2">
							<strong className="text-gray-300">Output:</strong> {output}
						</p>
					)}

					{explanation && (
						<p>
							<strong className="text-gray-300">Explanation:</strong> {explanation}
						</p>
					)}
				</div>
			);
		})}
	</div>
)}



	


				{/* Constraints */}
				{currentProblem.constraints && (
					<div className='mt-6'>
						<p className='text-sm font-medium'>Constraints:</p>
						<ul className='list-disc list-inside text-sm text-gray-300 mt-2'>
							{currentProblem.constraints.map((c, i) => (
								<li key={i}>
									<code>{c}</code>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}


function useGetCurrentProblem(problemId: string) {
	const [loading, setLoading] = useState<boolean>(true);
	const [problemDifficulty, setProblemDifficulty] = useState<string>("");
	const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  
	useEffect(() => {
	  async function getCurrent() {
		try {
		  setLoading(true);
		  const docRef = doc(firestore, "problems", problemId);
		  const docSnap = await getDoc(docRef);
  
		  if (docSnap.exists()) {
			const problem = docSnap.data() as Problem;
  
			setCurrentProblem({ ...problem,id:docSnap.id });
  
			const difficultyClass =
			  problem.difficulty === "Easy"
				? "bg-olive text-olive"
				: problem.difficulty === "Medium"
				? "bg-dark-yellow text-dark-yellow"
				: "bg-dark-pink text-dark-pink";
  
			setProblemDifficulty(difficultyClass);
		  } 
		} catch (error) {
		  console.error("Error fetching problem:", error);
		  setCurrentProblem(null);
		} finally {
		  setLoading(false);
		}
	  }
  
	  getCurrent();
	}, [problemId]);
  
	return {
	  currentProblem,
	  loading,
	  problemDifficulty,
	  setCurrentProblem, // exposed if mutation needed from outside
	};
  }

function userProblem(problemId:string){

	const[data,setData]=useState({liked:false,disliked:false,starred:false,solved:false});
	const [user]=useAuthState(auth);
	useEffect(()=>{
		async function problemData(){
			const  userRef=doc(firestore,"users",user!.uid);
			const userSnap=await getDoc(userRef);
			if(userSnap.exists())
			{
				const  data=userSnap.data();
				const{solved,starred,likedProblems,dislikedProblems}=data;
				setData({
					liked:likedProblems.includes(problemId),
					disliked:dislikedProblems.includes(problemId),
					starred:starred.includes(problemId),
					solved:solved.includes(problemId),
				})
			}
		}
		problemData();
		const listener = (e: any) => {
			if (e.detail === problemId) {
				setData(prev => ({ ...prev, solved: true }));
			}
		};
	
		window.addEventListener("solved-problem", listener);
	
		return () => {
			window.removeEventListener("solved-problem", listener);

	}},[problemId,user])
	// console.log(data);

	return {...data,setData};



}
