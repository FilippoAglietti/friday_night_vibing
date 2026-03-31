import type {
  Curriculum,
  Module,
  Lesson,
  QuizQuestion,
  BonusResource,
} from "@/types/curriculum";

// ─────────────────────────────────────────────────────────
// Machine Learning Fundamentals — Full showcase curriculum
// ─────────────────────────────────────────────────────────

const mlFundamentalsModules: Module[] = [
  {
    id: "ml-m1",
    title: "Introduction to Machine Learning",
    description:
      "Understand the foundations of machine learning, key concepts, and real-world applications.",
    objectives: [
      "Define machine learning and distinguish supervised vs. unsupervised learning",
      "Explain the machine learning workflow and model evaluation",
      "Identify appropriate use cases for different ML approaches",
    ],
    order: 0,
    durationMinutes: 180,
    lessons: [
      {
        id: "ml-l1-1",
        title: "What is Machine Learning?",
        description:
          "An introduction to machine learning concepts, terminology, and the learning paradigm that powers modern AI.",
        format: "video",
        durationMinutes: 45,
        objectives: [
          "Understand the definition and scope of machine learning",
          "Distinguish between AI, ML, and deep learning",
        ],
        keyPoints: [
          "Machine learning enables systems to learn from data without explicit programming",
          "Three main paradigms: supervised, unsupervised, and reinforcement learning",
          "ML powers recommendation systems, computer vision, NLP, and autonomous systems",
          "Training data quality is critical to model performance",
        ],
        content: `## Understanding Machine Learning

**Machine learning** is a subset of artificial intelligence that enables computer systems to learn and improve from experience without being explicitly programmed. Instead of following pre-written instructions, ML models identify patterns in data and make predictions or decisions based on those patterns. This paradigm has revolutionized how we build applications, from recommendation engines to autonomous vehicles.

The key distinction of machine learning is that algorithms are data-driven rather than rule-driven. Rather than hardcoding every decision logic, we provide examples and let the algorithm learn the underlying patterns. As the amount and quality of data increases, model performance typically improves.

## The Three Main Paradigms

**Supervised learning** uses labeled data where the correct answers are known. Think of it as learning with a teacher—the algorithm learns to predict outputs from inputs by studying labeled examples. This is used for problems like predicting house prices (regression) or classifying emails as spam (classification).

**Unsupervised learning** finds hidden patterns in unlabeled data without knowing the "correct" answers in advance. It's like exploring data without guidance. Common tasks include clustering similar customers or reducing data dimensions for visualization.

**Reinforcement learning** trains agents through rewards and penalties, like teaching a dog new tricks with treats. The agent learns to maximize cumulative rewards through trial and error.

## Real-World Applications

Machine learning powers countless modern systems: streaming services use collaborative filtering to recommend shows, hospitals use image classification to detect diseases in X-rays, and banks use anomaly detection to prevent fraud. **Training data quality** is absolutely critical—garbage in, garbage out. Poor quality or biased training data will produce poor or biased models.

### Try It Yourself

Identify three ML applications in your daily life (e.g., email spam filtering, social media feeds, autocomplete). For each, determine whether it likely uses supervised, unsupervised, or reinforcement learning.

> **Pro Tip:** Always start by understanding your problem before jumping to algorithms. Is it supervised or unsupervised? How much labeled data do you have? These questions matter more than the specific algorithm choice.`,
        suggestedResources: [
          {
            title: "ML Basics — Google Developers",
            url: "https://developers.google.com/machine-learning/intro-to-ml",
            type: "interactive",
          },
          {
            title: "Introduction to Machine Learning — Coursera",
            url: "https://www.coursera.org/learn/machine-learning",
            type: "video",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l1-2",
        title: "Supervised vs. Unsupervised Learning",
        description:
          "Explore the two fundamental paradigms of machine learning and when to use each approach.",
        format: "interactive",
        durationMinutes: 60,
        objectives: [
          "Compare supervised and unsupervised learning approaches",
          "Identify real-world problems suited to each paradigm",
        ],
        keyPoints: [
          "Supervised learning uses labeled data to predict outcomes (regression, classification)",
          "Unsupervised learning finds patterns in unlabeled data (clustering, dimensionality reduction)",
          "Supervised learning requires more labeled data but provides clear targets",
          "Unsupervised learning is useful for exploration and discovering hidden patterns",
          "Semi-supervised learning combines labeled and unlabeled data",
        ],
        content: `## Supervised vs. Unsupervised Learning: The Fundamental Divide

Machine learning divides into two major approaches based on data availability and problem structure. **Supervised learning** requires labeled training data where each input has a known output. **Unsupervised learning** works with unlabeled data, discovering structure without explicit targets.

## Supervised Learning: Learning from Examples

In supervised learning, we have pairs of inputs and outputs: (feature, label). A spam filter learns from emails marked as "spam" or "not spam". A house price predictor learns from (house features, price) pairs. The algorithm searches for a function that maps inputs to outputs.

There are two main types: **Regression** predicts continuous values (stock prices, temperature), while **Classification** predicts categories (disease vs. healthy, dog vs. cat). Both learn from labeled examples and evaluate by comparing predictions to known answers.

## Unsupervised Learning: Finding Hidden Patterns

Unsupervised learning has no labels—just raw data. **Clustering** groups similar items together without knowing categories in advance. **Dimensionality reduction** simplifies high-dimensional data for visualization or preprocessing. These methods excel at exploration: discovering customer segments, detecting anomalies, or visualizing data structure.

## Semi-Supervised: Best of Both Worlds

Semi-supervised learning combines small amounts of labeled data with large amounts of unlabeled data. This is practical—getting labels is expensive, but data is abundant. A company might manually label 500 emails, then use those to help classify millions of unlabeled messages.

## Choosing Your Approach

Choose supervised learning when you have labeled data and a clear prediction target. Choose unsupervised learning when you want to discover structure, have only unlabeled data, or need to reduce dimensionality. The choice depends on your data availability and business objective.

### Try It Yourself

Consider these scenarios: 1) Predicting customer churn (will they leave?), 2) Segmenting customers for marketing, 3) Detecting credit card fraud. For each, would you use supervised or unsupervised learning? Why?

> **Pro Tip:** Getting labeled data is expensive. If you have limited labels, consider semi-supervised approaches that leverage abundant unlabeled data.`,
        suggestedResources: [
          {
            title: "Supervised vs. Unsupervised Learning",
            url: "https://scikit-learn.org/stable/",
            type: "article",
          },
          {
            title: "ML Workflow in Practice",
            url: "https://www.tensorflow.org/tutorials",
            type: "interactive",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l1-3",
        title: "The Machine Learning Workflow",
        description:
          "Learn the complete process from problem definition to model deployment.",
        format: "reading",
        durationMinutes: 75,
        objectives: [
          "Navigate the end-to-end ML project lifecycle",
          "Understand data preparation, training, and evaluation stages",
        ],
        keyPoints: [
          "Define the problem clearly and establish success metrics",
          "Data collection and preprocessing consume 80% of ML project time",
          "Feature engineering transforms raw data into predictive signals",
          "Model selection, training, and hyperparameter tuning require experimentation",
          "Evaluation on held-out test data prevents overfitting",
        ],
        content: `## The Machine Learning Workflow: From Problem to Model

Every successful ML project follows a structured workflow. Understanding this pipeline helps you avoid common pitfalls and build effective solutions. The workflow isn't linear—you often loop back to earlier stages as you learn from data and results.

## Stage 1: Problem Definition and Data Collection

Start by clearly defining your problem: What are you predicting? What decisions will the model inform? Is this a regression or classification problem? Supervised or unsupervised?

Then gather data. Data quality determines model quality—spend time understanding your data source, potential biases, and collection process. More data usually beats better algorithms, so prioritize data collection and quality over algorithm sophistication.

## Stage 2: Data Exploration and Preparation

**Exploratory Data Analysis (EDA)** means visualizing and understanding your data. Look for patterns, outliers, missing values, and relationships between variables. Create summary statistics, distribution plots, and correlation matrices.

**Data preprocessing** cleans the data: handle missing values, remove outliers, encode categorical variables, and scale numeric features. This unglamorous stage is crucial—models struggle with messy data.

## Stage 3: Feature Engineering

Transform raw data into useful features. Instead of using pixel intensities directly, a computer vision model might use edge detection. Raw timestamps might become day-of-week, hour, and seasonality features. **Feature engineering** often matters more than algorithm choice.

## Stage 4: Model Selection and Training

Choose an algorithm appropriate for your problem. Split data into training (70%), validation (15%), and test (15%) sets. Train on training data, tune hyperparameters on validation data, and evaluate on held-out test data. Never evaluate on training data—that shows memorization, not generalization.

## Stage 5: Evaluation and Iteration

Evaluate your model on test data using appropriate metrics. For classification, use accuracy, precision, recall, and F1-score. For regression, use MAE, RMSE, or R². If performance is poor, iterate: try different features, algorithms, or hyperparameters. Return to earlier stages if needed.

## Stage 6: Deployment and Monitoring

Once satisfied, deploy your model to production. Monitor performance continuously—data distribution shifts over time, and models degrade. Retrain periodically with new data.

### Try It Yourself

Outline the ML workflow for a problem you care about (predicting churn, classifying images, recommending products). For each stage, list the specific actions you'd take.

> **Pro Tip:** Save 20% of your effort for deployment and monitoring. Most ML resources focus on model building, but production systems need monitoring, versioning, and maintenance.`,
        suggestedResources: [
          {
            title: "ML Workflow Guide",
            url: "https://www.tensorflow.org/guide/keras",
            type: "article",
          },
          {
            title: "Data Science Workflow",
            url: "https://kaggle.com/learn",
            type: "interactive",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q1-1",
        type: "multiple-choice",
        question: "What is the primary difference between supervised and unsupervised learning?",
        options: [
          "Supervised learning requires labeled data; unsupervised does not",
          "Unsupervised learning is faster than supervised learning",
          "Supervised learning cannot be used for classification",
          "Unsupervised learning always requires neural networks",
        ],
        correctAnswer: 0,
        explanation:
          "Supervised learning trains on labeled data with known outcomes, while unsupervised learning finds patterns in unlabeled data.",
        points: 2,
      },
      {
        id: "ml-q1-2",
        type: "multiple-choice",
        question: "Which step typically takes the most time in an ML project?",
        options: [
          "Model training",
          "Data collection and preprocessing",
          "Hyperparameter tuning",
          "Model deployment",
        ],
        correctAnswer: 1,
        explanation:
          "Data preparation is often the longest phase, as raw data requires cleaning, transformation, and feature engineering.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m2",
    title: "Data Preparation and Exploration",
    description:
      "Master data loading, cleaning, visualization, and exploratory analysis with Python tools.",
    objectives: [
      "Load and inspect datasets using pandas",
      "Handle missing values, outliers, and data inconsistencies",
      "Perform exploratory data analysis and statistical testing",
    ],
    order: 1,
    durationMinutes: 210,
    lessons: [
      {
        id: "ml-l2-1",
        title: "Loading and Inspecting Data",
        description:
          "Get hands-on with pandas to load, examine, and understand your data structure.",
        format: "interactive",
        durationMinutes: 60,
        objectives: [
          "Load data from CSV, Excel, and other sources",
          "Use pandas methods to inspect dataset structure and statistics",
        ],
        keyPoints: [
          "pandas.read_csv() and read_excel() handle various data formats",
          "df.head(), df.info(), df.describe() provide quick data summaries",
          "Identify data types, missing values, and basic distributions",
          "Check for duplicate rows and understand target variable distribution",
          "Memory usage analysis helps optimize data processing",
        ],
        content: `## Loading and Inspecting Data: The First Critical Step

Before building any model, you must understand your data intimately. Loading data correctly and inspecting it thoroughly sets the foundation for everything downstream.

## Loading Data with Pandas

**Pandas** is Python's go-to library for data manipulation. Loading CSV files is straightforward with \`pd.read_csv()\`. For other formats: \`read_excel()\` for Excel files, \`read_parquet()\` for Parquet, \`read_sql()\` for databases, and \`read_json()\` for JSON.

When loading large files, consider parameters like \`nrows\` to load only a sample, \`dtype\` to specify data types, and \`index_col\` to set the index. Correctly specifying dtypes saves memory and prevents parsing errors.

## First Inspection: Shape and Types

Use \`df.shape\` to see dimensions, \`df.dtypes\` to see data types, and \`df.info()\` for a comprehensive overview. Check \`df.head()\` and \`df.tail()\` to see actual values. Watch for: unexpected data types, missing values, string columns that should be numeric.

## Understanding Your Data

Create \`df.describe()\` to see numeric summaries: mean, std, min, max, quartiles. For categorical columns, use \`df.value_counts()\` to see category frequencies. Check data ranges: does age go from 0 to 150? Does temperature seem plausible?

## Detecting Issues

Look for red flags: columns with single values (no variance means no predictive power), extremely skewed distributions, unrealistic values, or suspicious patterns. Missing values appear as NaN in pandas—check \`df.isnull().sum()\` to count them per column.

## Documenting Findings

Write down what you learn: approximate size, data types, value ranges, missing value patterns, and any anomalies. This documentation becomes crucial when building your preprocessing pipeline.

### Try It Yourself

Load a dataset from Kaggle (https://www.kaggle.com/datasets). Inspect shape, dtypes, missing values, and summary statistics. Write a brief summary of what you learn about the data.

\`\`\`python
import pandas as pd
df = pd.read_csv('your_file.csv')
print(df.shape)
print(df.info())
print(df.describe())
print(df.isnull().sum())
\`\`\`

> **Pro Tip:** Never assume your data is clean. Invest time in inspection—problems discovered now are cheap to fix; problems discovered in production are expensive and embarrassing.`,
        suggestedResources: [
          {
            title: "pandas Documentation",
            url: "https://pandas.pydata.org/docs/",
            type: "article",
          },
          {
            title: "Data Loading Tutorial",
            url: "https://kaggle.com/learn/pandas",
            type: "interactive",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l2-2",
        title: "Data Cleaning and Preprocessing",
        description:
          "Learn techniques to handle missing values, outliers, and prepare data for modeling.",
        format: "project",
        durationMinutes: 75,
        objectives: [
          "Apply strategies for handling missing data",
          "Detect and treat outliers appropriately",
        ],
        keyPoints: [
          "Missing values can be dropped, imputed with mean/median, or inferred using models",
          "Outliers may be errors, genuine anomalies, or important edge cases",
          "Standardization and normalization ensure features are on comparable scales",
          "Categorical encoding converts text to numerical representations",
          "Train-test split prevents data leakage during preprocessing",
        ],
        content: `## Data Cleaning and Preprocessing: Making Messy Data Usable

Real-world data is messy. It contains missing values, duplicates, typos, outliers, and inconsistencies. **Data preprocessing** transforms raw data into a form suitable for modeling. This unglamorous step often consumes 60-80% of project time but is absolutely critical.

## Handling Missing Values

Missing values appear as NaN in pandas. First, understand why values are missing: is the absence itself informative (user didn't provide age = they don't want to)? Or is it random?

For numeric columns, **mean imputation** fills missing values with column mean. **Median imputation** is more robust to outliers. **Forward fill** uses the previous value (for time series). **Deletion** removes rows with missing values—but wastes data if many values are missing.

For categorical columns, fill with mode (most frequent value) or a special "Unknown" category. Don't impute if missing values are informative.

## Handling Duplicates

Check \`df.duplicated()\` to find duplicate rows. \`df.drop_duplicates()\` removes them. Decide whether duplicates are errors or genuine duplicates in your data. Removing duplicates might improve model quality or lose valid data.

## Encoding Categorical Variables

**One-hot encoding** converts categories to binary columns: color "red" becomes \`red=1, blue=0, green=0\`. **Label encoding** maps categories to integers: \`red=0, blue=1, green=2\`. Use one-hot for algorithms like logistic regression; use label encoding for tree-based models.

Avoid the "dummy variable trap" in linear models: if you have 3 color categories, create only 2 dummy variables (the third is implied when the others are 0).

## Handling Outliers

Outliers are extreme values that might be errors or genuine extremes. Visualize with boxplots or histograms. Some outliers are valuable (fraud detection), others are errors.

**Capping** limits values to a range (e.g., salary > $1M becomes $1M). **Robust scaling** uses median and quartiles instead of mean and std, handling outliers better. **Removal** deletes obvious errors, but use sparingly.

## Feature Scaling

Many algorithms (KNN, SVM, neural networks) are sensitive to feature magnitude. **Standardization** (z-score) subtracts mean and divides by std: \`(x - mean) / std\`. **Normalization** (min-max) scales to [0, 1]: \`(x - min) / (max - min)\`. Tree-based models are scale-invariant and don't need scaling.

### Try It Yourself

Take a dataset with missing values and duplicates. For each column, decide on a strategy (impute, delete, or keep as-is). Implement it and document your decisions.

\`\`\`python
# Check missing values
print(df.isnull().sum())

# Fill with mean (numeric columns)
df['age'].fillna(df['age'].mean(), inplace=True)

# Remove duplicates
df.drop_duplicates(inplace=True)

# Scale numeric columns
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
df[['age', 'income']] = scaler.fit_transform(df[['age', 'income']])
\`\`\`

> **Pro Tip:** Keep a copy of your original data and document every preprocessing step. You'll often need to retrace your steps or explain what you did.`,
        suggestedResources: [
          {
            title: "Data Preprocessing Best Practices",
            url: "https://scikit-learn.org/stable/modules/preprocessing.html",
            type: "article",
          },
          {
            title: "Handling Missing Data",
            url: "https://pandas.pydata.org/docs/user_guide/missing_data.html",
            type: "reading",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l2-3",
        title: "Exploratory Data Analysis (EDA)",
        description:
          "Use visualization and statistics to discover patterns and relationships in your data.",
        format: "interactive",
        durationMinutes: 75,
        objectives: [
          "Create visualizations to understand feature distributions",
          "Identify correlations and relationships between variables",
        ],
        keyPoints: [
          "Histograms and boxplots reveal distribution shapes and outliers",
          "Scatter plots show relationships between numeric features",
          "Correlation matrices identify multicollinearity and feature importance",
          "Categorical features require bar charts and cross-tabulation analysis",
          "EDA guides feature selection and engineering decisions",
        ],
        content: `## Exploratory Data Analysis (EDA): Seeing Your Data Clearly

After loading and cleaning data, **Exploratory Data Analysis** reveals patterns, relationships, and anomalies. EDA informs feature engineering decisions, helps detect data quality issues, and provides insights into your problem.

## Univariate Analysis: Single Variables

Start with individual columns. For numeric variables, plot **histograms** to see distributions and identify skewness or multi-modality. **Boxplots** reveal outliers and quartile structure. For categorical variables, **bar charts** show category frequencies.

Calculate statistics: mean, median, std, min, max, quartiles. Compare mean to median—if they differ greatly, the distribution is skewed. High std relative to mean indicates high variability.

## Bivariate Analysis: Relationships Between Variables

Create **scatter plots** to visualize relationships between numeric variables. Look for linear, non-linear, or clustered patterns. Calculate **correlation coefficients** (Pearson for linear, Spearman for monotonic) to quantify relationships.

For categorical-categorical relationships, use **crosstabs** or **stacked bar charts**. For numeric-categorical relationships, create **boxplots** grouped by category or **violin plots** for distribution shape.

## Correlation Analysis

A **correlation matrix** shows pairwise relationships: values near 1 mean strong positive correlation, near -1 mean strong negative, near 0 mean no linear relationship. High correlation between features suggests redundancy; high correlation with target suggests predictive power.

Visualize with **heatmaps** using \`seaborn.heatmap(df.corr())\`. But remember: correlation ≠ causation, and correlation captures only linear relationships.

## Multivariate Analysis: Complex Patterns

**Pairplots** create scatter plots for all numeric variable pairs, colored by a categorical target. **PCA** reduces dimensions for visualization. **Cluster analysis** reveals natural groupings.

## Distribution Analysis

Understand target variable distribution—imbalanced classification (99% negative, 1% positive) needs special handling. Skewed distributions (income, house prices) might need transformation (log, sqrt).

## Temporal Analysis

If your data has timestamps, plot over time: Do values trend? Show seasonality? Have abrupt changes? Temporal patterns inform time-series modeling decisions.

### Try It Yourself

For a dataset, create: 1) Histograms for key numeric variables, 2) Correlation heatmap, 3) Scatter plots between top correlated pairs, 4) Boxplots for categorical groups. What patterns emerge?

\`\`\`python
import matplotlib.pyplot as plt
import seaborn as sns

# Histogram
plt.hist(df['age'], bins=30)
plt.show()

# Correlation heatmap
sns.heatmap(df.corr(), annot=True)
plt.show()

# Scatter plot colored by category
sns.scatterplot(data=df, x='age', y='income', hue='category')
plt.show()
\`\`\`

> **Pro Tip:** EDA often leads to insights that become features. A temporal pattern you discover might become a seasonal feature; a relationship you notice might become a ratio feature. EDA is not wasted time—it's detective work that improves models.`,
        suggestedResources: [
          {
            title: "matplotlib & seaborn Documentation",
            url: "https://matplotlib.org/stable/users/index.html",
            type: "article",
          },
          {
            title: "Data Visualization with Python",
            url: "https://seaborn.pydata.org/",
            type: "article",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q2-1",
        type: "multiple-choice",
        question:
          "When handling missing values, which approach typically preserves the most information?",
        options: [
          "Delete all rows with any missing value",
          "Fill with the mean or median value",
          "Use a model to predict the missing value",
          "Replace with zero",
        ],
        correctAnswer: 2,
        explanation:
          "Model-based imputation (KNN imputation, regression) often preserves relationships better than simple statistical imputation.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m3",
    title: "Linear Models and Regression",
    description:
      "Master foundational models for predicting continuous values and understanding feature importance.",
    objectives: [
      "Implement linear regression and understand the underlying mathematics",
      "Apply regularization techniques (Ridge, Lasso) to prevent overfitting",
      "Evaluate regression models using appropriate metrics",
    ],
    order: 2,
    durationMinutes: 240,
    lessons: [
      {
        id: "ml-l3-1",
        title: "Linear Regression Fundamentals",
        description:
          "Learn the mathematical foundation and practical implementation of linear regression.",
        format: "video",
        durationMinutes: 75,
        objectives: [
          "Understand the linear regression equation and loss function",
          "Implement linear regression from scratch and using scikit-learn",
        ],
        keyPoints: [
          "Linear regression models the relationship: y = mx + b extended to multiple features",
          "Loss function (MSE) measures the average prediction error squared",
          "Gradient descent optimization iteratively minimizes the loss",
          "Closed-form solutions exist for OLS regression with small datasets",
          "Feature scaling improves convergence and interpretation",
        ],
        content: `## Linear Regression Fundamentals: Predicting Continuous Values

**Linear regression** is the foundation of predictive modeling. It models the relationship between input features and a continuous target as a linear equation: \`y = mx + b\` in simple form, or \`y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ\` in multivariate form.

## How Linear Regression Works

The algorithm finds coefficients (β₀, β₁, ..., βₙ) that minimize prediction error. **Ordinary Least Squares (OLS)** minimizes the sum of squared errors: \`Σ(actual - predicted)²\`. Squaring errors penalizes large mistakes heavily, making regression sensitive to outliers.

Interpretation is straightforward: coefficient β₁ means "one unit increase in x₁ leads to β₁ unit change in y, holding other variables constant." The intercept β₀ is the predicted value when all features are zero.

## Assumptions and Limitations

Linear regression assumes: 1) **Linearity**—the relationship is linear, 2) **Independence**—observations are independent, 3) **Homoscedasticity**—error variance is constant, 4) **Normality**—errors are normally distributed.

When assumptions are violated, model performance suffers. Non-linear relationships, autocorrelated data (time series), or heteroscedastic errors invalidate standard inference.

## Simple vs. Multiple Regression

**Simple regression** uses one feature. **Multiple regression** uses many features. Multiple regression is more powerful but prone to overfitting if too many features exist relative to data size.

## Interpreting Results

\`R²\` (coefficient of determination) shows what fraction of variance is explained: R² = 0.75 means 75% of variance is explained. Higher is better, but context matters—some problems are inherently harder.

\`p-values\` test whether coefficients differ significantly from zero. Low p-values (< 0.05) suggest significant predictors. High p-values suggest the variable might be noise.

### Try It Yourself

Build a simple linear regression model predicting house prices from square footage:

\`\`\`python
from sklearn.linear_model import LinearRegression
import numpy as np

X = df[['sqft']].values
y = df['price'].values

model = LinearRegression()
model.fit(X, y)

print(f"Coefficient: {model.coef_[0]}")
print(f"Intercept: {model.intercept_}")
print(f"R² Score: {model.score(X, y)}")
\`\`\`

> **Pro Tip:** Before fitting, scale your features. Unscaled features with different magnitudes produce coefficients that aren't directly comparable. Scaling makes interpretation clearer and often improves numerical stability.`,
        suggestedResources: [
          {
            title: "Linear Regression — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/linear_model.html",
            type: "article",
          },
          {
            title: "Regression Analysis Tutorial",
            url: "https://www.tensorflow.org/tutorials/keras/regression",
            type: "interactive",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l3-2",
        title: "Regularization: Ridge and Lasso",
        description:
          "Prevent overfitting by adding penalties for model complexity.",
        format: "interactive",
        durationMinutes: 75,
        objectives: [
          "Explain L1 and L2 regularization penalties",
          "Choose between Ridge, Lasso, and Elastic Net for your problem",
        ],
        keyPoints: [
          "Ridge (L2) adds penalty on the sum of squared coefficients",
          "Lasso (L1) adds penalty on the sum of absolute coefficients",
          "Lasso provides feature selection by shrinking irrelevant coefficients to zero",
          "Elastic Net combines L1 and L2 penalties for balanced regularization",
          "Regularization strength (alpha) is tuned via cross-validation",
        ],
        content: `## Regularization: Ridge and Lasso—Preventing Overfitting

Overfitting happens when a model memorizes training data, learning noise alongside true patterns. **Regularization** prevents this by penalizing large coefficients, preferring simpler models that generalize better.

## The Overfitting Problem

Complex models fit training data perfectly but fail on new data. You notice this through: 1) High training accuracy but low test accuracy, 2) Large coefficients suggesting the model relies heavily on specific features, 3) Sensitivity to small data changes.

The model has learned training-specific quirks rather than generalizable patterns. Regularization forces a tradeoff: accept slightly higher training error for much better test error.

## Ridge Regression (L2 Regularization)

**Ridge regression** adds an L2 penalty: minimize \`SSE + λΣ(β²)\`. The penalty term λ (lambda) controls strength. High λ shrinks coefficients toward zero—extreme λ makes all coefficients near zero.

Ridge shrinks all coefficients but doesn't eliminate them. Features with small coefficients still remain. This is useful when all features are somewhat predictive, or when multicollinearity exists (correlated features).

## Lasso Regression (L1 Regularization)

**Lasso** adds an L1 penalty: minimize \`SSE + λΣ(|β|)\`. Unlike Ridge, Lasso can shrink coefficients exactly to zero, performing **feature selection**. The absolute value penalty has this zero-shrinking property mathematically.

Lasso is useful when you suspect only some features matter. It automatically eliminates irrelevant features, simplifying interpretation.

## Choosing λ

The regularization strength λ controls the bias-variance tradeoff. Small λ ≈ no regularization (high variance, low bias). Large λ ≈ strong regularization (low variance, high bias, potential underfitting).

Use **cross-validation** to choose λ: try a range of values, evaluate each with cross-validation, pick the one with best CV error. \`sklearn\` provides \`RidgeCV\` and \`LassoCV\` for this.

## Elastic Net: The Hybrid

**Elastic Net** combines Ridge and Lasso: minimize \`SSE + λ₁Σ(β²) + λ₂Σ(|β|)\`. It offers middle ground: some feature elimination like Lasso, but more stable like Ridge. Use it when unsure between Ridge and Lasso.

### Try It Yourself

Compare Ridge, Lasso, and Elastic Net on a dataset with many features:

\`\`\`python
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.model_selection import cross_val_score

ridge = Ridge(alpha=1.0)
lasso = Lasso(alpha=0.1)
elastic = ElasticNet(alpha=0.5, l1_ratio=0.5)

for name, model in [('Ridge', ridge), ('Lasso', lasso), ('Elastic', elastic)]:
    scores = cross_val_score(model, X, y, cv=5, scoring='r2')
    print(f"{name}: {scores.mean():.3f} ± {scores.std():.3f}")
\`\`\`

> **Pro Tip:** Lasso is excellent for feature selection when you have many features and suspect only some matter. Ridge is better when all features are informative but correlated. Start with both and see which generalizes better.`,
        suggestedResources: [
          {
            title: "Ridge and Lasso Regression",
            url: "https://scikit-learn.org/stable/modules/linear_model.html#ridge-regression",
            type: "article",
          },
          {
            title: "Regularization in ML",
            url: "https://www.tensorflow.org/tutorials/keras/overfit_and_underfit",
            type: "interactive",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l3-3",
        title: "Regression Model Evaluation",
        description:
          "Learn metrics and techniques to properly evaluate regression model performance.",
        format: "project",
        durationMinutes: 90,
        objectives: [
          "Calculate and interpret MSE, RMSE, MAE, and R² metrics",
          "Apply cross-validation to assess model generalization",
        ],
        keyPoints: [
          "RMSE (Root Mean Squared Error) is in the same units as the target variable",
          "MAE (Mean Absolute Error) is robust to outliers compared to MSE",
          "R² (coefficient of determination) shows the proportion of variance explained",
          "Cross-validation estimates real-world performance on unseen data",
          "Residual plots reveal systematic errors and assumption violations",
        ],
        content: `## Regression Model Evaluation: Measuring Prediction Quality

After training a regression model, you must evaluate how well it predicts. Different metrics reveal different aspects of performance. Always evaluate on **held-out test data**, never on training data.

## Key Evaluation Metrics

**Mean Absolute Error (MAE)** averages absolute prediction errors: \`MAE = Σ|actual - predicted| / n\`. Units match the target variable. A MAE of $5,000 for house prices is interpretable: predictions are off by $5,000 on average.

**Mean Squared Error (MSE)** and **Root Mean Squared Error (RMSE)** square errors before averaging. Squaring emphasizes large errors. RMSE is popular because it's in original units like MAE. For houses, RMSE of $7,000 means typical error is larger than MAE, due to large outlier errors.

**R² (Coefficient of Determination)** measures explained variance: R² = 1 - (SSresidual / SStotal). R² = 0.85 means the model explains 85% of variance. R² = 0 means the model's no better than predicting mean. Negative R² means the model's worse than mean prediction.

## Residual Analysis

**Residuals** are prediction errors: \`residual = actual - predicted\`. Plot residuals vs. predictions. A good model has: 1) Residuals centered at zero, 2) Constant spread (homoscedasticity), 3) No patterns, 4) Normal distribution.

If residuals have patterns—increasing spread, non-zero mean, curves—your model violates assumptions. This suggests: missing variables, non-linearity, or heteroscedasticity. Investigate and consider model changes.

## Cross-Validation

**k-Fold Cross-Validation** repeatedly splits data into k folds, trains on k-1 and tests on 1. Repeat k times, evaluating each fold. Average results show typical performance on unseen data. k=5 or k=10 is standard.

Cross-validation catches overfitting: if train error is far below CV error, you're overfitting. It also provides error variance—high variance means performance is unstable.

## Comparing Models

When choosing between models, use cross-validation scores. Model A with CV mean 0.85 and std 0.02 is more reliable than Model B with mean 0.86 and std 0.15—B's higher variability suggests instability.

Don't cherry-pick the test set. Use multiple metrics and cross-validation. Pick the model that generalizes best, not the one that overfits most.

### Try It Yourself

Train three models (linear regression, Ridge, Lasso) on a regression dataset. For each, calculate MAE, RMSE, R², and 5-fold cross-validation score. Compare results.

\`\`\`python
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

for name, model in [('Linear', LinearRegression()), ('Ridge', Ridge()), ('Lasso', Lasso())]:
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    cv_score = cross_val_score(model, X_train, y_train, cv=5).mean()
    print(f"{name}: MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.3f}, CV={cv_score:.3f}")
\`\`\`

> **Pro Tip:** Always use cross-validation and multiple metrics. A single metric on a single test set is unreliable. Multiple perspectives catch problems single metrics miss.`,
        suggestedResources: [
          {
            title: "Model Evaluation Metrics",
            url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
            type: "article",
          },
          {
            title: "Cross-Validation Strategies",
            url: "https://scikit-learn.org/stable/modules/cross_validation.html",
            type: "reading",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q3-1",
        type: "multiple-choice",
        question: "What does Lasso regression do that Ridge regression does not?",
        options: [
          "Lasso adds a penalty term to the loss function",
          "Lasso can shrink coefficients exactly to zero for feature selection",
          "Lasso reduces prediction error",
          "Lasso only works with large datasets",
        ],
        correctAnswer: 1,
        explanation:
          "Lasso's L1 penalty can shrink coefficients to exactly zero, providing automatic feature selection, while Ridge's L2 penalty only shrinks coefficients toward zero.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m4",
    title: "Classification Models",
    description:
      "Build predictive models for categorical outcomes and master binary and multiclass classification.",
    objectives: [
      "Implement logistic regression for binary classification",
      "Understand decision trees and ensemble methods",
      "Evaluate classifiers using appropriate metrics and techniques",
    ],
    order: 3,
    durationMinutes: 270,
    lessons: [
      {
        id: "ml-l4-1",
        title: "Logistic Regression and Classification Basics",
        description:
          "Learn to predict categorical outcomes using logistic regression.",
        format: "video",
        durationMinutes: 75,
        objectives: [
          "Understand the sigmoid function and probability interpretation",
          "Implement binary classification with logistic regression",
        ],
        keyPoints: [
          "Logistic regression predicts probabilities using the sigmoid function (0 to 1)",
          "Decision boundary separates classes; typically at probability = 0.5",
          "Cross-entropy loss measures classification error",
          "Logistic regression provides interpretable coefficients",
          "Calibration ensures predicted probabilities match empirical frequencies",
        ],
        content: `## Logistic Regression and Classification Basics: Predicting Categories

While linear regression predicts continuous values, **logistic regression** predicts probabilities and classes. Despite its name, it's a classification algorithm, not regression.

## Classification vs. Regression

Classification predicts categorical targets (spam/not spam, disease/healthy, cat/dog). Logistic regression outputs probabilities: P(class=1) between 0 and 1. Threshold (usually 0.5) determines final class: if P(class=1) > 0.5, predict class 1; else predict class 0.

Binary classification has 2 classes. Multi-class has 3+. Logistic regression extends to multi-class using **One-vs-Rest** (train k binary classifiers) or **Multinomial** approach.

## The Logistic Function

Linear regression's predictions can exceed [0, 1]. We need a function that always outputs probabilities. The **logistic function** maps any input to [0, 1]: \`P(y=1) = 1 / (1 + e^(-z))\` where z is the linear combination \`β₀ + β₁x₁ + ...\`

The S-shaped curve represents confidence: near 0 (very negative z) = nearly 0 probability, near 1 (very positive z) = nearly 1 probability, at 0 (z=0) = 0.5 probability.

## Training and Coefficients

Logistic regression finds coefficients maximizing **likelihood** (probability of observing the data), not minimizing sum of squared errors. This is called **Maximum Likelihood Estimation (MLE)**.

Interpretation: positive coefficient means feature increases P(class=1); negative decreases it. Magnitude shows strength.

## Decision Boundary

The decision boundary where P(class=1) = 0.5 separates classes. For 2D data, it's a line. Higher dimensions = hyperplane. The model's complexity depends on whether the boundary is linear (logistic regression) or curved (non-linear models).

## Predictions vs. Probabilities

Always distinguish: **probabilities** output by \`predict_proba()\` show confidence; **classes** output by \`predict()\` apply a threshold. For imbalanced data, adjust the threshold—lower threshold favors minority class.

### Try It Yourself

Build a binary classifier predicting email spam:

\`\`\`python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

model = LogisticRegression()
model.fit(X_train, y_train)

# Get probabilities and predictions
probs = model.predict_proba(X_test)[:, 1]  # Probability of class 1
preds = model.predict(X_test)

# Evaluate
print(classification_report(y_test, preds))
print(confusion_matrix(y_test, preds))
\`\`\`

> **Pro Tip:** Always check probabilities, not just predictions. A prediction with 51% confidence is less reliable than 99% confidence. For high-stakes decisions, require high confidence probabilities.`,
        suggestedResources: [
          {
            title: "Logistic Regression — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression",
            type: "article",
          },
          {
            title: "Classification with TensorFlow",
            url: "https://www.tensorflow.org/tutorials/keras/classification",
            type: "interactive",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l4-2",
        title: "Decision Trees and Ensemble Methods",
        description:
          "Explore tree-based models and ensemble techniques for robust predictions.",
        format: "interactive",
        durationMinutes: 90,
        objectives: [
          "Build and visualize decision trees",
          "Apply Random Forests, Gradient Boosting, and other ensembles",
        ],
        keyPoints: [
          "Decision trees recursively split features to separate classes",
          "Information gain (Gini impurity, entropy) guides splitting decisions",
          "Ensembles combine multiple models to reduce variance and bias",
          "Random Forests bootstrap samples and features for robust predictions",
          "Gradient Boosting sequentially fits models to residuals",
          "XGBoost and LightGBM provide efficient implementations with regularization",
        ],
        content: `## Decision Trees and Ensemble Methods: Beyond Simple Models

**Decision trees** grow hierarchical models by recursively splitting data on features, creating an interpretable flowchart. **Ensemble methods** combine multiple models for better performance.

## How Decision Trees Work

A tree starts with all data at the root. It finds the feature and split value that best separate classes (minimize impurity). This recursively continues on each subset until leaves are pure (single class) or stopping criteria are met.

Trees are interpretable—you can literally trace a path from root to leaf to see why a specific prediction was made. No feature scaling needed; trees handle non-linearity naturally.

## Tree Depth and Overfitting

Deep trees memorize training data, overfitting. **Pruning** limits depth or requires minimum samples per leaf. A tree that's too shallow underfits; too deep overfits. Use cross-validation to find optimal depth.

## Ensemble Methods: Wisdom of Crowds

Single models have bias and variance. **Ensemble methods** combine multiple models (often weak learners) for robust predictions. If individual models disagree, ensemble votes.

**Random Forests** train many decision trees on random data subsets, each split considering random feature subsets. This variance in training creates diverse trees. Averaging predictions reduces overfitting dramatically. Forests are powerful, scalable, and handle high-dimensional data well.

**Gradient Boosting** (XGBoost, LightGBM, CatBoost) builds trees sequentially, each correcting previous errors. Early trees make rough predictions; later trees focus on hard examples. This sequential refinement often beats Random Forests.

**Bagging** trains models on bootstrap samples (random with replacement), averaging predictions. **Boosting** trains sequentially, each model weighted by previous errors.

## Feature Importance

Both trees and ensembles show feature importance—which features matter most. Tree-based feature importance is more reliable than correlation: it captures non-linear relationships and interactions.

### Try It Yourself

Compare Decision Tree, Random Forest, and Gradient Boosting on a classification task:

\`\`\`python
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import GradientBoostingClassifier

models = {
    'Tree': DecisionTreeClassifier(max_depth=5),
    'RF': RandomForestClassifier(n_estimators=100),
    'XGB': GradientBoostingClassifier(n_estimators=100)
}

for name, model in models.items():
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"{name}: {score:.3f}")
    print(f"Feature importance: {model.feature_importances_}")
\`\`\`

> **Pro Tip:** Random Forests and Gradient Boosting are among the best off-the-shelf algorithms. If linear models fail and you're not sure what to try, start with Random Forest—it's hard to beat and requires minimal tuning.`,
        suggestedResources: [
          {
            title: "Decision Trees and Ensembles",
            url: "https://scikit-learn.org/stable/modules/ensemble.html",
            type: "article",
          },
          {
            title: "XGBoost Documentation",
            url: "https://xgboost.readthedocs.io/",
            type: "article",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l4-3",
        title: "Classification Metrics and Evaluation",
        description:
          "Master metrics appropriate for imbalanced classes and multiclass problems.",
        format: "project",
        durationMinutes: 105,
        objectives: [
          "Calculate and interpret precision, recall, F1-score",
          "Handle class imbalance appropriately",
        ],
        keyPoints: [
          "Accuracy misleads on imbalanced datasets; use precision, recall, F1-score",
          "Precision: of predicted positives, how many are actually positive?",
          "Recall: of actual positives, how many did we find?",
          "F1-score harmonic mean of precision and recall",
          "ROC-AUC measures discrimination ability across thresholds",
          "Stratified cross-validation ensures balanced class representation",
        ],
        content: `## Classification Metrics and Evaluation: Beyond Accuracy

**Accuracy** (proportion correct) misleads with imbalanced data. If 99% of cases are negative, a model predicting always "negative" achieves 99% accuracy but is useless. Use multiple metrics to understand true performance.

## Confusion Matrix

The **confusion matrix** breaks down predictions:
- **True Positives (TP)**: Correctly predicted positive
- **False Positives (FP)**: Incorrectly predicted positive (false alarms)
- **True Negatives (TN)**: Correctly predicted negative
- **False Negatives (FN)**: Missed positives (missed detections)

From this matrix, calculate meaningful metrics.

## Precision and Recall

**Precision** = TP / (TP + FP): "Of predicted positives, how many were correct?" Use when false alarms are costly (spam filter—don't annoy users).

**Recall** = TP / (TP + FN): "Of actual positives, how many were found?" Use when missing positives is costly (disease detection—don't miss sick patients).

These metrics trade off: high precision means few false alarms but miss cases; high recall means few misses but many false alarms.

## F1-Score and Precision-Recall Curve

**F1-Score** = 2 × (Precision × Recall) / (Precision + Recall): harmonic mean balancing precision and recall. Use when you care about both equally. Range 0-1, higher is better.

**Precision-Recall curve** plots precision vs. recall at different decision thresholds. Lower thresholds (more aggressive classification) increase recall but decrease precision. Choose threshold based on your use case.

## ROC-AUC

**Receiver Operating Characteristic (ROC)** plots True Positive Rate (recall) vs. False Positive Rate (1 - specificity) at different thresholds. **AUC** (Area Under Curve) is a single metric: AUC=0.5 means random guessing, AUC=1.0 means perfect classification.

ROC is useful for comparing models and choosing thresholds. AUC is robust to class imbalance.

## Handling Imbalanced Data

For imbalanced data, use **weighted classes** (penalize misclassifying minority class), **oversampling** (duplicate minority class), **undersampling** (remove majority class), or **SMOTE** (synthetic minority oversampling).

### Try It Yourself

Evaluate a classifier on imbalanced data:

\`\`\`python
from sklearn.metrics import confusion_matrix, precision_score, recall_score
from sklearn.metrics import f1_score, roc_auc_score, roc_curve
import matplotlib.pyplot as plt

y_pred = model.predict(X_test)
y_probs = model.predict_proba(X_test)[:, 1]

print(confusion_matrix(y_test, y_pred))
print(f"Precision: {precision_score(y_test, y_pred):.3f}")
print(f"Recall: {recall_score(y_test, y_pred):.3f}")
print(f"F1: {f1_score(y_test, y_pred):.3f}")
print(f"AUC: {roc_auc_score(y_test, y_probs):.3f}")

# Plot ROC curve
fpr, tpr, _ = roc_curve(y_test, y_probs)
plt.plot(fpr, tpr)
plt.plot([0, 1], [0, 1], 'k--')  # Random baseline
plt.show()
\`\`\`

> **Pro Tip:** Don't rely on accuracy alone. For imbalanced data, use precision and recall. For comparing models, use AUC. Different metrics reveal different aspects—use multiple to make informed decisions.`,
        suggestedResources: [
          {
            title: "Classification Metrics",
            url: "https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics",
            type: "article",
          },
          {
            title: "Handling Imbalanced Data",
            url: "https://imbalanced-learn.org/stable/",
            type: "article",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q4-1",
        type: "multiple-choice",
        question:
          "In a dataset with 95% negative and 5% positive examples, which metric is least reliable?",
        options: [
          "Accuracy",
          "Precision",
          "Recall",
          "F1-score",
        ],
        correctAnswer: 0,
        explanation:
          "Accuracy can be high even with poor predictions on the minority class. Precision, recall, and F1-score better reflect performance on imbalanced data.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m5",
    title: "Feature Engineering and Selection",
    description:
      "Transform raw features into predictive signals and select the most important features for your model.",
    objectives: [
      "Apply feature scaling, encoding, and transformation techniques",
      "Implement feature selection methods to reduce dimensionality",
      "Create new features that improve model performance",
    ],
    order: 4,
    durationMinutes: 225,
    lessons: [
      {
        id: "ml-l5-1",
        title: "Feature Scaling and Encoding",
        description:
          "Prepare features for modeling by normalizing and encoding categorical variables.",
        format: "interactive",
        durationMinutes: 75,
        objectives: [
          "Apply standardization and normalization techniques",
          "Encode categorical features appropriately",
        ],
        keyPoints: [
          "Standardization (z-score): x' = (x - mean) / std, centers and scales to unit variance",
          "Normalization (min-max): x' = (x - min) / (max - min), scales to [0, 1] range",
          "One-hot encoding creates binary columns for categorical features",
          "Label encoding assigns integers; use only if ordinal relationship exists",
          "Target encoding uses target variable statistics; careful of data leakage",
        ],
        content: `## Feature Scaling and Encoding: Preparing Features for Learning

Raw data has features with different magnitudes and types. **Feature scaling** standardizes numeric ranges. **Encoding** converts categorical variables to numeric form. Both are crucial preprocessing steps.

## Why Scaling Matters

Many algorithms (KNN, SVM, neural networks, linear models) are sensitive to feature magnitude. If "age" ranges 0-100 and "income" ranges 0-1,000,000, income dominates the model because its values are larger.

Distance-based algorithms compute distances between points—unstandardized features with large ranges dominate these calculations. Gradient-based optimization also improves with scaling: smaller gradients means more stable training.

Trees and tree ensembles are scale-invariant (splits work the same regardless of scale), so they don't need scaling.

## Standardization (Z-score Normalization)

**Standardization** transforms features to mean 0, std 1: \`x_scaled = (x - mean) / std\`. Use \`StandardScaler\` in sklearn. Interpretation: values represent standard deviations from mean. Works well with normally distributed features.

## Normalization (Min-Max Scaling)

**Normalization** scales to [0, 1]: \`x_scaled = (x - min) / (max - min)\`. Use \`MinMaxScaler\`. Bounded range is useful for neural networks (which initialize weights near 0). Sensitive to outliers—one extreme value spreads others to narrow range.

## Robust Scaling

**RobustScaler** uses median and interquartile range instead of mean and std: \`x_scaled = (x - median) / IQR\`. Robust to outliers. Use when data has extreme values.

## Encoding Categorical Variables

**One-hot encoding** creates binary columns for categories: category "A" becomes \`[1, 0, 0]\`, "B" becomes \`[0, 1, 0]\`. Use \`OneHotEncoder\`. Careful with many categories—10 categories become 10 columns, inflating dimensionality.

**Label encoding** maps categories to integers: "A"→0, "B"→1, "C"→2. Use \`LabelEncoder\`. Works for tree models but implies order (0 < 1 < 2), misleading for unordered categories.

**Target encoding** replaces each category with the mean target value for that category. Powerful but risks overfitting if categories have few samples.

## Handling Ordinal Variables

**Ordinal variables** have meaningful order: education level (high school < bachelor < master). Use integer encoding preserving the order: high school=1, bachelor=2, master=3. Trees will respect this order.

### Try It Yourself

Scale and encode a mixed dataset:

\`\`\`python
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# Define preprocessing
numeric_features = ['age', 'income']
categorical_features = ['color', 'size']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])

X_processed = preprocessor.fit_transform(X_train)
\`\`\`

> **Pro Tip:** Fit scalers on training data only, then apply to test data. Fitting on test data leaks information—test performance becomes artificially optimistic.`,
        suggestedResources: [
          {
            title: "Preprocessing — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/preprocessing.html",
            type: "article",
          },
          {
            title: "Feature Scaling Best Practices",
            url: "https://www.tensorflow.org/tutorials/structured_data/feature_columns",
            type: "interactive",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l5-2",
        title: "Feature Selection Methods",
        description:
          "Reduce dimensionality and improve model interpretability by selecting important features.",
        format: "project",
        durationMinutes: 75,
        objectives: [
          "Apply filter, wrapper, and embedded feature selection methods",
          "Use feature importance to prioritize features",
        ],
        keyPoints: [
          "Filter methods (correlation, chi-square) are fast but independent of model",
          "Wrapper methods (RFE) evaluate features using model performance",
          "Embedded methods (tree importance, coefficients) select features during training",
          "Permutation importance estimates each feature's contribution to predictions",
          "Curse of dimensionality: too many features hurt generalization",
        ],
        content: `## Feature Selection Methods: Keeping What Matters

Raw datasets often have many features, many irrelevant. Too many features lead to overfitting, slow training, and confusing models. **Feature selection** identifies the most important features, improving performance and interpretability.

## Why Feature Selection?

More features don't always mean better models. Extra features introduce noise, increase overfitting risk, slow training, and complicate interpretation. Irrelevant features distract the model from true signals.

## Filter Methods: Simple Statistical Tests

**Filter methods** rank features by statistics, independent of the model. Examples:
- **Correlation** with target: select features with high |correlation|
- **Mutual Information**: measures dependency between feature and target
- **Chi-square**: for categorical features and targets
- **Variance threshold**: remove low-variance features (no signal)

Filter methods are fast, model-agnostic, but ignore feature interactions and don't account for redundancy (two correlated features both ranked high).

## Wrapper Methods: Model-Based Selection

**Wrapper methods** train models with different feature subsets, selecting subsets with best performance.

**Recursive Feature Elimination (RFE)** starts with all features, trains a model, removes the least important feature, repeats. RFE leverages the model's feature importance, capturing interactions.

**Forward selection** starts empty, adds features one-by-one that most improve performance. **Backward elimination** starts full, removes worst-performing features iteratively.

Wrapper methods are computationally expensive (train many models) but effective because they optimize for actual model performance.

## Embedded Methods: Feature Selection During Training

Some algorithms perform feature selection inherently. **Lasso** shrinks unimportant coefficients to zero, selecting features. **Tree-based models** provide feature importance scores.

These methods are efficient (single training) and account for interactions, but limited to specific algorithms.

## Multicollinearity and Redundancy

High correlation between features (multicollinearity) causes problems: coefficients become unstable, interpretation becomes difficult. Remove or combine redundant features. **Variance Inflation Factor (VIF)** quantifies multicollinearity—VIF > 5-10 suggests problematic correlation.

### Try It Yourself

Compare feature selection methods:

\`\`\`python
from sklearn.feature_selection import SelectKBest, f_classif, RFE
from sklearn.linear_model import LogisticRegression

# Filter method: top 5 features by f-score
selector = SelectKBest(f_classif, k=5)
X_filtered = selector.fit_transform(X_train, y_train)
print(f"Selected features (filter): {X_train.columns[selector.get_support()].tolist()}")

# Wrapper method: RFE
model = LogisticRegression()
rfe = RFE(model, n_features_to_select=5)
X_rfe = rfe.fit_transform(X_train, y_train)
print(f"Selected features (RFE): {X_train.columns[rfe.support_].tolist()}")
\`\`\`

> **Pro Tip:** Start with filter methods for quick initial selection, then use RFE or embedded methods for final selection. Combine domain knowledge with statistical methods—sometimes business intuition trumps statistics.`,
        suggestedResources: [
          {
            title: "Feature Selection — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/feature_selection.html",
            type: "article",
          },
          {
            title: "Automated Feature Engineering",
            url: "https://featuretools.com/",
            type: "tool",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l5-3",
        title: "Feature Engineering Techniques",
        description:
          "Create new features from raw data to improve predictive power.",
        format: "reading",
        durationMinutes: 75,
        objectives: [
          "Design domain-specific features",
          "Apply mathematical transformations for better feature relationships",
        ],
        keyPoints: [
          "Polynomial features capture non-linear relationships",
          "Log and power transforms handle skewed distributions",
          "Interaction features combine multiple variables (e.g., age * income)",
          "Binning/discretization converts continuous to categorical",
          "Time-based features (day of week, month, trend) for temporal data",
        ],
        content: `## Feature Engineering Techniques: Creating Better Features

**Feature engineering** transforms raw variables into informative features that improve model performance. This is where domain expertise shines—a well-engineered feature can outperform algorithm choice.

## Polynomial Features

Polynomial features capture non-linear relationships. If \`y = x²\`, linear regression on \`x\` fails; linear regression on \`x²\` succeeds. Create \`x²\`, \`x³\`, interaction terms \`x₁×x₂\` to model non-linearity.

Beware: many polynomial features lead to overfitting. Keep polynomial degree low and use regularization.

## Interaction Terms

Interaction terms multiply features: \`x₁ × x₂\`. Sometimes the combination matters more than individual features. Marketing effectiveness depends on both budget and audience size; budget alone or audience alone misses the synergy.

Select interactions intelligently—not all combinations are meaningful. Domain knowledge guides selection.

## Binning and Discretization

Group continuous variables into bins. Income brackets (low, medium, high) are more interpretable than raw values. Binning captures non-linear relationships—tiny salary increases jump from "low" to "medium" income category.

Lose information through binning—use when interpretability matters and you have enough data per bin.

## Temporal Features

Extract components from timestamps: year, month, day-of-week, hour, is_weekend, days_since_event. These capture seasonality and temporal patterns that raw timestamps miss. Log sales increase before holidays—holiday feature captures this.

## Domain-Specific Features

This is where intuition matters. For credit scoring: debt-to-income ratio combines two features better than either alone. For e-commerce: days_since_last_purchase indicates customer engagement better than raw timestamps.

Domain expertise and business logic drive these features.

## Feature Combinations

Ratios, sums, products, and differences combine features. Revenue/employees = productivity. Distance from center/max_distance = relative location. These engineered features often outperform original variables.

## Log and Root Transformations

Skewed distributions (log-normal) improve with transformation. \`log(income)\` is more normal than raw income. \`sqrt(count)\` stabilizes variance. Interpretation changes—coefficient on log(x) means "1% increase in x leads to β change in y."

### Try It Yourself

Engineer features for a dataset:

\`\`\`python
df['age_squared'] = df['age'] ** 2
df['income_age'] = df['income'] * df['age']  # Interaction
df['log_income'] = np.log1p(df['income'])  # Log transform
df['high_income'] = (df['income'] > df['income'].median()).astype(int)  # Binning

# Test which improve model performance
for col in ['age_squared', 'income_age', 'log_income', 'high_income']:
    X_new = X.copy()
    X_new[col] = df[col]
    score = cross_val_score(model, X_new, y, cv=5).mean()
    print(f"{col}: {score:.3f}")
\`\`\`

> **Pro Tip:** Feature engineering is 80% art, 20% science. Brainstorm features with domain experts. Test many combinations—some will shine, others will flop. The best features come from deep understanding of the problem.`,
        suggestedResources: [
          {
            title: "Feature Engineering Handbook",
            url: "https://featuretools.com/blog/",
            type: "article",
          },
          {
            title: "Advanced Feature Engineering",
            url: "https://kaggle.com/learn",
            type: "interactive",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q5-1",
        type: "multiple-choice",
        question:
          "When should you apply feature scaling before training a logistic regression model?",
        options: [
          "Always, for all models",
          "Only for neural networks",
          "Never; logistic regression is scale-invariant",
          "Only if features are on very different scales",
        ],
        correctAnswer: 3,
        explanation:
          "Logistic regression is relatively scale-invariant, but scaling helps with interpretability and faster convergence of optimization algorithms.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m6",
    title: "Model Validation and Hyperparameter Tuning",
    description:
      "Select optimal models and hyperparameters using cross-validation and systematic search techniques.",
    objectives: [
      "Apply cross-validation strategies to prevent overfitting",
      "Use grid search and random search for hyperparameter optimization",
      "Diagnose and address bias-variance tradeoffs",
    ],
    order: 5,
    durationMinutes: 210,
    lessons: [
      {
        id: "ml-l6-1",
        title: "Cross-Validation Strategies",
        description:
          "Learn to rigorously evaluate model performance on unseen data.",
        format: "video",
        durationMinutes: 60,
        objectives: [
          "Implement k-fold and stratified cross-validation",
          "Understand when to use time-series and grouped cross-validation",
        ],
        keyPoints: [
          "k-fold cross-validation: divide data into k folds, train on k-1, test on 1",
          "Stratified k-fold ensures balanced class distribution in each fold",
          "Time-series CV respects temporal order; never train on future data",
          "Leave-One-Out CV: k=n, useful for small datasets but computationally expensive",
          "Nested CV for hyperparameter tuning: inner loop for tuning, outer for evaluation",
        ],
        content: `## Cross-Validation Strategies: Robust Model Evaluation

**Cross-validation** estimates true model performance without a separate test set. It trains and evaluates multiple times on different data splits, averaging results for robust estimates.

## K-Fold Cross-Validation

**k-Fold** splits data into k equal parts (folds). Train on k-1 folds, test on 1 fold. Repeat k times with different held-out folds. Average the k test scores.

k=5 is standard (trains 5 models, evaluates 5 times). k=10 is more rigorous but slower. k=n (leave-one-out) is computationally expensive but low-bias—every sample is test and train data, minimizing variance.

## Stratified Cross-Validation

Regular k-fold can create imbalanced folds: if 90% of data is negative, a random fold might be 95% negative, another 85%. **Stratified k-fold** preserves class distributions in each fold. For classification with imbalanced data, always use stratified CV.

Similarly, **stratified grouping** applies to regression with ordinal targets (low, medium, high income).

## Time Series Cross-Validation

Regular cross-validation shuffles data, breaking temporal order. For time-series data, **walk-forward validation** respects order: train on past data, test on future, slide forward.

Split: train on 2020-2021 data, test on 2022-01-31. Then train on 2020-2022 Q1, test on Q2. Never train on future data to predict the past.

## Leave-One-Out Cross-Validation (LOOCV)

**LOOCV** leaves one sample out each iteration. Train on n-1 samples, test on 1. Repeat n times. Theoretically ideal (maximum training data, minimal bias) but computationally expensive for large datasets. Use for small datasets (< 1000 samples).

## Nested Cross-Validation

For **hyperparameter tuning**, use nested CV: outer loop evaluates models with tuned hyperparameters; inner loop tunes hyperparameters. Prevents overfitting to the test set through hyperparameter tuning.

Outer loop: k-fold. Inner loop: k-fold for each fold. Computationally expensive but prevents optimistic bias.

### Try It Yourself

Implement cross-validation:

\`\`\`python
from sklearn.model_selection import cross_val_score, StratifiedKFold

# Standard 5-fold CV
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"CV Score: {scores.mean():.3f} ± {scores.std():.3f}")

# Stratified 5-fold for imbalanced data
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=skf, scoring='f1')
print(f"Stratified CV Score: {scores.mean():.3f} ± {scores.std():.3f}")

# Time series cross-validation
from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5)
scores = cross_val_score(model, X, y, cv=tscv)
\`\`\`

> **Pro Tip:** Always use cross-validation, not just train-test split. A single test set can be lucky or unlucky. Cross-validation averages over multiple splits, giving robust estimates of true performance.`,
        suggestedResources: [
          {
            title: "Cross-Validation — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/cross_validation.html",
            type: "article",
          },
          {
            title: "CV Best Practices",
            url: "https://www.tensorflow.org/tutorials/keras/overfit_and_underfit",
            type: "interactive",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l6-2",
        title: "Hyperparameter Tuning: Grid and Random Search",
        description:
          "Optimize model hyperparameters systematically to maximize performance.",
        format: "interactive",
        durationMinutes: 75,
        objectives: [
          "Use GridSearchCV and RandomizedSearchCV",
          "Understand computational tradeoffs in hyperparameter search",
        ],
        keyPoints: [
          "Hyperparameters control model behavior; examples: learning rate, tree depth, regularization",
          "Grid search exhaustively evaluates all parameter combinations",
          "Random search samples randomly; scales better to high dimensions",
          "Bayesian optimization intelligently samples promising regions",
          "Parallel processing accelerates search using all CPU cores",
        ],
        content: `## Hyperparameter Tuning: Grid and Random Search

**Hyperparameters** are settings configured before training (tree depth, regularization strength, learning rate). Unlike coefficients learned during training, hyperparameters are chosen by us. Choosing good hyperparameters dramatically impacts performance.

## Hyperparameter Types

**Tree depth** controls model complexity. **Learning rate** in boosting controls step size—small is slow but stable, large is fast but risky. **Regularization strength (λ)** controls overfitting. **Number of trees** in forests affects variance and training time.

## Grid Search

**Grid Search** tries all combinations in a predefined grid. Define ranges: \`tree_depth = [3, 5, 7, 10]\`, \`learning_rate = [0.01, 0.1, 1.0]\`. Try all 12 combinations, evaluate each with cross-validation, pick the best.

Grid Search is exhaustive but computationally expensive. 10 hyperparameters with 5 values each = 10 million combinations. For high-dimensional hyperparameter spaces, this is infeasible.

## Random Search

**Random Search** samples randomly from hyperparameter distributions. Instead of grid, define ranges: \`tree_depth ~ uniform(3, 10)\`, \`learning_rate ~ loguniform(0.001, 1.0)\`. Sample randomly and evaluate. Often finds good solutions faster than grid search, especially in high dimensions.

Empirically, random search with 10× the grid size often outperforms standard grid search because it explores broader space.

## Bayesian Optimization

**Bayesian optimization** uses a statistical model to predict which hyperparameters are promising, focusing search on promising regions. After each evaluation, update beliefs about the hyperparameter landscape.

More sophisticated than grid/random search, often requires fewer evaluations. Libraries like Optuna, Hyperopt implement this efficiently.

## Practical Guidelines

Use **cross-validation** to evaluate each hyperparameter combination—single train-test split is unreliable. Start with coarse grids (wide ranges), refine based on results.

Prioritize the most important hyperparameters. Tree depth and regularization often matter more than learning rate. Experiment iteratively: initial grid, observe patterns, refine ranges.

### Try It Yourself

Tune hyperparameters with Grid and Random Search:

\`\`\`python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV

# Grid Search
param_grid = {'max_depth': [3, 5, 7], 'min_samples_split': [2, 5, 10]}
grid = GridSearchCV(DecisionTreeClassifier(), param_grid, cv=5, scoring='f1')
grid.fit(X_train, y_train)
print(f"Best params: {grid.best_params_}")
print(f"Best CV score: {grid.best_score_:.3f}")

# Random Search
param_dist = {'max_depth': [3, 5, 7, 10], 'min_samples_split': range(2, 10)}
random = RandomizedSearchCV(DecisionTreeClassifier(), param_dist, n_iter=20, cv=5)
random.fit(X_train, y_train)
print(f"Best params: {random.best_params_}")
\`\`\`

> **Pro Tip:** Use random search first for quick exploration of hyperparameter space. Once you've identified promising ranges, use grid search or Bayesian optimization for refinement. Random search + grid search is faster and smarter than grid search alone.`,
        suggestedResources: [
          {
            title: "Grid Search and Hyperparameter Tuning",
            url: "https://scikit-learn.org/stable/modules/grid_search.html",
            type: "article",
          },
          {
            title: "Optuna: Hyperparameter Optimization",
            url: "https://optuna.org/",
            type: "tool",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l6-3",
        title: "Bias-Variance Tradeoff and Model Selection",
        description:
          "Diagnose overfitting and underfitting to select models with optimal complexity.",
        format: "project",
        durationMinutes: 75,
        objectives: [
          "Identify bias and variance problems from learning curves",
          "Apply techniques to address overfitting and underfitting",
        ],
        keyPoints: [
          "Bias: systematic error from oversimplified models (underfitting)",
          "Variance: sensitivity to training data fluctuations (overfitting)",
          "Learning curves show training vs. validation performance across dataset sizes",
          "High bias with small gap: model too simple; add complexity",
          "High variance with large gap: overfitting; simplify model or get more data",
        ],
        content: `## Bias-Variance Tradeoff and Model Selection: Finding the Sweet Spot

Every model has **bias** (systematic errors from wrong assumptions) and **variance** (sensitivity to training data fluctuations). The **bias-variance tradeoff** is the central tension in machine learning: simple models have high bias, low variance; complex models have low bias, high variance.

## Bias: Underfitting

High bias means the model makes systematic errors. A linear model applied to non-linear data has high bias—it can't capture true patterns. The model is too simple, underfitting.

Signs: high training error, high test error, error similar on both sets. The model struggles even on training data.

## Variance: Overfitting

High variance means the model is sensitive to training data details. A very deep tree memorizes training data quirks, learning noise. Test performance collapses because test data has different noise.

Signs: low training error, high test error, large gap between them. The model fits training data perfectly but fails on test data.

## The Tradeoff

Ideal models balance bias and variance. Slightly higher training error (accepting some bias) for much lower test error (reducing variance). This tradeoff curve resembles a U-shape: optimal complexity is where training and test error sum to minimum.

## Detecting Your Position

Compare train vs. test error:
- Train error high, test error high: **high bias** (underfitting). Add features, use more complex model.
- Train error low, test error high: **high variance** (overfitting). Use regularization, get more data, simplify model.
- Both low: **good model**. You're in the sweet spot.

## Strategies to Balance

**Increase model complexity** (more features, deeper trees, more parameters) to reduce bias. **Increase regularization** (higher λ, tree depth limits) to reduce variance. **Get more data**—variance decreases as data size increases because the model has harder time memorizing noise.

## Model Selection

Compare models with cross-validation scores and their standard deviations. Model A: mean 0.85, std 0.03 (consistent). Model B: mean 0.86, std 0.12 (variable). Model A is more reliable despite lower mean—Model B's high variance suggests instability.

Complex models sometimes give worse CV scores than simple models—the complexity introduces variance faster than it reduces bias.

### Try It Yourself

Visualize bias-variance tradeoff:

\`\`\`python
train_errors = []
test_errors = []
depths = range(1, 20)

for depth in depths:
    model = DecisionTreeClassifier(max_depth=depth)
    model.fit(X_train, y_train)
    train_err = 1 - model.score(X_train, y_train)
    test_err = 1 - model.score(X_test, y_test)
    train_errors.append(train_err)
    test_errors.append(test_err)

import matplotlib.pyplot as plt
plt.plot(depths, train_errors, label='Train Error')
plt.plot(depths, test_errors, label='Test Error')
plt.axvline(x=depths[np.argmin(test_errors)], color='r', linestyle='--', label='Optimal Depth')
plt.legend()
plt.show()
\`\`\`

> **Pro Tip:** The bias-variance tradeoff is fundamental. When tuning models, explicitly think about it: are you trying to reduce bias (model too simple) or variance (model too complex)? This mental model guides every tuning decision.`,
        suggestedResources: [
          {
            title: "Bias-Variance Tradeoff",
            url: "https://scikit-learn.org/stable/auto_examples/model_selection/plot_bias_variance.html",
            type: "article",
          },
          {
            title: "Overfit and Underfit",
            url: "https://www.tensorflow.org/tutorials/keras/overfit_and_underfit",
            type: "interactive",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q6-1",
        type: "multiple-choice",
        question:
          "In k-fold cross-validation with k=5, how many times is each sample used for training?",
        options: [
          "1 time",
          "4 times",
          "5 times",
          "Depends on the dataset size",
        ],
        correctAnswer: 1,
        explanation:
          "Each sample is held out once as test data and used for training in the other 4 folds.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m7",
    title: "Unsupervised Learning: Clustering",
    description:
      "Discover natural groupings in data using clustering algorithms and dimensionality reduction.",
    objectives: [
      "Implement k-means, hierarchical, and density-based clustering",
      "Evaluate clustering quality using internal and external metrics",
      "Apply dimensionality reduction for visualization and feature extraction",
    ],
    order: 6,
    durationMinutes: 240,
    lessons: [
      {
        id: "ml-l7-1",
        title: "K-Means and Hierarchical Clustering",
        description:
          "Learn fundamental clustering algorithms and their applications.",
        format: "video",
        durationMinutes: 75,
        objectives: [
          "Implement k-means clustering",
          "Compare hierarchical clustering approaches",
        ],
        keyPoints: [
          "K-means partitions data into k clusters by minimizing within-cluster variance",
          "Initialization matters; use k-means++ to avoid poor local minima",
          "Elbow method helps select optimal k by plotting inertia",
          "Hierarchical clustering builds dendrograms showing cluster relationships",
          "Agglomerative (bottom-up) vs. divisive (top-down) approaches",
        ],
        content: `## K-Means and Hierarchical Clustering: Grouping Similar Data

**Clustering** groups similar data points without labels. **K-Means** is the most popular clustering algorithm. It's simple, fast, and interpretable.

## How K-Means Works

Start with k random "centers." Assign each point to the nearest center. Recalculate center positions as cluster means. Repeat until convergence (centers don't move).

K-Means minimizes within-cluster distances: it tries to make clusters tight and compact. The algorithm converges (guaranteed) but might find local optima—run multiple times with different initializations, pick best result.

## Choosing k: The Elbow Method

How many clusters? **Elbow method** plots within-cluster sum of squares (WCSS) for different k. WCSS decreases as k increases (more clusters = tighter clusters). The "elbow" where WCSS decreases sharply then flattens suggests good k.

**Silhouette score** measures cluster cohesion and separation: samples should be close to their cluster, far from others. Silhouette ∈ [-1, 1]; higher is better. Plot silhouette for different k values.

## Limitations and Assumptions

K-Means assumes spherical clusters of similar size. Elongated or imbalanced clusters fool it. Requires specifying k upfront, sensitive to initialization. Euclidean distance assumption means features need scaling.

## Hierarchical Clustering

**Hierarchical clustering** builds a tree of nested clusters. **Agglomerative** (bottom-up) starts with each point as its own cluster, merging closest pairs iteratively. **Divisive** (top-down) starts with one cluster, splitting recursively.

Hierarchical clustering produces a **dendrogram**—a tree visualization showing how clusters merge. Cut the dendrogram at different heights to get different cluster numbers.

Unlike K-Means, hierarchical doesn't require specifying k. Dendrograms provide insights into cluster structure. But it's slower (O(n²) memory) and sensitive to linkage choice (single, complete, average, Ward).

## Linkage Methods

**Single linkage** uses closest pair distance (tends to create long chains). **Complete linkage** uses farthest pair distance (tight clusters). **Average linkage** uses average distance. **Ward** minimizes variance increase when merging (often best).

### Try It Yourself

Cluster data with K-Means and Hierarchical methods:

\`\`\`python
from sklearn.cluster import KMeans
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# K-Means with elbow method
wcss = []
for k in range(1, 11):
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(X)
    wcss.append(kmeans.inertia_)

plt.plot(range(1, 11), wcss)
plt.axvline(x=3, color='r', linestyle='--')
plt.show()

# Hierarchical clustering dendrogram
Z = linkage(X, method='ward')
dendrogram(Z)
plt.show()
\`\`\`

> **Pro Tip:** K-Means is fast and scalable—great for large datasets. Hierarchical clustering provides more insight into structure. Use K-Means for quick results, hierarchical when you want to understand cluster relationships.`,
        suggestedResources: [
          {
            title: "Clustering — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/clustering.html",
            type: "article",
          },
          {
            title: "K-Means Deep Dive",
            url: "https://www.tensorflow.org/tutorials/clustering/kmeans",
            type: "interactive",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l7-2",
        title: "Density-Based Clustering and DBSCAN",
        description:
          "Discover clusters of arbitrary shape using density-based approaches.",
        format: "interactive",
        durationMinutes: 75,
        objectives: [
          "Apply DBSCAN for non-spherical clusters",
          "Identify and handle noise points and outliers",
        ],
        keyPoints: [
          "DBSCAN finds clusters based on point density, not centroid-based",
          "Core points, border points, and noise are identified by epsilon and min_samples",
          "Handles clusters of arbitrary shape better than k-means",
          "No need to specify k in advance",
          "Suitable for outlier detection and non-convex clusters",
        ],
        content: `## Density-Based Clustering and DBSCAN: Finding Arbitrary Shapes

**DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) clusters dense regions and identifies outliers. Unlike K-Means, it finds arbitrary-shaped clusters and handles outliers naturally.

## How DBSCAN Works

Define two parameters: **eps** (neighborhood radius) and **min_samples** (minimum neighbors to form core point). A point is **core** if it has ≥ min_samples neighbors within eps. **Border** points are non-core but within eps of a core point. **Noise** points are neither core nor border.

DBSCAN clusters core points that are density-connected, treating noise points as outliers. This is powerful—it finds non-spherical clusters and automatically detects outliers.

## Parameter Tuning

**eps** is critical. Small eps creates tiny clusters and treats most points as noise. Large eps merges distinct clusters. **k-distance graph** helps: sort distances to k-th nearest neighbor, plot. The "knee" in the plot suggests good eps.

**min_samples** typically equals data dimensionality (for 2D, min_samples=2-4). Higher values require denser clusters.

## Advantages and Limitations

DBSCAN handles arbitrary shapes (K-Means struggles with crescent-shaped clusters). It naturally detects outliers. No need to specify number of clusters upfront.

Limitations: performance degrades in high dimensions (curse of dimensionality). Clusters with varying density can confuse it. Parameters eps and min_samples require tuning.

## Alternatives: OPTICS and HDBSCAN

**OPTICS** extends DBSCAN, automatically finding eps. **HDBSCAN** works well with varying density and is more scalable.

## Clustering Metrics

**Silhouette score** works for any clustering. **Davies-Bouldin Index** measures cluster separation (lower is better). For unlabeled data, these intrinsic metrics help evaluate clustering quality.

For labeled data (benchmarking), **Adjusted Rand Index** and **Normalized Mutual Information** measure agreement with ground truth.

### Try It Yourself

Use DBSCAN and compare with K-Means:

\`\`\`python
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics import silhouette_score

# Find eps using k-distance graph
neighbors = NearestNeighbors(n_neighbors=4)
neighbors_fit = neighbors.fit(X)
distances, indices = neighbors_fit.kneighbors(X)
distances = np.sort(distances[:, -1], axis=0)
plt.plot(distances)
plt.ylabel("4-NN Distance")
plt.show()  # Look for knee

# DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=5)
labels = dbscan.fit_predict(X)
print(f"Clusters: {len(set(labels))}, Noise points: {sum(labels == -1)}")
print(f"Silhouette: {silhouette_score(X, labels):.3f}")
\`\`\`

> **Pro Tip:** Use DBSCAN when you expect non-spherical clusters or have outliers you want to identify. It's more realistic than K-Means for many real-world datasets. Plot your data first—if clusters look arbitrary, DBSCAN likely outperforms K-Means.`,
        suggestedResources: [
          {
            title: "DBSCAN — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/clustering.html#dbscan",
            type: "article",
          },
          {
            title: "Density-Based Clustering",
            url: "https://en.wikipedia.org/wiki/Density-based_spatial_clustering_of_applications_with_noise",
            type: "reading",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l7-3",
        title: "Dimensionality Reduction: PCA and t-SNE",
        description:
          "Reduce feature dimensionality for visualization and computational efficiency.",
        format: "project",
        durationMinutes: 90,
        objectives: [
          "Apply PCA for linear dimensionality reduction",
          "Use t-SNE for non-linear visualization",
        ],
        keyPoints: [
          "PCA finds principal components that explain maximum variance",
          "Explained variance ratio guides selection of component count",
          "t-SNE preserves local structure; ideal for visualization, not modeling",
          "UMAP combines benefits of PCA and t-SNE with better scalability",
          "Curse of dimensionality: remove irrelevant features to improve performance",
        ],
        content: `## Dimensionality Reduction: PCA and t-SNE—Simplifying High-Dimensional Data

High-dimensional data is curse and blessing: more features mean more information but also more noise, computational cost, and overfitting risk. **Dimensionality reduction** simplifies data while preserving essential information.

## Principal Component Analysis (PCA)

**PCA** finds directions (principal components) of maximum variance. First component points in the direction where data varies most. Second component (orthogonal to first) has second-most variance. Continue for d components.

PCA projects data onto these components. Keeping top k components captures most variance while reducing dimensionality.

Advantages: linear, interpretable (components are linear combinations of features), fast. Disadvantages: assumes linear relationships, doesn't preserve local structure well.

## Explained Variance

Plot **explained variance ratio** for each component. Component 1 might explain 40%, component 2 might explain 25%, etc. Cumulative variance shows how many components capture 95% of variance. Typically, 95% variance is preserved with drastically fewer dimensions.

Use this to choose k: how many dimensions are needed?

## t-SNE: Visualization-Focused Reduction

**t-SNE** (t-Distributed Stochastic Neighbor Embedding) excels at visualization. It preserves local structure: nearby points in high-dimensional space stay nearby in 2D/3D. Non-linear and computationally intensive, but produces beautiful visualizations.

t-SNE is not suitable for classification (distances in t-SNE don't directly correspond to original distances). Use for exploration and visualization, not feature engineering.

## Other Reduction Techniques

**UMAP** (Uniform Manifold Approximation and Projection) is faster than t-SNE, preserves global structure better. **Autoencoders** use neural networks to learn compressed representations. **Factor Analysis** assumes underlying factors.

## When to Use Reduction

Use PCA for: feature engineering in downstream models, visualization, preprocessing before expensive algorithms, noise reduction. Use t-SNE/UMAP for: visualization and exploration. Use autoencoders for: complex non-linear reduction.

### Try It Yourself

Apply PCA and visualize:

\`\`\`python
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# PCA for dimensionality reduction
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

print(f"Explained variance: {pca.explained_variance_ratio_}")
print(f"Cumulative: {pca.explained_variance_ratio_.cumsum()}")

# Plot
plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y)
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.1%})")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.1%})")
plt.show()

# t-SNE for visualization
from sklearn.manifold import TSNE
X_tsne = TSNE(n_components=2).fit_transform(X)
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y)
plt.show()
\`\`\`

> **Pro Tip:** PCA is fast and great for preprocessing. t-SNE is beautiful but only for visualization—don't use its output as features. UMAP is increasingly popular as a middle ground: faster visualization, preserves structure better than t-SNE.`,
        suggestedResources: [
          {
            title: "PCA — scikit-learn",
            url: "https://scikit-learn.org/stable/modules/decomposition.html#pca",
            type: "article",
          },
          {
            title: "t-SNE Visualization",
            url: "https://scikit-learn.org/stable/modules/manifold.html#t-sne",
            type: "article",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q7-1",
        type: "multiple-choice",
        question: "When is t-SNE preferred over PCA for dimensionality reduction?",
        options: [
          "Always, t-SNE is strictly better",
          "For visualization and understanding local structure",
          "For use as features in downstream models",
          "When computational efficiency is critical",
        ],
        correctAnswer: 1,
        explanation:
          "t-SNE excels at preserving local neighborhood structure for visualization, but PCA is better for feature extraction in models due to its computational efficiency and interpretability.",
        points: 2,
      },
    ],
  },
  {
    id: "ml-m8",
    title: "Practical ML Project Workflow",
    description:
      "Apply machine learning concepts to real-world projects with emphasis on reproducibility and production considerations.",
    objectives: [
      "Execute end-to-end ML projects from problem definition to deployment",
      "Version control datasets and models",
      "Monitor model performance in production",
    ],
    order: 7,
    durationMinutes: 255,
    lessons: [
      {
        id: "ml-l8-1",
        title: "From Problem to Production",
        description:
          "Navigate the complete lifecycle of an ML project with real-world considerations.",
        format: "video",
        durationMinutes: 75,
        objectives: [
          "Define success metrics and business objectives",
          "Plan data pipeline and infrastructure",
        ],
        keyPoints: [
          "Define the problem clearly: what are we predicting and why?",
          "Establish baseline: simple model or business metric",
          "Data collection: sourcing, quality, privacy, and legal considerations",
          "Build MVP quickly; iterate with feedback rather than perfecting initial version",
          "Monitor for data drift: retraining requirements and performance degradation",
        ],
        content: `## From Problem to Production: The Complete ML Workflow

Building a production ML system is far more than training a model. It involves problem definition, data pipeline, model deployment, monitoring, and continuous improvement. Production-ready systems require engineering rigor.

## Problem Definition and Scoping

Start with the business problem: What decision should the model inform? What's the cost of errors? What's the acceptable latency? What's the data availability?

Define success metrics aligned with business goals (not just accuracy). Understand constraints: latency, computational budget, regulatory requirements.

## Data Pipeline

Real systems need **data pipelines** that continuously collect, validate, and preprocess data. Data quality degrades—distributions shift, missing values emerge, formats change. Automated monitoring catches issues.

**Data versioning** tracks datasets used for training—reproducing results requires exactly the same data. **Feature pipelines** compute features consistently in training and production.

## Model Development in Context

Train multiple models, compare rigorously with cross-validation. But remember: model building is 5-10% of project time. Data quality, feature engineering, and operational concerns dominate.

Document your decisions: why you chose this architecture, what you tried, what worked and didn't. Future you (and collaborators) will appreciate it.

## Model Deployment

**Batch prediction** processes data offline, storing predictions. Simple, scalable, good for non-time-sensitive predictions.

**Online prediction** scores in real-time as requests arrive. Lower latency, higher infrastructure cost. Use for time-sensitive applications (recommenders, fraud detection).

## Model Monitoring and Maintenance

**Performance degradation** happens: data distributions shift, world changes, model decays. Monitor key metrics in production—accuracy, precision, recall, latency, throughput.

Set **alerts** for metric drops. Retrain periodically with new data. A/B test new models against production baseline.

## Responsible AI

Consider fairness: does the model discriminate against groups? **Bias** comes from biased training data, not just the algorithm. Understand model decisions (explainability). Plan for adversarial robustness.

## The Complete Workflow

Problem → Data → Features → Modeling → Evaluation → Deployment → Monitoring → Iterate. It's not linear—monitoring reveals issues requiring retraining or feature rethinking.

### Try It Yourself

Sketch a production ML system for a real problem:

1. Define the business problem and success metrics
2. Outline data collection and quality checks
3. Design feature engineering pipeline
4. Choose evaluation strategy (cross-validation, holdout test)
5. Plan deployment: batch or online?
6. List monitoring metrics and alert thresholds
7. Describe feedback loops for continuous improvement

> **Pro Tip:** Start simple. A simple model deployed and monitored beats a complex model left on a laptop. Iterate incrementally—measure, learn, improve. Production-first thinking from the start makes projects successful.`,
        suggestedResources: [
          {
            title: "ML Ops and Model Deployment",
            url: "https://www.tensorflow.org/tfx/",
            type: "article",
          },
          {
            title: "MLflow: Experiment Tracking",
            url: "https://mlflow.org/",
            type: "tool",
          },
        ],
        order: 0,
      },
      {
        id: "ml-l8-2",
        title: "Model Versioning and Reproducibility",
        description:
          "Ensure experiments are reproducible and models are properly tracked.",
        format: "interactive",
        durationMinutes: 90,
        objectives: [
          "Version control code, data, and models",
          "Document experiments and results systematically",
        ],
        keyPoints: [
          "Git tracks code changes; DVC or similar track large data/model files",
          "Random seeds and environment specifications ensure reproducibility",
          "Experiment tracking (MLflow, Weights & Biases) logs hyperparameters and metrics",
          "Model registry manages model versions and deployment candidates",
          "Containerization (Docker) ensures consistency across environments",
        ],
        content: `## Model Versioning and Reproducibility: Keeping Track of Everything

In production, you'll train hundreds of models. Which one is deployed? How was it trained? With which data? Which version is that? **Model versioning** tracks models, code, data, and hyperparameters for reproducibility and rollbacks.

## Version Control

Use **Git** for code versioning. Every experiment should be traceable: commit code, note hyperparameters, save metrics.

**Data versioning** with tools like **DVC** (Data Version Control) tracks datasets similarly to Git. Commit data references (hashes), not raw files. This enables reproducing exact training conditions.

## Experiment Tracking

**MLflow** or **Weights & Biases** track experiments: hyperparameters, metrics, artifacts (plots, models). View comparisons across experiments. Query: which hyperparameters gave best results?

These tools eliminate the chaos of spreadsheets and scattered notes. Experiments become reproducible and comparable.

## Model Serialization

Save trained models for deployment. **Pickle** in Python saves objects but is language-specific and potentially unsafe. **ONNX** (Open Neural Network Exchange) standardizes model format across libraries. **ModelDeploy** formats like MLflow Models bundle code and dependencies.

Include **model cards**: what data was used, performance metrics, limitations, intended use, creator, date. This documentation is crucial.

## Configuration Management

Hardcoded hyperparameters buried in code are hard to change. Use **config files** (YAML, JSON) to specify model parameters, data paths, hyperparameters. Code reads config, making it reusable across experiments.

Example YAML:
\`\`\`yaml
model:
  type: random_forest
  n_estimators: 100
  max_depth: 10
data:
  train_path: data/train_2024_01.csv
  test_path: data/test_2024_01.csv
\`\`\`

## Reproducibility Practices

Set random seeds (\`random_state\` in sklearn). Document environment (Python version, package versions). Use containerization (**Docker**) to freeze environment exactly.

Reproducibility isn't automatic—it requires discipline. But it's essential for science, debugging, and production systems.

## Drift Detection

When deployed, monitor whether training and production distributions differ. **Data drift** (feature distributions change) causes performance degradation. **Concept drift** (target distribution changes) means the problem itself changed.

Detect drift by monitoring feature statistics and model performance. High drift triggers retraining.

### Try It Yourself

Set up experiment tracking:

\`\`\`python
import mlflow

mlflow.start_run()

# Log hyperparameters
mlflow.log_params({
    'n_estimators': 100,
    'max_depth': 10,
    'learning_rate': 0.1
})

# Train model
model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)

# Log metrics
accuracy = model.score(X_test, y_test)
mlflow.log_metric('accuracy', accuracy)

# Save model
mlflow.sklearn.log_model(model, 'model')

mlflow.end_run()

# Later: query best experiment
best_run = mlflow.search_runs(order_by=['metrics.accuracy DESC']).iloc[0]
\`\`\`

> **Pro Tip:** Reproducibility and experiment tracking feel like overhead initially. They pay massive dividends: understanding what worked, why, and when. Start these practices early—it's far harder to retrofit later.`,
        suggestedResources: [
          {
            title: "Data Version Control (DVC)",
            url: "https://dvc.org/",
            type: "tool",
          },
          {
            title: "Weights & Biases Experiment Tracking",
            url: "https://wandb.ai/",
            type: "tool",
          },
        ],
        order: 1,
      },
      {
        id: "ml-l8-3",
        title: "Model Monitoring and Maintenance",
        description:
          "Keep models performing well in production through monitoring and retraining.",
        format: "project",
        durationMinutes: 90,
        objectives: [
          "Set up monitoring for model predictions and data quality",
          "Detect and respond to model performance degradation",
        ],
        keyPoints: [
          "Monitor prediction distributions; alert on unexpected shifts",
          "Track ground truth outcomes when available to detect drift",
          "Performance degradation: retraining, hyperparameter adjustment, or architecture change",
          "A/B testing validates new models before full deployment",
          "Shadow mode: run new model in parallel without affecting predictions",
        ],
        content: `## Model Monitoring and Maintenance: Keeping Models Healthy

A model deployed to production degrades over time. Data distributions shift, the world changes, competitors adapt. **Monitoring** detects degradation; **maintenance** keeps models fresh.

## Key Monitoring Metrics

**Model performance**: accuracy, precision, recall, AUC in production. Compare to baseline (previous model, human). Large drops signal problems.

**Business metrics**: the ultimate judges. If accuracy stays high but revenue drops, something's wrong upstream. Monitor metrics that matter to the business.

**Operational metrics**: latency (prediction time), throughput (predictions per second), error rate (failures). Even accurate models are useless if they're slow or fail constantly.

## Data Monitoring

**Feature distributions**: In production, feature statistics should match training. Monitor mean, std, min, max, quantiles. Differences signal data quality issues or distribution shift.

**Missing values**: Increasing NaN rates indicate upstream data pipeline problems. Set alerts if missing rate exceeds thresholds.

**Outliers**: Unusual values might be data errors or genuine new phenomena. Flag for investigation.

## Drift Detection

**Data drift**: feature distributions shift (loan amounts decrease during economic downturn). Model trained on historical data performs worse.

**Concept drift**: the relationship between features and target changes (prediction task changes). A fraud detector trained pre-COVID might fail post-COVID as fraud patterns changed.

Detect drift by comparing train and production distributions using statistical tests (Kolmogorov-Smirnov) or domain-specific checks.

## Triggering Retraining

Establish thresholds: if performance drops 5%, accuracy drops below 92%, or drift metrics exceed limits, automatically retrain on fresh data.

**Continuous training** periodically retrains models on recent data. **Trigger-based retraining** responds to detected problems. **Online learning** updates models incrementally with each new sample (when feasible).

## A/B Testing

Before replacing production model, **A/B test** new model: route some traffic to new model, rest to old. Compare performance. This catches edge cases and unexpected issues.

Statistical significance requires sufficient samples. A 0.1% improvement on 1 million predictions is significant; on 100 samples, it's noise.

## Rollback Procedures

When a deployed model fails, have **rollback procedures** ready. Keep previous model versions; revert quickly if issues arise. Minutes of poor performance are better than hours of investigation.

## Maintenance Workflows

- **Weekly**: Check key metrics, alert on anomalies
- **Monthly**: Review drift metrics, plan retraining if needed
- **Quarterly**: Refresh data, retrain on latest data, A/B test improvements
- **Yearly**: Large reviews, architectural changes, algorithm improvements

### Try It Yourself

Set up basic monitoring:

\`\`\`python
import pandas as pd
from scipy.stats import ks_2samp

# Compare train vs production data
train_features = X_train['age']
prod_features = X_prod['age']  # Current production data

# Statistical test for drift
statistic, p_value = ks_2samp(train_features, prod_features)
if p_value < 0.05:
    print("Data drift detected!")

# Monitor performance
accuracy_prod = model.score(X_prod, y_prod)
if accuracy_prod < 0.92:
    print("Accuracy below threshold! Consider retraining.")

# Log metrics
metrics = {
    'timestamp': datetime.now(),
    'accuracy': accuracy_prod,
    'n_samples': len(X_prod),
    'drift_p_value': p_value
}
# Send to monitoring system (Datadog, CloudWatch, etc.)
\`\`\`

> **Pro Tip:** Monitoring is where real ML engineering happens. Models in production are investment—protect them. Spend as much effort on monitoring as on model building. Early detection of problems prevents disasters.`,
        suggestedResources: [
          {
            title: "Model Monitoring Strategies",
            url: "https://www.tensorflow.org/tfx/guide/understanding_tfx_pipelines",
            type: "article",
          },
          {
            title: "Evidently: Model Monitoring",
            url: "https://www.evidentlyai.com/",
            type: "tool",
          },
        ],
        order: 2,
      },
    ],
    quiz: [
      {
        id: "ml-q8-1",
        type: "multiple-choice",
        question: "What is the primary purpose of A/B testing in ML deployment?",
        options: [
          "To train two models simultaneously",
          "To validate that a new model performs better before full deployment",
          "To split the training dataset",
          "To create multiple versions of features",
        ],
        correctAnswer: 1,
        explanation:
          "A/B testing compares model performance on real users to ensure improvements in the real world, not just in offline metrics.",
        points: 2,
      },
    ],
  },
];

const mlCurriculum: Curriculum = {
  id: "curriculum-ml-001",
  title: "Machine Learning Fundamentals",
  subtitle: "Master core ML concepts, algorithms, and practical project skills",
  description:
    "A comprehensive introduction to machine learning covering supervised and unsupervised learning, data preparation, feature engineering, model evaluation, and production considerations. Build a strong foundation with hands-on projects using Python, scikit-learn, and TensorFlow.",
  targetAudience:
    "Aspiring data scientists and engineers with basic Python knowledge who want to master machine learning fundamentals and build real-world projects.",
  difficulty: "intermediate",
  objectives: [
    "Understand core ML paradigms: supervised, unsupervised, and reinforcement learning",
    "Implement and compare algorithms: linear regression, logistic regression, decision trees, and ensemble methods",
    "Master data preparation: cleaning, exploration, feature engineering, and selection",
    "Apply proper evaluation: cross-validation, appropriate metrics, hyperparameter tuning",
    "Build production-ready ML systems with monitoring and maintenance",
  ],
  prerequisites: [
    "Python programming (functions, libraries like NumPy, Pandas)",
    "Basic statistics (mean, variance, distributions, correlation)",
    "Linear algebra fundamentals (vectors, matrices, matrix operations)",
  ],
  tags: ["AI/ML", "Python", "Data Science", "Supervised Learning", "Unsupervised Learning"],
  modules: mlFundamentalsModules,
  pacing: {
    style: "self-paced",
    totalHours: 42,
    hoursPerWeek: 6,
    totalWeeks: 7,
    weeklyPlan: [
      {
        week: 1,
        label: "Foundations",
        moduleIds: ["ml-m1"],
      },
      {
        week: 2,
        label: "Data Mastery",
        moduleIds: ["ml-m2"],
      },
      {
        week: 3,
        label: "Linear Models",
        moduleIds: ["ml-m3"],
      },
      {
        week: 4,
        label: "Classification",
        moduleIds: ["ml-m4"],
      },
      {
        week: 5,
        label: "Feature Engineering",
        moduleIds: ["ml-m5"],
      },
      {
        week: 6,
        label: "Validation & Tuning",
        moduleIds: ["ml-m6"],
      },
      {
        week: 7,
        label: "Unsupervised Learning & Production",
        moduleIds: ["ml-m7", "ml-m8"],
      },
    ],
  },
  bonusResources: [
    {
      id: "bonus-ml-1",
      title: "Kaggle Competitions: Practice Real-World Problems",
      type: "tool",
      url: "https://kaggle.com/competitions",
      description: "Apply your skills to real datasets and compete with other learners.",
      durationMinutes: 180,
      isFree: true,
    },
    {
      id: "bonus-ml-2",
      title: "Papers with Code: Latest ML Research",
      type: "article",
      url: "https://paperswithcode.com/",
      description: "Explore cutting-edge research papers with open-source implementations.",
      durationMinutes: 120,
      isFree: true,
    },
    {
      id: "bonus-ml-3",
      title: "Fast.ai: Practical Deep Learning Course",
      type: "video",
      url: "https://fast.ai/",
      description: "Top-down approach to deep learning after mastering ML fundamentals.",
      durationMinutes: 300,
      isFree: true,
    },
  ],
  createdBy: "ML Education Team",
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-03-29T00:00:00Z",
  version: "1.0.0",
};

// ─────────────────────────────────────────────────────────
// UX Research & Design Sprint — Abbreviated curriculum
// ─────────────────────────────────────────────────────────

const uxCurriculum: Curriculum = {
  id: "curriculum-ux-001",
  title: "UX Research & Design Sprint",
  subtitle: "Learn user-centered design through research and rapid prototyping",
  description:
    "Discover how to understand user needs through research and apply those insights in Design Sprints to rapidly prototype and test solutions. Combines foundational UX research methods with the practical Design Sprint framework.",
  targetAudience:
    "Product managers, designers, and entrepreneurs who want to apply evidence-based design thinking to create better user experiences.",
  difficulty: "beginner",
  objectives: [
    "Conduct user research with interviews, surveys, and usability testing",
    "Synthesize research into actionable insights and user personas",
    "Facilitate and execute 5-day Design Sprint for rapid prototyping",
    "Create wireframes and low-fidelity prototypes quickly",
    "Validate designs with real users through testing",
  ],
  prerequisites: [
    "Basic understanding of product development",
    "Familiarity with digital products or services",
  ],
  tags: ["Design", "UX", "Research", "Product", "User Testing"],
  modules: [
    {
      id: "ux-m1",
      title: "User Research Fundamentals",
      description: "Learn methods to understand your users and their needs.",
      objectives: [
        "Distinguish between qualitative and quantitative research",
        "Plan and conduct user interviews",
        "Create effective survey instruments",
      ],
      order: 0,
      durationMinutes: 165,
      lessons: [
        {
          id: "ux-l1-1",
          title: "Research Methods: Qualitative vs. Quantitative",
          description:
            "Understand the strengths and appropriate applications of different research approaches.",
          format: "reading",
          durationMinutes: 55,
          objectives: [
            "Compare qualitative and quantitative research methods",
            "Select appropriate research methods for your research questions",
          ],
          keyPoints: [
            "Qualitative research explores 'why' and 'how' through depth and detail",
            "Quantitative research measures 'what' and 'how many' through numbers",
            "Triangulation combines methods to validate findings from multiple angles",
            "Research ethics: informed consent, privacy, and minimizing harm",
            "User research requires recruitment, incentives, and proper documentation",
          ],
          content: `# Research Methods: Qualitative vs. Quantitative

Understanding your users is the foundation of effective design, but user research comes in many forms. Two fundamental approaches—**qualitative** and **quantitative** research—answer different questions and provide distinct types of insights that together create a complete picture of your users' needs, behaviors, and motivations.

## Qualitative Research: Understanding the Why

**Qualitative research** explores the depth and nuance of human experience. It answers questions like "Why do users avoid our checkout flow?" or "How do users think about saving money?" Through methods like interviews, contextual inquiry, and observations, qualitative research captures the rich details of user behavior in context.

The power of qualitative research lies in its ability to uncover **motivations, emotions, and mental models**. When you conduct an interview and ask a user to describe their workflow, you learn not just what they do, but why they do it. You discover their frustrations before they become support tickets and their unmet needs before your competitors find them. The iterative nature of qualitative methods—where follow-up questions lead to deeper insights—makes them invaluable for exploring new problem spaces or understanding surprising user behaviors.

However, qualitative findings apply to the specific individuals you studied. You cannot say "70% of our users prefer this feature" based on five interviews. That's where quantitative research enters.

## Quantitative Research: Understanding the Scale

**Quantitative research** measures prevalence, frequency, and statistical relationships across large populations. It answers questions like "What percentage of users encounter errors in our signup process?" or "Is Feature A preferred over Feature B?" Through surveys, analytics, and experiments, quantitative research provides the statistical confidence you need to make business decisions.

The strength of quantitative methods is their **generalizability and reliability**. If you survey 500 users and 60% report a specific pain point, you can confidently say this matters to your market. Quantitative research also excels at measuring the **impact of changes**—did your redesign reduce page load time? Did your new onboarding flow improve retention? Analytics provide the answer.

The challenge is depth: a survey might tell you that users are frustrated, but it won't tell you why or how they currently solve the problem.

## Triangulation: Combining Methods for Richer Insights

The most effective research strategies combine qualitative and quantitative approaches. This practice, called **triangulation**, lets you:

- Use qualitative research to identify potential problems and generate hypotheses
- Use quantitative research to validate those hypotheses across your user base
- Use qualitative follow-up interviews to understand why the quantitative patterns exist

For example: A/B test results show that Version B gets 15% higher conversion (quantitative), but user interviews with visitors who saw Version B explain that they found the new layout more intuitive and discovered features they didn't know existed (qualitative).

## Research Ethics: Protecting Your Users

Conducting research ethically is not optional—it's fundamental to good design practice. **Informed consent** means users understand what you're studying and how you'll use their data. **Privacy protection** means storing user information securely and following data regulations like GDPR. **Minimizing harm** means recognizing that your research methods—especially those exploring sensitive topics—can affect participants.

Research ethics also means transparency with stakeholders. Misrepresenting research findings or cherry-picking data to support predetermined conclusions undermines the entire purpose of user research.

### Try It Yourself

1. **Define your research question** — Pick a feature or workflow in a product you use. Write down a specific question you'd like to answer: "Why do users abandon their carts?" vs. "What percentage of users complete purchase on mobile?"
2. **Match method to question** — For your question, would qualitative or quantitative research be more helpful? Why?
3. **Design recruitment** — For either method, list what characteristics your ideal participants should have and where you'd find them.

> **Pro Tip:** Start with qualitative research when entering a new domain. Five well-conducted user interviews will teach you more about an unfamiliar user segment than any survey. Once you understand the landscape, use quantitative methods to measure prevalence and validate patterns.`,
          suggestedResources: [
            {
              title: "User Research Guide — Nielsen Norman Group",
              url: "https://www.nngroup.com/articles/user-research-methods/",
              type: "article",
            },
            {
              title: "Handbook of Usability Testing",
              url: "https://www.nngroup.com/books/handbook-usability-testing-second-edition/",
              type: "book",
            },
          ],
          order: 0,
        },
        {
          id: "ux-l1-2",
          title: "Conducting Effective User Interviews",
          description:
            "Master the art of listening and asking questions to uncover user insights.",
          format: "interactive",
          durationMinutes: 110,
          objectives: [
            "Write interview guides with open-ended questions",
            "Conduct interviews with minimal bias and maximum insight",
          ],
          keyPoints: [
            "Open-ended questions elicit detailed responses; avoid yes/no questions",
            "Active listening: focus on understanding, not defending product",
            "Follow-up probes: 'Tell me more about...', 'Why did you...?'",
            "Recruit diverse participants representing your target users",
            "Document insights systematically: transcription, notes, video",
          ],
          content: `# Conducting Effective User Interviews

One-on-one user interviews are the gold standard of qualitative research. There's simply no substitute for sitting down with a real user, listening to their stories, and asking thoughtful follow-up questions. Effective interviews reveal not just what users do, but why they do it—and often, what they didn't even know they needed.

## The Power of Open-Ended Questions

The difference between a useful interview and a wasted hour often comes down to how you ask questions. **Open-ended questions** invite elaboration: "Tell me about a time when you tried to return an item online." These questions typically start with "How," "What," "Tell me about," or "Describe for me."

**Closed questions** shut down conversation: "Did you find that confusing?" or "Is our checkout easy?" Users will answer yes or no, and the conversation ends. Even worse, closed questions can bias responses—many users default to polite agreement rather than honest feedback.

The best interview guides contain mostly open-ended questions. You're not testing whether users can use your product (that's usability testing). You're exploring their mental models, needs, workflows, and pain points. Every question should give them space to think, reflect, and share stories.

## Active Listening: The Interview Superpower

Most people are trained to respond, defend, or explain. In a user interview, you must **listen without judgment**. This means:

- **Listening to understand**, not listening to reply. Don't plan your next question while they're talking.
- **Focusing on the user**, not on defending your product. If they say something negative about your design, that's data, not criticism.
- **Creating comfort**, so users feel safe being honest. This means warm body language, eye contact, and validating their experiences: "That's really helpful to know."

Active listening also means noticing **emotional cues**. When someone's voice changes, when they hesitate, when they light up—these moments often contain the deepest insights.

## Powerful Follow-Up Techniques

After an open-ended question, follow-up probes go deeper:

- **"Tell me more about that..."** — Invites elaboration on something interesting they just said.
- **"Why was that important to you?"** — Uncovers motivations and values.
- **"How did you feel when that happened?"** — Explores emotional responses and frustration points.
- **"What did you do next?"** — Traces the complete user journey, including workarounds.
- **"Have you ever experienced anything similar?"** — Builds patterns across their experiences.

These probes sound natural in conversation, not scripted. The best interviews feel like engaging conversations where the user wants to share because you're genuinely curious.

## Recruiting the Right Participants

Interviews are only as valuable as the participants you recruit. **Diversity matters**—not just demographic diversity (age, gender, location) but also **behavioral diversity**: power users and novices, early adopters and skeptics, people who love your product and people who hate it.

Target the **specific segment** you're trying to understand. If you're researching mobile payment adoption, recruiting only smartphone enthusiasts won't tell you why others aren't adopting. If you're studying accessibility needs, recruiting only non-disabled users wastes everyone's time.

Offer **reasonable incentives**: money, gift cards, or services. Compensating participants respects their time and often yields better, more honest feedback. Uncompensated interviews tend to attract only the most passionate users—and the most opinionated ones—skewing your sample.

## Documentation: Capturing the Gold

You'll forget most of what you heard in an interview within hours. **Document systematically**:

- **Audio or video recording** (with permission) — Allows you to review exact phrasing and tone later. Quote users directly in reports—their exact words are more powerful than paraphrasing.
- **Live notes** — Jot down key phrases, quotes, and observations during the interview. Note emotional moments and contradictions.
- **Transcription** — For important interviews, full transcripts enable careful analysis and sharing with your team.
- **Debrief immediately** — After the interview, while memory is fresh, write down your immediate impressions and key themes you noticed.

### Try It Yourself

1. **Develop an interview guide** — Write 6-8 open-ended questions about a daily activity (how you choose what to eat, how you decide what to buy). Notice how the questions feel.
2. **Conduct a practice interview** — Ask a friend the questions. Record audio or video (with permission). Notice when you want to defend an idea instead of listening.
3. **Review your recording** — Listen back and count how many times you asked closed questions or interrupted. Reflect on what you could improve.

> **Pro Tip:** Never interview your own coworkers or close friends unless absolutely necessary. They often tell you what they think you want to hear, not what they truly think. Genuine user feedback comes from people with no stake in your success.`,
          suggestedResources: [
            {
              title: "User Interview Best Practices — NN/g",
              url: "https://www.nngroup.com/articles/user-interviews/",
              type: "article",
            },
            {
              title: "Interviewing Users — Steve Krug",
              url: "https://www.sensible.com/rocket-surgery/",
              type: "book",
            },
          ],
          order: 1,
        },
      ],
      quiz: [
        {
          id: "ux-q1-1",
          type: "multiple-choice",
          question: "When should you use quantitative research methods?",
          options: [
            "When you want to deeply understand motivations",
            "When you need to measure prevalence or frequency across a population",
            "When you have a small budget",
            "When you don't know what questions to ask yet",
          ],
          correctAnswer: 1,
          explanation:
            "Quantitative research is ideal for measuring how widespread a behavior or preference is across your target audience.",
          points: 2,
        },
      ],
    },
    {
      id: "ux-m2",
      title: "Insights and Personas",
      description: "Synthesize research into clear user personas and actionable insights.",
      objectives: [
        "Identify patterns and themes from research data",
        "Create realistic and actionable user personas",
        "Develop empathy maps and jobs-to-be-done statements",
      ],
      order: 1,
      durationMinutes: 150,
      lessons: [
        {
          id: "ux-l2-1",
          title: "Synthesizing User Research Data",
          description:
            "Transform raw research into themes, patterns, and actionable insights.",
          format: "video",
          durationMinutes: 50,
          objectives: [
            "Code qualitative data to identify themes",
            "Cluster insights into meaningful categories",
          ],
          keyPoints: [
            "Affinity mapping: group sticky notes (insights) into related clusters",
            "Code data: tag similar insights with consistent labels",
            "Look for patterns: contradictions, agreements, surprising discoveries",
            "Quote users directly when creating personas and presenting findings",
            "Validate themes by checking if they resonate with stakeholders",
          ],
          content: `# Synthesizing User Research Data

You've conducted your interviews, surveys, and observations. You have pages of notes, video recordings, and survey responses. Now what? **Research synthesis** is the process of transforming that raw data into actionable insights—the themes, patterns, and surprising discoveries that will inform your design decisions.

## From Raw Data to Themes: The Coding Process

**Coding** means systematically labeling insights with consistent tags. You might code interview transcripts by marking every mention of "time pressure" with one color, "confusion about pricing" with another, and "frustrated with mobile" with a third.

The goal isn't perfection—it's to make patterns visible. As you code more data, you'll refine your codes. A code that seemed distinct ("password reset is hard") might merge with a broader code ("authentication friction"). New codes emerge as you discover unexpected themes.

Tools like Dovetail or Otter automate parts of this process, but many teams start with the simplest approach: **print out interview quotes, cut them into individual sticky notes, and physically arrange them on a wall**. This tactile approach forces you to confront every data point and makes patterns impossible to miss.

## Affinity Mapping: Finding Structure in Chaos

**Affinity mapping** is the team version of synthesis. In a typical affinity mapping session:

1. Team members place sticky notes (one insight per note) on a large wall or table
2. The group collectively moves notes into piles based on similarity
3. These piles gradually reveal broader clusters—themes that emerge from the data
4. Each cluster gets a descriptive label

This exercise is powerful because it surfaces different interpretations. When team members disagree about which cluster a note belongs to, that disagreement reveals assumptions worth examining. A product manager might see "I have to call support" as a customer service opportunity; an engineer sees it as a documentation failure. Both perspectives are data.

Affinity mapping also builds shared understanding. Instead of one researcher presenting findings, the entire team engages in discovery together. When people help build the synthesis, they own the insights.

## Pattern Recognition: The Art and the Science

Pattern recognition combines systematic coding with intuition and domain knowledge. You're looking for:

- **Consensus themes** — Multiple users mention the same pain point or desire
- **Contradictions** — Different users have opposite needs or behaviors. Who's right? Maybe both: different segments need different solutions.
- **Surprising discoveries** — Something no one predicted. These are often the most valuable insights because they challenge assumptions.
- **Intensity** — Some themes emerge because multiple people care deeply, not just because multiple people mentioned them.

Watch for your own biases. If you expected users to struggle with X, you might over-code for it. If something contradicts your beliefs, you might dismiss it. The best synthesis happens when diverse team members challenge each other's interpretations.

## Using Direct Quotes to Bring Research to Life

Numbers tell one story; user quotes tell another. "75% of users experienced errors in checkout" is data. "I almost gave up three times during checkout—I thought my card was declined and I couldn't find the order confirmation" is a user story that makes you feel the problem.

**Quote users directly** in your synthesis documents, personas, and design presentations. Include their exact words, even if imperfect grammar. Real quotes are more persuasive than polished paraphrasing. When stakeholders hear authentic user voices, they remember the insight and feel motivated to solve the problem.

Ethical practice: Always ask permission before using someone's quote in public presentations. Anonymize details that could identify them, unless they've explicitly agreed to attribution.

## Validating Your Themes: Reality Check

After you've identified themes, sense-check them with other team members and, ideally, with additional users. Ask:

- Do these themes ring true to customer support teams, who interact with users daily?
- Do they align with behavioral data from analytics?
- Do new research participants confirm these patterns, or do they introduce new themes?

Validation doesn't mean unanimous agreement—you might have discovered a real pattern that some team members resist because it challenges their vision. But validation means the pattern is real, grounded in data, and not a projection of your own assumptions.

### Try It Yourself

1. **Collect raw data** — Record yourself or a friend describing their morning routine (how they wake up, get ready, eat breakfast). Aim for 5-10 minutes of natural conversation.
2. **Transcribe and code** — Write down the transcript. Use three different colors of highlighter to mark insights about different themes you notice.
3. **Affinity map with sticky notes** — Extract 10-15 key quotes or observations. Write each on a separate sticky note. Arrange them into clusters. What themes emerge?
4. **Create a theme summary** — For each cluster, write a descriptive label and list the data points supporting it.

> **Pro Tip:** Include perspectives from people who were not in the research. Your customer support team, sales team, or even customers who weren't interviewed might see patterns you missed. Fresh eyes catch blind spots.`,
          suggestedResources: [
            {
              title: "Synthesis Techniques — NN/g",
              url: "https://www.nngroup.com/articles/user-research-synthesis/",
              type: "article",
            },
            {
              title: "Affinity Mapping",
              url: "https://www.nngroup.com/articles/affinity-diagram/",
              type: "article",
            },
          ],
          order: 0,
        },
        {
          id: "ux-l2-2",
          title: "Creating Compelling User Personas",
          description:
            "Build realistic representations of your users to guide design decisions.",
          format: "project",
          durationMinutes: 100,
          objectives: [
            "Design personas that reflect research findings",
            "Use personas to inform design thinking and decisions",
          ],
          keyPoints: [
            "Personas should be data-driven, not fictional stereotypes",
            "Include goals, pain points, behaviors, and context",
            "Name personas to make them memorable and relatable",
            "Avoid perfection: realistic personas have strengths and flaws",
            "Create 3-5 primary personas representing key segments",
          ],
          content: `# Creating Compelling User Personas

A user persona is a realistic representation of a segment of your users. Unlike an average user (which doesn't actually exist), a persona represents a distinct type of person with specific goals, behaviors, and frustrations. Personas make abstract research findings concrete and actionable. They help teams make decisions aligned with real user needs.

## From Research to Persona: Data-Driven, Not Fictional

Many companies create "personas" that are actually stereotypes—invented characters that reflect what the team assumes users are like. Real personas are **grounded in research data**. Every detail in an effective persona came from your interviews, surveys, or analytics.

Your research synthesis identified themes and segments. Each persona represents one segment. If your affinity mapping revealed that some users are "pragmatic minimalists" (want the fastest solution) while others are "feature explorers" (want to understand all options), you have two personas.

Include the **evidence** backing each persona detail. "Sarah is a busy executive" is vague. "Sarah manages eight people and checks email every 15 minutes during work hours" is specific and based on data. "Sarah has mentioned time pressure in 5 of our 8 interviews with busy executives" is transparent about the evidence.

## What to Include: Goals, Pain Points, Behaviors, Context

Effective personas contain:

- **Behavioral patterns** — How do they currently accomplish the task? Do they use analogous products? What tools do they prefer?
- **Goals and motivations** — What are they trying to achieve? Why does it matter to them?
- **Pain points** — What's frustrating or difficult about their current approach? Where do they struggle?
- **Technology comfort** — Are they early adopters or late adopters? Do they prefer simple or feature-rich solutions?
- **Context** — Where are they when they use your product? Are they multitasking or focused? Are they on mobile, desktop, or both?
- **Success metrics** — How would they define success? What would delight them?

Avoid including details unrelated to your product or research. Personas don't need favorite colors, hobbies, or demographic data unless those factors actually influence how they use your product. Overly detailed personas encourage people to treat personas as characters rather than research summaries.

## Naming Personas: Making Them Real and Memorable

A persona named "Power User" is forgettable. A persona named "Samira, the Efficient Operator" sticks in memory. **Names should sound like real people** and hint at their archetype.

Personas often include a small photo—a stock photo of a real person, not a designer's illustration. This visual representation makes personas more memorable and makes it harder for teams to dismiss them as invented characters. (Always use stock photos with proper licensing, or your team's own diverse colleagues if they're willing.)

Some teams use a short tagline: "Samira gets things done fast. She doesn't tolerate friction." This one-liner helps teams quickly remember the persona's core priority.

## Avoid the Perfection Trap: Real Personas Have Flaws

Ineffective personas are idealized—"The perfect user who knows exactly what they want and uses our product exactly how we designed it." **Real personas are complex**. They have contradictions, limited knowledge, competing priorities, and sometimes make inefficient choices.

A persona might be tech-savvy but impatient—they'll try new features quickly but abandon them if they don't immediately deliver value. Or they're motivated by cost-savings but willing to pay for premium support. Or they love your product's core feature but never use the advanced options because they don't understand them.

These flaws and contradictions are data. They tell you where your design must accommodate real human behavior, not ideal behavior.

## Primary vs. Secondary Personas: Start with 3-5

Most products have 3-5 primary personas representing your core user segments. Primary personas are the people you're optimizing for. If you optimize for everyone equally, you optimize for no one.

Secondary personas represent important edge cases: power users, new users, accessibility-focused users, or users in specific contexts. You don't optimize for them, but you design in ways that don't exclude them.

Some research identifies anti-personas: users who should NOT be your focus. A budgeting app might identify "people who want zero financial discipline" as an anti-persona. That understanding helps you say no to feature requests that would distract from your core value.

## Using Personas to Guide Design

Once created, personas should be visible and referenced constantly:

- Print personas and post them in your design space
- Reference them in design critiques: "Is this optimized for Samira's workflow?"
- Consult them when prioritizing features
- Use them to inform interaction patterns: should the UI assume expertise or guide new users?
- Test with participants matching your personas—see if your design assumptions hold

Personas lose value if they're created, presented once, and archived. Living personas are consulted regularly and evolve as you learn more about your users.

### Try It Yourself

1. **Identify a segment** — From research data (real or imagined), pick one user segment: busy professionals, budget-conscious shoppers, or another group.
2. **Create a persona** — Write a 1-page description including their goal, main pain point, current workflow, tech comfort, and success metric. Give them a realistic name.
3. **Test it** — Describe the persona to someone who interacts with users (customer support, sales). Do they recognize this person? What details surprised them or seemed wrong?
4. **Refine** — Based on feedback, adjust the persona with more specific details or different characteristics.

> **Pro Tip:** Regularly update personas as you collect new research. Personas are hypotheses about your users, and hypotheses improve with evidence. Quarterly research reviews should confirm or adjust personas—especially if your product attracts new user segments or your market evolves.`,
          suggestedResources: [
            {
              title: "Personas — NN/g",
              url: "https://www.nngroup.com/articles/persona/",
              type: "article",
            },
            {
              title: "Empathy Maps",
              url: "https://www.nngroup.com/articles/empathy-mapping/",
              type: "article",
            },
          ],
          order: 1,
        },
      ],
      quiz: [
        {
          id: "ux-q2-1",
          type: "multiple-choice",
          question: "What makes a persona effective for guiding design?",
          options: [
            "It should be based on research data and real user patterns",
            "It should be detailed and include everything about the user",
            "It should represent an average user",
            "It should be as fictional as possible for creativity",
          ],
          correctAnswer: 0,
          explanation:
            "Effective personas are grounded in research data and represent distinct user segments, helping designers and teams make decisions aligned with real user needs.",
          points: 2,
        },
      ],
    },
    {
      id: "ux-m3",
      title: "Design Sprint Execution",
      description: "Facilitate a rapid 5-day design process to create and test prototypes.",
      objectives: [
        "Plan and facilitate a 5-day Design Sprint",
        "Create low-fidelity prototypes quickly",
        "Test prototypes with real users and gather feedback",
      ],
      order: 2,
      durationMinutes: 180,
      lessons: [
        {
          id: "ux-l3-1",
          title: "Design Sprint Overview and Planning",
          description:
            "Understand the Design Sprint framework and prepare your team for success.",
          format: "video",
          durationMinutes: 60,
          objectives: [
            "Understand each day of the Design Sprint",
            "Prepare materials and schedule for a sprint",
          ],
          keyPoints: [
            "Monday: Map the problem and select focus area",
            "Tuesday: Sketch competing solutions individually",
            "Wednesday: Decide on solution approach through voting",
            "Thursday: Build a realistic prototype",
            "Friday: Test with real users and gather feedback",
            "Facilitator role: keep energy up, enforce timeboxes, ensure participation",
          ],
          content: `# Design Sprint Overview and Planning

A **Design Sprint** is a structured five-day process for solving problems and testing solutions quickly. Instead of debating ideas in meetings for weeks, sprints compress research, ideation, prototyping, and testing into an intensive, focused week. The method was developed at Google and has become standard practice for product teams wanting to validate ideas before investing in full development.

## Why a Sprint? The Power of Rapid Iteration

Design sprints work because they **constrain scope and time**. With unlimited time, teams endlessly refine, debate, and modify. With a five-day deadline, you make decisions, create something testable, and learn from real users. You fail fast and cheaply, pivoting before you've invested months in development.

Sprints are ideal when:
- You're tackling a new problem or market
- Key stakeholders disagree about the best solution
- You want to validate an idea before major investment
- You want to explore multiple competing solutions side-by-side

The sprint doesn't replace traditional development—it comes before it. Sprint outcomes inform which direction deserves full investment.

## Monday: Mapping and Focus

**Monday** starts with alignment. You map the problem: What is the core challenge? What are we trying to solve? What success looks like? Who are the users?

By day's end, the team selects a **focus area**—the specific part of the problem you'll tackle. You won't solve everything in five days. You might focus on: "How do new users discover premium features?" or "How do we reduce mobile checkout abandonment?" This focused scope makes progress possible.

Preparation is crucial: Have your user research, personas, and competitive analysis ready. Share it Monday morning so everyone's building on shared understanding.

## Tuesday: Sketching and Ideation

**Tuesday** is about **individual sketching**. Don't brainstorm as a group yet. Instead, each person sketches their own solution ideas—rough, quick sketches, not polished designs. Paper and pen are fine.

Why individual work? Groupthink is real. The loudest voice in the room often dominates brainstorming, and group dynamics suppress unconventional ideas. When everyone sketches alone first, you surface diverse ideas. That quiet designer who usually stays silent might sketch the most elegant solution.

Sketches should be low-detail: "user logs in" → "sees recommendation" → "clicks to learn more" → "sees details." The goal is rapid exploration of multiple approaches, not finished design.

## Wednesday: Deciding Together

**Wednesday** is decision day. The team reviews all sketches, discusses the approaches, and votes on which solution to prototype. Often, you combine elements from multiple sketches—the best entry flow from one, the clearest information architecture from another.

**Voting democratizes decision-making**. Rather than the most senior person choosing, everyone votes silently and discusses why each idea appeals to them. This surfaces different perspectives: "I voted for Sketch 3 because it minimizes steps, but Sketch 1 is clearer for first-time users—maybe we blend them?"

By end of Wednesday, you've committed to a direction. No more second-guessing during building.

## Thursday: Prototyping Fast

**Thursday**, you build a **prototype**—something realistic enough to test but quick enough to complete in a day. Your prototype doesn't need to be fully functional. A clickable prototype in Figma, a video walkthrough, even an Invision prototype with static screens—anything testable works.

Key principle: **Make it realistic but incomplete**. Test participants can't evaluate your solution if it looks rough, but you're wasting time polishing details. Prototype the core experience and UI patterns, but leave secondary features out.

Realistic means: genuine product data, not lorem ipsum. Use real customer names, real product images, real pricing. Participants evaluate more honestly when the prototype feels real.

## Friday: Testing and Learning

**Friday morning**, you recruit 5-6 test participants and conduct moderated testing sessions. In the afternoon, you debrief: What worked? What confused people? Where did they expect different behavior?

This isn't a formal usability study. It's a quick learning session. You're not gathering statistically significant data; you're getting qualitative feedback that informs next steps. Is the overall direction sound, or did testing reveal fundamental misunderstandings?

After Friday, you have a decision: continue developing this solution, pivot based on feedback, or abandon the direction and sprint on an alternative.

## The Facilitator: Timekeeper and Energy Manager

A good **sprint facilitator** is crucial. They're responsible for:

- **Keeping pace** — Enforcing timeboxes so you don't get stuck on Monday's problem definition
- **Managing energy** — Keeping morale up during intense week, taking breaks, celebrating progress
- **Ensuring participation** — Making sure quieter voices are heard, preventing any one person from dominating
- **Removing blockers** — Tracking decisions, preventing scope creep, ensuring necessary resources are available
- **Documentation** — Capturing outcomes and key insights for teams who weren't in the sprint

Facilitators should be respected but neutral—ideally not strongly attached to any particular solution. They ask questions to surface thinking rather than pushing their own opinions.

## Preparing for Your Sprint

Success starts before Monday:

- **Gather data** — Have research, personas, competitive analysis, and context ready
- **Assemble the team** — Include decision-makers, design/product, engineering, and ideally customer-facing roles
- **Book the space** — You need a room with walls for sketches and prototypes, sticky notes, whiteboards
- **Schedule users** — Before the sprint starts, recruit 5-6 test participants for Friday
- **Communicate timeline** — Everyone should know they're unavailable Monday-Friday for other meetings

### Try It Yourself

1. **Choose a sprint challenge** — Pick a real problem: "How can we make onboarding faster?" or "How do we encourage feature discovery?"
2. **Plan your Monday** — Write an agenda: problem definition (30 min), research review (45 min), focus selection (30 min)
3. **Draft a prototype brief** — By Wednesday evening, write one paragraph describing the solution you'll build Thursday
4. **Create a test guide** — Write 5-6 tasks and questions you'd ask test participants Friday

> **Pro Tip:** Run your first sprint with a small problem, not a company-critical one. Learn the rhythm when stakes are lower. Then run bigger sprints with confidence.`,
          suggestedResources: [
            {
              title: "Design Sprint by Google",
              url: "https://www.designsprintkit.withgoogle.com/",
              type: "interactive",
            },
            {
              title: "Sprint Book by Jake Knapp",
              url: "https://www.thesprintbook.com/",
              type: "book",
            },
          ],
          order: 0,
        },
        {
          id: "ux-l3-2",
          title: "Prototyping and User Testing",
          description:
            "Create prototypes and validate solutions with real users quickly.",
          format: "project",
          durationMinutes: 120,
          objectives: [
            "Build low-fidelity prototypes for testing",
            "Conduct moderated usability testing sessions",
          ],
          keyPoints: [
            "Prototype fidelity should match testing goals: low-fi for concepts, hi-fi for details",
            "Tools: Figma, Adobe XD, or even paper prototypes are valid",
            "Recruit 5 diverse users; observe their interactions",
            "Ask open questions: 'What are you thinking?', 'How would you do X?'",
            "Analyze patterns: which features confused users? What delighted them?",
          ],
          content: `# Prototyping and User Testing

Moving from design sprint sketches to a testable prototype and then validating that prototype with real users is where design thinking becomes real insight. Prototyping is iterative: you create something, test it, learn what works and what doesn't, and improve. The faster you cycle through this process, the faster you learn which direction to pursue.

## Matching Prototype Fidelity to Your Goals

**Fidelity** refers to how finished and detailed your prototype looks and functions. Different testing goals demand different fidelity levels.

**Low-fidelity prototypes** (paper sketches, wireframes, simple clickable prototypes) test the *concept*. Is this general approach resonating with users? Do they understand the core idea? Test before investing in detailed visual design. This is perfect for design sprint prototypes where you have limited time.

**Medium-fidelity prototypes** (Figma mockups with basic interactions, rough visual design) test the *interaction and information architecture*. Is the flow intuitive? Do people find information in expected places? This works for testing with small groups before design refinement.

**High-fidelity prototypes** (pixel-perfect mockups, animation, realistic content) test the *details*. Does the visual hierarchy guide attention? Does the design feel professional? When does aesthetic matter? When testing with stakeholders or investors, high-fidelity helps them imagine the finished product. When testing with users exploring concepts, it's wasted effort.

**A common mistake**: Creating high-fidelity prototypes before you've tested the core idea. You spend days making everything look perfect, only to learn the fundamental approach doesn't resonate. Build low-fidelity first, validate direction, then invest in details.

## Tools for Prototyping

You have many options:

- **Figma** — Excellent for interactive prototypes. Create screens, add hotspots and flows, share a link with testers.
- **Adobe XD** — Similar to Figma, strong prototyping features, good for transitions and animations.
- **Paper and pen** — Surprisingly effective. Users understand you're testing the concept, not the visual design. Useful for early ideation.
- **Protopie, Framer, Webflow** — Specialized prototyping tools for more complex interactions.
- **Video walkthrough** — For complex flows, record yourself explaining the concept while clicking through a slide deck. Narration bridges gaps in the prototype.
- **Coded prototype** — For testing highly interactive experiences, HTML/CSS/JavaScript gives maximum fidelity.

Choose tools matching your timeline and testing depth. A design sprint prototype in Figma is fast enough. A venture pitch needs more polish.

## Recruiting Test Participants: Small and Diverse

You don't need hundreds of test participants. **Nielsen Norman research shows that 5 users uncover about 85% of usability issues**. More users add diminishing returns. With 5 testers, you identify most problems. With 10 testers, you're mostly confirming what you learned from the first 5.

**Diversity matters more than size**. Five participants who represent different use cases, expertise levels, and contexts reveal more than five homogeneous participants. If you're designing for busy professionals and casual users, include both.

Recruit people matching your personas. If you're testing an app for remote workers, recruit actual remote workers—not office workers imagining remote work. Recruit a mix: people who've used similar products, people new to the category, power users, and casual users.

Offer **compensation**: \$50-100 gift cards are standard, making recruitment easier and signaling respect for participants' time. Compensated participants are more willing to give honest feedback than volunteers motivated by niceness.

## Moderated Testing: The Gold Standard

**Moderated usability testing** means you're present (in-person or via Zoom) watching someone use your prototype and asking questions. This is different from unmoderated testing (where users record themselves), which works for quick feedback but loses the nuance of observing confusion in real-time.

In a moderated session:

1. **Set context** — Explain the task: "Imagine you're looking for a way to track your podcast subscriptions. Here's our prototype. Try to accomplish this task..."
2. **Observe silently** — Let them interact without guidance. Resist the urge to help when they struggle; their struggle is data.
3. **Ask open questions** — "What were you thinking when you clicked there?" "Why did you try that approach?" "What would you do next?" These questions reveal their mental model, not just their actions.
4. **Probe deeper** — "Tell me more about that" when something interesting happens.
5. **Identify blockers** — Note where they got stuck, confused, or frustrated. These are design opportunities.

**Never defend the design.** When a tester says "This button is confusing," don't explain why you designed it that way. Their confusion is feedback, not criticism.

Record sessions (with permission) so you can review them later and spot details you missed in the moment. Watch for non-verbal cues: hesitation, frustration, delight. These moments reveal authentic reactions.

## Analyzing Patterns: From Observations to Insights

After testing all 5 participants, you'll have pages of notes and video recordings. Look for **patterns**:

- **Consensus problems** — All 5 users struggled with the same task. This is a clear design issue.
- **Segment-specific problems** — Three power users breezed through; two new users were confused. This suggests you need better onboarding or progressive disclosure.
- **Delights** — Where did users smile, nod in satisfaction, or express surprise positively? Amplify those.
- **Unexpected uses** — Did users try to accomplish the task differently than you expected? Maybe your mental model differs from theirs.

Avoid over-generalizing from small sample sizes. "All users wanted X" from 5 people means "these 5 people wanted X"—it's insightful but not statistical proof. Quantitative research with larger samples provides different insight.

Quote users directly in your report. "When I saw the modal pop up, I thought I was supposed to fill it out before I could continue" is more compelling than "Users found the modal jarring."

## From Testing to Iteration

Testing insights fuel the next cycle. Did testing validate your direction? Great—move forward with confidence. Did it reveal fundamental issues? Pivot. Did it surface specific problems with solutions? Iterate.

Common outcomes:

- **"This direction works; let's refine details"** — Move to higher-fidelity design and development.
- **"The core concept doesn't resonate"** — Run another design sprint exploring alternatives.
- **"They don't understand this feature"** — Redesign onboarding or simplify the feature itself.
- **"Everyone wants Feature X, not Feature Y"** — Adjust priorities; rebalance development resources.

The speed of this cycle is your competitive advantage. While competitors debate for months, you've tested with users and already refined your approach.

### Try It Yourself

1. **Build a quick prototype** — Using Figma or paper, create a low-fidelity prototype of a task: signing up, searching, or checking out. Aim for 30 minutes of work—rough is fine.
2. **Write a test script** — Draft 4-5 tasks for testers and 5-6 open-ended questions about their experience.
3. **Test with one person** — Recruit a friend or colleague matching your target user. Conduct a 30-minute session, asking them to complete tasks while narrating their thinking.
4. **Identify patterns** — What confused them? What delighted them? What would you change based on this one test?

> **Pro Tip:** The first test always generates the most insights. You'll feel tempted to make changes between Test 1 and Test 2. Resist. Test all 5 first, then analyze patterns together. Individual quirks from Test 1 often don't represent real problems—run at least three tests before making changes.`,
          suggestedResources: [
            {
              title: "Prototyping Techniques",
              url: "https://www.nngroup.com/articles/uxpa_prototyping/",
              type: "article",
            },
            {
              title: "Usability Testing Best Practices",
              url: "https://www.nngroup.com/articles/usability-testing-101/",
              type: "article",
            },
          ],
          order: 1,
        },
      ],
      quiz: [
        {
          id: "ux-q3-1",
          type: "multiple-choice",
          question: "How many test users do you need for a Design Sprint?",
          options: [
            "Ideally 5 per sprint for identifying major usability issues",
            "At least 30 for statistical significance",
            "1-2 is enough for quick feedback",
            "As many as your budget allows",
          ],
          correctAnswer: 0,
          explanation:
            "Nielsen Norman research shows that 5 users uncover approximately 85% of usability issues. More users add diminishing returns for iterative testing.",
          points: 2,
        },
      ],
    },
  ],
  pacing: {
    style: "instructor-led",
    totalHours: 22,
    hoursPerWeek: 5.5,
    totalWeeks: 4,
    weeklyPlan: [
      {
        week: 1,
        label: "Research Methods",
        moduleIds: ["ux-m1"],
      },
      {
        week: 2,
        label: "Synthesis & Personas",
        moduleIds: ["ux-m2"],
      },
      {
        week: 3,
        label: "Design Sprint",
        moduleIds: ["ux-m3"],
      },
    ],
  },
  bonusResources: [
    {
      id: "bonus-ux-1",
      title: "Remote Research Toolkit",
      type: "template",
      url: "https://www.nngroup.com/articles/remote-usability-test-setup/",
      description: "Conduct user research and testing remotely with confidence.",
      durationMinutes: 90,
      isFree: true,
    },
  ],
  createdBy: "UX Education Team",
  createdAt: "2026-02-01T10:00:00Z",
  updatedAt: "2026-03-29T00:00:00Z",
  version: "1.0.0",
};

// ─────────────────────────────────────────────────────────
// Advanced TypeScript Patterns — Abbreviated curriculum
// ─────────────────────────────────────────────────────────

const tsCurriculum: Curriculum = {
  id: "curriculum-ts-001",
  title: "Advanced TypeScript Patterns",
  subtitle: "Master type systems, design patterns, and production architecture",
  description:
    "Elevate your TypeScript expertise with advanced type system features, architectural patterns, and best practices for building maintainable, type-safe applications at scale.",
  targetAudience:
    "Experienced TypeScript developers who want to master advanced type system features and design patterns for building robust, scalable applications.",
  difficulty: "advanced",
  objectives: [
    "Master advanced TypeScript features: generics, conditional types, mapped types, and type inference",
    "Implement architectural patterns: dependency injection, factory, builder, and repository patterns",
    "Design resilient error handling and validation strategies",
    "Apply principles of SOLID and clean architecture to TypeScript projects",
    "Optimize performance and maintainability in large codebases",
  ],
  prerequisites: [
    "Intermediate TypeScript knowledge (interfaces, basic generics)",
    "Familiarity with design patterns and OOP principles",
    "Experience with production Node.js or frontend applications",
  ],
  tags: ["TypeScript", "Engineering", "Architecture", "Advanced", "Design Patterns"],
  modules: [
    {
      id: "ts-m1",
      title: "Advanced Type System Mechanics",
      description:
        "Explore TypeScript's powerful type system: generics, inference, and transformations.",
      objectives: [
        "Create reusable generic types and functions",
        "Use conditional and mapped types for dynamic type creation",
        "Leverage type inference and utility types effectively",
      ],
      order: 0,
      durationMinutes: 210,
      lessons: [
        {
          id: "ts-l1-1",
          title: "Generics and Type Constraints",
          description:
            "Write flexible, reusable code with generics while maintaining type safety.",
          format: "video",
          durationMinutes: 70,
          objectives: [
            "Design generic functions and classes",
            "Apply constraints to generic type parameters",
          ],
          keyPoints: [
            "Generics enable code reuse across different types while maintaining type safety",
            "Type parameters act as placeholders: <T>, <K, V>",
            "Constraints limit type parameters: <T extends string>, <T extends { id: number }>",
            "Generic functions infer types automatically in most cases",
            "Default type parameters provide fallback types: <T = string>",
          ],
          content: `# Generics and Type Constraints

**Generics** are one of TypeScript's most powerful features, allowing you to write flexible, reusable code while maintaining strict type safety. Instead of writing the same function multiple times for different types, generics let you create a single implementation that works across many types.

## Understanding Type Parameters

Think of a generic type parameter like a placeholder for a real type that will be specified later. The most common type parameter is \`<T>\` (short for "Type"), but you can use any name:

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

// TypeScript infers the type from the argument
const str = identity("hello");      // T is string
const num = identity(42);           // T is number
const bool = identity(true);        // T is boolean
\`\`\`

You can have multiple type parameters:

\`\`\`typescript
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const result = pair("age", 25);  // [string, number]
\`\`\`

## Type Constraints

Without constraints, generic types can be too broad and lose type safety. **Constraints** narrow what types are acceptable:

\`\`\`typescript
// Constrain T to types that have a length property
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");        // OK: string has length
getLength([1, 2, 3]);      // OK: array has length
getLength(42);             // ERROR: number doesn't have length

// Constrain T to string types only
function toUpperCase<T extends string>(value: T): T {
  return value.toUpperCase() as T;
}
\`\`\`

## Generic Classes and Interfaces

Generics shine in data structures and API designs:

\`\`\`typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}
\`\`\`

## Default Type Parameters

Just like function parameters, type parameters can have defaults:

\`\`\`typescript
// Default T to string if not specified
function log<T = string>(value: T): void {
  console.log(value);
}

log("hello");        // T is string
log<number>(42);     // T is number
\`\`\`

### Try It Yourself

Create a generic \`FilterList\` function that takes an array of type \`T\` and a predicate function, returning only items that match. Then test it with different types (numbers, strings, objects).

> **Pro Tip:** Use meaningful type parameter names! While \`T\` is standard, use \`K\` for keys, \`V\` for values, \`Item\` for array items, etc. This makes generic code much more readable. Also, **always constrain your generics** — unconstrained generics often hide bugs and make code harder to understand.
`,
          suggestedResources: [
            {
              title: "Generics — TypeScript Handbook",
              url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
              type: "article",
            },
            {
              title: "Advanced TypeScript Course — Frontend Masters",
              url: "https://frontendmasters.com/courses/typescript-v3/",
              type: "video",
            },
          ],
          order: 0,
        },
        {
          id: "ts-l1-2",
          title: "Conditional and Mapped Types",
          description:
            "Create powerful type transformations for complex type scenarios.",
          format: "interactive",
          durationMinutes: 70,
          objectives: [
            "Build conditional types using ternary syntax",
            "Transform object types with mapped types",
          ],
          keyPoints: [
            "Conditional types: T extends U ? X : Y syntax resembles ternary operators",
            "Distributive conditional types work with unions automatically",
            "Mapped types iterate over object keys: { [K in keyof T]: T[K] }",
            "Utility types (Pick, Omit, Record) are implemented using mapped types",
            "Combining conditional and mapped types solves complex typing challenges",
          ],
          content: `# Conditional and Mapped Types

**Conditional types** and **mapped types** are advanced TypeScript features that enable powerful type transformations. They let you create types that change based on conditions or transform object structures dynamically.

## Conditional Types

Conditional types use ternary syntax to create types that behave differently based on what they're applied to:

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;     // true
type B = IsString<number>;      // false
\`\`\`

This is especially powerful for creating utility types:

\`\`\`typescript
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>;    // string
type Num = Flatten<number>;      // number
\`\`\`

The \`infer\` keyword extracts types from complex structures:

\`\`\`typescript
// Extract the promise value type
type Awaited<T> = T extends Promise<infer U> ? U : T;

type Result = Awaited<Promise<string>>;  // string

// Extract function return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = (x: number) => string;
type FnReturn = ReturnType<Fn>;  // string
\`\`\`

## Distributive Conditional Types

When you apply conditional types to unions, TypeScript distributes the type over each member:

\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never;

// With union: applied to each member
type StrOrNum = ToArray<string | number>;  
// Result: string[] | number[]

// This is useful for filtering unions
type Flatten<T> = T extends Array<infer U> ? U : T;
type Mixed = Flatten<string | number[]>;   // string | number
\`\`\`

## Mapped Types

**Mapped types** let you create new object types by transforming the properties of existing types:

\`\`\`typescript
// Make all properties optional
type Optional<T> = {
  [K in keyof T]?: T[K];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type OptionalUser = Optional<User>;
// { id?: number; name?: string; email?: string }
\`\`\`

Real-world mapped type examples:

\`\`\`typescript
// Make all properties readonly
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};

// Get all properties as getters
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type Person = { name: string; age: number };
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }

// Extract only properties of a certain type
type StringPropertiesOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};
\`\`\`

## Combining Conditional and Mapped Types

Together, they solve complex typing problems:

\`\`\`typescript
// Type-safe event emitter
type Events = {
  click: { x: number; y: number };
  submit: { data: string };
};

type EventHandlers<T> = {
  [K in keyof T]: (event: T[K]) => void;
};

const handlers: EventHandlers<Events> = {
  click: (e) => console.log(e.x),      // OK
  submit: (e) => console.log(e.data),  // OK
  // missing: (e) => {},               // ERROR!
};
\`\`\`

### Try It Yourself

Create a \`Readonly\` mapped type that makes all properties immutable, then create a \`Mutable\` type that removes \`readonly\`. Test both on a complex object type.

> **Pro Tip:** Mapped types are the foundation of TypeScript's utility types like \`Partial\`, \`Required\`, \`Readonly\`, and \`Record\`. Understanding how they work helps you build powerful domain-specific types. Use \`as\` clauses to rename keys during mapping—this unlocks incredible flexibility!
`,
          suggestedResources: [
            {
              title: "Conditional Types — TypeScript Handbook",
              url: "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html",
              type: "article",
            },
            {
              title: "Mapped Types — TypeScript Handbook",
              url: "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html",
              type: "article",
            },
          ],
          order: 1,
        },
        {
          id: "ts-l1-3",
          title: "Type Inference and Utility Types",
          description:
            "Leverage TypeScript's type inference for cleaner, more maintainable code.",
          format: "project",
          durationMinutes: 70,
          objectives: [
            "Use type inference effectively to reduce annotation verbosity",
            "Apply built-in utility types appropriately",
          ],
          keyPoints: [
            "Type inference reduces boilerplate: let x = 42 infers number type",
            "as const assertion narrows types for literal values and tuples",
            "typeof operator extracts types from values: typeof person",
            "Partial<T>, Required<T>, Readonly<T> modify object types",
            "Record<K, V>, Pick<T, K>, Omit<T, K> select and reshape object types",
          ],
          content: `# Type Inference and Utility Types

**Type inference** allows TypeScript to automatically determine types without explicit annotations, reducing boilerplate while maintaining type safety. **Utility types** are built-in generic types that transform other types in useful ways.

## How Type Inference Works

TypeScript's type inference system is remarkably sophisticated. It analyzes context to determine the intended type:

\`\`\`typescript
// Simple inference
let x = 42;           // x is number
let name = "Alice";   // name is string
let active = true;    // active is boolean

// Inference from function return
function add(a: number, b: number) {
  return a + b;       // inferred as number
}

const result = add(1, 2);  // result is number

// Inference from array contents
const numbers = [1, 2, 3];           // number[]
const mixed = [1, "two", true];      // (number | string | boolean)[]
\`\`\`

Contextual inference helps with callbacks and complex scenarios:

\`\`\`typescript
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

users.forEach(user => {
  // user is inferred as { id: number; name: string }
  console.log(user.id);
});
\`\`\`

## The as const Assertion

The \`as const\` assertion tells TypeScript to treat a value as a literal type, enabling powerful patterns:

\`\`\`typescript
// Without as const: "north" | "south" | "east" | "west"
const direction = "north" as const;

// Create a readonly tuple
const coords = [10, 20] as const;  // readonly [10, 20]

// Perfect for literal type switches
const themeColors = {
  light: "#ffffff" as const,
  dark: "#000000" as const,
} as const;

type ThemeName = keyof typeof themeColors;  // "light" | "dark"
\`\`\`

## typeof and keyof Operators

Extract types from values and objects:

\`\`\`typescript
const person = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
};

type PersonType = typeof person;
// { name: string; age: number; email: string }

type PersonKeys = keyof typeof person;  // "name" | "age" | "email"

// Use in generic constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const name = getProperty(person, "name");  // string
\`\`\`

## Essential Utility Types

### Object Modification Utilities

\`\`\`typescript
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Partial<T> — all properties optional
type PartialTask = Partial<Task>;
// { id?: number; title?: string; completed?: boolean }

// Required<T> — all properties required
type RequiredTask = Required<PartialTask>;

// Readonly<T> — all properties immutable
type ReadonlyTask = Readonly<Task>;

// Pick<T, K> — select specific properties
type TaskPreview = Pick<Task, "id" | "title">;
// { id: number; title: string }

// Omit<T, K> — exclude specific properties
type TaskUpdate = Omit<Task, "id">;
// { title: string; completed: boolean }
\`\`\`

### Type Selection and Transformation

\`\`\`typescript
// Record<K, V> — create an object with specific keys
type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
// { admin: string[]; user: string[]; guest: string[] }

// Extract<T, U> — get types that match a condition
type StringOrBool = string | number | boolean;
type Strings = Extract<StringOrBool, string>;  // string

// Exclude<T, U> — remove types that match
type NotBool = Exclude<StringOrBool, boolean>;  // string | number
\`\`\`

### Function and Promise Utilities

\`\`\`typescript
type MyFunction = (a: string, b: number) => boolean;

// ReturnType<T> — extract return type
type FnReturn = ReturnType<MyFunction>;  // boolean

// Parameters<T> — extract parameter types
type FnParams = Parameters<MyFunction>;  // [a: string, b: number]

// Awaited<T> — unwrap Promise
type PromiseValue = Awaited<Promise<string>>;  // string
\`\`\`

### Try It Yourself

Create a type \`DeepPartial<T>\` that makes all properties optional recursively (including nested objects). Test it on a complex nested type structure.

> **Pro Tip:** Leverage type inference to reduce type annotations—let TypeScript do the work! Use \`as const\` when you need precise literal types. Utility types are powerful but can make code hard to follow, so document complex type transformations with comments. TypeScript Playground is your friend for experimenting with these patterns!
`,
          suggestedResources: [
            {
              title: "Type Inference — TypeScript Handbook",
              url: "https://www.typescriptlang.org/docs/handbook/type-inference.html",
              type: "article",
            },
            {
              title: "Utility Types — TypeScript Handbook",
              url: "https://www.typescriptlang.org/docs/handbook/utility-types.html",
              type: "article",
            },
          ],
          order: 2,
        },
      ],
      quiz: [
        {
          id: "ts-q1-1",
          type: "multiple-choice",
          question:
            "What is the primary advantage of using generics in TypeScript?",
          options: [
            "They make code run faster",
            "They enable type-safe reusable code across different types",
            "They reduce the file size of compiled code",
            "They are required for all functions",
          ],
          correctAnswer: 1,
          explanation:
            "Generics allow you to write functions and classes that work with multiple types while maintaining type safety, reducing code duplication.",
          points: 2,
        },
      ],
    },
    {
      id: "ts-m2",
      title: "Architectural Patterns and SOLID",
      description:
        "Apply proven architectural patterns and SOLID principles to TypeScript applications.",
      objectives: [
        "Implement dependency injection for loose coupling",
        "Apply SOLID principles to design maintainable systems",
        "Use factory and builder patterns for object creation",
      ],
      order: 1,
      durationMinutes: 225,
      lessons: [
        {
          id: "ts-l2-1",
          title: "Dependency Injection and IoC Containers",
          description:
            "Decouple components through dependency injection for flexible, testable code.",
          format: "video",
          durationMinutes: 75,
          objectives: [
            "Understand dependency injection principles",
            "Implement IoC (Inversion of Control) containers",
          ],
          keyPoints: [
            "Dependency injection provides dependencies to classes rather than hardcoding them",
            "Constructor injection is the most common and explicit form",
            "IoC containers manage object creation and dependency resolution automatically",
            "Enables easy mocking for unit testing and alternative implementations",
            "Popular TypeScript DI libraries: InversifyJS, Awilix, TypeDI",
          ],
          content: `# Dependency Injection and IoC Containers

**Dependency Injection (DI)** is a design pattern that improves code maintainability, testability, and flexibility by decoupling components. Instead of classes creating their dependencies, dependencies are **provided** (injected) from outside.

## The Problem With Hardcoded Dependencies

Without DI, classes create their own dependencies, which creates tight coupling:

\`\`\`typescript
class UserService {
  private emailService: EmailService;

  constructor() {
    // Hard-coded dependency - can't use alternative implementations
    this.emailService = new EmailService();
  }

  createUser(email: string) {
    this.emailService.sendWelcomeEmail(email);
  }
}

// Testing is difficult - always uses real EmailService
const service = new UserService();
\`\`\`

Problems:
- Can't swap implementations for testing
- Can't use different configurations
- Hard to understand what a class needs
- Changes to dependencies ripple through code

## Constructor Injection

The simplest form of DI: pass dependencies as constructor parameters:

\`\`\`typescript
interface EmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

class UserService {
  constructor(private emailService: EmailService) {}

  async createUser(email: string) {
    await this.emailService.sendWelcomeEmail(email);
  }
}

// Production: use real service
const emailService = new RealEmailService();
const userService = new UserService(emailService);

// Testing: use mock
class MockEmailService implements EmailService {
  async sendWelcomeEmail(email: string) {
    console.log(\`Mock: would send email to \${email}\`);
  }
}

const mockService = new UserService(new MockEmailService());
\`\`\`

## Inversion of Control (IoC) Containers

As applications grow, manually managing dependencies becomes unwieldy. **IoC containers** automate this:

\`\`\`typescript
// With InversifyJS
import { Container, injectable, inject } from "inversify";

const TYPES = {
  EmailService: Symbol.for("EmailService"),
  UserService: Symbol.for("UserService"),
};

@injectable()
class EmailService {
  async send(to: string, subject: string, body: string) {
    console.log(\`Sending \${subject} to \${to}\`);
  }
}

@injectable()
class UserService {
  constructor(@inject(TYPES.EmailService) private email: EmailService) {}

  async createUser(email: string) {
    await this.email.send(email, "Welcome", "Welcome to our app!");
  }
}

// Setup the container
const container = new Container();
container.bind(TYPES.EmailService).to(EmailService);
container.bind(TYPES.UserService).to(UserService);

// The container resolves all dependencies automatically
const userService = container.get<UserService>(TYPES.UserService);
await userService.createUser("user@example.com");
\`\`\`

## Benefits in Action

### Easy Testing

\`\`\`typescript
@injectable()
class OrderService {
  constructor(
    @inject(TYPES.PaymentGateway) private payment: PaymentGateway,
    @inject(TYPES.EmailService) private email: EmailService
  ) {}

  async processOrder(orderId: string) {
    const result = await this.payment.charge(orderId);
    await this.email.sendConfirmation(orderId);
    return result;
  }
}

// In tests: inject mocks
class MockPayment implements PaymentGateway {
  async charge(orderId: string) {
    return { success: true, transactionId: "test-123" };
  }
}

const testContainer = new Container();
testContainer.bind(TYPES.PaymentGateway).to(MockPayment);
testContainer.bind(TYPES.EmailService).to(MockEmail);

const service = testContainer.get<OrderService>(TYPES.OrderService);
// Now you can test without hitting real APIs
\`\`\`

### Different Implementations

\`\`\`typescript
// Switch implementations without changing code
if (process.env.NODE_ENV === "production") {
  container.bind(TYPES.CacheService).to(RedisCacheService);
  container.bind(TYPES.Database).to(PostgresDatabase);
} else {
  container.bind(TYPES.CacheService).to(InMemoryCacheService);
  container.bind(TYPES.Database).to(MockDatabase);
}
\`\`\`

## Popular TypeScript DI Libraries

- **InversifyJS**: Powerful, decorator-based, great for large applications
- **Awilix**: Simple, lightweight, functional style
- **TypeDI**: Microsoft-endorsed, integrates well with TypeORM
- **tsyringe**: Microsoft's dependency injection library

### Try It Yourself

Refactor a tightly coupled class that creates its own dependencies. Extract the dependencies into interfaces, add constructor injection, and write unit tests that use mock implementations.

> **Pro Tip:** Always depend on **abstractions (interfaces), not concrete implementations**. This is the Dependency Inversion Principle from SOLID. Use IoC containers for complex applications, but for simpler projects, manual constructor injection can be sufficient and easier to understand. In tests, you often don't need a container—just instantiate with mocks directly!
`,
          suggestedResources: [
            {
              title: "Dependency Injection in TypeScript",
              url: "https://www.typescriptlang.org/docs/handbook/decorators.html",
              type: "article",
            },
            {
              title: "InversifyJS Documentation",
              url: "https://inversify.io/",
              type: "article",
            },
          ],
          order: 0,
        },
        {
          id: "ts-l2-2",
          title: "SOLID Principles in TypeScript",
          description:
            "Apply Single Responsibility, Open/Closed, Liskov, Interface Segregation, and Dependency Inversion.",
          format: "project",
          durationMinutes: 75,
          objectives: [
            "Recognize SOLID violations and refactor code",
            "Design classes with clear, single responsibilities",
          ],
          keyPoints: [
            "Single Responsibility: each class has one reason to change",
            "Open/Closed: open for extension, closed for modification through inheritance/composition",
            "Liskov Substitution: subtypes should be substitutable for their base types",
            "Interface Segregation: clients should depend on specific, focused interfaces",
            "Dependency Inversion: depend on abstractions, not concrete implementations",
          ],
          content: `# SOLID Principles in TypeScript

**SOLID** is an acronym for five principles that make code more maintainable, flexible, and testable. When applied consistently, SOLID principles result in systems that are easier to extend, test, and modify.

## Single Responsibility Principle (SRP)

Each class should have **one and only one reason to change**. A class should have a single responsibility.

### Violation Example

\`\`\`typescript
// BAD: UserManager handles too much
class UserManager {
  createUser(name: string, email: string) {
    // Validate email format
    if (!email.includes("@")) throw new Error("Invalid email");
    
    // Save to database
    const user = { id: Date.now(), name, email };
    this.saveToDatabase(user);
    
    // Send email
    this.sendWelcomeEmail(email);
    
    // Log activity
    console.log(\`User created: \${name}\`);
  }

  private saveToDatabase(user: any) { /* ... */ }
  private sendWelcomeEmail(email: string) { /* ... */ }
}
\`\`\`

### Better Approach

\`\`\`typescript
// GOOD: Each class has one responsibility
interface EmailValidator {
  validate(email: string): boolean;
}

interface UserRepository {
  save(user: User): Promise<void>;
}

interface NotificationService {
  sendWelcomeEmail(email: string): Promise<void>;
}

@injectable()
class UserCreationService {
  constructor(
    private emailValidator: EmailValidator,
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}

  async createUser(name: string, email: string) {
    if (!this.emailValidator.validate(email)) {
      throw new Error("Invalid email");
    }

    const user = new User(name, email);
    await this.userRepository.save(user);
    await this.notificationService.sendWelcomeEmail(email);
  }
}
\`\`\`

## Open/Closed Principle (OCP)

Classes should be **open for extension** but **closed for modification**. Add new behavior without changing existing code.

### Violation Example

\`\`\`typescript
// BAD: Must modify for each new discount type
class PricingCalculator {
  calculatePrice(amount: number, customerType: string): number {
    if (customerType === "gold") return amount * 0.9;
    if (customerType === "silver") return amount * 0.95;
    if (customerType === "bronze") return amount * 0.98;
    return amount;
  }
}
\`\`\`

### Better Approach

\`\`\`typescript
// GOOD: Extend through composition, not modification
interface DiscountStrategy {
  apply(amount: number): number;
}

class GoldCustomerDiscount implements DiscountStrategy {
  apply(amount: number): number {
    return amount * 0.9;
  }
}

class SilverCustomerDiscount implements DiscountStrategy {
  apply(amount: number): number {
    return amount * 0.95;
  }

// Add new discounts without modifying existing code
class PlatinumCustomerDiscount implements DiscountStrategy {
  apply(amount: number): number {
    return amount * 0.85;
  }
}

class PricingCalculator {
  constructor(private discountStrategy: DiscountStrategy) {}

  calculatePrice(amount: number): number {
    return this.discountStrategy.apply(amount);
  }
}
\`\`\`

## Liskov Substitution Principle (LSP)

**Subtypes must be substitutable for their base types**. If \`S\` is a subtype of \`T\`, you should be able to use \`S\` wherever \`T\` is expected.

### Violation Example

\`\`\`typescript
// BAD: Square violates Rectangle's contract
class Rectangle {
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number) { this.width = w; this.height = w; }  // Forces both
  setHeight(h: number) { this.width = h; this.height = h; }
}

// This breaks with Square!
function testRectangle(rect: Rectangle) {
  rect.setWidth(5);
  rect.setHeight(10);
  console.assert(rect.area() === 50); // Fails for Square!
}
\`\`\`

### Better Approach

\`\`\`typescript
// GOOD: Separate interfaces, no forced inheritance
interface Shape {
  area(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
}
\`\`\`

## Interface Segregation Principle (ISP)

Clients should depend on **specific, focused interfaces**, not broad, general-purpose ones.

### Violation Example

\`\`\`typescript
// BAD: Fat interface forces implementations to do too much
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  code(): void;
  debug(): void;
}

class Robot implements Worker {
  work() { /* ... */ }
  eat() { /* Robots don't eat! */ }
  sleep() { /* Robots don't sleep! */ }
  code() { /* ... */ }
  debug() { /* ... */ }
}
\`\`\`

### Better Approach

\`\`\`typescript
// GOOD: Segregated, focused interfaces
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Debuggable {
  debug(): void;
}

class Developer implements Workable, Eatable, Debuggable {
  work() { console.log("Coding..."); }
  eat() { console.log("Eating lunch..."); }
  debug() { console.log("Finding bugs..."); }
}

class Robot implements Workable, Debuggable {
  work() { console.log("Processing..."); }
  debug() { console.log("Checking logs..."); }
  // No need to implement Eatable
}
\`\`\`

## Dependency Inversion Principle (DIP)

**High-level modules should not depend on low-level modules.** Both should depend on abstractions.

### Violation Example

\`\`\`typescript
// BAD: High-level depends on low-level concrete class
class PaymentService {
  constructor(private stripe: StripeGateway) {} // Concrete dependency
  
  processPayment(amount: number) {
    return this.stripe.charge(amount);
  }
}
\`\`\`

### Better Approach

\`\`\`typescript
// GOOD: Both depend on abstraction
interface PaymentGateway {
  charge(amount: number): Promise<{ success: boolean }>;
}

class PaymentService {
  constructor(private gateway: PaymentGateway) {} // Abstraction
  
  processPayment(amount: number) {
    return this.gateway.charge(amount);
  }
}

// Can use any implementation
class StripeGateway implements PaymentGateway {
  async charge(amount: number) { /* ... */ }
}

class PayPalGateway implements PaymentGateway {
  async charge(amount: number) { /* ... */ }
}
\`\`\`

### Try It Yourself

Take a large, complex class and refactor it to follow SOLID principles. Extract responsibilities into separate classes, use interfaces, and apply dependency injection.

> **Pro Tip:** SOLID principles aren't absolute rules—they're guidelines. Over-applying them can lead to over-engineering. Start with SRP and DIP as they provide the most immediate value. Use the "reason to change" test: if you can think of multiple reasons a class might need to change, it probably violates SRP!
`,
          suggestedResources: [
            {
              title: "SOLID Principles — Robert C. Martin",
              url: "https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html",
              type: "article",
            },
            {
              title: "Design Patterns in TypeScript",
              url: "https://refactoring.guru/design-patterns/typescript",
              type: "article",
            },
          ],
          order: 1,
        },
        {
          id: "ts-l2-3",
          title: "Creational Patterns: Factory and Builder",
          description:
            "Master patterns for flexible, maintainable object creation.",
          format: "interactive",
          durationMinutes: 75,
          objectives: [
            "Implement factory patterns for object creation",
            "Apply builder pattern for complex object construction",
          ],
          keyPoints: [
            "Factory pattern encapsulates object creation logic",
            "Abstract factories create families of related objects",
            "Builder pattern handles complex constructors with many optional parameters",
            "Fluent interface: builder methods return 'this' for method chaining",
            "Both patterns reduce coupling and improve testability",
          ],
          content: `# Creational Patterns: Factory and Builder

**Creational patterns** address how objects are instantiated. The **Factory** and **Builder** patterns provide flexible, maintainable ways to create objects, especially when construction is complex or varies by context.

## Factory Pattern

The **Factory Pattern** encapsulates object creation logic, allowing clients to create objects without knowing the specific classes.

### Simple Factory

\`\`\`typescript
interface Database {
  connect(): Promise<void>;
  query(sql: string): Promise<any[]>;
}

class PostgresDatabase implements Database {
  async connect() { console.log("Connecting to Postgres..."); }
  async query(sql: string) { return []; }
}

class MongoDatabase implements Database {
  async connect() { console.log("Connecting to MongoDB..."); }
  async query(sql: string) { return []; }
}

// Factory function
function createDatabase(type: "postgres" | "mongo"): Database {
  switch (type) {
    case "postgres":
      return new PostgresDatabase();
    case "mongo":
      return new MongoDatabase();
    default:
      throw new Error(\`Unknown database type: \${type}\`);
  }
}

// Usage: clients don't know which class is instantiated
const db = createDatabase(process.env.DB_TYPE);
await db.connect();
\`\`\`

### Abstract Factory

For creating **families of related objects**:

\`\`\`typescript
// UI components for different themes
interface Button {
  render(): string;
}

interface Checkbox {
  render(): string;
}

// Dark theme family
class DarkButton implements Button {
  render() { return '<button style="background: #333">'; }
}

class DarkCheckbox implements Checkbox {
  render() { return '<input type="checkbox" style="color: #fff">'; }
}

// Light theme family
class LightButton implements Button {
  render() { return '<button style="background: #fff">'; }
}

class LightCheckbox implements Checkbox {
  render() { return '<input type="checkbox" style="color: #000">'; }
}

// Abstract factory interface
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class DarkThemeFactory implements UIFactory {
  createButton() { return new DarkButton(); }
  createCheckbox() { return new DarkCheckbox(); }
}

class LightThemeFactory implements UIFactory {
  createButton() { return new LightButton(); }
  createCheckbox() { return new LightCheckbox(); }
}

// Client code uses factory without knowing concrete classes
function renderForm(factory: UIFactory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  return button.render() + checkbox.render();
}

const theme = process.env.THEME === "dark" ? new DarkThemeFactory() : new LightThemeFactory();
const form = renderForm(theme);
\`\`\`

### Benefits

- Encapsulates object creation logic
- Easy to swap implementations
- Simple to test with factory mocks
- Decouples client code from concrete classes

## Builder Pattern

The **Builder Pattern** handles object construction when:
- Objects have many optional parameters
- Construction has multiple steps
- You want readable, fluent API

### Without Builder (Problem)

\`\`\`typescript
// Too many overloads or unclear parameters
class SqlQuery {
  constructor(
    select: string,
    from: string,
    where?: string,
    orderBy?: string,
    limit?: number,
    offset?: number,
    distinct?: boolean,
    groupBy?: string
  ) { /* ... */ }
}

// Unclear what parameters mean
const query = new SqlQuery("*", "users", "age > 18", undefined, 10, 0, true);
\`\`\`

### With Builder (Solution)

\`\`\`typescript
class SqlQueryBuilder {
  private select: string = "*";
  private from: string = "";
  private where?: string;
  private orderBy?: string;
  private limit?: number;
  private offset?: number;
  private distinct: boolean = false;
  private groupBy?: string;

  // Fluent interface: methods return 'this'
  setSelect(columns: string) {
    this.select = columns;
    return this;
  }

  setFrom(table: string) {
    this.from = table;
    return this;
  }

  setWhere(condition: string) {
    this.where = condition;
    return this;
  }

  setOrderBy(order: string) {
    this.orderBy = order;
    return this;
  }

  setLimit(limit: number) {
    this.limit = limit;
    return this;
  }

  setOffset(offset: number) {
    this.offset = offset;
    return this;
  }

  setDistinct(distinct: boolean) {
    this.distinct = distinct;
    return this;
  }

  setGroupBy(columns: string) {
    this.groupBy = columns;
    return this;
  }

  build(): string {
    let query = \`SELECT \`;
    if (this.distinct) query += "DISTINCT ";
    query += \`\${this.select} FROM \${this.from}\`;
    if (this.where) query += \` WHERE \${this.where}\`;
    if (this.groupBy) query += \` GROUP BY \${this.groupBy}\`;
    if (this.orderBy) query += \` ORDER BY \${this.orderBy}\`;
    if (this.limit) query += \` LIMIT \${this.limit}\`;
    if (this.offset) query += \` OFFSET \${this.offset}\`;
    return query;
  }
}

// Usage: clear, readable, chainable
const query = new SqlQueryBuilder()
  .setSelect("id, name, email")
  .setFrom("users")
  .setWhere("age > 18")
  .setDistinct(true)
  .setOrderBy("name ASC")
  .setLimit(10)
  .build();
\`\`\`

### Real-World Example: Request Builder

\`\`\`typescript
class HttpRequestBuilder {
  private url: string = "";
  private method: string = "GET";
  private headers: Record<string, string> = {};
  private body?: any;
  private timeout: number = 30000;

  setUrl(url: string) { this.url = url; return this; }
  setMethod(method: "GET" | "POST" | "PUT" | "DELETE") { this.method = method; return this; }
  addHeader(key: string, value: string) { this.headers[key] = value; return this; }
  setBody(body: any) { this.body = body; return this; }
  setTimeout(ms: number) { this.timeout = ms; return this; }

  build() {
    return {
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      timeout: this.timeout,
    };
  }
}

// Usage: fluent and clear intent
const request = new HttpRequestBuilder()
  .setUrl("https://api.example.com/users")
  .setMethod("POST")
  .addHeader("Content-Type", "application/json")
  .addHeader("Authorization", "Bearer token123")
  .setBody({ name: "Alice", email: "alice@example.com" })
  .setTimeout(5000)
  .build();
\`\`\`

### Try It Yourself

Create a \`ReportBuilder\` that constructs reports with various sections (title, summary, tables, charts). Use fluent interface for clear, chainable API.

> **Pro Tip:** Use Builder for any complex object with multiple optional parameters. The fluent interface makes code incredibly readable—it reads almost like natural language. TypeScript's method chaining (returning \`this\`) combined with proper typing makes builders incredibly powerful and safe!
`,
          suggestedResources: [
            {
              title: "Factory Pattern Examples",
              url: "https://refactoring.guru/design-patterns/factory-method",
              type: "article",
            },
            {
              title: "Builder Pattern Guide",
              url: "https://refactoring.guru/design-patterns/builder",
              type: "article",
            },
          ],
          order: 2,
        },
      ],
      quiz: [
        {
          id: "ts-q2-1",
          type: "multiple-choice",
          question: "Which SOLID principle focuses on client-specific interfaces?",
          options: [
            "Single Responsibility Principle",
            "Open/Closed Principle",
            "Interface Segregation Principle",
            "Dependency Inversion Principle",
          ],
          correctAnswer: 2,
          explanation:
            "Interface Segregation Principle states that clients should depend on fine-grained, specific interfaces rather than broad, general ones.",
          points: 2,
        },
      ],
    },
    {
      id: "ts-m3",
      title: "Error Handling and Validation",
      description:
        "Build resilient applications with comprehensive error handling and validation strategies.",
      objectives: [
        "Design effective error handling strategies",
        "Implement validation at multiple application layers",
        "Use type-safe result types for better error propagation",
      ],
      order: 2,
      durationMinutes: 195,
      lessons: [
        {
          id: "ts-l3-1",
          title: "Error Handling Strategies",
          description:
            "Create robust applications that handle errors gracefully.",
          format: "video",
          durationMinutes: 65,
          objectives: [
            "Implement try-catch patterns effectively",
            "Design custom error classes with meaningful context",
          ],
          keyPoints: [
            "Error context matters: include relevant data in error messages",
            "Custom error classes allow catching specific error types",
            "Error boundaries in frontend applications isolate component failures",
            "Logging and monitoring track errors in production",
            "Distinguish recoverable errors from fatal errors requiring immediate handling",
          ],
          content: `# Error Handling Strategies

Robust error handling is critical for production applications. **Effective error handling** requires strategy: knowing when to throw, when to catch, and what information to provide.

## Custom Error Classes

Create specific error types for different failure scenarios:

\`\`\`typescript
// Base custom error class
class ApplicationError extends Error {
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    public readonly code: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain-specific errors
class ValidationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", context);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(
      \`\${resource} with id \${id} not found\`,
      "NOT_FOUND",
      { resource, id }
    );
  }
}

class DatabaseError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "DATABASE_ERROR", context);
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR");
  }
}
\`\`\`

## Throwing Errors with Context

Always provide enough context to understand and debug failures:

\`\`\`typescript
async function fetchUser(userId: string) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError("User", userId);
      }
      throw new ApplicationError(
        "Failed to fetch user",
        "FETCH_ERROR",
        { status: response.status, userId }
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error; // Re-throw known errors
    }

    // Wrap unknown errors with context
    throw new ApplicationError(
      "Unexpected error fetching user",
      "UNKNOWN_ERROR",
      { userId, originalError: error }
    );
  }
}
\`\`\`

## Catching and Handling Specific Errors

Handle different error types differently:

\`\`\`typescript
async function updateUser(userId: string, updates: UserUpdate) {
  try {
    // Validate input
    if (!updates.email && !updates.name) {
      throw new ValidationError(
        "At least one field must be provided",
        { providedFields: Object.keys(updates) }
      );
    }

    await fetchUser(userId); // Ensure user exists
    return await saveUserUpdates(userId, updates);

  } catch (error) {
    // Handle specific error types
    if (error instanceof NotFoundError) {
      console.error(\`User not found: \${error.message}\`);
      // Handle not found gracefully
      return { success: false, reason: "user_not_found" };
    }

    if (error instanceof ValidationError) {
      console.error(\`Validation failed: \${error.message}\`);
      return { success: false, reason: "validation_failed", details: error.context };
    }

    if (error instanceof ApplicationError) {
      // Log with full context for debugging
      logger.error({
        name: error.name,
        message: error.message,
        code: error.code,
        context: error.context,
        timestamp: error.timestamp,
        stack: error.stack,
      });
      
      // Respond appropriately
      throw new ApplicationError(
        "Operation failed",
        "UPDATE_FAILED",
        { userId }
      );
    }

    // Unexpected error
    logger.error({ error, userId });
    throw error;
  }
}
\`\`\`

## Error Boundaries (Frontend)

In React, error boundaries prevent a single component failure from crashing the app:

\`\`\`typescript
interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    logger.error({
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <UserProfile userId="123" />
</ErrorBoundary>
\`\`\`

## Logging and Monitoring

Capture errors with sufficient context for production debugging:

\`\`\`typescript
interface ErrorLog {
  timestamp: Date;
  level: "error" | "warn" | "info";
  message: string;
  code?: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  requestId?: string;
}

class Logger {
  error(error: Error | ApplicationError, context?: Record<string, any>) {
    const log: ErrorLog = {
      timestamp: new Date(),
      level: "error",
      message: error.message,
      stack: error.stack,
      code: (error as ApplicationError).code,
      context: (error as ApplicationError).context || context,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(log);
    }

    // Send to monitoring service
    this.sendToMonitoring(log);
  }

  private sendToMonitoring(log: ErrorLog) {
    // Send to Sentry, DataDog, etc.
    fetch("/api/logs", { method: "POST", body: JSON.stringify(log) });
  }
}
\`\`\`

## Recoverable vs. Fatal Errors

Distinguish between errors you can recover from and those that require shutdown:

\`\`\`typescript
// Recoverable: retry or show user message
if (error instanceof ValidationError) {
  // Show validation errors to user
  displayFormErrors(error.context);
  return;
}

if (error instanceof NotFoundError) {
  // Gracefully handle missing resources
  return notFoundPage();
}

// Fatal: application cannot continue
if (error instanceof DatabaseError && isConnectionError(error)) {
  logger.error("Database connection lost", error);
  process.exit(1);
}

if (error instanceof ApplicationError && error.code === "CRITICAL_SECURITY_BREACH") {
  logger.error("Security breach detected", error);
  process.exit(1);
}
\`\`\`

### Try It Yourself

Build an error handling system for a real API endpoint. Create custom errors for different failure scenarios (validation, auth, not found, server error). Test that errors propagate correctly with full context.

> **Pro Tip:** Always include a **error code** in custom errors—it helps with monitoring and debugging. Provide **context** (relevant IDs, timestamps, values) with every error. Never hide error information; let it propagate up so it can be logged and monitored properly. In production, log errors to a service like Sentry or DataDog, not just to console!
`,
          suggestedResources: [
            {
              title: "Exception Handling Best Practices",
              url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
              type: "article",
            },
            {
              title: "Result Types and Error Handling",
              url: "https://github.com/microsoft/TypeScript/issues/13965",
              type: "article",
            },
          ],
          order: 0,
        },
        {
          id: "ts-l3-2",
          title: "Validation Strategies and Libraries",
          description:
            "Validate data at API boundaries and business logic layers.",
          format: "project",
          durationMinutes: 65,
          objectives: [
            "Implement runtime validation using schema validators",
            "Design validation layers for APIs and business logic",
          ],
          keyPoints: [
            "TypeScript types don't exist at runtime; runtime validation is essential",
            "Schema validation libraries: zod, joi, yup, class-validator",
            "Validation at API boundaries protects against malformed input",
            "Business logic validation enforces domain rules and invariants",
            "Type guards and assertion functions enhance type safety",
          ],
          content: `# Validation Strategies and Libraries

TypeScript provides powerful **static type checking** at development time, but types disappear at runtime. **Runtime validation** is essential to ensure data matches expected types when it enters your system from external sources.

## The Runtime Validation Problem

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// This looks type-safe, but...
async function processUser(data: User) {
  console.log(\`User \${data.name} is \${data.age} years old\`);
}

// At runtime, data could be anything!
const data = JSON.parse(userInput);
await processUser(data);

// data might be:
// { name: "Alice" }                                    // missing fields
// { id: "not-a-number", name: "Bob", email: "...", age: "invalid" }
// { id: 1, name: 123, email: null, age: {} }         // wrong types
\`\`\`

TypeScript's types are **compile-time only**. They're erased during transpilation—runtime has no knowledge of them.

## Schema Validation with Zod

**Zod** is a TypeScript-first schema validation library with excellent developer experience:

\`\`\`typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(["admin", "user", "guest"]).default("user"),
});

// Infer TypeScript type from schema
type User = z.infer<typeof UserSchema>;

// Validate data
function processUser(data: unknown) {
  const result = UserSchema.safeParse(data);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    return;
  }

  // result.data is guaranteed to be User type
  const user: User = result.data;
  console.log(\`User \${user.name} is \${user.age} years old\`);
}

// Parse throws if invalid
try {
  const user = UserSchema.parse(JSON.parse(userInput));
} catch (error) {
  console.error("Invalid user data", error);
}
\`\`\`

## Validation at API Boundaries

Protect your application by validating at entry points:

\`\`\`typescript
import express from "express";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(18).optional(),
});

app.post("/users", (req, res) => {
  // Validate request body
  const validation = CreateUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: validation.error.errors,
    });
  }

  // Request body is now guaranteed valid
  const userData = validation.data;
  createUser(userData);
  res.json({ success: true });
});
\`\`\`

## Type Guards and Assertion Functions

Create runtime type checks that narrow types:

\`\`\`typescript
// Type guard function: returns boolean and narrows type
function isUser(data: any): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "number" &&
    typeof data.name === "string" &&
    typeof data.email === "string"
  );
}

function processData(data: unknown) {
  if (isUser(data)) {
    // Inside this block, data is User type
    console.log(data.name); // OK
  } else {
    console.error("Data is not a valid user");
  }
}

// Assertion function: throws if invalid
function assertIsUser(data: unknown): asserts data is User {
  if (!isUser(data)) {
    throw new Error("Data is not a valid user");
  }
}

const data = fetchData();
assertIsUser(data);
// data is now guaranteed to be User type
console.log(data.name); // OK
\`\`\`

## Complex Validation Scenarios

### Conditional Validation

\`\`\`typescript
const OrderSchema = z.object({
  items: z.array(z.object({ id: z.string(), quantity: z.number() })),
  shippingAddress: z.string(),
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]),
  // Only require cardToken if payment method is credit_card
  cardToken: z.string().optional(),
}).refine(
  (data) => data.paymentMethod !== "credit_card" || !!data.cardToken,
  {
    message: "cardToken required for credit_card payment",
    path: ["cardToken"],
  }
);
\`\`\`

### Custom Domain Validation

\`\`\`typescript
const PasswordSchema = z.string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain digit")
  .regex(/[!@#$%^&*]/, "Must contain special character");

const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords don't match", path: ["confirmPassword"] }
);
\`\`\`

### Validating Collections

\`\`\`typescript
const BatchUserSchema = z.object({
  users: z.array(UserSchema).min(1).max(100),
  source: z.string(),
});

function processBatch(data: unknown) {
  const validation = BatchUserSchema.safeParse(data);

  if (!validation.success) {
    console.error("Batch validation failed");
    return;
  }

  // Each user is guaranteed valid
  for (const user of validation.data.users) {
    processUser(user);
  }
}
\`\`\`

## Business Logic Validation

Validate not just types, but business rules:

\`\`\`typescript
class Order {
  private items: OrderItem[];
  private discountPercent: number;

  constructor(items: OrderItem[], discountPercent: number = 0) {
    this.validateBusinessRules(items, discountPercent);
    this.items = items;
    this.discountPercent = discountPercent;
  }

  private validateBusinessRules(items: OrderItem[], discount: number) {
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    if (discount < 0 || discount > 100) {
      throw new Error("Discount must be between 0 and 100");
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const minimumOrderValue = 50;

    if (totalPrice < minimumOrderValue) {
      throw new Error(\`Minimum order value is \${minimumOrderValue}\`);
    }
  }

  applyPromoCode(code: string) {
    const discount = getDiscountForCode(code);
    
    // Re-validate with new discount
    this.validateBusinessRules(this.items, discount);
    
    this.discountPercent = discount;
  }
}
\`\`\`

### Try It Yourself

Create a Zod schema for a complex domain object (e.g., Product, BlogPost, Invoice). Include conditional validation, custom error messages, and collections. Write validation at an API boundary.

> **Pro Tip:** Always validate at **system boundaries**—API endpoints, file uploads, database reads. Don't validate internal transfers between functions that you control. Use Zod's \`transform\` and \`refine\` methods for powerful validation and transformation pipelines. Schema validation in TypeScript combines type safety with runtime guarantees!
`,
          suggestedResources: [
            {
              title: "Zod Validation Library",
              url: "https://zod.dev/",
              type: "tool",
            },
            {
              title: "Type Guards in TypeScript",
              url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates",
              type: "article",
            },
          ],
          order: 1,
        },
        {
          id: "ts-l3-3",
          title: "Result Types and Railway-Oriented Programming",
          description:
            "Use Result types for explicit error handling without exceptions.",
          format: "interactive",
          durationMinutes: 65,
          objectives: [
            "Implement Result<T, E> types for explicit error handling",
            "Apply railway-oriented programming for composable error handling",
          ],
          keyPoints: [
            "Result type: Ok<T> or Err<E> makes error handling explicit",
            "Railway-oriented programming: 'happy path' and 'error path'",
            "Composable error handling through flatMap/bind operations",
            "Libraries: neverthrow, ts-results provide Result types",
            "Reduces reliance on exceptions for control flow",
          ],
          content: `# Result Types and Railway-Oriented Programming

**Result types** provide a functional approach to error handling that makes errors explicit and composable. Instead of throwing exceptions, functions return either a successful result or an error, allowing you to chain operations elegantly.

## The Problem With Exceptions

Exceptions break the linear flow of code and can be silent:

\`\`\`typescript
// What can go wrong here? Not obvious!
function processPayment(userId: string, amount: number) {
  const user = findUser(userId);        // throws NotFound?
  validateAmount(amount);               // throws Validation?
  const account = user.getAccount();    // throws?
  const balance = account.getBalance(); // throws?
  
  if (balance < amount) {
    throw new InsufficientFundsError();
  }

  return account.deduct(amount);        // throws?
}

// Caller must know all possible exceptions
try {
  processPayment("123", 100);
} catch (error) {
  // What went wrong? NotFound? Validation? Insufficient funds?
  // Unclear from function signature
}
\`\`\`

## Result Types: Success or Failure

**Result types** make the contract explicit:

\`\`\`typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Helper functions
function Ok<T, E>(value: T): Result<T, E> {
  return { ok: true, value };
}

function Err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}

// Now the function's contract is clear!
function processPayment(
  userId: string,
  amount: number
): Result<PaymentReceipt, PaymentError> {
  // ...
  return Ok({ transactionId: "123", amount, timestamp: new Date() });
  // or return Err({ code: "INSUFFICIENT_FUNDS" });
}

// Caller knows exactly what can happen
const result = processPayment("123", 100);
if (result.ok) {
  console.log("Payment successful", result.value);
} else {
  console.error("Payment failed", result.error);
}
\`\`\`

## Railway-Oriented Programming

Think of two parallel "railways": the **happy path** (success) and the **error path** (failure). Operations stay on their respective paths:

\`\`\`typescript
// Imagine code flowing on tracks:
//
// Happy path ——→ Ok(data) ——→ Ok(data) ——→ Ok(result)
//
// Error path ←—— Err(e) ←———— Err(e) ←———— Err(e)

// Each operation accepts an input from its track
// and returns output on the same track

type Result<T, E> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };

// Map: happy path only
function map<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U
): Result<U, E> {
  return result.ok ? Ok(transform(result.value)) : result;
}

// FlatMap (bind): compose operations that return Results
function flatMap<T, U, E>(
  result: Result<T, E>,
  next: (value: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? next(result.value) : result;
}

// Practical example
function findUser(id: string): Result<User, { code: "NOT_FOUND" }> {
  const user = database.find(id);
  return user ? Ok(user) : Err({ code: "NOT_FOUND" });
}

function validateAmount(
  amount: number
): Result<number, { code: "INVALID_AMOUNT" }> {
  return amount > 0 ? Ok(amount) : Err({ code: "INVALID_AMOUNT" });
}

function processPayment(
  userId: string,
  amount: number
): Result<PaymentReceipt, PaymentError> {
  return flatMap(findUser(userId), (user) =>
    flatMap(validateAmount(amount), (validAmount) =>
      flatMap(user.getAccount(), (account) =>
        flatMap(account.deductFunds(validAmount), (newBalance) =>
          Ok({
            userId,
            amount: validAmount,
            newBalance,
            timestamp: new Date(),
          })
        )
      )
    )
  );
}
\`\`\`

## Using Neverthrow Library

Real-world Result implementation:

\`\`\`typescript
import { ok, err, Result } from "neverthrow";

type UserError = { code: "NOT_FOUND" } | { code: "INVALID_EMAIL" };

function findUser(id: string): Result<User, UserError> {
  const user = database.get(id);
  return user ? ok(user) : err({ code: "NOT_FOUND" });
}

function validateEmail(email: string): Result<string, UserError> {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)
    ? ok(email)
    : err({ code: "INVALID_EMAIL" });
}

function updateUserEmail(
  userId: string,
  newEmail: string
): Result<User, UserError> {
  return findUser(userId)
    .andThen((user) => validateEmail(newEmail).map(() => user))
    .andThen((user) => {
      user.email = newEmail;
      return ok(user);
    });
}

// Usage
const result = updateUserEmail("123", "alice@example.com");

if (result.isOk()) {
  console.log("Updated user:", result.value);
} else {
  console.error("Failed:", result.error.code);
}
\`\`\`

## Composing Operations

Chain multiple fallible operations elegantly:

\`\`\`typescript
type PaymentError =
  | { type: "USER_NOT_FOUND" }
  | { type: "INSUFFICIENT_FUNDS" }
  | { type: "INVALID_CARD" }
  | { type: "PAYMENT_DECLINED" };

function processCompletePayment(
  userId: string,
  cardToken: string,
  amount: number
): Result<PaymentReceipt, PaymentError> {
  return findUser(userId)
    .andThen((user) =>
      validateCard(cardToken).map((card) => ({ user, card }))
    )
    .andThen(({ user, card }) =>
      checkBalance(user, amount).map(() => ({ user, card }))
    )
    .andThen(({ user, card }) =>
      chargeCard(card, amount)
        .map((charge) => ({ user, card, charge }))
        .mapErr((e) => ({
          type: "PAYMENT_DECLINED" as const,
          reason: e,
        }))
    )
    .andThen(({ user, charge }) =>
      recordTransaction(user, charge).map(() => charge)
    )
    .map((charge) => ({
      transactionId: charge.id,
      amount: charge.amount,
      timestamp: new Date(),
    }));
}

// Error propagates automatically—no try/catch needed!
\`\`\`

## Error Recovery

Unlike exceptions, Results allow elegant recovery:

\`\`\`typescript
function getOrDefault<T, E>(
  result: Result<T, E>,
  defaultValue: T
): T {
  return result.isOk() ? result.value : defaultValue;
}

function getOrElse<T, E>(
  result: Result<T, E>,
  recover: (error: E) => T
): T {
  return result.isOk() ? result.value : recover(result.error);
}

// Usage
const user = findUser("123")
  .map((u) => u.name)
  .andThen((name) =>
    fetchUserDetails(name)
  )
  .getOrElse((error) => {
    console.log("Using cached data due to:", error);
    return getCachedUser();
  });
\`\`\`

### Try It Yourself

Refactor a function that uses try/catch to use Result types instead. Create helper functions for common operations (map, flatMap, getOrElse). Notice how the error flow becomes explicit and composable.

> **Pro Tip:** Result types make error handling **explicit and composable**—you can chain operations without worrying about exceptions interrupting flow. They're perfect for APIs, parsers, and any place where operations can fail predictably. Once you get used to the pattern, it's much more elegant than try/catch!
`,
          suggestedResources: [
            {
              title: "Railway Oriented Programming",
              url: "https://fsharpforfunandprofit.com/rop/",
              type: "article",
            },
            {
              title: "Neverthrow Library",
              url: "https://github.com/supermacro/neverthrow",
              type: "tool",
            },
          ],
          order: 2,
        },
      ],
      quiz: [
        {
          id: "ts-q3-1",
          type: "multiple-choice",
          question:
            "Why is runtime validation important even with TypeScript's static types?",
          options: [
            "TypeScript types exist at runtime and provide validation",
            "TypeScript types are compiled away; runtime validation ensures actual data matches expected types",
            "Runtime validation is optional and only for large applications",
            "It's only needed for user input, not for internal data",
          ],
          correctAnswer: 1,
          explanation:
            "TypeScript types are only for development and compile-time checking. At runtime, types disappear, so explicit validation libraries are necessary to ensure data integrity.",
          points: 2,
        },
      ],
    },
  ],
  pacing: {
    style: "self-paced",
    totalHours: 48,
    hoursPerWeek: 8,
    totalWeeks: 6,
    weeklyPlan: [
      {
        week: 1,
        label: "Type System Mastery",
        moduleIds: ["ts-m1"],
      },
      {
        week: 2,
        label: "Architecture and Patterns",
        moduleIds: ["ts-m2"],
      },
      {
        week: 3,
        label: "Error Handling",
        moduleIds: ["ts-m3"],
      },
    ],
  },
  bonusResources: [
    {
      id: "bonus-ts-1",
      title: "TypeScript Compiler Options Deep Dive",
      type: "article",
      url: "https://www.typescriptlang.org/tsconfig",
      description: "Master compiler configuration for optimizing your TypeScript setup.",
      durationMinutes: 120,
      isFree: true,
    },
  ],
  createdBy: "TypeScript Engineering Team",
  createdAt: "2026-01-20T10:00:00Z",
  updatedAt: "2026-03-29T00:00:00Z",
  version: "1.0.0",
};

export const exampleCurricula: Curriculum[] = [
  mlCurriculum,
  uxCurriculum,
  tsCurriculum,
];
