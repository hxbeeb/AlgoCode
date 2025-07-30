"use client";

import { useEffect, useState } from "react";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { Problem } from "@/app/problems/problems";
import { toast } from "react-toastify";

interface TestCase {
	id: number;
	input: Record<string, any>;
	output: string;
	explanation?: string;
}

export default function ProblemForm() {
	const initialProblemState = (): Problem => ({
		id: "",
		title: "",
		likes: 0,
		dislikes: 0,
		difficulty: "",
		description: "",
		constraints: [""],
		category: "",
		order: 0,
		videoId: "",
		starterProblem: "",
		starterFunctionName: "",
		examples: [{ id: Date.now(), input: { "": "" }, output: "", explanation: "" }],
	});

	const [problem, setProblem] = useState<Problem>(initialProblemState());
	const [singleTestCases, setSingleTestCases] = useState<TestCase[]>([
		{ id: Date.now(), input: { "": "" }, output: "", explanation: "" }
	]);
	const [bulkTestCases, setBulkTestCases] = useState<TestCase[]>([]);
	const [showBulkImport, setShowBulkImport] = useState(false);
	const [bulkImportText, setBulkImportText] = useState("");

	useEffect(() => {
		const fetchProblemCount = async () => {
			const snapshot = await getDocs(collection(firestore, "problems"));
			setProblem((prev) => ({ ...prev, order: snapshot.size + 1 }));
		};
		fetchProblemCount();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setProblem((prev) => ({ ...prev, [name]: value }));
	};

	const handleConstraintChange = (index: number, value: string) => {
		const updated = [...problem.constraints];
		updated[index] = value;
		setProblem((prev) => ({ ...prev, constraints: updated }));
	};

	const addConstraint = () => {
		setProblem((prev) => ({ ...prev, constraints: [...prev.constraints, ""] }));
	};

	const removeConstraint = (index: number) => {
		const updated = problem.constraints.filter((_, i) => i !== index);
		setProblem((prev) => ({ ...prev, constraints: updated }));
	};

	const addSingleTestCase = () => {
		const newId = Date.now();
		setSingleTestCases((prev) => [
			...prev,
			{ id: newId, input: { "": "" }, output: "", explanation: "" }
		]);
	};

	const removeSingleTestCase = (id: number) => {
		setSingleTestCases((prev) => prev.filter((tc) => tc.id !== id));
	};

	const updateSingleTestCaseInput = (id: number, key: string, value: any) => {
		setSingleTestCases((prev) =>
			prev.map((tc) =>
				tc.id === id
					? { ...tc, input: { ...tc.input, [key]: value } }
					: tc
			)
		);
	};

	const updateSingleTestCaseField = (id: number, field: keyof TestCase, value: string) => {
		setSingleTestCases((prev) =>
			prev.map((tc) =>
				tc.id === id ? { ...tc, [field]: value } : tc
			)
		);
	};

	const removeSingleTestCaseInput = (testCaseId: number, key: string) => {
		setSingleTestCases((prev) =>
			prev.map((tc) => {
				if (tc.id === testCaseId) {
					const newInput = { ...tc.input };
					delete newInput[key];
					return { ...tc, input: newInput };
				}
				return tc;
			})
		);
	};

	const parseValue = (val: string): any => {
		try {
			const parsed = JSON.parse(val);
			return parsed;
		} catch {
			// Try to parse matrix string manually
			if (val.includes("\n")) {
				const rows = val.trim().split("\n");
				const matrix = rows.map((row) =>
					row.trim().split(/[\s,]+/).map(Number)
				);

				const isValidMatrix = matrix.every(
					(row) => row.length === matrix[0].length && row.every((n) => !isNaN(n))
				);

				if (isValidMatrix) return matrix;
			}

			return val;
		}
	};

	const parseBulkImport = () => {
		try {
			const lines = bulkImportText.trim().split('\n');
			const newTestCases: TestCase[] = [];
			let currentTestCase: Partial<TestCase> = {};
			let currentInput: Record<string, any> = {};
			let lineIndex = 0;

			while (lineIndex < lines.length) {
				const line = lines[lineIndex].trim();
				
				if (line.startsWith('INPUT:')) {
					// Start new test case
					if (currentTestCase.id && currentTestCase.output) {
						newTestCases.push({
							id: currentTestCase.id,
							input: currentInput,
							output: currentTestCase.output,
							explanation: currentTestCase.explanation || ""
						});
					}
					
					currentTestCase = { id: Date.now() + Math.random() };
					currentInput = {};
					
					// Parse parameters from the same line as INPUT:
					const inputContent = line.substring(6).trim(); // Remove "INPUT:"
					if (inputContent) {
						// Split by spaces and find key-value pairs
						const parts = inputContent.split(/\s+/);
						for (let i = 0; i < parts.length - 1; i++) {
							if (parts[i].endsWith(':') && i + 1 < parts.length) {
								const key = parts[i].slice(0, -1); // Remove trailing colon
								const value = parts[i + 1];
								currentInput[key] = parseValue(value);
							}
						}
					}
					
					lineIndex++;
					
					// Parse additional input parameters on separate lines
					while (lineIndex < lines.length && !lines[lineIndex].trim().startsWith('OUTPUT:')) {
						const inputLine = lines[lineIndex].trim();
						if (inputLine && !inputLine.startsWith('EXPLANATION:')) {
							const colonIndex = inputLine.indexOf(':');
							if (colonIndex > 0) {
								const key = inputLine.substring(0, colonIndex).trim();
								const value = inputLine.substring(colonIndex + 1).trim();
								currentInput[key] = parseValue(value);
							}
						}
						lineIndex++;
					}
				} else if (line.startsWith('OUTPUT:')) {
					const output = line.substring(7).trim();
					currentTestCase.output = output;
					lineIndex++;
				} else if (line.startsWith('EXPLANATION:')) {
					const explanation = line.substring(12).trim();
					currentTestCase.explanation = explanation;
					lineIndex++;
				} else {
					lineIndex++;
				}
			}

			// Add the last test case
			if (currentTestCase.id && currentTestCase.output) {
				newTestCases.push({
					id: currentTestCase.id,
					input: currentInput,
					output: currentTestCase.output,
					explanation: currentTestCase.explanation || ""
				});
			}

			if (newTestCases.length > 0) {
				setBulkTestCases(newTestCases);
				toast.success(`✅ Imported ${newTestCases.length} bulk test cases!`);
				setShowBulkImport(false);
				setBulkImportText("");
			} else {
				toast.error("❌ No valid test cases found in the import text.");
			}
		} catch (error) {
			toast.error("❌ Error parsing bulk import. Check the format.");
		}
	};

	const clearBulkTestCases = () => {
		setBulkTestCases([]);
		toast.success("✅ Cleared all bulk test cases!");
	};

	const handleSubmit = async () => {
		const {
			id,
			title,
			difficulty,
			category,
			description,
			starterProblem,
			starterFunctionName,
			constraints,
		} = problem;

		if (
			!id.trim() ||
			!title.trim() ||
			!difficulty.trim() ||
			!category.trim() ||
			!description.trim() ||
			!starterProblem.trim() ||
			!starterFunctionName.trim()
		) {
			toast.error("❌ Please fill in all required fields.");
			return;
		}

		const hasConstraint = constraints.some((c) => c.trim() !== "");
		if (!hasConstraint) {
			toast.error("❌ Add at least one constraint.");
			return;
		}

		// Validate single test cases (for description)
		const validSingleTestCases = singleTestCases.filter(tc => {
			const hasInput = Object.keys(tc.input).length > 0 && 
				Object.values(tc.input).some(v => v !== "" && v !== null);
			const hasOutput = tc.output.trim() !== "";
			return hasInput && hasOutput;
		});

		if (validSingleTestCases.length === 0) {
			toast.error("❌ Add at least one valid single test case for the description.");
			return;
		}

		// Validate bulk test cases (for submission)
		const validBulkTestCases = bulkTestCases.filter(tc => {
			const hasInput = Object.keys(tc.input).length > 0 && 
				Object.values(tc.input).some(v => v !== "" && v !== null);
			const hasOutput = tc.output.trim() !== "";
			return hasInput && hasOutput;
		});

		if (validBulkTestCases.length === 0) {
			toast.error("❌ Add at least one valid bulk test case for submission validation.");
			return;
		}

		// Convert single test cases to examples format (for description)
		const examples = validSingleTestCases.map(tc => ({
			id: tc.id,
			input: tc.input,
			output: tc.output,
			explanation: tc.explanation
		}));

		// Combine all test cases for submission validation
		const allTestCases = [...validSingleTestCases, ...validBulkTestCases];

		const problemToUpload = {
			...problem,
			examples,
			allTestCases // This will be used for submission validation
		};

		try {
			await setDoc(doc(firestore, "problems", problem.id), problemToUpload);
			toast.success("✅ Problem uploaded successfully!");
			setProblem(initialProblemState());
			setSingleTestCases([{ id: Date.now(), input: { "": "" }, output: "", explanation: "" }]);
			setBulkTestCases([]);
		} catch (error) {
			console.error("Upload failed:", error);
			toast.error("❌ Upload failed. Check console.");
		}
	};

	return (
		<div className="p-6 text-white bg-black min-h-screen">
			<h2 className="text-2xl font-bold mb-6">🚀 Create New Problem</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
				<input
					name="id"
					placeholder="Unique Problem ID (document name)"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800"
				/>
				<input
					name="title"
					placeholder="Problem Title"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800"
				/>
				<select
					name="difficulty"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800"
				>
					<option value="">Select Difficulty</option>
					<option value="Easy">Easy</option>
					<option value="Medium">Medium</option>
					<option value="Hard">Hard</option>
				</select>
				<input
					name="category"
					placeholder="Category"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800"
				/>
				<input
					name="videoId"
					placeholder="YouTube Video ID"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800"
				/>
				<input
					name="starterFunctionName"
					placeholder="Function Name"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800"
				/>
				<textarea
					name="starterProblem"
					placeholder="Starter Code"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800 col-span-2 min-h-[120px]"
				/>
				<textarea
					name="description"
					placeholder="Problem Description"
					onChange={handleChange}
					className="p-2 rounded bg-gray-800 col-span-2 min-h-[120px]"
				/>
			</div>

			<h3 className="text-lg mt-8 mb-2 font-semibold">📌 Constraints</h3>
			<div className="max-w-3xl">
				{problem.constraints.map((c, i) => (
					<div key={i} className="flex gap-2 mb-2">
						<input
							type="text"
							value={c}
							onChange={(e) => handleConstraintChange(i, e.target.value)}
							className="p-1 bg-gray-700 rounded w-full"
						/>
						<button
							className="text-red-400"
							onClick={() => removeConstraint(i)}
						>
							❌
						</button>
					</div>
				))}
				<button className="text-green-400 mt-1" onClick={addConstraint}>
					➕ Add Constraint
				</button>
			</div>

			<h3 className="text-lg mt-8 mb-2 font-semibold">📝 Single Test Cases (For Description)</h3>
			<p className="text-gray-400 mb-4 text-sm">
				These test cases will be shown in the problem description. 
				Keep them simple and illustrative (2-3 examples).
			</p>

			{singleTestCases.map((testCase, idx) => (
				<div
					key={testCase.id}
					className="border border-gray-600 p-4 mb-4 rounded-md bg-[#1E1E1E]"
				>
					<div className="flex justify-between items-center mb-2">
						<span className="font-semibold">Example {idx + 1}</span>
						<button
							onClick={() => removeSingleTestCase(testCase.id)}
							className="text-red-400 hover:underline"
						>
							Remove
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-medium mb-2">Input Parameters</h4>
							{Object.entries(testCase.input).map(([key, value]) => (
								<div key={key} className="flex gap-2 mb-2">
									<input
										type="text"
										placeholder="Parameter name"
										value={key}
										onChange={(e) => {
											const newKey = e.target.value;
											const newInput = { ...testCase.input };
											delete newInput[key];
											newInput[newKey] = value;
											setSingleTestCases(prev =>
												prev.map(tc =>
													tc.id === testCase.id
														? { ...tc, input: newInput }
														: tc
												)
											);
										}}
										className="p-1 bg-gray-700 rounded w-1/3"
									/>
									<input
										type="text"
										placeholder="Value (JSON format)"
										value={typeof value === "string" ? value : JSON.stringify(value)}
										onChange={(e) => {
											const parsed = parseValue(e.target.value);
											updateSingleTestCaseInput(testCase.id, key, parsed);
										}}
										className="p-1 bg-gray-700 rounded w-2/3"
									/>
									<button
										onClick={() => removeSingleTestCaseInput(testCase.id, key)}
										className="text-red-400"
									>
										❌
									</button>
								</div>
							))}
							<button
								onClick={() => {
									const newKey = `param${Object.keys(testCase.input).length + 1}`;
									updateSingleTestCaseInput(testCase.id, newKey, "");
								}}
								className="text-blue-400 text-sm"
							>
								➕ Add Parameter
							</button>
						</div>

						<div>
							<h4 className="font-medium mb-2">Expected Output</h4>
							<textarea
								value={testCase.output}
								onChange={(e) => updateSingleTestCaseField(testCase.id, "output", e.target.value)}
								placeholder="Expected output (JSON format)"
								className="w-full p-2 rounded bg-gray-700 min-h-[100px]"
							/>
							<textarea
								value={testCase.explanation || ""}
								onChange={(e) => updateSingleTestCaseField(testCase.id, "explanation", e.target.value)}
								placeholder="Explanation (Optional)"
								className="w-full p-2 rounded bg-gray-700 mt-2 min-h-[60px]"
							/>
						</div>
					</div>
				</div>
			))}

			<button onClick={addSingleTestCase} className="text-green-400 mb-8">
				➕ Add Single Test Case
			</button>

			<h3 className="text-lg mt-8 mb-2 font-semibold">🧪 Bulk Test Cases (For Submission)</h3>
			<div className="flex gap-4 mb-4">
				<button
					onClick={() => setShowBulkImport(!showBulkImport)}
					className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
				>
					{showBulkImport ? "❌ Cancel Bulk Import" : "📥 Bulk Import"}
				</button>
				{bulkTestCases.length > 0 && (
					<button
						onClick={clearBulkTestCases}
						className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
					>
						🗑️ Clear All ({bulkTestCases.length})
					</button>
				)}
			</div>

			{showBulkImport && (
				<div className="mb-6 p-4 border border-gray-600 rounded-md bg-[#1E1E1E]">
					<h4 className="font-medium mb-2">📥 Bulk Import Test Cases</h4>
					<p className="text-gray-400 mb-4 text-sm">
						These test cases will be used for submission validation but won't be shown in the description.
						Paste your test cases in the following format:
					</p>
					<div className="bg-gray-800 p-3 rounded mb-4 text-sm font-mono">
						{`INPUT:
nums: [2, 7, 11, 15]
target: 9
OUTPUT: [0, 1]
EXPLANATION: Because nums[0] + nums[1] == 9

INPUT:
nums: [3, 2, 4]
target: 6
OUTPUT: [1, 2]
EXPLANATION: Because nums[1] + nums[2] == 6

INPUT:
nums: [3, 3]
target: 6
OUTPUT: [0, 1]`}
					</div>
					<textarea
						value={bulkImportText}
						onChange={(e) => setBulkImportText(e.target.value)}
						placeholder="Paste your test cases here..."
						className="w-full p-3 rounded bg-gray-700 min-h-[200px] font-mono text-sm"
					/>
					<div className="mt-4 flex gap-2">
						<button
							onClick={parseBulkImport}
							className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
						>
							✅ Import Test Cases
						</button>
						<button
							onClick={() => {
								setShowBulkImport(false);
								setBulkImportText("");
							}}
							className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
						>
							❌ Cancel
						</button>
					</div>
				</div>
			)}

			<p className="text-gray-400 mb-4 text-sm">
				Bulk test cases will be used when users submit their solutions. 
				All test cases (single + bulk) must pass for a solution to be accepted.
			</p>

			{bulkTestCases.length > 0 && (
				<div className="mb-6 p-4 border border-green-600 rounded-md bg-[#1E1E1E]">
					<h4 className="font-medium mb-2 text-green-400">✅ Bulk Test Cases Loaded</h4>
					<p className="text-gray-400 text-sm">
						{bulkTestCases.length} bulk test cases ready for submission validation.
					</p>
				</div>
			)}

			<div className="mt-4">
				<button
					onClick={handleSubmit}
					className="bg-green-600 px-6 py-2 rounded text-white hover:bg-green-700"
				>
					✅ Upload Problem
				</button>
			</div>
		</div>
	);
}
