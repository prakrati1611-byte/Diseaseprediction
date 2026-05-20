// Nova Health App Logic

// 1. Application State
let modelData = null;
let selectedSymptoms = new Set();
let activeRegion = 'all';
let autocompleteTimeout = null;

// Symptom to Region Mapping (Standardizes which body map region highlights which symptoms)
const symptomRegionMap = {
    // Head & Neck
    "headache": "head",
    "dizziness": "head",
    "neck_pain": "head",
    "stiff_neck": "head",
    "spinning_movements": "head",
    "loss_of_balance": "head",
    "unsteadiness": "head",
    "visual_disturbances": "head",
    "blurred_and_distorted_vision": "head",
    "pain_behind_the_eyes": "head",
    "patches_in_throat": "head",
    "throat_irritation": "head",
    "sinus_pressure": "head",
    "runny_nose": "head",
    "congestion": "head",
    "loss_of_smell": "head",
    "drying_and_tingling_lips": "head",
    "slurred_speech": "head",
    "puffy_face_and_eyes": "head",
    "enlarged_thyroid": "head",
    "watering_from_eyes": "head",
    "ulcers_on_tongue": "head",

    // Chest & Cardio-Respiratory
    "cough": "chest",
    "breathlessness": "chest",
    "phlegm": "chest",
    "chest_pain": "chest",
    "fast_heart_rate": "chest",
    "palpitations": "chest",
    "rusty_sputum": "chest",
    "blood_in_sputum": "chest",
    "mucoid_sputum": "chest",

    // Abdomen & Digestive
    "stomach_pain": "abdomen",
    "acidity": "abdomen",
    "vomiting": "abdomen",
    "indigestion": "abdomen",
    "abdominal_pain": "abdomen",
    "diarrhoea": "abdomen",
    "constipation": "abdomen",
    "swelling_of_stomach": "abdomen",
    "distention_of_abdomen": "abdomen",
    "stomach_bleeding": "abdomen",
    "belly_pain": "abdomen",
    "nausea": "abdomen",
    "loss_of_appetite": "abdomen",
    "acute_liver_failure": "abdomen",

    // Urinary & Pelvic
    "burning_micturition": "urinary",
    "spotting_urination": "urinary",
    "yellow_urine": "urinary",
    "bladder_discomfort": "urinary",
    "foul_smell_of_urine": "urinary",
    "continuous_feel_of_urine": "urinary",

    // Joints & Limbs (Mobility)
    "joint_pain": "joints",
    "swelling_joints": "joints",
    "movement_stiffness": "joints",
    "knee_pain": "joints",
    "hip_joint_pain": "joints",
    "muscle_weakness": "joints",
    "weakness_in_limbs": "joints",
    "weakness_of_one_body_side": "joints",
    "painful_walking": "joints",
    "back_pain": "joints",
    "muscle_pain": "joints",
    "swollen_legs": "joints",
    "swollen_extremeties": "joints",
    "prominent_veins_on_calf": "joints",

    // Skin & Surface / General Systemic (defaults to skin/systemic)
    "itching": "skin",
    "skin_rash": "skin",
    "nodal_skin_eruptions": "skin",
    "yellowish_skin": "skin",
    "yellowing_of_eyes": "skin",
    "red_spots_over_body": "skin",
    "dischromic_patches": "skin",
    "brittle_nails": "skin",
    "small_dents_in_nails": "skin",
    "inflammatory_nails": "skin",
    "pus_filled_pimples": "skin",
    "blackheads": "skin",
    "scurring": "skin",
    "skin_peeling": "skin",
    "silver_like_dusting": "skin",
    "blister": "skin",
    "red_sore_around_nose": "skin",
    "yellow_crust_ooze": "skin",
    "bruising": "skin"
};

// UI Categories for the accordion browse panel
const uiCategories = {
    "General & Systemic": [
        "chills", "shivering", "fatigue", "weight_gain", "weight_loss", "lethargy", 
        "high_fever", "mild_fever", "sweating", "dehydration", "malaise", "obesity",
        "excessive_hunger", "increased_appetite", "polyuria", "family_history", 
        "anxiety", "depression", "irritability", "lack_of_concentration",
        "cold_hands_and_feets", "mood_swings", "restlessness", "sunken_eyes",
        "fluid_overload", "swelled_lymph_nodes", "altered_sensorium", "coma",
        "history_of_alcohol_consumption", "receiving_blood_transfusion", 
        "receiving_unsterile_injections", "extra_marital_contacts", "internal_itching",
        "toxic_look_(typhos)", "passage_of_gases"
    ],
    "Head, Neck & Sensory": [
        "headache", "dizziness", "neck_pain", "stiff_neck", "spinning_movements",
        "loss_of_balance", "unsteadiness", "visual_disturbances", 
        "blurred_and_distorted_vision", "pain_behind_the_eyes", "patches_in_throat",
        "throat_irritation", "sinus_pressure", "runny_nose", "congestion",
        "loss_of_smell", "drying_and_tingling_lips", "slurred_speech",
        "puffy_face_and_eyes", "enlarged_thyroid", "watering_from_eyes",
        "ulcers_on_tongue"
    ],
    "Chest & Cardio-Respiratory": [
        "cough", "breathlessness", "phlegm", "chest_pain", "fast_heart_rate",
        "palpitations", "rusty_sputum", "blood_in_sputum", "mucoid_sputum"
    ],
    "Abdomen & Gastrointestinal": [
        "stomach_pain", "acidity", "vomiting", "indigestion", "abdominal_pain",
        "diarrhoea", "constipation", "swelling_of_stomach", "distention_of_abdomen",
        "stomach_bleeding", "belly_pain", "nausea", "loss_of_appetite",
        "acute_liver_failure"
    ],
    "Urinary & Reproductive": [
        "burning_micturition", "spotting_urination", "yellow_urine", 
        "bladder_discomfort", "foul_smell_of_urine", "continuous_feel_of_urine"
    ],
    "Joints, Muscles & Limbs": [
        "joint_pain", "swelling_joints", "movement_stiffness", "knee_pain",
        "hip_joint_pain", "muscle_weakness", "weakness_in_limbs", 
        "weakness_of_one_body_side", "painful_walking", "back_pain",
        "muscle_pain", "swollen_legs", "swollen_extremeties", 
        "prominent_veins_on_calf"
    ],
    "Skin, Nails & Surface": [
        "itching", "skin_rash", "nodal_skin_eruptions", "yellowish_skin",
        "yellowing_of_eyes", "red_spots_over_body", "dischromic_patches",
        "brittle_nails", "small_dents_in_nails", "inflammatory_nails",
        "pus_filled_pimples", "blackheads", "scurring", "skin_peeling",
        "silver_like_dusting", "blister", "red_sore_around_nose", 
        "yellow_crust_ooze", "bruising"
    ]
};

