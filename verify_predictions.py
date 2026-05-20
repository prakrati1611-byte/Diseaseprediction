import json
import pandas as pd
import numpy as np
from sklearn.naive_bayes import BernoulliNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression

def verify():
    print("Loading datasets...")
    train_df = pd.read_csv("Training.csv")
    test_df = pd.read_csv("Testing.csv")
    train_df['prognosis'] = train_df['prognosis'].str.strip()
    test_df['prognosis'] = test_df['prognosis'].str.strip()

    with open("model_data.json", "r") as f:
        model_bundle = json.load(f)

    features = model_bundle["features"]
    classes = model_bundle["classes"]

    X_test = test_df[features]
    y_test = test_df['prognosis']
    class_to_idx = {cls: idx for idx, cls in enumerate(classes)}
    y_test_idx = y_test.map(class_to_idx)

    # 1. Verify Naive Bayes
    print("\nVerifying Naive Bayes...")
    # Train sklearn reference
    nb_ref = BernoulliNB(alpha=1.0)
    nb_ref.fit(train_df[features], train_df['prognosis'].map(class_to_idx))
    ref_preds_nb = nb_ref.predict(X_test)

    # Custom implementation using JSON weights
    log_priors = np.array(model_bundle["naive_bayes"]["class_log_prior"])
    feature_prob = np.array(model_bundle["naive_bayes"]["feature_prob"])
    
    custom_preds_nb = []
    for idx, row in X_test.iterrows():
        x = row.values
        scores = []
        for c in range(len(classes)):
            # score = log_prior + sum(x_j * log(p_j) + (1-x_j) * log(1-p_j))
            score = log_priors[c]
            for j in range(len(features)):
                p = feature_prob[c][j]
                if x[j] == 1:
                    score += np.log(p)
                else:
                    score += np.log(1 - p)
            scores.append(score)
        custom_preds_nb.append(np.argmax(scores))

    nb_matches = np.sum(ref_preds_nb == custom_preds_nb)
    print(f"Naive Bayes matches: {nb_matches} / {len(X_test)}")
    assert nb_matches == len(X_test), "Naive Bayes custom predictions do not match scikit-learn reference!"

    # 2. Verify Logistic Regression
    print("\nVerifying Logistic Regression...")
    lr_ref = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    lr_ref.fit(train_df[features], train_df['prognosis'].map(class_to_idx))
    ref_preds_lr = lr_ref.predict(X_test)

    # Custom implementation using JSON coefficients
    coef = np.array(model_bundle["logistic_regression"]["coef"])
    intercept = np.array(model_bundle["logistic_regression"]["intercept"])

    custom_preds_lr = []
    for idx, row in X_test.iterrows():
        x = row.values
        scores = []
        for c in range(len(classes)):
            z = intercept[c] + np.dot(coef[c], x)
            scores.append(z)
        custom_preds_lr.append(np.argmax(scores))

    lr_matches = np.sum(ref_preds_lr == custom_preds_lr)
    print(f"Logistic Regression matches: {lr_matches} / {len(X_test)}")
    assert lr_matches == len(X_test), "Logistic Regression custom predictions do not match scikit-learn reference!"

    # 3. Verify Decision Tree
    print("\nVerifying Decision Tree...")
    dt_ref = DecisionTreeClassifier(random_state=42)
    dt_ref.fit(train_df[features], train_df['prognosis'].map(class_to_idx))
    ref_preds_dt = dt_ref.predict(X_test)

    # Custom implementation using JSON tree
    tree_root = model_bundle["decision_tree"]["root"]

    def traverse(node, x):
        if node["is_leaf"]:
            return node["probs"]
        feat_idx = node["feature_idx"]
        val = x[feat_idx]
        if val <= 0.5:
            return traverse(node["left"], x)
        else:
            return traverse(node["right"], x)

    custom_preds_dt = []
    for idx, row in X_test.iterrows():
        x = row.values
        probs = traverse(tree_root, x)
        custom_preds_dt.append(np.argmax(probs))

    dt_matches = np.sum(ref_preds_dt == custom_preds_dt)
    print(f"Decision Tree matches: {dt_matches} / {len(X_test)}")
    assert dt_matches == len(X_test), "Decision Tree custom predictions do not match scikit-learn reference!"

    print("\nVerification successful! All custom implementations match scikit-learn output perfectly.")

if __name__ == "__main__":
    verify()
