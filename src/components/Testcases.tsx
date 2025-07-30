'use client';
import { Problem } from "@/app/problems/problems";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import EditorFooter from "./EditorFooter";
import { exit } from "process";

// Language constants
const LANGUAGE_IDS = {
	JAVASCRIPT: 63,
	PYTHON: 71,
	JAVA: 62,
	CPP: 54,
} as const;

type LanguageId = typeof LANGUAGE_IDS[keyof typeof LANGUAGE_IDS];

interface TestcasesProps {
	pid: string;
	userCode: string;
	setUserCode: (code: string) => void;
	setSuccess: (success: boolean) => void;
	languageId: LanguageId;
	setFailedTestCases?: (testCases: any[]) => void;
	setTestResults?: (results: { passed: number; total: number } | null) => void;
}

interface CodeExecutionResult {
	allPassed: boolean;
	error?: string;
}

export default function Testcases({ 
	pid, 
	userCode, 
	setUserCode, 
	setSuccess, 
	languageId,
	setFailedTestCases,
	setTestResults
}: TestcasesProps) {
	const [activeTestCaseId, setActiveTestCaseId] = useState(0);
	const [problem, setProblem] = useState<Problem | null>(null);
	const [user] = useAuthState(auth);
	const router = useRouter();
	const [exampleResults, setExampleResults] = useState<Array<{ passed: boolean; actualOutput?: string }>>([]);

	useEffect(() => {
		const fetchProblem = async () => {
			try {
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
			} catch (error) {
				toast.error("Failed to fetch problem.");
				router.push("/");
			}
		};
		fetchProblem();
	}, [pid, router, setUserCode]);

	// Helper: Extract function name from code
	const extractFunctionName = (code: string, languageId: LanguageId): string => {
		let pattern: RegExp;
		switch (languageId) {
			case LANGUAGE_IDS.JAVASCRIPT:
				// Match both function declarations and function expressions
				pattern = /(?:function\s+([a-zA-Z0-9_]+)|(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*function)/;
				break;
			case LANGUAGE_IDS.PYTHON:
				pattern = /def\s+([a-zA-Z0-9_]+)/;
				break;
			case LANGUAGE_IDS.JAVA:
			case LANGUAGE_IDS.CPP:
				pattern = /([a-zA-Z0-9_]+)\s*\(/;
				break;
			default:
				return "solution";
		}
		const match = code.match(pattern);
		if (languageId === LANGUAGE_IDS.JAVASCRIPT && match) {
			// For JavaScript, return the first non-null group
			return match[1] || match[2] || "solution";
		}
		return match ? match[1] : "solution";
	};

	// Helper: Generate code wrapper based on language
	const generateCodeWrapper = (languageId: LanguageId, functionName: string, inputObj: Record<string, any>, sortedParams: string[]): string => {
		switch (languageId) {
			case LANGUAGE_IDS.JAVASCRIPT:
				return generateJSWrapper(functionName, inputObj, sortedParams);
			case LANGUAGE_IDS.PYTHON:
				return generatePythonWrapper(functionName, inputObj, sortedParams);
			case LANGUAGE_IDS.JAVA:
				return generateJavaWrapper(functionName, inputObj, sortedParams);
			case LANGUAGE_IDS.CPP:
				return generateCppWrapper(functionName, inputObj, sortedParams);
			default:
				return userCode;
		}
	};

	const generateJSWrapper = (functionName: string, inputObj: Record<string, any>, keys: string[]): string => {
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
		return `${wrapper}\n// ---USER CODE BELOW---\n${userCode}\n// ---USER CODE ABOVE---\nconsole.log(${functionName}(${keys.join(", ")}));`;
	};

	const generatePythonWrapper = (functionName: string, inputObj: Record<string, any>, keys: string[]): string => {
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
		return `${wrapper}\n# ---USER CODE BELOW---\n${userCode}\n# ---USER CODE ABOVE---\nprint(${functionName}(${keys.join(", ")}))`;
	};

	const generateJavaWrapper = (functionName: string, inputObj: Record<string, any>, keys: string[]): string => {
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
		return `${wrapper}        // ---USER CODE BELOW---\n        ${userCode}\n        // ---USER CODE ABOVE---\n        System.out.println(${functionName}(${keys.join(", ")}));\n    }\n}`;
	};

	const generateCppWrapper = (functionName: string, inputObj: Record<string, any>, keys: string[]): string => {
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
		return `${wrapper}    // ---USER CODE BELOW---\n    ${userCode}\n    // ---USER CODE ABOVE---\n    cout << ${functionName}(${keys.join(", ")}) << endl;\n    return 0;\n}`;
	};

	const tryParseJSON = (str: string) => {
		try {
			return JSON.parse(str.trim());
		} catch {
			return null;
		}
	};

	const outputsEqual = (expected: string, actual: string): boolean => {
		const expectedParsed = tryParseJSON(expected);
		const actualParsed = tryParseJSON(actual);
		if (expectedParsed !== null && actualParsed !== null) {
			return JSON.stringify(expectedParsed) === JSON.stringify(actualParsed);
		}
		// fallback: compare trimmed, whitespace-insensitive
		return expected.trim().replace(/\s+/g, '') === actual.trim().replace(/\s+/g, '');
	};

	const prepareTestCaseData = (example: any) => {
		let stdin = "";
		let inputObj: Record<string, any> = {};
		if (example?.input) {
			// Handle both array and object input formats
			if (Array.isArray(example.input)) {
				// If input is an array of objects, merge all objects
				inputObj = example.input.reduce((acc: any, item: any) => ({ ...acc, ...item }), {});
			} else if (typeof example.input === 'object' && example.input !== null) {
				// If input is a single object
				inputObj = example.input;
			}
			
			// Create a fixed order for parameters - prioritize common parameters
			const parameterOrder = ['nums', 'target', 'head', 'val', 's', 't', 'word1', 'word2'];
			
			// Get all available parameters
			const availableParams = Object.keys(inputObj);
			
			// Sort parameters: first by priority order, then alphabetically for others
			const sortedParams = availableParams.sort((a, b) => {
				const aIndex = parameterOrder.indexOf(a);
				const bIndex = parameterOrder.indexOf(b);
				
				// If both are in priority order, sort by their index
				if (aIndex !== -1 && bIndex !== -1) {
					return aIndex - bIndex;
				}
				
				// If only one is in priority order, prioritize it
				if (aIndex !== -1) return -1;
				if (bIndex !== -1) return 1;
				
				// Otherwise, sort alphabetically
				return a.localeCompare(b);
			});
			
			stdin = sortedParams
				.map((param) => {
					const v = inputObj[param];
					if (Array.isArray(v)) {
						return JSON.stringify(v);
					} else if (typeof v === "object" && v !== null) {
						// Check if it's a Firebase matrix and convert it
						if (isFirebaseMatrix(v)) {
							return JSON.stringify(convertFirebaseMatrix(v));
						}
						return JSON.stringify(v);
					}
					return v;
				})
				.join("\n");
		}
		return { stdin, inputObj, sortedParams: sortedParams || [] };
	};

	const executeTestCase = async (example: any): Promise<{ passed: boolean; error?: string; actualOutput?: string }> => {
		const { stdin, inputObj, sortedParams } = prepareTestCaseData(example);
		const functionName = extractFunctionName(userCode, languageId);
		const codeToSend = generateCodeWrapper(languageId, functionName, inputObj, sortedParams);

		try {
			console.log(codeToSend);
			console.log(languageId);
			console.log(stdin);
			const res = await fetch("/api/judge0", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					source_code: codeToSend,
					language_id: languageId,
					stdin,
				}),
			});

			if (!res.ok) {
				return { passed: false, error: "Failed to execute code" };
			}

			const data = await res.json();
			const expected = example.output;
			const actual = data.stdout || '';

			if (!data.stdout || (example.output && !outputsEqual(expected, actual))) {
				return { passed: false, error: "Output mismatch", actualOutput: actual };
			}

			return { passed: true };
		} catch (error) {
			return { passed: false, error: "Execution error" };
		}
	};

	const runAllTestCases = async (): Promise<CodeExecutionResult> => {
		if (!problem) {
			return { allPassed: false, error: "Problem not loaded" };
		}

		const results: Array<{ passed: boolean; actualOutput?: string }> = [];

		for (let i = 0; i < problem.examples.length; i++) {
			const result = await executeTestCase(problem.examples[i]);
			results.push({
				passed: result.passed,
				actualOutput: result.actualOutput
			});
			if (!result.passed) {
				setExampleResults(results);
				return { allPassed: false, error: result.error };
			}
		}

		setExampleResults(results);
		return { allPassed: true };
	};
	const walkAllTestCases = async (): Promise<CodeExecutionResult> => {
		if (!problem) {
			return { allPassed: false, error: "Problem not loaded" };
		}

		// Check if allTestCases exists and has items
		if (!problem.allTestCases || problem.allTestCases.length === 0) {
			return { allPassed: true }; // No bulk test cases to run
		}

		let passedCount = 0;
		const totalTests = problem.allTestCases.length;

		for (let i = 0; i < problem.allTestCases.length; i++) {
			const result = await executeTestCase(problem.allTestCases[i]);
			if (result.passed) {
				passedCount++;
			} else {
				// Return only the first failed test case
				const failedTestCase = {
					...problem.allTestCases[i],
					actualOutput: result.actualOutput || result.error || "Execution failed",
					passed: false
				};

				// Pass only the first failed test case to parent component
				if (setFailedTestCases) {
					setFailedTestCases([failedTestCase]);
				}

				// Pass test results to parent component
				if (setTestResults) {
					setTestResults({ passed: passedCount, total: totalTests });
				}

				return { 
					allPassed: false, 
					error: `Test case ${i + 1} failed` 
				};
			}
		}

		// All tests passed
		if (setTestResults) {
			setTestResults({ passed: totalTests, total: totalTests });
		}

		return { allPassed: true };
	};

	const handleRun = async () => {
		const result = await runAllTestCases();
		
		if (result.allPassed) {
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

	const updateUserProgress = async () => {
		if (!user || !problem) return;

		const userRef = doc(firestore, "users", user.uid);
		const userSnap = await getDoc(userRef);
		
		if (userSnap.exists()) {
			const userData = userSnap.data();
			const solvedProblems = userData.solved || [];
			
			if (!solvedProblems.includes(pid)) {
				let points = 1;
				if (problem.difficulty === "Medium") points = 2;
				else if (problem.difficulty === "Hard") points = 3;
				
				await updateDoc(userRef, {
					solved: arrayUnion(pid),
					points: userData.points ? userData.points + points : points,
				});
				
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("solved-problem", { detail: pid }));
				}
			}
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

		const result = await walkAllTestCases();
		
		if (result.allPassed) {
			setSuccess(true);
			toast.success("Code submitted!", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
			
			setTimeout(() => {
				setSuccess(false);
			}, 4000);
			
			await updateUserProgress();
		} else {
			toast.error("One or more test cases failed.", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
		}
	};

	if (!problem) return null;

	const isFirebaseMatrix = (obj: any): boolean => {
		if (typeof obj !== 'object' || obj === null) return false;
		const values = Object.values(obj);
		return values.every(
			(row) =>
				typeof row === 'object' &&
				row !== null &&
				Object.values(row).every((val) => typeof val === 'number')
		);
	};
	
	const convertFirebaseMatrix = (obj: Record<string, any>): number[][] => {
		return Object.keys(obj)
			.sort((a, b) => Number(a) - Number(b))
			.map((rowKey) => {
				const row = obj[rowKey];
				return Object.keys(row)
					.sort((a, b) => Number(a) - Number(b))
					.map((colKey) => row[colKey]);
			});
	};
	
	const formatValue = (v: any): string => {
		if (Array.isArray(v)) {
			if (Array.isArray(v[0])) {
				return '[\n' + v.map(row => '  [' + row.join(', ') + ']').join(',\n') + '\n]';
			}
			return '[' + v.join(', ') + ']';
		} else if (isFirebaseMatrix(v)) {
			const matrix = convertFirebaseMatrix(v);
			return '[\n' + matrix.map(row => '  [' + row.join(', ') + ']').join(',\n') + '\n]';
		} else if (typeof v === 'object' && v !== null) {
			return JSON.stringify(v, null, 2);
		}
		return JSON.stringify(v);
	};
	
	const currentExample = problem.examples[activeTestCaseId];
	const inputData = currentExample?.input;
	
	// Handle both array and object input formats
	let inputObj: Record<string, any> = {};
	if (Array.isArray(inputData)) {
		// If input is an array of objects, merge all objects
		inputObj = inputData.reduce((acc, item) => ({ ...acc, ...item }), {});
	} else if (typeof inputData === 'object' && inputData !== null) {
		// If input is a single object
		inputObj = inputData;
	}
	
	const metaObj = currentExample?.output || "";
	const explanation = currentExample?.explanation || "";

	// Create a fixed order for parameters - prioritize common parameters
	const parameterOrder = ['nums', 'target', 'head', 'val', 's', 't', 'word1', 'word2'];
	
	// Get all available parameters
	const availableParams = Object.keys(inputObj);
	
	// Sort parameters: first by priority order, then alphabetically for others
	const sortedParams = availableParams.sort((a, b) => {
		const aIndex = parameterOrder.indexOf(a);
		const bIndex = parameterOrder.indexOf(b);
		
		// If both are in priority order, sort by their index
		if (aIndex !== -1 && bIndex !== -1) {
			return aIndex - bIndex;
		}
		
		// If only one is in priority order, prioritize it
		if (aIndex !== -1) return -1;
		if (bIndex !== -1) return 1;
		
		// Otherwise, sort alphabetically
		return a.localeCompare(b);
	});
	
	const formattedInput = sortedParams
		.map(param => `${param} = ${formatValue(inputObj[param])}`)
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
				{problem.examples.map((example, index) => {
					const result = exampleResults[index];
					const isPassed = result?.passed;
					const hasResult = result !== undefined;
					
					return (
						<div
							key={index}
							className={`px-4 py-1 rounded-lg cursor-pointer font-medium text-sm border
								${activeTestCaseId === index 
									? "bg-black text-white" 
									: hasResult && !isPassed
									? "bg-red-600 text-white border-red-500"
									: hasResult && isPassed
									? "bg-green-600 text-white border-green-500"
									: "bg-gray text-gray-400 hover:bg-gray-700 border-gray-700"
								}`}
							onClick={() => setActiveTestCaseId(index)}
						>
							Case {index + 1}
							{hasResult && (
								<span className="ml-2 text-xs">
									{isPassed ? "✓" : "✗"}
								</span>
							)}
						</div>
					);
				})}
			</div>

			<div className='flex flex-col font-semibold my-6'>
				<div className="bg-[#2C2C2E] rounded-lg p-2 mb-2 border border-gray-700">
					<p className='text-sm font-medium text-white mb-2'>Input:</p>
					<div className='w-full rounded-md px-4 py-3 bg-dark-fill-3 text-white'>
						{formattedInput}
					</div>
				</div>
				<div className="bg-[#2C2C2E] rounded-lg p-2 mb-2 border border-gray-700">
					<p className='text-sm font-medium text-white mt-4 mb-2'>Expected Output:</p>
					<div className='w-full rounded-md px-4 py-3 bg-dark-fill-3 text-white'>
						{metaObj || ""}
					</div>
				</div>
				{exampleResults[activeTestCaseId] && !exampleResults[activeTestCaseId].passed && (
					<div className="bg-[#2C2C2E] rounded-lg p-2 mb-2 border border-red-500">
						<p className='text-sm font-medium text-red-400 mt-4 mb-2'>Your Output:</p>
						<div className='w-full rounded-md px-4 py-3 bg-dark-fill-3 text-red-400'>
							{exampleResults[activeTestCaseId].actualOutput || "Execution failed"}
						</div>
					</div>
				)}
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

