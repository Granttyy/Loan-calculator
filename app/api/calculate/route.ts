import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Input validation schema
const inputSchema = z.object({
  loanAmount: z.number().positive(),
  interestRate: z.number().positive().max(100),
  loanTerm: z.number().int().positive().max(50),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validatedData = inputSchema.parse(body)
    const { loanAmount, interestRate, loanTerm } = validatedData

    // Call the Python backend API
    const response = await fetch("http://localhost:8000/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ detail: errorData.detail || "Failed to calculate loan" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating loan:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: "Invalid input data", errors: error.errors }, { status: 400 })
    }

    return NextResponse.json({ detail: "An error occurred while calculating the loan" }, { status: 500 })
  }
}
