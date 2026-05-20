import pandas as pd
import numpy as np
from sklearn.naive_bayes import BernoulliNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score

train = pd.read_csv('Training.csv')
test = pd.read_csv('Testing.csv')
train['prognosis'] = train['prognosis'].str.strip()
test['prognosis'] = test['prognosis'].str.strip()
feature_cols = [c for c in test.columns if c != 'prognosis']
combined = pd.concat([train, test], ignore_index=True)
deduped = combined.drop_duplicates(subset=feature_cols + ['prognosis'])
X_all = deduped[feature_cols].astype(int).values
y_all = deduped['prognosis'].values

from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y_enc = le.fit_transform(y_all)

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

models = [
    ('BernoulliNB', BernoulliNB(alpha=1.0)),
    ('DecisionTree', DecisionTreeClassifier(random_state=42)),
]

for name, model in models:
    scores = cross_val_score(model, X_all, y_enc, cv=skf, scoring='accuracy', n_jobs=-1)
    print(f"{name} CV accuracy: {scores.mean():.4f} +/- {scores.std():.4f}")

for C in [1.0, 0.1, 0.01, 0.001]:
    lr = LogisticRegression(max_iter=2000, C=C, random_state=42)
    scores = cross_val_score(lr, X_all, y_enc, cv=skf, scoring='accuracy', n_jobs=-1)
    print(f"LogisticRegression C={C} CV: {scores.mean():.4f} +/- {scores.std():.4f}")
