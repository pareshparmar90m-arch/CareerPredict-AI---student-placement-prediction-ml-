import os
import sys

# Ensure root dir is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.schemas.prediction_schema import StudentPredictionInput
from backend.services.prediction_service import prediction_service

def test_predictions():
    print("=== Testing FastAPI Service Independently ===")
    prediction_service.load_models()

    # Test Case 1: High Profile Student
    high_student = StudentPredictionInput(
        age=21,
        gender="Female",
        cgpa=8.9,
        branch="CSE",
        college_tier="Tier 1",
        internships_count=3,
        projects_count=5,
        certifications_count=4,
        coding_skill_score=88.5,
        aptitude_score=90.0,
        communication_skill_score=85.0,
        logical_reasoning_score=87.0,
        hackathons_participated=3,
        github_repos=15,
        linkedin_connections=450,
        mock_interview_score=86.0,
        attendance_percentage=92.0,
        backlogs=0,
        extracurricular_score=78.0,
        leadership_score=82.0,
        volunteer_experience="Yes",
        sleep_hours=7.5,
        study_hours_per_day=5.0
    )

    res_high = prediction_service.predict(high_student)
    print("\n[HIGH PROFILE PREDICTION RESULT]:")
    print(res_high.model_dump_json(indent=2))

    # Test Case 2: Low Profile Student
    low_student = StudentPredictionInput(
        age=22,
        gender="Male",
        cgpa=5.2,
        branch="Mechanical",
        college_tier="Tier 3",
        internships_count=0,
        projects_count=1,
        certifications_count=0,
        coding_skill_score=35.0,
        aptitude_score=40.0,
        communication_skill_score=45.0,
        logical_reasoning_score=38.0,
        hackathons_participated=0,
        github_repos=1,
        linkedin_connections=30,
        mock_interview_score=40.0,
        attendance_percentage=62.0,
        backlogs=4,
        extracurricular_score=30.0,
        leadership_score=20.0,
        volunteer_experience="No",
        sleep_hours=8.0,
        study_hours_per_day=1.5
    )

    res_low = prediction_service.predict(low_student)
    print("\n[LOW PROFILE PREDICTION RESULT]:")
    print(res_low.model_dump_json(indent=2))

    print("\n=== Backend Service Test Passed Successfully! ===")

if __name__ == "__main__":
    test_predictions()