// Helper: Format column/symptom code into user friendly display string
function formatSymptomName(sym) {
    return sym.replace(/_/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase())
              .replace(/\(typhos\)/gi, '')
              .replace(/  +/g, ' ')
              .trim();
}

// 2. Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    loadModels();
    setupEventListeners();
});

// Load the exported models JSON
async function loadModels() {
    try {
        const response = await fetch('model_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        modelData = await response.json();
        console.log("Model Data loaded successfully:", modelData);
        
        // Initialize UI components using the feature list
        populateAccordion();
        renderRegionSymptoms();
        updateSymptomCounters();
        initMedicalLibrary();
    } catch (error) {
        console.error("Failed to load model parameters:", error);
        alert("Warning: Could not load the machine learning model files. Please verify that model_data.json was generated correctly.");
    }
}

// 3. Set Up DOM Event Handlers
function setupEventListeners() {
    // Autocomplete Search
    const searchInput = document.getElementById("symptom-search");
    const clearSearchBtn = document.getElementById("clear-search");
    
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length > 0) {
            clearSearchBtn.style.display = "block";
            
            // Debounce dropdown display
            clearTimeout(autocompleteTimeout);
            autocompleteTimeout = setTimeout(() => {
                showAutocomplete(query);
            }, 100);
        } else {
            clearSearchBtn.style.display = "none";
            document.getElementById("autocomplete-list").style.display = "none";
        }
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        document.getElementById("autocomplete-list").style.display = "none";
        searchInput.focus();
    });

    // Close autocomplete when clicking outside
    document.addEventListener("click", (e) => {
        const autocompleteList = document.getElementById("autocomplete-list");
        if (e.target !== searchInput && !autocompleteList.contains(e.target)) {
            autocompleteList.style.display = "none";
        }
    });

    // Clear All button
    document.getElementById("clear-all-symptoms").addEventListener("click", () => {
        selectedSymptoms.clear();
        updateSelectedPills();
        updateSymptomCounters();
        renderRegionSymptoms();
        
        // Deselect any selected items in general grids
        document.querySelectorAll(".symptom-item.selected").forEach(el => {
            el.classList.remove("selected");
        });
        
        runDiagnostics();
    });

    // Tab buttons switching
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });

    // SVG Body Silhouette Clicks
    const svgRegions = document.querySelectorAll("#body-silhouette-svg .interactive-region");
    svgRegions.forEach(region => {
        region.addEventListener("click", () => {
            const regionName = region.dataset.region;
            
            // Toggle active state
            if (region.classList.contains("active")) {
                region.classList.remove("active");
                setActiveRegion("all");
            } else {
                svgRegions.forEach(r => r.classList.remove("active"));
                region.classList.add("active");
                setActiveRegion(regionName);
            }
        });
    });

    // Region Quick Links Clicks
    document.querySelectorAll(".region-quick-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".region-quick-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const regionName = btn.dataset.region;
            
            // Align SVG active class
            const svgRegions = document.querySelectorAll("#body-silhouette-svg .interactive-region");
            svgRegions.forEach(r => {
                if (r.dataset.region === regionName) {
                    r.classList.add("active");
                } else {
                    r.classList.remove("active");
                }
            });
            
            setActiveRegion(regionName);
        });
    });

    // Reset Map Filter
    document.getElementById("reset-region-filter").addEventListener("click", () => {
        const svgRegions = document.querySelectorAll("#body-silhouette-svg .interactive-region");
        svgRegions.forEach(r => r.classList.remove("active"));
        
        document.querySelectorAll(".region-quick-btn").forEach(b => b.classList.remove("active"));
        document.querySelector('.region-quick-btn[data-region="all"]').classList.add("active");
        
        setActiveRegion("all");
    });

    // Print Report Button
    document.getElementById("print-report").addEventListener("click", () => {
        window.print();
    });

    // Single-page navigation link handlers
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            const pageId = link.dataset.page;
            switchPage(pageId);
        });
    });

    // Medical Library search input filter
    const libSearch = document.getElementById("library-search");
    if (libSearch) {
        libSearch.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            filterLibrary(query);
        });
    }

    // Modal close button
    const closeModalBtn = document.getElementById("close-modal");
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", hideDiseaseModal);
    }

    // Modal background overlay click to close
    const diseaseModal = document.getElementById("disease-modal");
    if (diseaseModal) {
        diseaseModal.addEventListener("click", (e) => {
            if (e.target === diseaseModal) {
                hideDiseaseModal();
            }
        });
    }

    // Nova AI Listeners
    const aiChatSend = document.getElementById("nova-ai-chat-send");
    if (aiChatSend) {
        aiChatSend.addEventListener("click", handleNovaAIChatSubmit);
    }
    const aiChatInput = document.getElementById("nova-ai-chat-input");
    if (aiChatInput) {
        aiChatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleNovaAIChatSubmit();
            }
        });
    }
    // Delegate suggest button clicks in chat history
    const chatHistory = document.getElementById("nova-ai-chat-history");
    if (chatHistory) {
        chatHistory.addEventListener("click", (e) => {
            const suggestBtn = e.target.closest(".suggest-btn");
            if (suggestBtn) {
                const query = suggestBtn.dataset.query;
                const input = document.getElementById("nova-ai-chat-input");
                if (input) {
                    input.value = query;
                    handleNovaAIChatSubmit();
                }
            }
        });
    }
    // Copilot Action Handlers
    const copilotApplyBtn = document.getElementById("copilot-apply-btn");
    if (copilotApplyBtn) {
        copilotApplyBtn.addEventListener("click", () => {
            if (copilotExtractedSymptoms.length > 0) {
                selectedSymptoms.clear();
                copilotExtractedSymptoms.forEach(s => selectedSymptoms.add(s));
                updateSymptomUI();
                switchPage("diagnostics-page");
            }
        });
    }
    const copilotClearBtn = document.getElementById("copilot-clear-btn");
    if (copilotClearBtn) {
        copilotClearBtn.addEventListener("click", () => {
            copilotExtractedSymptoms = [];
            updateCopilotUI();
            
            // Clear chat and reset greeting
            if (chatHistory) {
                chatHistory.innerHTML = `
                    <div class="chat-message assistant">
                        <div class="message-avatar">
                            <i class="fa-solid fa-user-doctor"></i>
                        </div>
                        <div class="message-bubble">
                            <p>Hello! I am your <strong>Nova AI Health Assistant</strong>. You can ask me questions about diseases, describe your symptoms for a real-time risk assessment, or inquire about precautions and specialists.</p>
                            <p>How can I help you today?</p>
                            <div class="suggested-queries">
                                <button class="suggest-btn" data-query="I have a high fever, headache, and severe joint pain. What could it be?">Analyze my symptoms</button>
                                <button class="suggest-btn" data-query="What precautions should I take for Malaria?">Precautions for Malaria</button>
                                <button class="suggest-btn" data-query="Which specialist should I consult for heart issues?">Specialist for Heart Issues</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }
}

// 4. Autocomplete Renderer
function showAutocomplete(query) {
    if (!modelData) return;
    
    const dropdown = document.getElementById("autocomplete-list");
    dropdown.innerHTML = "";
    
    // Filter features
    const matches = modelData.features.filter(feature => {
        const friendlyName = formatSymptomName(feature).toLowerCase();
        return friendlyName.includes(query) || feature.toLowerCase().includes(query);
    });
    
    if (matches.length === 0) {
        dropdown.style.display = "none";
        return;
    }
    
    // Sort matches so that prefix matches are shown first
    matches.sort((a, b) => {
        const nameA = formatSymptomName(a).toLowerCase();
        const nameB = formatSymptomName(b).toLowerCase();
        const aStarts = nameA.startsWith(query);
        const bStarts = nameB.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return nameA.localeCompare(nameB);
    });

    // Cap suggestions at 8
    const displayMatches = matches.slice(0, 8);
    
    displayMatches.forEach(feature => {
        const friendlyName = formatSymptomName(feature);
        const item = document.createElement("div");
        item.className = "autocomplete-item";
        
        // Highlight the matched query string
        const regex = new RegExp(`(${query})`, "gi");
        const highlightedText = friendlyName.replace(regex, "<mark>$1</mark>");
        
        // Determine category mapping for tag display
        let categoryName = "Systemic";
        for (const [cat, symptoms] of Object.entries(uiCategories)) {
            if (symptoms.includes(feature)) {
                categoryName = cat.split(" ")[0];
                break;
            }
        }

        item.innerHTML = `
            <span>${highlightedText}</span>
            <span class="autocomplete-item-category">${categoryName}</span>
        `;
        
        item.addEventListener("click", () => {
            addSymptom(feature);
            document.getElementById("symptom-search").value = "";
            document.getElementById("clear-search").style.display = "none";
            dropdown.style.display = "none";
        });
        
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = "block";
}

// 5. State Changes & Filters
function setActiveRegion(region) {
    activeRegion = region;
    
    // Update labels
    const regionLabels = {
        "all": "Whole Body",
        "head": "Head & Neck",
        "chest": "Chest & Cardio",
        "abdomen": "Abdomen & Digestive",
        "urinary": "Urinary & Pelvic",
        "joints": "Joints & Limbs",
        "skin": "Skin & Surface"
    };
    
    document.getElementById("current-region-name").innerText = regionLabels[region] || "Whole Body";
    
    // Update Region Quick Links buttons
    document.querySelectorAll(".region-quick-btn").forEach(btn => {
        if (btn.dataset.region === region) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    renderRegionSymptoms();
}

// Populate Accordion List in Tab B
function populateAccordion() {
    if (!modelData) return;
    
    const container = document.getElementById("category-accordion");
    container.innerHTML = "";
    
    Object.entries(uiCategories).forEach(([categoryName, symptomCodes], index) => {
        // Intersect category codes with actual dataset features
        const validSymptomCodes = symptomCodes.filter(c => modelData.features.includes(c));
        if (validSymptomCodes.length === 0) return;
        
        const item = document.createElement("div");
        item.className = "accordion-item";
        if (index === 0) item.classList.add("open"); // open first category by default
        
        const trigger = document.createElement("button");
        trigger.className = "accordion-trigger";
        trigger.innerHTML = `
            <span>${categoryName} (${validSymptomCodes.length})</span>
            <i class="fa-solid fa-chevron-down chevron"></i>
        `;
        
        const content = document.createElement("div");
        content.className = "accordion-content";
        
        const grid = document.createElement("div");
        grid.className = "category-symptom-grid";
        
        validSymptomCodes.forEach(code => {
            const friendlyName = formatSymptomName(code);
            const card = document.createElement("div");
            card.className = "symptom-item";
            card.dataset.code = code;
            card.innerText = friendlyName;
            
            if (selectedSymptoms.has(code)) {
                card.classList.add("selected");
            }
            
            card.addEventListener("click", () => {
                toggleSymptom(code);
            });
            
            grid.appendChild(card);
        });
        
        content.appendChild(grid);
        item.appendChild(trigger);
        item.appendChild(content);
        
        trigger.addEventListener("click", () => {
            item.classList.toggle("open");
        });
        
        container.appendChild(item);
    });
}

// Render the symptoms lists in Tab A filtered by active body region
function renderRegionSymptoms() {
    if (!modelData) return;
    
    const grid = document.getElementById("region-symptoms-list");
    grid.innerHTML = "";
    
    let symptomsToShow = [];
    
    if (activeRegion === "all") {
        // In "All" state, show a curated set of common baseline symptoms to avoid cluttering
        const prioritySymptoms = [
            "itching", "skin_rash", "continuous_sneezing", "joint_pain", "stomach_pain",
            "acidity", "vomiting", "fatigue", "weight_loss", "cough", "high_fever", 
            "headache", "yellowish_skin", "nausea", "loss_of_appetite", "diarrhoea", 
            "chest_pain", "dizziness", "muscle_pain", "burning_micturition", "back_pain"
        ];
        symptomsToShow = prioritySymptoms.filter(c => modelData.features.includes(c));
    } else {
        // Filter by mapped region
        symptomsToShow = modelData.features.filter(feature => {
            return symptomRegionMap[feature] === activeRegion;
        });
        
        // If region is "skin", let's make sure skin and general surface items are added
        if (activeRegion === "skin") {
            symptomsToShow = modelData.features.filter(feature => {
                const reg = symptomRegionMap[feature];
                return reg === "skin" || (!reg && uiCategories["Skin, Nails & Surface"].includes(feature));
            });
        }
    }
    
    if (symptomsToShow.length === 0) {
        grid.innerHTML = `<div class="no-symptoms-placeholder">No primary symptoms listed for this region. Please browse categories or search.</div>`;
        return;
    }
    
    // Render the grid items
    symptomsToShow.forEach(code => {
        const friendlyName = formatSymptomName(code);
        const card = document.createElement("div");
        card.className = "symptom-item";
        card.dataset.code = code;
        card.innerText = friendlyName;
        
        if (selectedSymptoms.has(code)) {
            card.classList.add("selected");
        }
        
        card.addEventListener("click", () => {
            toggleSymptom(code);
        });
        
        grid.appendChild(card);
    });
}

// Toggle selection
function toggleSymptom(code) {
    if (selectedSymptoms.has(code)) {
        selectedSymptoms.delete(code);
    } else {
        selectedSymptoms.add(code);
    }
    
    updateSymptomStateUI(code);
}

// Add directly (via autocomplete)
function addSymptom(code) {
    if (!selectedSymptoms.has(code)) {
        selectedSymptoms.add(code);
        updateSymptomStateUI(code);
    }
}

// Sync UI grids and run predictions
function updateSymptomStateUI(code) {
    // Sync class list across all active elements in DOM
    document.querySelectorAll(`.symptom-item[data-code="${code}"]`).forEach(el => {
        if (selectedSymptoms.has(code)) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });

    updateSelectedPills();
    updateSymptomCounters();
    runDiagnostics();
}

// Render selected pills tags
function updateSelectedPills() {
    const pillContainer = document.getElementById("selected-pills");
    
    // Clear list
    pillContainer.innerHTML = "";
    
    if (selectedSymptoms.size === 0) {
        pillContainer.innerHTML = `<div class="no-symptoms-placeholder">No symptoms selected yet. Use search, categories, or the body map.</div>`;
        return;
    }
    
    selectedSymptoms.forEach(code => {
        const friendlyName = formatSymptomName(code);
        const pill = document.createElement("div");
        pill.className = "symptom-pill";
        pill.innerHTML = `
            <span>${friendlyName}</span>
            <button class="remove-pill-btn" data-code="${code}"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        pill.querySelector(".remove-pill-btn").addEventListener("click", (e) => {
            const c = e.currentTarget.dataset.code;
            toggleSymptom(c);
        });
        
        pillContainer.appendChild(pill);
    });
}

// Update counters
function updateSymptomCounters() {
    const count = selectedSymptoms.size;
    document.getElementById("selected-count").innerText = count;
    
    // Update progress meter in waiting state
    const pct = Math.min((count / 3) * 100, 100);
    const waitingBar = document.getElementById("waiting-progress-fill");
    const waitingText = document.getElementById("waiting-progress-text");
    
    if (waitingBar) waitingBar.style.width = `${pct}%`;
    if (waitingText) waitingText.innerText = `${count} / 3 symptoms selected`;
}

// 6. ML Inference Code Execution
function runDiagnostics() {
    const count = selectedSymptoms.size;
    
    const stateWaiting = document.getElementById("state-waiting");
    const stateLoading = document.getElementById("state-loading");
    const stateResults = document.getElementById("state-results");
    
    if (count < 3) {
        // Toggle panel states
        stateWaiting.style.display = "flex";
        stateWaiting.classList.add("active-state");
        stateLoading.style.display = "none";
        stateResults.style.display = "none";
        return;
    }
    
    // Transition to loading scanner panel
    stateWaiting.style.display = "none";
    stateWaiting.classList.remove("active-state");
    stateLoading.style.display = "flex";
    stateResults.style.display = "none";
    
    // Reset Stages indicators
    const stageNb = document.getElementById("stage-nb");
    const stageDt = document.getElementById("stage-dt");
    const stageLr = document.getElementById("stage-lr");
    const scanningDetail = document.getElementById("scanning-detail-text");
    
    stageNb.className = "stage-item";
    stageNb.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Bernoulli Naive Bayes Model`;
    stageDt.className = "stage-item";
    stageDt.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> CART Decision Tree Pathing`;
    stageLr.className = "stage-item";
    stageLr.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> L2 Regularized Logistic Regression`;
    
    // Run an artificial sequential loader for beautiful UX micro-animations
    scanningDetail.innerText = "Encoding inputs and parsing symptom indexes...";
    
    setTimeout(() => {
        stageNb.className = "stage-item checked";
        stageNb.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bernoulli Naive Bayes calibrated`;
        scanningDetail.innerText = "Traversing decision tree nodes...";
        
        setTimeout(() => {
            stageDt.className = "stage-item checked";
            stageDt.innerHTML = `<i class="fa-solid fa-circle-check"></i> Decision Tree rules aligned`;
            scanningDetail.innerText = "Computing L2 Softmax regression coefficients...";
            
            setTimeout(() => {
                stageLr.className = "stage-item checked";
                stageLr.innerHTML = `<i class="fa-solid fa-circle-check"></i> Logistic Regression solved`;
                scanningDetail.innerText = "Combining scores and validating consensus...";
                
                setTimeout(() => {
                    // Compute actual results and render dashboard
                    calculatePrediction();
                }, 150);
                
            }, 250);
        }, 250);
    }, 250);
}

