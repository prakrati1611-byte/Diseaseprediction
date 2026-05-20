import pandas as pd
import numpy as np
import json
from sklearn.naive_bayes import BernoulliNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder

# 1. Define Clinical Metadata for all 41 diseases
disease_metadata = {
    "Fungal infection": {
        "name": "Fungal Infection",
        "description": "An inflammatory skin condition caused by a fungal infection, leading to itching, redness, rashes, and peeling skin.",
        "specialist": "Dermatologist",
        "precautions": ["Bathe twice a day with clean water", "Use antiseptic soap or dettol", "Keep the affected area dry and clean", "Avoid sharing personal items like towels"]
    },
    "Allergy": {
        "name": "Allergic Reaction",
        "description": "An immune system response to foreign substances (allergens), causing sneezing, chills, shivering, and watering of the eyes.",
        "specialist": "Allergist / Immunologist",
        "precautions": ["Apply calamine lotion to soothe skin irritation", "Cover your mouth and nose when sneezing", "Identify and avoid contact with allergen triggers", "Take over-the-counter antihistamines as advised"]
    },
    "GERD": {
        "name": "GERD (Acid Reflux)",
        "description": "Gastroesophageal reflux disease occurs when stomach acid frequently flows back into the tube connecting your mouth and stomach, causing heartburn.",
        "specialist": "Gastroenterologist",
        "precautions": ["Avoid fatty, greasy, or spicy foods", "Avoid lying down for at least 2-3 hours after eating", "Maintain a healthy weight", "Avoid alcohol and smoking"]
    },
    "Chronic cholestasis": {
        "name": "Chronic Cholestasis",
        "description": "A condition where the flow of bile from the liver is reduced or blocked, leading to itching, yellow skin, dark urine, and nausea.",
        "specialist": "Hepatologist / Gastroenterologist",
        "precautions": ["Maintain a low-fat, highly nutritious diet", "Avoid alcohol and taxing medications", "Stay hydrated and moisturize skin to reduce itching", "Schedule regular liver panel checkups"]
    },
    "Drug Reaction": {
        "name": "Drug Reaction",
        "description": "An adverse reaction of the body's immune system to a medication, causing skin rashes, itching, fever, and stomach discomfort.",
        "specialist": "Allergist / Dermatologist",
        "precautions": ["Stop taking the suspected medication immediately", "Consult your prescribing doctor or emergency services", "Stay hydrated and monitor breathing closely", "Note the drug name to avoid future exposure"]
    },
    "Peptic ulcer diseae": {
        "name": "Peptic Ulcer Disease",
        "description": "Sores that develop on the inner lining of the stomach, lower esophagus, or small intestine, causing burning abdominal pain.",
        "specialist": "Gastroenterologist",
        "precautions": ["Avoid spicy, acidic, and fried foods", "Eat small, frequent meals rather than large ones", "Limit caffeine and avoid NSAID painkillers", "Practice stress reduction techniques"]
    },
    "AIDS": {
        "name": "AIDS / HIV",
        "description": "Acquired Immunodeficiency Syndrome is a chronic, life-threatening condition caused by the human immunodeficiency virus (HIV), severely weakening the immune system.",
        "specialist": "Infectious Disease Specialist",
        "precautions": ["Adhere strictly to prescribed Antiretroviral Therapy (ART)", "Practice safe intercourse and avoid sharing needles", "Maintain hygiene to prevent opportunistic infections", "Eat a highly nutritious diet to boost energy"]
    },
    "Diabetes ": {
        "name": "Diabetes Mellitus",
        "description": "A chronic metabolic disorder characterized by elevated blood glucose levels due to insufficient insulin production or action, causing fatigue and excessive urination.",
        "specialist": "Endocrinologist",
        "precautions": ["Monitor blood sugar levels regularly", "Maintain a low-carbohydrate, high-fiber diet", "Engage in regular physical exercise", "Consult your doctor for medication adjustment"]
    },
    "Gastroenteritis": {
        "name": "Gastroenteritis (Stomach Flu)",
        "description": "Inflammation of the stomach and intestines, typically caused by bacterial or viral infection, leading to vomiting, cramps, and watery diarrhea.",
        "specialist": "Gastroenterologist",
        "precautions": ["Drink plenty of fluids containing electrolytes (ORS)", "Follow a bland diet (BRAT: Bananas, Rice, Applesauce, Toast)", "Wash hands frequently with warm soapy water", "Avoid dairy, caffeine, and greasy foods"]
    },
    "Bronchial Asthma": {
        "name": "Bronchial Asthma",
        "description": "A chronic respiratory condition characterized by inflammation, swelling, and narrowing of the airways, causing breathlessness, wheezing, and coughing.",
        "specialist": "Pulmonologist",
        "precautions": ["Always keep your rescue inhaler on hand", "Avoid dust, pet dander, tobacco smoke, and strong odors", "Stay warm during cold weather spells", "Practice deep breathing exercises regularly"]
    },
    "Hypertension ": {
        "name": "Hypertension (High Blood Pressure)",
        "description": "A common cardiovascular condition where the long-term force of blood against your artery walls is consistently too high, increasing heart disease risk.",
        "specialist": "Cardiologist / General Physician",
        "precautions": ["Significantly reduce dietary sodium/salt intake", "Engage in moderate aerobic exercise (e.g., walking) daily", "Monitor blood pressure at home and record readings", "Limit caffeine and practice relaxation techniques"]
    },
    "Migraine": {
        "name": "Migraine",
        "description": "A neurological condition that causes intense, throbbing, debilitating headaches, often accompanied by nausea, and sensitivity to light and sound.",
        "specialist": "Neurologist",
        "precautions": ["Rest in a dark, quiet, well-ventilated room", "Apply a cold or warm compress to your forehead/neck", "Maintain regular sleep and meal schedules", "Identify and avoid trigger foods (e.g., aged cheese, MSG)"]
    },
    "Cervical spondylosis": {
        "name": "Cervical Spondylosis",
        "description": "Age-related wear and tear affecting the spinal disks in your neck, causing stiffness, chronic neck pain, and occasional numbness in arms.",
        "specialist": "Orthopedic Specialist / Physiotherapist",
        "precautions": ["Use an ergonomic cervical pillow for sleeping", "Perform gentle neck stretching exercises daily", "Avoid lifting heavy objects or putting strain on neck", "Maintain proper posture while working on screens"]
    },
    "Paralysis (brain hemorrhage)": {
        "name": "Paralysis (Brain Hemorrhage)",
        "description": "A sudden loss of muscle function in parts of the body, caused by ruptured blood vessels in the brain leading to tissue damage.",
        "specialist": "Neurologist / Neurosurgeon",
        "precautions": ["Seek emergency medical intervention immediately", "Strictly monitor and manage blood pressure levels", "Begin rehabilitation and physiotherapy early", "Ensure assistive devices are used to prevent falls"]
    },
    "Jaundice": {
        "name": "Jaundice",
        "description": "A yellowish discoloration of the skin, mucous membranes, and whites of the eyes caused by elevated bilirubin levels, often due to liver disorders.",
        "specialist": "Hepatologist",
        "precautions": ["Drink plenty of warm, filtered water", "Avoid fatty, fried, and heavily spiced foods", "Take complete physical rest", "Consume easily digestible, carb-rich foods like fruit juices"]
    },
    "Malaria": {
        "name": "Malaria",
        "description": "A serious, sometimes fatal disease caused by plasmodium parasites transmitted through the bites of infected female Anopheles mosquitoes, causing fever, shaking chills, and sweating.",
        "specialist": "Infectious Disease Specialist",
        "precautions": ["Use mosquito bed nets treated with insecticide", "Apply mosquito repellent containing DEET to exposed skin", "Wear long-sleeved clothing and pants outdoors", "Take prescribed antimalarial medications fully"]
    },
    "Chicken pox": {
        "name": "Chickenpox",
        "description": "A highly contagious viral infection causing an itchy, blister-like rash all over the body, along with fever, fatigue, and muscle aches.",
        "specialist": "Dermatologist / Pediatrician",
        "precautions": ["Avoid scratching the blisters to prevent scarring", "Isolate yourself from others to prevent transmission", "Take lukewarm baths with colloidal oatmeal or baking soda", "Apply soothing calamine lotion to the itchy spots"]
    },
    "Dengue": {
        "name": "Dengue Fever",
        "description": "A mosquito-borne viral disease causing a high fever, severe headache, severe joint and muscle pain ('breakbone fever'), and rash.",
        "specialist": "Infectious Disease Specialist",
        "precautions": ["Ensure high fluid intake (hydration is critical)", "Use mosquito netting and clear stagnant water around the home", "Take paracetamol for pain; avoid aspirin or ibuprofen", "Monitor blood platelet count closely"]
    },
    "Typhoid": {
        "name": "Typhoid Fever",
        "description": "A life-threatening bacterial infection caused by Salmonella typhi, spreading through contaminated food and water, causing sustained fever, weakness, and abdominal pain.",
        "specialist": "Infectious Disease Specialist",
        "precautions": ["Drink only boiled, bottled, or purified water", "Eat hot, freshly cooked food; avoid raw street food", "Wash hands thoroughly with soap before meals", "Complete the full course of prescribed antibiotics"]
    },
    "hepatitis A": {
        "name": "Hepatitis A",
        "description": "A highly contagious liver infection caused by the hepatitis A virus, usually spread through contaminated food, water, or close contact.",
        "specialist": "Hepatologist / Gastroenterologist",
        "precautions": ["Drink clean, filtered water", "Wash hands rigorously after using the bathroom", "Avoid alcohol consumption completely", "Eat light, nutritious meals to ease liver load"]
    },
    "Hepatitis B": {
        "name": "Hepatitis B",
        "description": "A serious liver infection caused by the hepatitis B virus, which can become chronic, potentially leading to liver scarring (cirrhosis) or liver cancer.",
        "specialist": "Hepatologist",
        "precautions": ["Get vaccinated against Hepatitis B if not already immune", "Do not share needles, razors, or personal hygiene items", "Practice safe intercourse", "Consult a hepatologist for antiviral monitoring"]
    },
    "Hepatitis C": {
        "name": "Hepatitis C",
        "description": "An infectious liver disease caused by the Hepatitis C virus, which primarily spreads through blood-to-blood contact and can lead to chronic liver damage.",
        "specialist": "Hepatologist",
        "precautions": ["Avoid sharing needles or personal care items", "Get tested regularly if at risk", "Follow prescribed direct-acting antiviral treatments", "Maintain a healthy, low-fat, alcohol-free diet"]
    },
    "Hepatitis D": {
        "name": "Hepatitis D",
        "description": "A liver disease caused by the Hepatitis D virus, which only replicates in the presence of an active Hepatitis B infection, causing severe acute or chronic liver disease.",
        "specialist": "Hepatologist",
        "precautions": ["Ensure protection against Hepatitis B via vaccination", "Avoid sharing personal items and needles", "Consult an experienced hepatologist", "Avoid alcohol and liver-taxing medications"]
    },
    "Hepatitis E": {
        "name": "Hepatitis E",
        "description": "A liver disease caused by the Hepatitis E virus, predominantly transmitted through fecal contamination of drinking water.",
        "specialist": "Hepatologist",
        "precautions": ["Drink clean, boiled, or bottled water", "Maintain strict personal and environmental sanitation", "Thoroughly cook pork, venison, and shellfish", "Ensure bed rest and follow up on liver enzymes"]
    },
    "Alcoholic hepatitis": {
        "name": "Alcoholic Hepatitis",
        "description": "Inflammation of the liver caused by heavy, long-term drinking of alcohol. Symptoms include yellowing skin, abdominal fluid retention, and nausea.",
        "specialist": "Hepatologist / Gastroenterologist",
        "precautions": ["Stop all alcohol consumption immediately and permanently", "Follow a high-protein, calorie-dense diet under medical guidance", "Seek support groups or therapy for alcohol dependency", "Monitor liver enzymes and abdominal swelling"]
    },
    "Tuberculosis": {
        "name": "Tuberculosis (TB)",
        "description": "A serious infectious bacterial disease that primarily affects the lungs, causing chronic cough with blood, fever, night sweats, and weight loss.",
        "specialist": "Pulmonologist / Infectious Disease Specialist",
        "precautions": ["Complete the entire 6-to-9 month course of antibiotics", "Wear a face mask in public to prevent transmission", "Ensure your room is well-ventilated and gets sunlight", "Practice good respiratory hygiene (cover mouth when coughing)"]
    },
    "Common Cold": {
        "name": "Common Cold",
        "description": "A mild, self-limiting viral infection of the upper respiratory tract, causing runny nose, sneezing, scratchy throat, and mild fever.",
        "specialist": "General Physician",
        "precautions": ["Drink warm fluids like herbal teas and broths", "Gargle with warm salt water to relieve throat irritation", "Get plenty of rest and sleep", "Wash hands regularly to avoid spreading the virus"]
    },
    "Pneumonia": {
        "name": "Pneumonia",
        "description": "An infection that inflames the air sacs (alveoli) in one or both lungs, which may fill with fluid or pus, causing chest pain, fever, chills, and difficulty breathing.",
        "specialist": "Pulmonologist",
        "precautions": ["Take prescribed antibiotics or antivirals as directed", "Use a humidifier or inhale steam to loosen mucus", "Get plenty of bed rest and avoid physical exertion", "Stay warm and hydrated"]
    },
    "Dimorphic hemmorhoids(piles)": {
        "name": "Dimorphic Hemorrhoids (Piles)",
        "description": "Swollen and inflamed veins in the anus and lower rectum, which can cause pain, bleeding, itching, and discomfort during bowel movements.",
        "specialist": "General Surgeon / Proctologist",
        "precautions": ["Consume a high-fiber diet (fruits, vegetables, whole grains)", "Drink 8-10 glasses of water daily", "Avoid straining or sitting on the toilet for too long", "Take warm sitz baths for 15-20 minutes daily"]
    },
    "Heart attack": {
        "name": "Myocardial Infarction (Heart Attack)",
        "description": "A critical emergency where blood flow to a part of the heart muscle is blocked, causing chest pain, pressure, breathlessness, and sweating.",
        "specialist": "Cardiologist",
        "precautions": ["Call emergency services (911/112) immediately", "Chew an aspirin if recommended by emergency dispatchers", "Sit down, remain calm, and loosen tight clothing", "Ensure easy access for paramedics to enter the premises"]
    },
    "Varicose veins": {
        "name": "Varicose Veins",
        "description": "Enlarged, gnarled, and twisted veins, most commonly visible in the legs, caused by weak or damaged vein walls and valves that restrict proper blood flow back to the heart.",
        "specialist": "Vascular Surgeon",
        "precautions": ["Avoid standing or sitting in one position for long periods", "Elevate your legs above heart level when resting", "Wear graduated compression stockings daily", "Maintain a healthy weight and exercise legs regularly"]
    },
    "Hypothyroidism": {
        "name": "Hypothyroidism",
        "description": "An underactive thyroid condition where the thyroid gland fails to produce sufficient thyroid hormones, resulting in a slowed metabolism, weight gain, fatigue, and depression.",
        "specialist": "Endocrinologist",
        "precautions": ["Take daily thyroid hormone replacement therapy as prescribed", "Monitor Thyroid Stimulating Hormone (TSH) levels regularly", "Eat a balanced, nutrient-rich diet", "Manage fatigue through regular, light exercise"]
    },
    "Hyperthyroidism": {
        "name": "Hyperthyroidism",
        "description": "An overactive thyroid condition characterized by excessive production of thyroid hormones, causing rapid heart rate, weight loss, anxiety, and heat intolerance.",
        "specialist": "Endocrinologist",
        "precautions": ["Take prescribed anti-thyroid medications regularly", "Reduce intake of high-iodine foods (like seaweed/seafood)", "Stay hydrated and avoid stimulant beverages like caffeine", "Ensure regular follow-ups for hormone monitoring"]
    },
    "Hypoglycemia": {
        "name": "Hypoglycemia",
        "description": "A condition characterized by abnormally low blood glucose levels, causing shaking, sweating, rapid heart rate, anxiety, and confusion. It requires immediate sugar intake.",
        "specialist": "Endocrinologist / General Physician",
        "precautions": ["Consume 15g of fast-acting carbs (juice, candy) immediately", "Check blood glucose levels 15 minutes after eating sugar", "Eat regular, well-balanced meals throughout the day", "Always carry fast-acting glucose tablets or snacks"]
    },
    "Osteoarthristis": {
        "name": "Osteoarthritis",
        "description": "A degenerative joint disease where the protective cartilage cushioning the ends of the bones wears down over time, causing joint pain, stiffness, and decreased mobility.",
        "specialist": "Rheumatologist / Orthopedist",
        "precautions": ["Perform low-impact joint exercises (swimming, cycling)", "Maintain an optimal body weight to reduce joint stress", "Apply hot or cold packs to painful joints", "Use supportive footwear or joint braces as needed"]
    },
    "Arthritis": {
        "name": "Arthritis",
        "description": "Inflammation of one or more joints, leading to persistent pain, stiffness, swelling, and reduced range of motion that typically worsens with age.",
        "specialist": "Rheumatologist",
        "precautions": ["Engage in regular stretching and light exercises", "Eat an anti-inflammatory diet rich in Omega-3 fatty acids", "Use hot packs for stiffness and cold packs for swelling", "Avoid repetitive joint-straining tasks"]
    },
    "(vertigo) Paroymsal  Positional Vertigo": {
        "name": "Benign Paroxysmal Positional Vertigo (BPPV)",
        "description": "An inner ear disorder characterized by brief, severe episodes of a spinning sensation (vertigo) triggered by specific changes in head position.",
        "specialist": "ENT Specialist / Neurologist",
        "precautions": ["Avoid sudden, rapid head movements or bending over", "Perform specific head maneuvers (e.g., Epley maneuver) under guidance", "Sit down immediately when a spinning sensation occurs", "Keep pathways clear of hazards in case of balance loss"]
    },
    "Acne": {
        "name": "Acne vulgaris",
        "description": "A common skin condition occurring when hair follicles become clogged with oil and dead skin cells, causing pimples, blackheads, whiteheads, and scarring.",
        "specialist": "Dermatologist",
        "precautions": ["Wash face twice daily with a mild, non-comedogenic cleanser", "Avoid touching, picking, or popping pimples", "Use oil-free, water-based skincare and cosmetics", "Drink plenty of water and maintain a clean pillowcase"]
    },
    "Urinary tract infection": {
        "name": "Urinary Tract Infection (UTI)",
        "description": "An infection in any part of the urinary system, typically the bladder or urethra, causing pain, a burning sensation during urination, and frequent urination.",
        "specialist": "Urologist / General Physician",
        "precautions": ["Drink plenty of water to help flush out bacteria", "Maintain good personal hygiene (wipe front to back)", "Urinate promptly after intercourse", "Complete the entire course of prescribed antibiotics"]
    },
    "Psoriasis": {
        "name": "Psoriasis",
        "description": "A chronic autoimmune skin disease that accelerates the lifecycle of skin cells, leading to thick, red, itchy patches covered with silvery scales.",
        "specialist": "Dermatologist",
        "precautions": ["Keep your skin well-moisturized daily", "Avoid skin injuries, cuts, and prolonged sun exposure", "Identify and manage stress triggers", "Limit alcohol and quit smoking"]
    },
    "Impetigo": {
        "name": "Impetigo",
        "description": "A highly contagious bacterial skin infection, primarily affecting children, causing sores and blisters around the nose and mouth that rupture and form honey-colored crusts.",
        "specialist": "Dermatologist / Pediatrician",
        "precautions": ["Gently wash the sores with warm, soapy water", "Cover the affected area with loose bandages to prevent spread", "Wash hands frequently and keep nails short", "Wash infected clothing, towels, and sheets separately"]
    }
}

