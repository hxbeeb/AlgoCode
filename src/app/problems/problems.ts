export type Problem = {
	id: string;
	title: string;
	difficulty: string;
	category: string;
	order: number;
	videoId?: string;
	starterProblem: string;
	starterFunctionName: string;
	description: string;
	likes: number;
	dislikes: number;
	examples: {
		id: number;
		input: Record<string, any>;
		output: string;
		explanation?: string;
	}[];
	allTestCases?: {
		id: number;
		input: Record<string, any>;
		output: string;
		explanation?: string;
	}[];
	constraints: string[];
};


export const problems: Problem[] = [
	{
		id: "two-sum",
		title: "Two Sum",
		difficulty: "Easy",
		category: "Array",
		starterFunctionName: "twoSum",
		order: 1,
		videoId: "8-k1C6ehKuw",
		description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
		likes: 120,
		dislikes: 2,
		starterProblem: `function twoSum(nums, target) {
  // your code here
}`,
		examples: [
			{
				id: 1,
				input: { nums: [2, 7, 11, 15], target: 9 },
				output: "[0,1]",
				explanation: "Because nums[0] + nums[1] == 9"
			},
			{
				id: 2,
				input: { nums: [3, 2, 4], target: 6 },
				output: "[1,2]"
			}
		],
		constraints: [
			"2 ≤ nums.length ≤ 10^4",
			"-10^9 ≤ nums[i] ≤ 10^9",
			"-10^9 ≤ target ≤ 10^9",
			"Only one valid answer exists."
		]
	},
	
	{
		id: "reverse-linked-list",
		title: "Reverse Linked List",
		starterFunctionName: "reverseList",
		difficulty: "Hard",
		category: "Linked List",
		order: 2,
		videoId: "",
		description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
		likes: 90,
		dislikes: 5,
		starterProblem: `function reverseList(head: ListNode | null): ListNode | null {
  // Write your code here
};`,
		examples: [
			{
				id: 1,
				input: { head: [1, 2, 3, 4, 5] },
				output: "[5,4,3,2,1]"
			}
		],
		constraints: [
			"The number of nodes in the list is the range [0, 5000]",
			"-5000 ≤ Node.val ≤ 5000"
		]
	},
	{
		id: "jump-game",
		title: "Jump Game",
		difficulty: "Medium",
		category: "Dynamic Programming",
		starterFunctionName: "jumpGame",
		order: 3,
		videoId: "",
		description: "Given an array of non-negative integers nums, you are initially positioned at the first index of the array. Each element in the array represents your maximum jump length. Determine if you are able to reach the last index.",
		likes: 100,
		dislikes: 8,
		starterProblem: `function jumpGame(nums: number[]): boolean {
  // Write your code here
};`,
		examples: [
			{
				id: 1,
				input: { nums: [2, 3, 1, 1, 4] },
				output: "true",
				explanation: "You can jump to the last index"
			}
		],
		constraints: [
			"1 ≤ nums.length ≤ 10^4",
			"0 ≤ nums[i] ≤ 10^5"
		]
	},
	{
		id: "valid-parentheses",
		title: "Valid Parentheses",
		starterFunctionName: "twosum",
		difficulty: "Easy",
		category: "Stack",
		order: 4,
		videoId: "xty7fr-k0TU",
		description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
		likes: 110,
		dislikes: 4,
		starterProblem: `function isValid(s: string): boolean {
  // Write your code here
};`,
		examples: [
			{
				id: 1,
				input: { s: "()[]{}" },
				output: "true"
			}
		],
		constraints: [
			"1 ≤ s.length ≤ 10^4",
			"s consists of parentheses only: '(', ')', '{', '}', '[' and ']'"
		]
	},
	{
		id: "search-a-2d-matrix",
		title: "Search a 2D Matrix",
		difficulty: "Medium",
		starterFunctionName: "twosum",
		category: "Binary Search",
		order: 5,
		videoId: "ZfFl4torNg4",
		description: "Write an efficient algorithm that searches for a value target in an m x n integer matrix.",
		likes: 85,
		dislikes: 3,
		starterProblem: `function searchMatrix(matrix: number[][], target: number): boolean {
  // Write your code here
};`,
		examples: [
			{
				id: 1,
				input: { matrix: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target: 3 },
				output: "true"
			}
		],
		constraints: [
			"m == matrix.length",
			"n == matrix[i].length",
			"1 ≤ m, n ≤ 100",
			"-10^4 ≤ matrix[i][j], target ≤ 10^4"
		]
	},
	{
		id: "container-with-most-water",
		title: "Container With Most Water",
		difficulty: "Medium",
		category: "Two Pointers",
		starterFunctionName: "twosum",
		order: 6,
		videoId: "",
		description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
		likes: 75,
		dislikes: 6,
		starterProblem: `function maxArea(height: number[]): number {
  // Write your code here
};`,
		examples: [
			{
				id: 1,
				input: { height: [1,8,6,2,5,4,8,3,7] },
				output: "49"
			}
		],
		constraints: [
			"n == height.length",
			"2 ≤ n ≤ 10^5",
			"0 ≤ height[i] ≤ 10^4"
		]
	},
	{
		id: "merge-intervals",
		title: "Merge Intervals",
		difficulty: "Medium",
		category: "Intervals",
		starterFunctionName: "twosum",
		order: 7,
		videoId: "",
		description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
		likes: 95,
		dislikes: 7,
		starterProblem: `function merge(intervals: number[][]): number[][] {
  // Write your code here
};`,
		examples: [
			{
				id: 1,
				input: { intervals: [[1,3],[2,6],[8,10],[15,18]] },
				output: "[[1,6],[8,10],[15,18]]"
			}
		],
		constraints: [
			"1 ≤ intervals.length ≤ 10^4",
			"intervals[i].length == 2",
			"0 ≤ starti ≤ endi ≤ 10^4"
		]
	}
];
