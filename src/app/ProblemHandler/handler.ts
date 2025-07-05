import { Problem } from "../problems/problems";
import axios from "axios";

class ListNode {
	val: number;
	next: ListNode | null;
	constructor(val: number, next: ListNode | null = null) {
		this.val = val;
		this.next = next;
	}
}

function isSubsetProblem(id: string): boolean {
	return id === "subsets";
}

function isLinkedListProblem(id: string): boolean {
	return id === "reverse-linked-list"; // add more ids if needed
}

function sortAndStringifySubsets(arr: any[]): string {
	return JSON.stringify(
		arr
			.map((subset) => subset.sort((a: number, b: number) => a - b))
			.sort((a, b) => a.length - b.length || a[0] - b[0])
	);
}

function arrayToList(arr: number[]): ListNode | null {
	if (arr.length === 0) return null;
	const head = new ListNode(arr[0]);
	let current = head;
	for (let i = 1; i < arr.length; i++) {
		current.next = new ListNode(arr[i]);
		current = current.next;
	}
	return head;
}

function listToArray(head: ListNode | null): number[] {
	const result: number[] = [];
	while (head) {
		result.push(head.val);
		head = head.next;
	}
	return result;
}

// 🔁 Converts nested object back to matrix (2D array)
function nestedObjectToMatrix(obj: Record<string, any>): number[][] {
	return Object.keys(obj)
		.sort((a, b) => Number(a) - Number(b))
		.map((rowKey) => {
			const row = obj[rowKey];
			return Object.keys(row)
				.sort((a, b) => Number(a) - Number(b))
				.map((colKey) => row[colKey]);
		});
}
function getOrderedArgsFromFunction(fn: Function, inputObj: Record<string, any>): any[] {
	const fnStr = fn.toString();
	const match = fnStr.match(/\(([^)]*)\)/);
	if (!match) return Object.values(inputObj);

	const paramOrder = match[1]
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);

	return paramOrder.map((key) => {
		const val = inputObj[key];

		if (
			key === "matrix" &&
			typeof val === "object" &&
			val !== null &&
			Object.values(val).every(
				(row) =>
					typeof row === "object" &&
					row !== null &&
					Object.values(row).every((n) => typeof n === "number")
			)
		) {
			return nestedObjectToMatrix(val);
		}

		return val;
	});
}

// Judge0 API integration via RapidAPI
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";
const JUDGE0_BASE_URL = `https://${RAPIDAPI_HOST}`;

export async function runCodeWithJudge0({
	source_code,
	language_id,
	stdin = "",
}: {
	source_code: string;
	language_id: number;
	stdin?: string;
}): Promise<{
	stdout: string | null;
	stderr: string | null;
	compile_output: string | null;
	status: { id: number; description: string };
	time: string | null;
	memory: number | null;
	token: string;
}> {
	if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY is not set in environment");

	// 1. Submit code to Judge0
	const submissionRes = await axios.post(
		`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`,
		{
			source_code,
			language_id,
			stdin,
		},
		{
			headers: {
				"content-type": "application/json",
				"X-RapidAPI-Key": RAPIDAPI_KEY,
				"X-RapidAPI-Host": RAPIDAPI_HOST,
			},
		}
	);

	const { token } = submissionRes.data;

	// 2. Poll for result
	let result;
	for (let i = 0; i < 10; i++) {
		const res = await axios.get(
			`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`,
			{
				headers: {
					"X-RapidAPI-Key": RAPIDAPI_KEY,
					"X-RapidAPI-Host": RAPIDAPI_HOST,
				},
			}
		);
		result = res.data;
		// Status: 1 = In Queue, 2 = Processing, 3 = Accepted, >3 = Error
		if (result.status && result.status.id >= 3) break;
		await new Promise((r) => setTimeout(r, 1000)); // wait 1s
	}
	return { ...result, token };
}

export function evaluateUserCode(userCode: string, problem: Problem): boolean {
	try {
		// console.log(userCode);
		const userFunction = new Function(`return ${userCode}`)();

		for (const [index, example] of problem.examples.entries()) {
			const expected = JSON.parse(example.output);
			let input = Array.isArray(example.input) ? example.input[0] : example.input;

			// let inputs = Object.values(input).map((val) => {
			// 	// 🔍 If value is a nested object (possible matrix), convert it
			// 	if (
			// 		typeof val === "object" &&
			// 		val !== null &&
			// 		Object.values(val).every(
			// 			(row) =>
			// 				typeof row === "object" &&
			// 				row !== null &&
			// 				Object.values(row).every((n) => typeof n === "number")
			// 		)
			// 	) {
			// 		return nestedObjectToMatrix(val as Record<string, any>);
			// 	}
			// 	return val;
			// });
			let inputs = getOrderedArgsFromFunction(userFunction, input);


			// 🧬 Handle linked list input conversion
			if (isLinkedListProblem(problem.id)) {
				inputs = inputs.map((val) =>
					Array.isArray(val) ? arrayToList(val) : val
				);
			}

			// console.log(inputs);
			// console.log(userFunction);

			let result = userFunction(...inputs);

			if (isLinkedListProblem(problem.id)) {
				result = listToArray(result);
			}

			let isCorrect = false;
			if (isSubsetProblem(problem.id)) {
				isCorrect =
					sortAndStringifySubsets(result) ===
					sortAndStringifySubsets(expected);
			} else {
				isCorrect = JSON.stringify(result) === JSON.stringify(expected);
			}

			// --- 🔍 Detailed Debug Output ---
			// console.log(`\n🧪 Test Case ${index + 1}`);
			// console.log(`Input:\n${JSON.stringify(input, null, 2)}`);
			// console.log(`Expected Output:\n${JSON.stringify(expected)}`);
			// console.log(`Your Output:\n${JSON.stringify(result)}`);
			// console.log(`Result: ${isCorrect ? "✅ Passed" : "❌ Failed"}`);

			if (!isCorrect) return false;
		}

		return true;
	} catch (err) {
		console.error("❌ Code evaluation error:", err);
		throw new Error("Code evaluation failed. Please check your syntax.");
	}
}
