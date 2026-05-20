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
X_train = train[feature_cols].astype(int)
y_train = train['prognosis']
X_test = test[feature_cols].astype(int)
y_test = test['prognosis']

print('Shapes:', X_train.shape, X_test.shape)

train_rows = set(map(tuple, X_train.values.tolist()))
test_rows = list(map(tuple, X_test.values.tolist()))
overlap_count = sum(1 for r in test_rows if r in train_rows)
print('Exact row overlap (test rows present in train):', overlap_count, '/', len(test_rows))

if overlap_count>0:
    row_to_labels = {}
    for idx, row in X_train.iterrows():
        key = tuple(row.values.tolist())
        row_to_labels.setdefault(key, []).append(y_train.iloc[idx])
    agree = 0
    for i,row in enumerate(test_rows):
        if row in row_to_labels:
            if y_test.iloc[i] in row_to_labels[row]:
                agree += 1
    print('Overlap rows with same label as in train:', agree, '/', overlap_count)

combined = pd.concat([X_train, X_test], ignore_index=True)
dup_within = combined.duplicated().sum()
print('Duplicate rows within combined dataset:', dup_within)

X_all = pd.concat([X_train, X_test], ignore_index=True).values
y_all = pd.concat([y_train, y_test], ignore_index=True).values

from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y_enc = le.fit_transform(y_all)

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

models = [
    ('BernoulliNB', BernoulliNB(alpha=1.0)),
    ('DecisionTree', DecisionTreeClassifier(random_state=42)),
    ('Logistic(C=1.0)', LogisticRegression(max_iter=1000, C=1.0, random_state=42)),
    ('Logistic(C=0.1)', LogisticRegression(max_iter=1000, C=0.1, random_state=42))
]

for name, model in models:
    scores = cross_val_score(model, X_all, y_enc, cv=skf, scoring='accuracy', n_jobs=-1)
    print(f"{name} CV accuracy: {scores.mean():.4f} ± {scores.std():.4f} (n={len(scores)})")
