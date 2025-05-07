from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import math

app = FastAPI(title="Loan Calculator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanInput(BaseModel):
    loanAmount: float = Field(..., gt=0, description="Loan amount in pesos (₱)")
    interestRate: float = Field(..., gt=0, le=100, description="Annual interest rate as a percentage")
    loanTerm: int = Field(..., gt=0, le=50, description="Loan term in years")

    @validator('loanAmount')
    def validate_loan_amount(cls, v):
        if v <= 0:
            raise ValueError("Loan amount must be positive")
        return v

class LoanResult(BaseModel):
    monthlyPayment: float
    totalPayment: float
    totalInterest: float

@app.post("/calculate", response_model=LoanResult)
async def calculate_loan(loan_input: LoanInput):
    try:
        # Extract values
        principal = loan_input.loanAmount
        annual_rate = loan_input.interestRate / 100  # Convert percentage to decimal
        term_years = loan_input.loanTerm
        
        # Calculate monthly interest rate
        monthly_rate = annual_rate / 12
        
        # Calculate total number of payments
        num_payments = term_years * 12
        
        # Calculate monthly payment using the loan formula
        if monthly_rate == 0:
            # Handle edge case of 0% interest
            monthly_payment = principal / num_payments
        else:
            monthly_payment = principal * (monthly_rate * math.pow(1 + monthly_rate, num_payments)) / (math.pow(1 + monthly_rate, num_payments) - 1)
        
        # Calculate total payment and interest
        total_payment = monthly_payment * num_payments
        total_interest = total_payment - principal
        
        return LoanResult(
            monthlyPayment=round(monthly_payment, 2),
            totalPayment=round(total_payment, 2),
            totalInterest=round(total_interest, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating loan: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Run with: uvicorn main:app --reload
print("FastAPI Loan Calculator running at http://localhost:8000") 