// Compute models and render results
function calculatePrediction() {
    if (!modelData || selectedSymptoms.size < 3) return;
    
    // Format input vector: size 132 (1 if symptom in set, 0 if not)
    const x = modelData.features.map(f => selectedSymptoms.has(f) ? 1 : 0);
    
    // 1. Evaluate Bernoulli Naive Bayes
    const nbProb = evaluateNaiveBayes(x);
    
    // 2. Evaluate Decision Tree
    const dtProb = evaluateDecisionTree(x);
    
    // 3. Evaluate Logistic Regression
    const lrProb = evaluateLogisticRegression(x);
    
    // 4. Calculate Average Ensemble Consensus
    const numClasses = modelData.classes.length;
    const consensusProb = [];
    for (let c = 0; c < numClasses; c++) {
        const avgProb = (nbProb[c] + dtProb[c] + lrProb[c]) / 3;
        consensusProb.push({
            idx: c,
            name: modelData.classes[c],
            prob: avgProb,
            nbProb: nbProb[c],
            dtProb: dtProb[c],
            lrProb: lrProb[c]
        });
    }
    
    // Sort by consensus probability descending
    consensusProb.sort((a, b) => b.prob - a.prob);
    
    // Render Results
    renderResultsUI(consensusProb);
}

// NB Classifier Evaluator
function evaluateNaiveBayes(x) {
    const logPriors = modelData.naive_bayes.class_log_prior;
    const featProb = modelData.naive_bayes.feature_prob;
    const numClasses = modelData.classes.length;
    const numFeatures = modelData.features.length;
    
    const scores = [];
    
    for (let c = 0; c < numClasses; c++) {
        let score = logPriors[c];
        
        for (let j = 0; j < numFeatures; j++) {
            const p = featProb[c][j];
            if (x[j] === 1) {
                score += Math.log(p);
            } else {
                score += Math.log(1 - p);
            }
        }
        scores.push(score);
    }
    
    // Apply stable Softmax
    return softmax(scores);
}

