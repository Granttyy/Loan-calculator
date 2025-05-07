"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Form validation schema
const formSchema = z.object({
  loanAmount: z.coerce.number().positive("Loan amount must be positive").min(1, "Loan amount is required"),
  interestRate: z.coerce
    .number()
    .positive("Interest rate must be positive")
    .max(100, "Interest rate cannot exceed 100%"),
  loanTerm: z.coerce
    .number()
    .int("Loan term must be a whole number")
    .positive("Loan term must be positive")
    .max(50, "Loan term cannot exceed 50 years"),
})

type FormValues = z.infer<typeof formSchema>

type LoanResult = {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
}

export function LoanCalculator() {
  const [result, setResult] = useState<LoanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 10000,
      interestRate: 5,
      loanTerm: 5,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to calculate loan")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculate Your Loan</CardTitle>
        <CardDescription>Enter your loan details to calculate monthly payments and total interest.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="loanAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                  </FormControl>
                  <FormDescription>Enter the total loan amount in pesos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="5" {...field} />
                  </FormControl>
                  <FormDescription>Enter the annual interest rate as a percentage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loanTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Term (years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5" {...field} />
                  </FormControl>
                  <FormDescription>Enter the loan term in years</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate"
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {result && (
        <CardFooter className="flex flex-col">
          <div className="w-full border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Monthly Payment:</div>
              <div className="text-sm font-medium text-right">₱{result.monthlyPayment.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Payment:</div>
              <div className="text-sm font-medium text-right">₱{result.totalPayment.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Interest:</div>
              <div className="text-sm font-medium text-right">₱{result.totalInterest.toFixed(2)}</div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
