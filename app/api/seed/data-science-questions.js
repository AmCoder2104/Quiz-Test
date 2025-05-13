export const dataScienceQuestions = [
  {
    question: "Which of the following is NOT a common programming language used in data science?",
    options: ["Python", "R", "COBOL", "SQL"],
    correctAnswer: 2,
    subject: "data-science",
    difficultyLevel: "easy",
    explanation:
      "COBOL is a legacy programming language primarily used in business, finance, and administrative systems for companies and governments, not commonly used in data science.",
  },
  {
    question: "What does the term 'overfitting' refer to in machine learning?",
    options: [
      "When a model performs well on training data but poorly on new data",
      "When a model is too simple to capture patterns in the data",
      "When a model requires too much computational power",
      "When a model has too few parameters",
    ],
    correctAnswer: 0,
    subject: "data-science",
    difficultyLevel: "medium",
    explanation:
      "Overfitting occurs when a model learns the training data too well, including its noise and outliers, resulting in poor performance on new, unseen data.",
  },
  {
    question:
      "Which technique is used to reduce the dimensionality of data while preserving as much variance as possible?",
    options: ["Random Forest", "K-means Clustering", "Principal Component Analysis (PCA)", "Gradient Boosting"],
    correctAnswer: 2,
    subject: "data-science",
    difficultyLevel: "medium",
    explanation:
      "Principal Component Analysis (PCA) is a statistical procedure that uses orthogonal transformation to convert a set of observations of possibly correlated variables into a set of values of linearly uncorrelated variables called principal components.",
  },
  {
    question: "What is the primary purpose of exploratory data analysis (EDA)?",
    options: [
      "To build predictive models",
      "To clean and preprocess data",
      "To analyze and visualize data to understand its main characteristics",
      "To deploy machine learning models to production",
    ],
    correctAnswer: 2,
    subject: "data-science",
    difficultyLevel: "easy",
    explanation:
      "Exploratory Data Analysis (EDA) is an approach to analyzing data sets to summarize their main characteristics, often with visual methods, to discover patterns, spot anomalies, test hypotheses, and check assumptions.",
  },
  {
    question: "Which of the following is a supervised learning algorithm?",
    options: ["K-means clustering", "Principal Component Analysis", "Linear Regression", "DBSCAN"],
    correctAnswer: 2,
    subject: "data-science",
    difficultyLevel: "medium",
    explanation:
      "Linear Regression is a supervised learning algorithm because it learns from labeled training data to predict a continuous output variable based on one or more input features.",
  },
  {
    question: "What is the purpose of cross-validation in machine learning?",
    options: [
      "To clean the dataset",
      "To evaluate model performance on unseen data",
      "To visualize data distributions",
      "To increase the size of the training dataset",
    ],
    correctAnswer: 1,
    subject: "data-science",
    difficultyLevel: "medium",
    explanation:
      "Cross-validation is a resampling procedure used to evaluate machine learning models on a limited data sample, providing an estimate of how the model is expected to perform on unseen data.",
  },
  {
    question: "Which of the following is NOT a common type of data visualization?",
    options: ["Histogram", "Scatter plot", "Box plot", "Quantum plot"],
    correctAnswer: 3,
    subject: "data-science",
    difficultyLevel: "easy",
    explanation:
      "Quantum plot is not a standard type of data visualization. Common types include histograms, scatter plots, box plots, bar charts, line graphs, and heat maps.",
  },
  {
    question: "What does the term 'feature engineering' refer to in data science?",
    options: [
      "The process of selecting the best machine learning algorithm",
      "The process of creating new features from existing data",
      "The process of cleaning and preprocessing data",
      "The process of evaluating model performance",
    ],
    correctAnswer: 1,
    subject: "data-science",
    difficultyLevel: "medium",
    explanation:
      "Feature engineering is the process of using domain knowledge to extract features (characteristics, properties, attributes) from raw data to improve the performance of machine learning algorithms.",
  },
  {
    question: "Which of the following is a measure of how spread out the data is?",
    options: ["Mean", "Median", "Standard Deviation", "Mode"],
    correctAnswer: 2,
    subject: "data-science",
    difficultyLevel: "easy",
    explanation:
      "Standard deviation is a measure of the amount of variation or dispersion of a set of values, indicating how spread out the data is from the mean.",
  },
  {
    question: "What is the difference between classification and regression in machine learning?",
    options: [
      "Classification predicts continuous values, while regression predicts categorical values",
      "Classification predicts categorical values, while regression predicts continuous values",
      "Classification is supervised learning, while regression is unsupervised learning",
      "There is no difference; the terms are interchangeable",
    ],
    correctAnswer: 1,
    subject: "data-science",
    difficultyLevel: "medium",
    explanation:
      "Classification is used to predict discrete categorical output labels or classes, while regression is used to predict continuous numerical values.",
  },
]