// Decision Tree Classifier Evaluator
function evaluateDecisionTree(x) {
    const root = modelData.decision_tree.root;
    
    function traverse(node) {
        if (node.is_leaf) {
            return node.probs;
        }
        const val = x[node.feature_idx];
        if (val <= 0.5) {
            return traverse(node.left);
        } else {
            return traverse(node.right);
        }
    }
    
    return traverse(root);
}

// Logistic Regression Classifier Evaluator
function evaluateLogisticRegression(x) {
    const coef = modelData.logistic_regression.coef;
    const intercept = modelData.logistic_regression.intercept;
    const numClasses = modelData.classes.length;
    const numFeatures = modelData.features.length;
    
    const scores = [];
    
    for (let c = 0; c < numClasses; c++) {
        let z = intercept[c];
        for (let j = 0; j < numFeatures; j++) {
            if (x[j] === 1) {
                z += coef[c][j];
            }
        }
        scores.push(z);
    }
    
    // Apply stable Softmax
    return softmax(scores);
}

// Stable Softmax calculator
function softmax(arr) {
    const maxVal = Math.max(...arr);
    const exps = arr.map(val => Math.exp(val - maxVal));
    const sumExps = exps.reduce((sum, val) => sum + val, 0);
    return exps.map(val => val / sumExps);
}

