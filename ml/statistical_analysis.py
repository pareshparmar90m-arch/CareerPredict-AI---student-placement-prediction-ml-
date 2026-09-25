import pandas as pd
import numpy as np
from scipy import stats

def run_statistical_analysis(df_path='student_placement_prediction_dataset_2026.csv'):
    df = pd.read_csv(df_path)
    
    # 1. Chi-Square Tests for Categorical Variables vs placement_status
    categorical_cols = ['college_tier', 'gender', 'branch', 'volunteer_experience']
    chi2_results = []
    
    for col in categorical_cols:
        contingency_tab = pd.crosstab(df[col], df['placement_status'])
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency_tab)
        
        # Calculate Cramer's V association
        n = contingency_tab.sum().sum()
        min_dim = min(contingency_tab.shape) - 1
        cramers_v = np.sqrt(chi2 / (n * min_dim)) if min_dim > 0 else 0.0
        
        chi2_results.append({
            "feature": col,
            "chi2_stat": round(float(chi2), 2),
            "p_value": float(f"{p_val:.4e}") if p_val < 0.0001 else round(float(p_val), 4),
            "degrees_of_freedom": int(dof),
            "cramers_v": round(float(cramers_v), 4),
            "is_statistically_significant": bool(p_val < 0.05),
            "interpretation": f"Strong association (Cramer's V = {cramers_v:.3f})" if cramers_v > 0.1 else f"Moderate/Weak association (Cramer's V = {cramers_v:.3f})"
        })

    # 2. Pearson & Spearman Correlations with Numerical Features
    placed_df = df[df['placement_status'] == 'Placed'].copy()
    salary_vals = pd.to_numeric(placed_df['salary_package_lpa'], errors='coerce').values
    
    correlations = {}
    for col in ['cgpa', 'coding_skill_score', 'aptitude_score', 'communication_skill_score', 'internships_count']:
        feat_vals = pd.to_numeric(placed_df[col], errors='coerce').values
        pearson_r, p_pearson = stats.pearsonr(feat_vals, salary_vals)
        spearman_r, p_spearman = stats.spearmanr(feat_vals, salary_vals)
        correlations[col] = {
            "pearson_r": round(float(pearson_r), 4),
            "spearman_r": round(float(spearman_r), 4),
            "p_value": round(float(p_pearson), 4)
        }

    # 3. Two-Sample T-Test: CGPA of Placed vs Unplaced Students
    cgpa_placed = pd.to_numeric(df[df['placement_status'] == 'Placed']['cgpa'], errors='coerce').values
    cgpa_unplaced = pd.to_numeric(df[df['placement_status'] == 'Not Placed']['cgpa'], errors='coerce').values
    t_stat, p_val_t = stats.ttest_ind(cgpa_placed, cgpa_unplaced, equal_var=False)
    
    ttest_cgpa = {
        "placed_mean_cgpa": round(float(np.mean(cgpa_placed)), 2),
        "unplaced_mean_cgpa": round(float(np.mean(cgpa_unplaced)), 2),
        "t_statistic": round(float(t_stat), 2),
        "p_value": float(f"{p_val_t:.4e}") if p_val_t < 0.0001 else round(float(p_val_t), 4),
        "is_statistically_significant": bool(p_val_t < 0.05)
    }

    return {
        "chi_square_tests": chi2_results,
        "salary_correlations": correlations,
        "ttest_cgpa": ttest_cgpa
    }

if __name__ == '__main__':
    res = run_statistical_analysis()
    print("=== Statistical Analysis Results ===")
    print("Chi2 Tests:", res["chi_square_tests"])
    print("Correlations:", res["salary_correlations"])
    print("CGPA T-Test:", res["ttest_cgpa"])
