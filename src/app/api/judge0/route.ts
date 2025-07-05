import { NextRequest, NextResponse } from "next/server";
import { runCodeWithJudge0 } from "@/app/ProblemHandler/handler";

export async function POST(req: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await req.json();
    if (!source_code || !language_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    console.log({ source_code, language_id, stdin });
    const result = await runCodeWithJudge0({ source_code, language_id, stdin });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