// 7. Results Renderer UI
function renderResultsUI(predictions) {
    const primary = predictions[0];
    
    // Toggle state
    document.getElementById("state-loading").style.display = "none";
    const resultsPanel = document.getElementById("state-results");
    resultsPanel.style.display = "flex";
    
    // Fetch disease metadata
    const metadata = modelData.metadata[primary.name] || {
        name: primary.name,
        description: "No clinical description available.",
        specialist: "General Practitioner",
        precautions: ["Consult a physician", "Rest and recover"]
    };
    
    // 1. Primary Disease Card
    const primaryNameEl = document.getElementById("primary-disease-name");
    const primaryDescEl = document.getElementById("primary-disease-description");
    const primarySpecEl = document.getElementById("primary-specialist");
    const primaryConfEl = document.getElementById("primary-confidence-pct");
    const confBadge = primaryConfEl.parentElement;
    
    primaryNameEl.innerText = metadata.name;
    primaryDescEl.innerText = metadata.description;
    primarySpecEl.innerText = metadata.specialist;
    
    const formattedConf = (primary.prob * 100).toFixed(1) + "%";
    primaryConfEl.innerText = formattedConf;
    
    // Adjust colors of confidence badge based on probability levels
    confBadge.className = "confidence-badge";
    if (primary.prob < 0.45) {
        confBadge.classList.add("danger-badge");
    } else if (primary.prob < 0.7) {
        confBadge.classList.add("warning-badge");
    }
    
    // 2. Precautions List
    const precautionsContainer = document.getElementById("primary-precautions-list");
    precautionsContainer.innerHTML = "";
    
    metadata.precautions.forEach(prec => {
        const item = document.createElement("div");
        item.className = "precaution-item";
        item.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>${prec}</span>
        `;
        precautionsContainer.appendChild(item);
    });
    
    // 3. Alternative Diagnoses List (predictions at index 1 and 2)
    const altContainer = document.getElementById("alternative-diagnoses-list");
    altContainer.innerHTML = "";
    
    const alternatives = predictions.slice(1, 4).filter(pred => pred.prob > 0.01);
    
    if (alternatives.length === 0) {
        altContainer.innerHTML = `<div class="no-symptoms-placeholder" style="padding: 0.5rem 0;">No alternative matches found with significant probability.</div>`;
    } else {
        alternatives.forEach(alt => {
            const friendlyAltName = (modelData.metadata[alt.name] && modelData.metadata[alt.name].name) || alt.name;
            const item = document.createElement("div");
            item.className = "alt-item";
            
            const altPct = (alt.prob * 100).toFixed(1);
            item.innerHTML = `
                <span class="alt-name">${friendlyAltName}</span>
                <div class="alt-pct-box">
                    <div class="alt-bar-track">
                        <div class="alt-bar-fill" style="width: ${altPct}%; background-color: ${alt.prob > 0.4 ? 'var(--warning)' : 'var(--text-dark)'};"></div>
                    </div>
                    <span class="alt-pct">${altPct}%</span>
                </div>
            `;
            altContainer.appendChild(item);
        });
    }
    
    // 4. Model Consensus Cards
    document.getElementById("consensus-nb-name").innerText = (modelData.metadata[predictions.find(p => p.nbProb === Math.max(...predictions.map(q => q.nbProb))).name] || {}).name || predictions[0].name;
    const nbTopProb = Math.max(...predictions.map(q => q.nbProb));
    document.getElementById("consensus-nb-pct").innerText = (nbTopProb * 100).toFixed(0) + "% Prob";
    document.getElementById("consensus-nb-fill").style.width = (nbTopProb * 100) + "%";
    
    document.getElementById("consensus-dt-name").innerText = (modelData.metadata[predictions.find(p => p.dtProb === Math.max(...predictions.map(q => q.dtProb))).name] || {}).name || predictions[0].name;
    const dtTopProb = Math.max(...predictions.map(q => q.dtProb));
    document.getElementById("consensus-dt-pct").innerText = (dtTopProb * 100).toFixed(0) + "% Prob";
    document.getElementById("consensus-dt-fill").style.width = (dtTopProb * 100) + "%";
    
    document.getElementById("consensus-lr-name").innerText = (modelData.metadata[predictions.find(p => p.lrProb === Math.max(...predictions.map(q => q.lrProb))).name] || {}).name || predictions[0].name;
    const lrTopProb = Math.max(...predictions.map(q => q.lrProb));
    document.getElementById("consensus-lr-pct").innerText = (lrTopProb * 100).toFixed(0) + "% Prob";
    document.getElementById("consensus-lr-fill").style.width = (lrTopProb * 100) + "%";
    
    // 5. Symptom Correlation / Explainability Chart
    const correlationContainer = document.getElementById("correlation-bars");
    correlationContainer.innerHTML = "";
    
    // Gather conditional probabilities of selected symptoms given the primary disease
    const selectedSymptomCodes = Array.from(selectedSymptoms);
    const correlationScores = [];
    
    selectedSymptomCodes.forEach(code => {
        const featureIdx = modelData.features.indexOf(code);
        if (featureIdx === -1) return;
        
        // Conditional likelihood of this symptom in the predicted class
        // P(symptom | class) from Naive Bayes probabilities
        const condProb = modelData.naive_bayes.feature_prob[primary.idx][featureIdx];
        correlationScores.push({
            code: code,
            name: formatSymptomName(code),
            score: condProb
        });
    });
    
    // Sort symptoms by conditional probability (contribution) descending
    correlationScores.sort((a, b) => b.score - a.score);
    
    correlationScores.forEach(item => {
        const row = document.createElement("div");
        row.className = "corr-row";
        
        const scorePct = (item.score * 100).toFixed(0);
        // Highlight higher contribution values with primary accent, low values with muted gray
        const barColor = item.score > 0.7 ? 'var(--primary)' : (item.score > 0.3 ? 'var(--primary-glow)' : 'var(--text-dark)');
        
        row.innerHTML = `
            <span class="corr-name" title="${item.name}">${item.name}</span>
            <div class="corr-bar-track">
                <div class="corr-bar-fill" style="width: ${scorePct}%; background: ${barColor};"></div>
            </div>
            <span class="corr-impact" style="color: ${item.score > 0.4 ? 'var(--primary-light)' : 'var(--text-muted)'};">${scorePct}% Impact</span>
        `;
        correlationContainer.appendChild(row);
    });
}

// 8. Navigation & Routing (Single Page Application Router)
function switchPage(pageId) {
    // Hide all containers
    document.querySelectorAll(".page-container").forEach(container => {
        container.style.display = "none";
        container.classList.remove("active");
    });
    
    // Show active page container
    const activeEl = document.getElementById(pageId);
    if (activeEl) {
        if (pageId === "diagnostics-page") {
            activeEl.style.display = "block"; // layout is block container containing grid
        } else {
            activeEl.style.display = "block";
        }
        activeEl.classList.add("active");
    }
    
    // Toggle navigation tab active classes
    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
    
    // Scroll to top of window
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 9. Medical Reference Library Renderer
function initMedicalLibrary() {
    if (!modelData) return;
    
    const container = document.getElementById("disease-cards-container");
    container.innerHTML = "";
    
    modelData.classes.forEach(diseaseCode => {
        const metadata = modelData.metadata[diseaseCode] || {
            name: diseaseCode,
            description: "No clinical description available.",
            specialist: "General Practitioner",
            precautions: ["Consult a physician"]
        };
        
        // Retrieve indicator symptoms (conditional probability P(symptom | disease) > 0.15)
        const classIdx = modelData.classes.indexOf(diseaseCode);
        const associatedSymptoms = [];
        if (classIdx !== -1) {
            const featProbs = modelData.naive_bayes.feature_prob[classIdx];
            featProbs.forEach((prob, fIdx) => {
                if (prob > 0.15) { // Any symptom with probability > 15% in this class is an indicator
                    associatedSymptoms.push(modelData.features[fIdx]);
                }
            });
        }
        
        const card = document.createElement("div");
        card.className = "disease-card";
        card.dataset.code = diseaseCode;
        card.dataset.name = metadata.name.toLowerCase();
        
        // Build comma separated string of formatted symptoms for searching
        const symptomTags = associatedSymptoms.map(formatSymptomName).join(", ").toLowerCase();
        card.dataset.symptoms = symptomTags;
        
        const snippet = metadata.description.length > 120 
            ? metadata.description.substring(0, 115) + "..." 
            : metadata.description;
            
        card.innerHTML = `
            <div class="disease-card-header">
                <span class="badge primary-badge-label" style="align-self: flex-start; margin-bottom: 0.25rem; background-color: rgba(99, 102, 241, 0.08); color: var(--primary-light); border-color: rgba(99, 102, 241, 0.2);">${metadata.specialist}</span>
                <h3>${metadata.name}</h3>
            </div>
            <div class="disease-card-body">
                <p>${snippet}</p>
            </div>
            <button class="secondary-btn view-details-btn" style="width: 100%; justify-content: center; margin-top: 0.5rem;">
                <i class="fa-solid fa-file-medical"></i> View Profile
            </button>
        `;
        
        card.querySelector(".view-details-btn").addEventListener("click", () => {
            showDiseaseModal(diseaseCode, metadata, associatedSymptoms);
        });
        
        container.appendChild(card);
    });
}

// 10. Filter library items
function filterLibrary(query) {
    const cards = document.querySelectorAll(".disease-card");
    cards.forEach(card => {
        const name = card.dataset.name;
        const symptoms = card.dataset.symptoms;
        const code = card.dataset.code;
        const specialist = (modelData.metadata[code] && modelData.metadata[code].specialist.toLowerCase()) || "";
        
        if (name.includes(query) || symptoms.includes(query) || specialist.includes(query)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

// 11. Expanded Disease Profile Modal Dialogs
function showDiseaseModal(diseaseCode, metadata, associatedSymptoms) {
    document.getElementById("modal-disease-name").innerText = metadata.name;
    document.getElementById("modal-disease-description").innerText = metadata.description;
    
    const specBadge = document.getElementById("modal-specialist-badge");
    specBadge.innerText = metadata.specialist;
    specBadge.style.backgroundColor = "rgba(99, 102, 241, 0.08)";
    specBadge.style.color = "var(--primary-light)";
    specBadge.style.borderColor = "rgba(99, 102, 241, 0.2)";
    
    // Render Precautions
    const precautionsList = document.getElementById("modal-precautions-list");
    precautionsList.innerHTML = "";
    metadata.precautions.forEach(prec => {
        const li = document.createElement("li");
        li.innerText = prec;
        precautionsList.appendChild(li);
    });
    
    // Render Key Mapped Symptoms
    const symptomsList = document.getElementById("modal-symptoms-list");
    symptomsList.innerHTML = "";
    if (associatedSymptoms.length === 0) {
        symptomsList.innerHTML = `<span class="no-symptoms-placeholder">No specific diagnostic symptoms catalogued.</span>`;
    } else {
        associatedSymptoms.forEach(code => {
            const tag = document.createElement("span");
            tag.className = "modal-symptom-tag";
            tag.innerText = formatSymptomName(code);
            symptomsList.appendChild(tag);
        });
    }
    
    // Toggle modal visibility
    const modal = document.getElementById("disease-modal");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // disable body scrolling while active
}

function hideDiseaseModal() {
    const modal = document.getElementById("disease-modal");
    modal.style.display = "none";
    document.body.style.overflow = ""; // enable scrolling
}
// --- Nova AI Health Chatbot Logic ---
let copilotExtractedSymptoms = [];

function handleNovaAIChatSubmit() {
    const input = document.getElementById("nova-ai-chat-input");
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    
    // Clear input field
    input.value = "";
    
    const chatHistory = document.getElementById("nova-ai-chat-history");
    if (!chatHistory) return;
    
    // 1. Append User Message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user";
    userMsg.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-user"></i>
        </div>
        <div class="message-bubble">
            <p>${escapeHTML(query)}</p>
        </div>
    `;
    chatHistory.appendChild(userMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // 2. Append Typing Indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-message assistant";
    typingIndicator.id = "nova-ai-typing-indicator";
    typingIndicator.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-user-doctor"></i>
        </div>
        <div class="message-bubble typing-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatHistory.appendChild(typingIndicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // 3. Process Response after natural typing delay
    setTimeout(() => {
        // Remove typing indicator
        const indicator = document.getElementById("nova-ai-typing-indicator");
        if (indicator) indicator.remove();
        
        // Extract symptoms from user query
        const newlyExtracted = extractSymptomsFromQuery(query);
        let addedCount = 0;
        newlyExtracted.forEach(s => {
            if (!copilotExtractedSymptoms.includes(s)) {
                copilotExtractedSymptoms.push(s);
                addedCount++;
            }
        });
        
        // Update Co-Pilot Panel
        updateCopilotUI();
        
        // Construct reply message
        let replyHTML = "";
        const cleanedQuery = query.toLowerCase();
        
        // Intent Routing:
        const isGreeting = cleanedQuery.match(/\b(hi|hello|hey|greetings|morning|afternoon|evening|hola)\b/);
        const isPrecaution = cleanedQuery.match(/\b(precaution|prevent|treatment|what should i do|what to do|care)\b/);
        const isSpecialist = cleanedQuery.match(/\b(specialist|doctor|who should i see|physician|consult|visit)\b/);
        
        if (isPrecaution) {
            // Find if a disease is mentioned in query
            let matchedDisease = null;
            if (modelData) {
                for (const classCode of modelData.classes) {
                    const cleanName = (modelData.metadata[classCode] || {}).name || classCode;
                    if (cleanedQuery.includes(cleanName.toLowerCase())) {
                        matchedDisease = classCode;
                        break;
                    }
                }
            }
            
            // Fallback to top predicted disease if none mentioned but predicted
            if (!matchedDisease && copilotExtractedSymptoms.length >= 2) {
                const topPred = getPredictionForSymptomList(copilotExtractedSymptoms);
                if (topPred) {
                    matchedDisease = modelData.classes.find(c => c === topPred.name);
                }
            }
            
            if (matchedDisease) {
                const diseaseMeta = modelData.metadata[matchedDisease] || {};
                const precautions = diseaseMeta.precautions || [];
                const dName = diseaseMeta.name || matchedDisease;
                replyHTML = `<p>Here are the recommended precautions and preventive care guidelines for <strong>${dName}</strong>:</p><ul>`;
                if (precautions.length > 0) {
                    precautions.forEach(p => {
                        replyHTML += `<li>${escapeHTML(p)}</li>`;
                    });
                } else {
                    replyHTML += `<li>Rest and stay hydrated.</li><li>Monitor symptoms closely.</li>`;
                }
                replyHTML += `</ul><p>Please consult a healthcare professional if symptoms persist or worsen.</p>`;
            } else {
                replyHTML = `<p>I don't have a specific disease reference for this precaution request. Could you specify which condition you are asking about (e.g., "What precautions should I take for Typhoid?") or list more symptoms?</p>`;
            }
        } 
        else if (isSpecialist) {
            let matchedDisease = null;
            if (modelData) {
                for (const classCode of modelData.classes) {
                    const cleanName = (modelData.metadata[classCode] || {}).name || classCode;
                    if (cleanedQuery.includes(cleanName.toLowerCase())) {
                        matchedDisease = classCode;
                        break;
                    }
                }
            }
            
            if (!matchedDisease && copilotExtractedSymptoms.length >= 2) {
                const topPred = getPredictionForSymptomList(copilotExtractedSymptoms);
                if (topPred) {
                    matchedDisease = modelData.classes.find(c => c === topPred.name);
                }
            }
            
            if (matchedDisease) {
                const diseaseMeta = modelData.metadata[matchedDisease] || {};
                const specialist = diseaseMeta.specialist || "General Physician";
                const dName = diseaseMeta.name || matchedDisease;
                replyHTML = `<p>For <strong>${dName}</strong>, we recommend scheduling an appointment with a <strong>${escapeHTML(specialist)}</strong>.</p><p>They will be able to perform clinical diagnostics, prescribe appropriate therapies, and guide recovery.</p>`;
            } else {
                replyHTML = `<p>I recommend starting with a consultation with a <strong>General Physician</strong>. If you describe your symptoms (e.g., "I have chest pain and shortness of breath"), I can recommend a specific medical specialist.</p>`;
            }
        }
        else if (isGreeting) {
            replyHTML = `<p>Greetings! I am the Nova AI Assistant. I can analyze symptom patterns offline and retrieve reference guidelines.</p><p>Please tell me what symptoms you are currently experiencing, or ask general questions about precautions and specialists.</p>`;
        }
        else if (newlyExtracted.length > 0) {
            const labels = newlyExtracted.map(s => `<strong>${formatSymptomName(s)}</strong>`);
            replyHTML = `<p>Understood. I have successfully identified the following symptom${newlyExtracted.length > 1 ? 's' : ''} in your message: ${labels.join(", ")}.</p>`;
            
            if (copilotExtractedSymptoms.length >= 2) {
                const topPred = getPredictionForSymptomList(copilotExtractedSymptoms);
                const dMeta = modelData.metadata[topPred.name] || {};
                const dName = dMeta.name || topPred.name;
                const confPct = Math.round(topPred.prob * 100);
                
                replyHTML += `<p>Analyzing your complete extracted symptom profile, my local prediction model correlates this most strongly with <strong>${dName}</strong> with an ensemble probability of **${confPct}%**.</p>`;
                replyHTML += `<p>You can see the real-time risk profile in the Co-Pilot panel on the right. Click **Apply to Dashboard** to load these symptoms into the main diagnostics page for a comprehensive review.</p>`;
            } else {
                replyHTML += `<p>I have added this to your active symptoms list. However, to generate a reliable statistical prediction profile, I need at least **2 identified symptoms**. Please describe any other symptoms or physical signs you have (e.g. "I also have chills and vomiting").</p>`;
            }
        }
        else {
            // General clinical fallback
            replyHTML = `<p>I've noted your query. To help diagnose or analyze your condition, please describe your active symptoms as clearly as possible (e.g., *"I have nausea, diarrhea, and stomach pain"*).</p>`;
            replyHTML += `<p>Alternatively, you can ask for guidelines about specific conditions: *"What precautions should I take for Malaria?"* or *"Who should I see for Diabetes?"*</p>`;
        }
        
        // Append response bubble
        const assistantMsg = document.createElement("div");
        assistantMsg.className = "chat-message assistant";
        assistantMsg.innerHTML = `
            <div class="message-avatar">
                <i class="fa-solid fa-user-doctor"></i>
            </div>
            <div class="message-bubble">
                ${replyHTML}
            </div>
        `;
        chatHistory.appendChild(assistantMsg);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
    }, 850);
}

function extractSymptomsFromQuery(text) {
    if (!modelData) return [];
    const cleaned = text.toLowerCase();
    const extracted = [];
    
    // Friendly name map to symptom codes
    const searchTerms = {};
    modelData.features.forEach(key => {
        const label = formatSymptomName(key).toLowerCase();
        searchTerms[label] = key;
        
        // Also map raw snake_case key directly
        const cleanKey = key.replace(/_/g, " ");
        searchTerms[cleanKey] = key;
    });
    
    // Standard clinical synonyms mapping to key codes
    const synonyms = {
        "fever": "high_fever",
        "temperature": "high_fever",
        "hot body": "high_fever",
        "coughing": "cough",
        "cough": "cough",
        "throat pain": "throat_irritation",
        "sore throat": "throat_irritation",
        "headache": "headache",
        "head ache": "headache",
        "vomit": "vomiting",
        "vomiting": "vomiting",
        "throw up": "vomiting",
        "nausea": "nausea",
        "sick to stomach": "nausea",
        "fatigue": "fatigue",
        "tired": "fatigue",
        "weakness": "fatigue",
        "exhausted": "fatigue",
        "skin rash": "skin_rash",
        "rash": "skin_rash",
        "joint pain": "joint_pain",
        "aching joints": "joint_pain",
        "muscle pain": "muscle_pain",
        "chills": "chills",
        "shivering": "chills",
        "chest pain": "chest_pain",
        "diarrhea": "diarrhoea",
        "loose motion": "diarrhoea",
        "constipation": "constipation",
        "abdominal pain": "abdominal_pain",
        "stomach ache": "abdominal_pain",
        "stomach pain": "abdominal_pain",
        "dizziness": "dizziness",
        "dizzy": "dizziness",
        "yellow skin": "yellowish_skin",
        "jaundice": "yellowish_skin",
        "loss of appetite": "loss_of_appetite",
        "not hungry": "loss_of_appetite",
        "weight loss": "weight_loss",
        "itching": "itching",
        "itchy": "itching",
        "sneezing": "sneezing",
        "sneeze": "sneezing",
        "runny nose": "runny_nose",
        "congested": "runny_nose",
        "breathless": "breathlessness",
        "short of breath": "breathlessness",
        "breathing difficulty": "breathlessness",
        "sweating": "mild_fever",
        "sweat": "mild_fever"
    };

    // Check direct names
    for (const [term, key] of Object.entries(searchTerms)) {
        if (cleaned.includes(term)) {
            if (!extracted.includes(key)) {
                extracted.push(key);
            }
        }
    }
    
    // Check synonyms
    for (const [term, key] of Object.entries(synonyms)) {
        if (cleaned.includes(term)) {
            if (!extracted.includes(key)) {
                extracted.push(key);
            }
        }
    }
    
    return extracted;
}

function updateCopilotUI() {
    const symptomsContainer = document.getElementById("copilot-extracted-symptoms");
    if (!symptomsContainer) return;
    
    symptomsContainer.innerHTML = "";
    
    if (copilotExtractedSymptoms.length === 0) {
        symptomsContainer.innerHTML = `<div class="no-symptoms-placeholder">No symptoms extracted from chat yet.</div>`;
        document.getElementById("copilot-prediction-results").style.display = "none";
        document.getElementById("copilot-waiting-card").style.display = "flex";
        return;
    }
    
    // Append tags for extracted symptoms
    copilotExtractedSymptoms.forEach(s => {
        const pill = document.createElement("span");
        pill.className = "symptom-pill";
        pill.innerHTML = `${formatSymptomName(s)} <i class="fa-solid fa-circle-check" style="margin-left:4px;color:var(--success-light);"></i>`;
        
        // Add a click handler to remove
        pill.style.cursor = "pointer";
        pill.addEventListener("click", () => {
            copilotExtractedSymptoms = copilotExtractedSymptoms.filter(item => item !== s);
            updateCopilotUI();
        });
        
        symptomsContainer.appendChild(pill);
    });
    
    // Evaluate predictions if >= 2 symptoms
    if (copilotExtractedSymptoms.length >= 2) {
        const topPred = getPredictionForSymptomList(copilotExtractedSymptoms);
        if (topPred) {
            const dMeta = modelData.metadata[topPred.name] || {};
            const dName = dMeta.name || topPred.name;
            const specName = dMeta.specialist || "General Physician";
            const confPct = Math.round(topPred.prob * 100);
            
            document.getElementById("copilot-disease-name").innerText = dName;
            document.getElementById("copilot-confidence").innerText = confPct;
            document.getElementById("copilot-specialist").innerText = specName;
            
            document.getElementById("copilot-prediction-results").style.display = "block";
            document.getElementById("copilot-waiting-card").style.display = "none";
        }
    } else {
        document.getElementById("copilot-prediction-results").style.display = "none";
        document.getElementById("copilot-waiting-card").style.display = "flex";
    }
}

function getPredictionForSymptomList(symptomList) {
    if (!modelData || symptomList.length === 0) return null;
    const x = modelData.features.map(f => symptomList.includes(f) ? 1 : 0);
    const nbProb = evaluateNaiveBayes(x);
    const dtProb = evaluateDecisionTree(x);
    const lrProb = evaluateLogisticRegression(x);
    const numClasses = modelData.classes.length;
    const consensusProb = [];
    for (let c = 0; c < numClasses; c++) {
        const avgProb = (nbProb[c] + dtProb[c] + lrProb[c]) / 3;
        consensusProb.push({
            name: modelData.classes[c],
            prob: avgProb
        });
    }
    consensusProb.sort((a, b) => b.prob - a.prob);
    return consensusProb[0];
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}
