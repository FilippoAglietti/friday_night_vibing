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
