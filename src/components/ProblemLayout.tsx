'use client';

import Split from "react-split";
import Description from "@/components/Description";
import Editor from "@/components/Editor";
import Testcases from "@/components/Testcases";
import { Problem } from "@/app/problems/problems";
import PreferenceNav from "./PreferenceNav";
import { useState, useEffect } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import useWindowSize from "@/app/hooks/useWindowSize";
import Confetti from 'react-confetti';
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline, TiStarFullOutline } from "react-icons/ti";

// Language constants
const LANGUAGE_IDS = {
	JAVASCRIPT: 63,
	PYTHON: 71,
	JAVA: 62,
	CPP: 54,
} as const;

type LanguageId = typeof LANGUAGE_IDS[keyof typeof LANGUAGE_IDS];

const languages = [
	{ name: "JavaScript", id: 63 },
	{ name: "Python 3", id: 71 },
	{ name: "C++", id: 54 },
	{ name: "Java", id: 62 },
	// Add more as needed
];

export default function ProblemLayout({ problem }: { problem: Problem }) {
	const [userCode, setUserCode] = useState(problem.starterProblem);
	const [showTestCases, setShowTestCases] = useState(true);
	const { width, height } = useWindowSize();
	const [success, setSuccess] = useState(false);
	const [failedTestCases, setFailedTestCases] = useState<any[]>([]);
	const [testResults, setTestResults] = useState<{ passed: number; total: number } | null>(null);
	const [activeTab, setActiveTab] = useState<'description' | 'failed-tests'>('description');
	const [language, setLanguage] = useState(() => {
		if (typeof window !== "undefined") {
			const savedLangId = localStorage.getItem("selectedLanguageId");
			if (savedLangId) {
				const found = languages.find(l => l.id === Number(savedLangId));
				if (found) return found;
			}
		}
		return languages[0];
	});

	// Save language to localStorage when it changes
	useEffect(() => {
		if (language) {
			localStorage.setItem("selectedLanguageId", String(language.id));
		}
	}, [language]);

	return (
		<div className="h-screen w-full text-white bg-black overflow-hidden">
			{success && <Confetti 
				width={width}
				gravity={0.3}
				tweenDuration={4000}
			/>}
			
			{/* Desktop Split View */}
			<div className="hidden md:flex h-full">
				<Split
					direction="horizontal"
					className="flex h-full w-full"
					sizes={[40, 60]}
					minSize={[300, 400]}
					gutterSize={8}
				>
					{/* Left: Description */}
					<div className="p-4 overflow-auto bg-[#1a1a1a] border-r border-gray-700">
						{/* Tab Navigation */}
						<div className='flex h-11 w-full flex-wrap items-center border-b border-gray-700 text-sm mb-4'>
							<button
								className={`px-5 py-2 font-semibold rounded-t-md transition-colors ${
									activeTab === 'description'
										? 'bg-[#262626] text-white'
										: 'text-gray-400 cursor-pointer hover:text-white'
								}`}
								onClick={() => setActiveTab('description')}
							>
								Description
							</button>
							{failedTestCases.length > 0 && testResults && (
								<button
									className={`ml-2 px-4 py-2 font-semibold rounded-t-md transition-colors ${
										activeTab === 'failed-tests'
											? 'bg-[#262626] text-white'
											: 'text-gray-400 cursor-pointer hover:text-white'
									}`}
									onClick={() => setActiveTab('failed-tests')}
								>
									Failed Tests (Passed {testResults.passed}/{testResults.total})
								</button>
							)}
						</div>

						{/* Tab Content */}
						{activeTab === 'description' ? (
							<Description problem={problem} />
						) : (
							<div className="space-y-4">
								{failedTestCases.map((testCase, idx) => {
									// Handle both array and object input formats
									let inputObj: Record<string, any> = {};
									if (Array.isArray(testCase.input)) {
										inputObj = testCase.input.reduce((acc: any, item: any) => ({ ...acc, ...item }), {});
									} else if (typeof testCase.input === 'object' && testCase.input !== null) {
										inputObj = testCase.input;
									}
									
									const formattedInput = inputObj &&
										Object.entries(inputObj)
											.map(([key, value]) => {
												let val: string;
												if (Array.isArray(value)) {
													if (Array.isArray(value[0])) {
														val = "[\n" + value.map((row) => `  [${row.join(", ")}]`).join(",\n") + "\n]";
													} else {
														val = `[${value.join(", ")}]`;
													}
												} else {
													val = JSON.stringify(value, null, 2);
												}
												return `${key} = ${val}`;
											})
											.join("\n");

									return (
										<div
											key={idx}
											className="bg-[#1E1E1E] border border-red-500 rounded-lg p-5 shadow-sm text-sm text-gray-200"
										>
											<p className="text-lg font-semibold text-red-400 mb-3">Test Case Failed</p>

											{formattedInput && (
												<p className="mb-2">
													<strong className="text-gray-300">Input:</strong> {formattedInput}
												</p>
											)}

											<p className="mb-2">
												<strong className="text-gray-300">Expected Output:</strong> {testCase.output}
											</p>

											<p className="mb-2">
												<strong className="text-red-400">Your Output:</strong> {testCase.actualOutput}
											</p>

											{testCase.explanation && (
												<p>
													<strong className="text-gray-300">Explanation:</strong> {testCase.explanation}
												</p>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Right: Editor + Testcases */}
					<Split
						direction="vertical"
						className="flex flex-col h-full"
						sizes={showTestCases ? [70, 30] : [100, 0]}
						minSize={showTestCases ? [200, 100] : [200, 0]}
						gutterSize={8}
					>
						<div className="p-4 overflow-auto bg-[#111]">
							<PreferenceNav language={language} setLanguage={setLanguage} languages={languages} />
							<Editor problem={problem} userCode={userCode} setUserCode={setUserCode} language={language} />
						</div>

						{/* Testcases Panel */}
						<div className="relative overflow-auto bg-[#111] border-t border-gray-700">
							{showTestCases ? (
								<>
									<Testcases
										setSuccess={setSuccess}
										pid={problem.id}
										userCode={userCode}
										setUserCode={setUserCode}
										languageId={language.id as LanguageId}
										setFailedTestCases={setFailedTestCases}
										setTestResults={setTestResults}
									/>
								</>
							) : (
								<div className="flex justify-center items-center h-6">
									<button
										className="bg-gray-700 text-white p-1 rounded-md hover:bg-gray-600"
										onClick={() => setShowTestCases(true)}
									>
									</button>
								</div>
							)}
						</div>
					</Split>
				</Split>
			</div>

			{/* Mobile / Small Tablet View */}
			<div className="flex flex-col md:hidden h-full overflow-auto">
				{/* Description */}
				<div className="p-3 bg-[#1a1a1a] border-b border-gray-700 max-h-[40%] overflow-auto">
					<Description problem={problem} />
				</div>

				{/* Editor */}
				<div className="p-3 bg-[#111] border-b border-gray-700">
					<PreferenceNav language={language} setLanguage={setLanguage} languages={languages} />
					<Editor problem={problem} userCode={userCode} setUserCode={setUserCode} language={language} />
				</div>

				{/* Testcases toggle */}
				<div className="flex justify-center items-center py-1 border-t border-gray-700">
					<button
						className="bg-gray-700 text-white p-1 rounded-md hover:bg-gray-600"
						onClick={() => setShowTestCases(prev => !prev)}
					>
						{showTestCases ? <IoIosArrowDown /> : <IoIosArrowUp />}
					</button>
				</div>

				{/* Testcases Panel */}
				{showTestCases && (
					<div className="p-3 bg-[#111] border-t border-gray-700 overflow-auto max-h-[35%]">
						<Testcases
							setSuccess={setSuccess}
							pid={problem.id}
							userCode={userCode}
							setUserCode={setUserCode}
							languageId={language.id as LanguageId}
							setFailedTestCases={setFailedTestCases}
							setTestResults={setTestResults}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
