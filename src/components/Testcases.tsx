'use client';
import { Problem } from "@/app/problems/problems";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import EditorFooter from "./EditorFooter";
import { evaluateUserCode } from "@/app/ProblemHandler/handler"; // common evaluator

export default function Testcases({ pid, userCode, setUserCode,setSuccess }: { pid: string, userCode: string, setUserCode: any,setSuccess:any }) {
	const [activeTestCaseId, setActiveTestCaseId] = useState(0);
	const [problem, setProblem] = useState<Problem | null>(null);
	const [user] = useAuthState(auth);
	const router = useRouter();

	useEffect(() => {
		const fetchProblem = async () => {
			const docRef = doc(firestore, "problems", pid);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data() as Problem;
				setProblem({ ...data, id: docSnap.id });
				const localCode = localStorage.getItem(`code-${pid}`);
				setUserCode(localCode ? JSON.parse(localCode) : data.starterProblem);
			} else {
				toast.error("Problem not found.");
				router.push("/");
			}
		};
		fetchProblem();
	}, [pid, router, setUserCode]);
	const handleRun=async()=>{
		try {
			if (!problem) return;
			const success = evaluateUserCode(userCode, problem);
			if (success) {
				toast.success("Congrats! All tests passed! \nSubmit your code.", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});
			


}else{		
				
				toast.error("Oops! One or more test cases failed", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});
			}
		} catch (error: any) {
			toast.error(error.message || "Something went wrong", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		}

	}

	const handleSubmit = async () => {
		if (!user) {
			toast.error("Please login to submit your code", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
			return;
		}
		try {
			if (!problem) return;
			const success = evaluateUserCode(userCode, problem);
			if (success) {
				setSuccess(true);
				toast.success("Congrats! code Submitted!", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});
				setTimeout(()=>{
					setSuccess(false)
				},4000)
				const userRef = doc(firestore, "users", user.uid);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  const userData = userSnap.data();
  const solvedProblems = userData.solved || [];
  // Check if pid is already solved
  if (!solvedProblems.includes(pid)) {
    let a = 1;
    if (problem.difficulty === "Medium") a = 2;
    else if (problem.difficulty === "Hard") a = 3;

    await updateDoc(userRef, {
      solved: arrayUnion(pid),
      points: userData.points?userData.points+a:a, // Consider using increment if you're accumulating points
    });

	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("solved-problem", { detail: pid }));
	}

  }
}
}else{		
				
				toast.error("Oops! One or more test cases failed", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});
			}
		} catch (error: any) {
			toast.error(error.message || "Something went wrong", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		}
	};

	if (!problem) return null;

	function isFirebaseMatrix(obj: any): boolean {
		if (typeof obj !== 'object' || obj === null) return false;
		const values = Object.values(obj);
		return values.every(
			(row) =>
				typeof row === 'object' &&
				row !== null &&
				Object.values(row).every((val) => typeof val === 'number')
		);
	}
	
	function convertFirebaseMatrix(obj: Record<string, any>): number[][] {
		return Object.keys(obj)
			.sort((a, b) => Number(a) - Number(b))
			.map((rowKey) => {
				const row = obj[rowKey];
				return Object.keys(row)
					.sort((a, b) => Number(a) - Number(b))
					.map((colKey) => row[colKey]);
			});
	}
	
	function formatValue(v: any): string {
		if (Array.isArray(v)) {
			if (Array.isArray(v[0])) {
				return '[\n' + v.map(row => '  [' + row.join(', ') + ']').join(',\n') + '\n]';
			}
			return '[' + v.join(', ') + ']';
		} else if (isFirebaseMatrix(v)) {
			const matrix = convertFirebaseMatrix(v);
			return '[\n' + matrix.map(row => '  [' + row.join(', ') + ']').join(',\n') + '\n]';
		} else if (typeof v === 'object' && v !== null) {
			return JSON.stringify(v, null, 2); // pretty-print object
		}
		return JSON.stringify(v);
	}
	
	const inputObj = problem.examples[activeTestCaseId]?.input?.[0] || {};
const metaObj = problem.examples[activeTestCaseId]?.output || "";
const explanation = problem.examples[activeTestCaseId]?.explanation || "";

const formattedInput = Object.entries(inputObj)
	.map(([k, v]) => `${k} = ${formatValue(v)}`)
	.join('\n');



	return (
		<div className='w-full px-6 pb-24 overflow-auto'>
			<div className='flex h-10 items-center space-x-6'>
				<div className='relative flex h-full flex-col justify-center cursor-pointer'>
					<div className='text-sm font-medium leading-5 text-white'>Testcases</div>
					<hr className='absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white' />
				</div>
			</div>

			<div className='flex space-x-2 mt-4 gap-10'>
				{problem.examples.map((example, index) => (
					<div
						key={index}
						className={`px-4 py-1 rounded-lg cursor-pointer font-medium text-sm border border-gray-700
							${activeTestCaseId === index ? "bg-black text-white" : "bg-gray text-gray-400 hover:bg-gray-700"}`}
						onClick={() => setActiveTestCaseId(index)}
					>
						Case {index + 1}
					</div>
				))}
			</div>

			<div className='flex flex-col font-semibold my-6'>
				<div className="bg-[#2C2C2E] rounded-lg p-2 mb-2 border border-gray-700">
					<p className='text-sm font-medium text-white mb-2'>Input:</p>
					<div className='w-full rounded-md px-4 py-3 bg-dark-fill-3 text-white'>
						{formattedInput}
					</div>
				</div>
				<div className="bg-[#2C2C2E] rounded-lg p-2 mb-2 border border-gray-700">
					<p className='text-sm font-medium text-white mt-4 mb-2'>Output:</p>
					<div className='w-full rounded-md px-4 py-3 bg-dark-fill-3 text-white'>
						{metaObj || ""}
					</div>
				</div>
				{explanation && (
					<div className="bg-[#2C2C2E] rounded-lg p-2 mb-2 border border-gray-700">
						<p className='text-sm font-medium text-white mt-4 mb-2'>Explanation:</p>
						<div className='w-full rounded-md px-4 py-3 bg-dark-fill-3 text-white'>
							{explanation}
						</div>
					</div>
				)}
			</div>

			<EditorFooter handleSubmit={handleSubmit} handleRun={handleRun} />
		</div>
	);
}
