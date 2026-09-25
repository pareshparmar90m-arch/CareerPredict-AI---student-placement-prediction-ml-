import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

RAW_NUMERICAL_FEATURES = [
    'age', 'cgpa', 'internships_count', 'projects_count', 'certifications_count',
    'coding_skill_score', 'aptitude_score', 'communication_skill_score',
    'logical_reasoning_score', 'hackathons_participated', 'github_repos',
    'linkedin_connections', 'mock_interview_score', 'attendance_percentage',
    'backlogs', 'extracurricular_score', 'leadership_score', 'sleep_hours',
    'study_hours_per_day'
]

class PlacementFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        
        # Ensure numerical dtypes
        for col in RAW_NUMERICAL_FEATURES:
            if col in X_out.columns:
                X_out[col] = pd.to_numeric(X_out[col], errors='coerce').fillna(0.0)
                
        # Domain Engineered Features
        if 'cgpa' in X_out.columns and 'coding_skill_score' in X_out.columns:
            X_out['academic_coding_index'] = X_out['cgpa'] * X_out['coding_skill_score']
            
        skill_cols = ['coding_skill_score', 'aptitude_score', 'logical_reasoning_score', 'communication_skill_score', 'mock_interview_score']
        avail_skills = [c for c in skill_cols if c in X_out.columns]
        if avail_skills:
            X_out['skill_composite_score'] = X_out[avail_skills].mean(axis=1)

        exp_cols = ['internships_count', 'projects_count', 'hackathons_participated']
        if all(c in X_out.columns for c in exp_cols):
            X_out['practical_experience_index'] = (X_out['internships_count'] * 2.0) + X_out['projects_count'] + X_out['hackathons_participated']

        if 'study_hours_per_day' in X_out.columns and 'sleep_hours' in X_out.columns:
            X_out['study_efficiency'] = X_out['study_hours_per_day'] / (X_out['sleep_hours'] + 1.0)
            
        return X_out
