from typing import Optional, List
from pydantic import BaseModel, Field, validator

class StudentPredictionInput(BaseModel):
    age: int = Field(..., ge=18, le=35, description="Student age in years")
    gender: str = Field(..., description="Gender: Male, Female")
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Cumulative Grade Point Average (0.0 to 10.0)")
    branch: str = Field(..., description="Engineering / Academic Branch")
    college_tier: str = Field(..., description="College Tier: Tier 1, Tier 2, Tier 3")
    internships_count: int = Field(..., ge=0, le=10, description="Number of completed internships")
    projects_count: int = Field(..., ge=0, le=20, description="Number of completed projects")
    certifications_count: int = Field(..., ge=0, le=20, description="Number of active certifications")
    coding_skill_score: float = Field(..., ge=0.0, le=100.0, description="Coding skill assessment score (0-100)")
    aptitude_score: float = Field(..., ge=0.0, le=100.0, description="Aptitude test score (0-100)")
    communication_skill_score: float = Field(..., ge=0.0, le=100.0, description="Communication skill score (0-100)")
    logical_reasoning_score: float = Field(..., ge=0.0, le=100.0, description="Logical reasoning score (0-100)")
    hackathons_participated: int = Field(..., ge=0, le=20, description="Number of hackathons participated")
    github_repos: int = Field(..., ge=0, le=100, description="Public GitHub repository count")
    linkedin_connections: int = Field(..., ge=0, le=10000, description="LinkedIn connection count")
    mock_interview_score: float = Field(..., ge=0.0, le=100.0, description="Mock interview performance score (0-100)")
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="College attendance percentage (0-100)")
    backlogs: int = Field(..., ge=0, le=15, description="Active or historical backlogs count")
    extracurricular_score: float = Field(..., ge=0.0, le=100.0, description="Extracurricular activities score (0-100)")
    leadership_score: float = Field(..., ge=0.0, le=100.0, description="Leadership roles score (0-100)")
    volunteer_experience: str = Field(..., description="Volunteer experience: Yes, No")
    sleep_hours: float = Field(..., ge=0.0, le=24.0, description="Average sleep hours per day")
    study_hours_per_day: float = Field(..., ge=0.0, le=24.0, description="Average self-study hours per day")

    @validator('gender')
    def validate_gender(cls, v):
        valid = ['Male', 'Female', 'Other']
        if v not in valid:
            raise ValueError(f"Gender must be one of {valid}")
        return v

    @validator('college_tier')
    def validate_college_tier(cls, v):
        valid = ['Tier 1', 'Tier 2', 'Tier 3']
        if v not in valid:
            raise ValueError(f"College tier must be one of {valid}")
        return v

    @validator('volunteer_experience')
    def validate_volunteer_exp(cls, v):
        valid = ['Yes', 'No']
        if v not in valid:
            raise ValueError(f"Volunteer experience must be 'Yes' or 'No'")
        return v

class PredictionResponse(BaseModel):
    placement_prediction: str = Field(..., description="'Placed' or 'Not Placed'")
    placement_probability: float = Field(..., description="Placement probability between 0.0 and 1.0")
    placement_probability_pct: float = Field(..., description="Placement probability percentage (0-100%)")
    estimated_package_lpa: Optional[float] = Field(None, description="Estimated salary package in LPA if placed")
    confidence_level: str = Field(..., description="High, Medium, or Low")
    stage_breakdown: dict = Field(..., description="Stage 1 classification and Stage 2 regression execution breakdown")

class ModelInfoResponse(BaseModel):
    status: str
    metadata: dict
