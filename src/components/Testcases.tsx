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

// Props: pid, userCode, setUserCode, setSuccess, languageId
export default function Testcases({ pid, userCode, setUserCode, setSuccess, languageId }: { pid: string, userCode: string, setUserCode: any, setSuccess: any, languageId: number }) {
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

	// Helper: Generate JS wrapper for any input signature
	function generateJSWrapper(functionName: string, inputObj: Record<string, any>) {
		const keys = Object.keys(inputObj);
		let wrapper = `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n`;
		keys.forEach((key, i) => {
			const val = inputObj[key];
			if (typeof val === 'number') {
				wrapper += `const ${key} = Number(input[${i}]);\n`;
			} else if (typeof val === 'string') {
				wrapper += `const ${key} = input[${i}];\n`;
			} else {
				wrapper += `const ${key} = JSON.parse(input[${i}]);\n`;
			}
		});
		return wrapper + `\n// ---USER CODE BELOW---\n`;
	}

	// Helper: Generate Python wrapper for any input signature
	function generatePythonWrapper(functionName: string, inputObj: Record<string, any>) {
		const keys = Object.keys(inputObj);
		let wrapper = `import sys\ninput_lines = sys.stdin.read().splitlines()\n`;
		keys.forEach((key, i) => {
			const val = inputObj[key];
			if (typeof val === 'number') {
				wrapper += `${key} = int(input_lines[${i}])\n`;
			} else if (typeof val === 'string') {
				wrapper += `${key} = input_lines[${i}]\n`;
			} else {
				wrapper += `${key} = eval(input_lines[${i}])\n`;
			}
		});
		return wrapper + `\n# ---USER CODE BELOW---\n`;
	}

	// Helper: Generate Java wrapper for any input signature
	function generateJavaWrapper(functionName: string, inputObj: Record<string, any>) {
		const keys = Object.keys(inputObj);
		let wrapper = `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n`;
		keys.forEach((key, i) => {
			const val = inputObj[key];
			if (typeof val === 'number') {
				wrapper += `        int ${key} = Integer.parseInt(sc.nextLine());\n`;
			} else if (typeof val === 'string') {
				wrapper += `        String ${key} = sc.nextLine();\n`;
			} else {
				wrapper += `        String ${key}Str = sc.nextLine();\n        int[] ${key} = Arrays.stream(${key}Str.replaceAll("[\\[\\] ]", "").split(",")).filter(s -> !s.isEmpty()).mapToInt(Integer::parseInt).toArray();\n`;
			}
		});
		wrapper += `        // ---USER CODE BELOW---\n`;
		return wrapper;
	}

	// Helper: Generate C++ wrapper for any input signature
	function generateCppWrapper(functionName: string, inputObj: Record<string, any>) {
		const keys = Object.keys(inputObj);
		let wrapper = `#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n`;
		keys.forEach((key, i) => {
			const val = inputObj[key];
			if (typeof val === 'number') {
				wrapper += `    int ${key}; cin >> ${key}; cin.ignore();\n`;
			} else if (typeof val === 'string') {
				wrapper += `    string ${key}; getline(cin, ${key});\n`;
			} else {
				wrapper += `    string ${key}Str; getline(cin, ${key}Str);\n    vector<int> ${key};\n    stringstream ss${i}(${key}Str.substr(1, ${key}Str.size()-2));\n    string temp;\n    while(getline(ss${i}, temp, ',')) {\n        if(!temp.empty()) ${key}.push_back(stoi(temp));\n    }\n`;
			}
		});
		wrapper += `    // ---USER CODE BELOW---\n`;
		return wrapper;
	}

	function tryParseJSON(str: string) {
		try {
			return JSON.parse(str.trim());
		} catch {
			return null;
		}
	}

	function outputsEqual(expected: string, actual: string) {
		const expectedParsed = tryParseJSON(expected);
		const actualParsed = tryParseJSON(actual);
		if (expectedParsed !== null && actualParsed !== null) {
			return JSON.stringify(expectedParsed) === JSON.stringify(actualParsed);
		}
		// fallback: compare trimmed, whitespace-insensitive
		return expected.trim().replace(/\s+/g, '') === actual.trim().replace(/\s+/g, '');
	}

	const handleRun = async () => {
		if (!problem) return;
		let allPassed = true;
		for (let i = 0; i < problem.examples.length; i++) {
			const example = problem.examples[i];
			let stdin = "";
			let inputObj = {};
			if (example?.input) {
				inputObj = example.input[0] || {};
				stdin = Object.values(inputObj)
					.map((v) => (Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : v))
					.join("\n");
			}
			let codeToSend = userCode;
			if (languageId === 63) {
				const match = userCode.match(/function\s+([a-zA-Z0-9_]+)/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generateJSWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n// ---USER CODE ABOVE---\nconsole.log(${functionName}(${Object.keys(inputObj).join(", ")}));`;
			} else if (languageId === 71) {
				const match = userCode.match(/def\s+([a-zA-Z0-9_]+)/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generatePythonWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n# ---USER CODE ABOVE---\nprint(${functionName}(${Object.keys(inputObj).join(", ")}))`;
			} else if (languageId === 62) {
				const match = userCode.match(/([a-zA-Z0-9_]+)\s*\(/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generateJavaWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n        // ---USER CODE ABOVE---\n        System.out.println(${functionName}(${Object.keys(inputObj).join(", ")}));\n    }\n}`;
			} else if (languageId === 54) {
				const match = userCode.match(/([a-zA-Z0-9_]+)\s*\(/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generateCppWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n    // ---USER CODE ABOVE---\n    cout << ${functionName}(${Object.keys(inputObj).join(", ")}) << endl;\n    return 0;\n}`;
			}
			try {
				const res = await fetch("/api/judge0", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						source_code: codeToSend,
						language_id: languageId,
						stdin,
					}),
				});
				const data = await res.json();
				const expected = example.output;
				const actual = data.stdout || '';
				if (!data.stdout || (example.output && !outputsEqual(expected, actual))) {
					allPassed = false;
					break;
				}
			} catch (error: any) {
				allPassed = false;
				break;
			}
		}
		if (allPassed) {
			toast.success("All test cases passed!", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		} else {
			toast.error("One or more test cases failed.", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		}
	};

	const handleSubmit = async () => {
		if (!user) {
			toast.error("Please login to submit your code", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
			return;
		}
		if (!problem) return;
		let allPassed = true;
		for (let i = 0; i < problem.examples.length; i++) {
			const example = problem.examples[i];
			let stdin = "";
			let inputObj = {};
			if (example?.input) {
				inputObj = example.input[0] || {};
				stdin = Object.values(inputObj)
					.map((v) => (Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : v))
					.join("\n");
			}
			let codeToSend = userCode;
			if (languageId === 63) {
				const match = userCode.match(/function\s+([a-zA-Z0-9_]+)/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generateJSWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n// ---USER CODE ABOVE---\nconsole.log(${functionName}(${Object.keys(inputObj).join(", ")}));`;
			} else if (languageId === 71) {
				const match = userCode.match(/def\s+([a-zA-Z0-9_]+)/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generatePythonWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n# ---USER CODE ABOVE---\nprint(${functionName}(${Object.keys(inputObj).join(", ")}))`;
			} else if (languageId === 62) {
				const match = userCode.match(/([a-zA-Z0-9_]+)\s*\(/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generateJavaWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n        // ---USER CODE ABOVE---\n        System.out.println(${functionName}(${Object.keys(inputObj).join(", ")}));\n    }\n}`;
			} else if (languageId === 54) {
				const match = userCode.match(/([a-zA-Z0-9_]+)\s*\(/);
				const functionName = match ? match[1] : "solution";
				const wrapper = generateCppWrapper(functionName, inputObj);
				codeToSend = `${wrapper}${userCode}\n    // ---USER CODE ABOVE---\n    cout << ${functionName}(${Object.keys(inputObj).join(", ")}) << endl;\n    return 0;\n}`;
			}
			try {
				const res = await fetch("/api/judge0", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						source_code: codeToSend,
						language_id: languageId,
						stdin,
					}),
				});
				const data = await res.json();
				const expected = example.output;
				const actual = data.stdout || '';
				if (!data.stdout || (example.output && !outputsEqual(expected, actual))) {
					allPassed = false;
					break;
				}
			} catch (error: any) {
				allPassed = false;
				break;
			}
		}
		if (allPassed) {
			setSuccess(true);
			toast.success("Code submitted!", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
			setTimeout(() => {
				setSuccess(false);
			}, 4000);
			const userRef = doc(firestore, "users", user.uid);
			const userSnap = await getDoc(userRef);
			if (userSnap.exists()) {
				const userData = userSnap.data();
				const solvedProblems = userData.solved || [];
				if (!solvedProblems.includes(pid)) {
					let a = 1;
					if (problem.difficulty === "Medium") a = 2;
					else if (problem.difficulty === "Hard") a = 3;
					await updateDoc(userRef, {
						solved: arrayUnion(pid),
						points: userData.points ? userData.points + a : a,
					});
					if (typeof window !== "undefined") {
						window.dispatchEvent(new CustomEvent("solved-problem", { detail: pid }));
					}
				}
			}
		} else {
			toast.error("One or more test cases failed.", {
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
