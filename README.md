# Avocado (Cost of living)
Avocado — AI-powered cost of living predictor for any city.  Avocado uses machine learning to compare cities and instantly estimate the cost of living, helping users understand expenses like housing, food, transport, and lifestyle before moving.
Data analysis:

Understanding the dataset
Transpose to move rows to columns and columns to rows
Created a “median” column to calculate the median of the values in each row
Renaming the column values to one word features:
EDA:
![Cost Distribution](https://github.com/Vidhikalal/Avocado/blob/main/Cost%20Distribution.png)
![Outlier Analysis for Cost of living Score](https://github.com/Vidhikalal/Avocado/blob/main/Oulier%20Analysis.png) 

Most cities fall between ~4 and ~8
The whiskers span roughly from ~3 to ~12
This means typical cities range from:
Cheap cities (~3–5)
Moderate cities (~5–7)
High-cost cities (~7–12)
We have one true outlier (can be New York, San Francisco) due to the high median accounted by the high cost of housing, rent, and utilities
The ML model should be able to work well with extreme outlier data since it can overfit or over weigh other features
The median (center line) is around ~6
This shows the global “middle cost” city is near a score of 6.
Hence, we can say the data is right-skewed
We can use log-transform may help stabilize variance
X_scaled = (X - median) / IQR (Inter Quartile range) instead of z = (x - mean) / std
IQR = Q3 − Q1 (middle 50% of data)

![Important Features Affecting Cost of Living](https://github.com/Vidhikalal/Avocado/blob/main/ImportantFeatures.png)

Given the distribution:
3 → low cost
4–7 → mid cost
8+ → expensive

Random forest classifier 

      precision    recall  f1-score   support

    Low Cost       0.89      1.00      0.94        16
    Medium Cost       0.89      0.80      0.84        10
    High Cost       1.00      0.83      0.91         6

    accuracy                           0.91        32
    macro avg       0.93      0.88      0.90        32
    weighted avg       0.91      0.91      0.90        32


![First Model Category Weight](https://github.com/Vidhikalal/Avocado/blob/main/FirstModelCategoryWeight.png)

![Second Model Category Weight](https://github.com/Vidhikalal/Avocado/blob/main/SecondModelCategoryWeight.png)


 "housing_avg": rent,
        "food_avg": food_avg,
        "restaurants_avg": restaurants_avg,
        "transport_avg": transport_avg,
        "internet_utils_avg": (internet_avg + utilities_avg) / 2,
        "lifestyle_avg": (clothing_avg + recreation_avg) / 2

weighted-score model is production-quality

Weighted Model MAE: 0.017401389394616554
Weighted Model RMSE: 0.0008268468995312273

model predicts weighted COL scores with:

1.7% average error
0.08% root-mean-square error
Weighted Model R² Score: 0.964492033663257
THE 6 REQUIRED MODEL INPUT FEATURES
1. housing_norm
Normalized average of:
rent (1-bed in centre)


rent (1-bed outside)


rent (3-bed in centre)


rent (3-bed outside)


price per sqm (centre)


price per sqm (outside)


utilities



2. food_norm
Normalized average of grocery items like:
milk


bread


eggs


chicken


beef


fruit & veg


rice


etc.



3. restaurants_norm
Normalized average of:
meal inexpensive


meal for 2


McMeal


beer domestic


beer imported


cappuccino


soda


wine



4. transport_norm
Normalized average of:
gas price


taxi base


taxi per km


taxi per hour


transit pass


one-way ticket



5. internet_utils_norm
Normalized average of:
internet monthly price


utilities (electricity, water, cooling, trash)


(both normalized before averaging)

6. lifestyle_norm
Normalized average of:
cinema


fitness club


tennis


clothing items (jeans, dress, shoes)


Required payload:
{
    "housing_norm": float,
    "food_norm": float,
    "restaurants_norm": float,
    "transport_norm": float,
    "internet_utils_norm": float,
    "lifestyle_norm": float
}

These data will be passed for the following: 
scaler2.transform(...)
rf_weighted.predict(...)




✔ A full ML training pipeline using RobustScaler + RandomForest
✔ A full pipeline using RobustScaler + Linear Regression + Ridge + XGBoost
✔ SHAP values for explainability
✔ A GenAI prompt that explains the output of your ML model in natural language
    













