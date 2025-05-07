import { LoanCalculator } from "@/components/loan-calculator"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Loan Calculator</h1>
        <LoanCalculator />
      </div>
    </main>
  )
}