def train_and_export():
    print("Loading data...")
    train_df = pd.read_csv("Training.csv")
    test_df = pd.read_csv("Testing.csv")

    # Clean prognosis names in datasets (remove trailing spaces to ensure alignment)
    train_df['prognosis'] = train_df['prognosis'].str.strip()
    test_df['prognosis'] = test_df['prognosis'].str.strip()

    # Identify and align columns using Testing.csv features as master list
    # (drops 'Unnamed: 133' from training if present due to trailing commas)
    feature_cols = [col for col in test_df.columns if col != 'prognosis']

    X_train = train_df[feature_cols]
    y_train = train_df['prognosis']
    X_test = test_df[feature_cols]
    y_test = test_df['prognosis']

    # --- Diagnostics: check for overlap / duplicates which can cause inflated accuracy ---
    train_rows = set(map(tuple, X_train.astype(int).values.tolist()))
    test_rows = list(map(tuple, X_test.astype(int).values.tolist()))
    overlap_count = sum(1 for r in test_rows if r in train_rows)
    print(f"Exact row overlap (test rows present in train): {overlap_count} / {len(test_rows)}")

    combined = pd.concat([X_train, X_test], ignore_index=True)
    dup_within = combined.duplicated().sum()
    print(f"Duplicate rows within combined dataset: {dup_within}")

    # If overlap or many duplicates exist, rebuild a clean split from the union of data
    if overlap_count > 0 or dup_within > 0:
        print("Detected overlap/duplicates between Training and Testing sets — rebuilding a deduplicated stratified split to avoid leakage.")
        combined_df = pd.concat([train_df, test_df], ignore_index=True)
        # Drop exact duplicate rows across features+label
        deduped = combined_df.drop_duplicates(subset=feature_cols + ['prognosis'])
        X_all = deduped[feature_cols].astype(int)
        y_all = deduped['prognosis']
        # Stratified split
        X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.2, random_state=42, stratify=y_all)
        print(f"After dedup/resplit — train: {X_train.shape}, test: {X_test.shape}")

    # Get class list (sorted alphabetically to guarantee stable indexing)
    classes = sorted(list(y_train.unique()))
    print(f"Total diseases: {len(classes)}")

    # Encode labels
    class_to_idx = {cls: idx for idx, cls in enumerate(classes)}
    y_train_idx = y_train.map(class_to_idx)
    y_test_idx = y_test.map(class_to_idx)

    # 2. Train Bernoulli Naive Bayes
    print("Training Naive Bayes...")
    nb = BernoulliNB(alpha=1.0)
    nb.fit(X_train, y_train_idx)
    nb_test_acc = accuracy_score(y_test_idx, nb.predict(X_test))
    print(f"Naive Bayes Test Accuracy: {nb_test_acc:.4f}")

    # Export NB weights
    # class_log_prior_: shape (n_classes,)
    # feature_log_prob_: shape (n_classes, n_features)
    nb_data = {
        "class_log_prior": nb.class_log_prior_.tolist(),
        "feature_log_prob": nb.feature_log_prob_.tolist(),
        "feature_prob": np.exp(nb.feature_log_prob_).tolist() # Probabilities directly for convenience
    }

    # 3. Train Decision Tree with better capacity (to reduce underfitting)
    print("Training Decision Tree...")
    # Tune: increase max_depth and reduce min_samples_leaf to allow more complex trees
    dt = DecisionTreeClassifier(max_depth=20, min_samples_leaf=2, random_state=42)
    dt.fit(X_train, y_train_idx)
    dt_test_acc = accuracy_score(y_test_idx, dt.predict(X_test))
    print(f"Decision Tree Test Accuracy: {dt_test_acc:.4f}")

    # Serialize Decision Tree recursively
    tree = dt.tree_
    def serialize_tree_node(node_id):
        if tree.children_left[node_id] == -1: # Leaf
            # Class distribution at leaf node
            value = tree.value[node_id][0]
            total = sum(value)
            probs = [float(v) / total for v in value]
            return {
                "is_leaf": True,
                "probs": probs
            }
        else:
            return {
                "is_leaf": False,
                "feature_idx": int(tree.feature[node_id]),
                "left": serialize_tree_node(int(tree.children_left[node_id])),
                "right": serialize_tree_node(int(tree.children_right[node_id]))
            }

    dt_data = {
        "root": serialize_tree_node(0)
    }

    # 4. Train Logistic Regression with regularization (C=0.1) to prevent overfitting
    print("Training Logistic Regression...")
    lr = LogisticRegression(max_iter=1000, C=0.1, random_state=42)
    lr.fit(X_train, y_train_idx)
    lr_test_acc = accuracy_score(y_test_idx, lr.predict(X_test))
    print(f"Logistic Regression Test Accuracy: {lr_test_acc:.4f}")

    # Validate models with 5-fold stratified cross-validation
    print("\n--- Cross-Validation Results (5-Fold Stratified) ---")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    X_all = pd.concat([X_train.reset_index(drop=True), X_test.reset_index(drop=True)], ignore_index=True)
    y_all = pd.concat([y_train.reset_index(drop=True), y_test.reset_index(drop=True)], ignore_index=True)
    
    nb_cv_scores = cross_val_score(BernoulliNB(alpha=1.0), X_all, y_all, cv=skf, scoring='accuracy')
    print(f"Naive Bayes CV: {nb_cv_scores.mean():.4f} +/- {nb_cv_scores.std():.4f}")
    
    dt_cv_scores = cross_val_score(DecisionTreeClassifier(max_depth=20, min_samples_leaf=2, random_state=42), X_all, y_all, cv=skf, scoring='accuracy')
    print(f"Decision Tree CV: {dt_cv_scores.mean():.4f} +/- {dt_cv_scores.std():.4f}")
    
    lr_cv_scores = cross_val_score(LogisticRegression(max_iter=1000, C=0.1, random_state=42), X_all, y_all, cv=skf, scoring='accuracy')
    print(f"Logistic Regression (C=0.1) CV: {lr_cv_scores.mean():.4f} +/- {lr_cv_scores.std():.4f}")
    print()

    # Export Logistic Regression parameters
    lr_data = {
        "coef": lr.coef_.tolist(), # shape (n_classes, n_features)
        "intercept": lr.intercept_.tolist() # shape (n_classes,)
    }

    # 5. Format Metadata mapping
    # Clean the keys of disease_metadata to ensure exact matches with stripped dataset prognosis names
    cleaned_metadata = {}
    for key, val in disease_metadata.items():
        cleaned_metadata[key.strip()] = val

    # Verify all dataset prognosis classes have metadata
    missing_metadata = [c for c in classes if c not in cleaned_metadata]
    if missing_metadata:
        print(f"Warning: Missing metadata for classes: {missing_metadata}")
        for missing in missing_metadata:
            cleaned_metadata[missing] = {
                "name": missing,
                "description": f"A medical condition resulting in symptoms including {', '.join(feature_cols[:5])}.",
                "specialist": "General Physician",
                "precautions": ["Consult a medical professional", "Rest and recover", "Stay hydrated", "Monitor symptoms"]
            }

    # Complete bundle
    model_bundle = {
        "features": feature_cols,
        "classes": classes,
        "naive_bayes": nb_data,
        "decision_tree": dt_data,
        "logistic_regression": lr_data,
        "metadata": cleaned_metadata
    }

    # Save to file
    with open("model_data.json", "w") as f:
        json.dump(model_bundle, f, indent=2)

    print("Success! Created model_data.json")

if __name__ == "__main__":
    train_and_export()
