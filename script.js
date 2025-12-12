/**
 * FlowMatch - Enhanced JavaScript
 * Modern, Feature-Rich, Professional
 */

// ============================================
// Global State Management
// ============================================

const AppState = {
  currentView: 'landing',
  parentData: {
    step: 1,
    formData: {},
    preferences: [],
    uploadedFiles: []
  },
  therapistData: {
    step: 1,
    formData: {},
    fields: [],
    subFields: [],
    meetingTypes: [],
    availability: [],
    leadTypes: []
  },
  savedMatches: []
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // Show loading screen
  const loadingScreen = document.getElementById('loadingScreen');
  
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 1500);

  // Load saved data
  loadStateFromStorage();
  
  // Initialize all components
  initializeNavigation();
  initializeParentFlow();
  initializeTherapistFlow();
  initializeInsuranceModule();
  initializeAutocomplete();
  initializeToasts();
  
  // Setup event listeners
  setupGlobalListeners();
  
  console.log('✅ FlowMatch initialized successfully');
}

// ============================================
// State Management
// ============================================

function saveStateToStorage() {
  try {
    localStorage.setItem('flowmatch_state', JSON.stringify(AppState));
  } catch (e) {
    console.warn('Could not save state to localStorage', e);
  }
}

function loadStateFromStorage() {
  try {
    const saved = localStorage.getItem('flowmatch_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(AppState, parsed);
      console.log('✅ State loaded from storage');
    }
  } catch (e) {
    console.warn('Could not load state from localStorage', e);
  }
}

// ============================================
// Navigation
// ============================================

function initializeNavigation() {
  const views = document.querySelectorAll('.view');
  const navButtons = document.querySelectorAll('[data-view]');
  const startParentButtons = document.querySelectorAll('.js-start-parent');
  const startTherapistButtons = document.querySelectorAll('.js-start-therapist');
  const backHomeButtons = document.querySelectorAll('.js-back-home');

  // Navigation buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      if (viewId) showView(viewId);
    });
  });

  // Start parent flow
  startParentButtons.forEach(btn => {
    btn.addEventListener('click', () => showView('parent-flow'));
  });

  // Start therapist flow
  startTherapistButtons.forEach(btn => {
    btn.addEventListener('click', () => showView('therapist-flow'));
  });

  // Back to home
  backHomeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view') || 'landing';
      showView(view);
    });
  });
}

function showView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach(view => {
    view.classList.toggle('active', view.id === viewId);
  });
  
  AppState.currentView = viewId;
  saveStateToStorage();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  showToast(`עברת ל${getViewName(viewId)}`, 'info');
}

function getViewName(viewId) {
  const names = {
    'landing': 'דף הבית',
    'parent-flow': 'זרימת הורים',
    'therapist-flow': 'זרימת מטפלים',
    'insurance': 'מודול ביטוח',
    'demo-center': 'מסכי דמו'
  };
  return names[viewId] || viewId;
}

// ============================================
// Parent Flow
// ============================================

function initializeParentFlow() {
  const form = document.getElementById('parent-form');
  if (!form) return;

  // Step navigation
  setupStepNavigation('parent', form);
  
  // Dynamic sub-specialties
  setupSubSpecialties();
  
  // Chips for preferences
  setupChips(form);
  
  // File upload
  setupFileUpload('parent');
  
  // Find match button
  const findMatchBtn = form.querySelector('.js-find-match');
  if (findMatchBtn) {
    findMatchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateParentForm()) {
        showParentResults();
        showToast('מצאנו לכם התאמות מעולות! 🎉', 'success');
      }
    });
  }
  
  // Restart button
  const restartBtn = form.querySelector('.js-restart-parent');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetParentForm();
      showToast('התהליך אופס. תוכלו להתחיל מחדש', 'info');
    });
  }
  
  // Not relevant button
  const notRelevantBtn = form.querySelector('.js-not-relevant');
  const notRelevantMsg = document.getElementById('not-relevant-msg');
  if (notRelevantBtn && notRelevantMsg) {
    notRelevantBtn.addEventListener('click', () => {
      notRelevantMsg.classList.add('visible');
      showToast('תודה על המשוב! נשתפר', 'info');
    });
  }
  
  // Result cards actions
  setupResultCards();
  
  // Update progress
  updateParentProgress();
}

function setupStepNavigation(flowType, form) {
  const nextButtons = form.querySelectorAll('.js-next-step');
  const prevButtons = form.querySelectorAll('.js-prev-step');
  
  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.getAttribute('data-next'));
      if (validateCurrentStep(flowType, AppState[`${flowType}Data`].step)) {
        goToStep(flowType, nextStep);
      }
    });
  });
  
  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.getAttribute('data-prev'));
      goToStep(flowType, prevStep);
    });
  });
  
  // Make stepper items clickable
  const stepperItems = form.closest('.view').querySelectorAll('.stepper-item[data-step]');
  stepperItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'));
      const currentStep = AppState[`${flowType}Data`].step;
      
      // Allow going back to previous steps, but validate before going forward
      if (targetStep < currentStep) {
        goToStep(flowType, targetStep);
      } else if (targetStep === currentStep) {
        // Already on this step, do nothing
        return;
      } else {
        // Going forward - validate all steps in between
        let canProceed = true;
        for (let step = currentStep; step < targetStep; step++) {
          if (!validateCurrentStep(flowType, step)) {
            canProceed = false;
            showToast('נא למלא את כל השדות הנדרשים', 'warning');
            break;
          }
        }
        if (canProceed) {
          goToStep(flowType, targetStep);
        }
      }
    });
  });
}

function goToStep(flowType, stepNumber) {
  const panels = document.querySelectorAll(`#${flowType}-form .step-panel`);
  const stepperItems = document.querySelectorAll(`.stepper-item[data-step]`);
  
  panels.forEach(panel => {
    const panelStep = parseInt(panel.getAttribute('data-step'));
    panel.classList.toggle('active', panelStep === stepNumber);
  });
  
  stepperItems.forEach(item => {
    const itemStep = parseInt(item.getAttribute('data-step'));
    item.classList.toggle('active', itemStep === stepNumber);
  });
  
  AppState[`${flowType}Data`].step = stepNumber;
  saveStateToStorage();
  
  if (flowType === 'parent') {
    updateParentProgress();
  } else if (flowType === 'therapist') {
    updateTherapistProgress();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep(flowType, step) {
  const form = document.getElementById(`${flowType}-form`);
  const panel = form.querySelector(`.step-panel[data-step="${step}"]`);
  
  if (!panel) return true;
  
  const requiredFields = panel.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      showFieldError(field, 'שדה חובה');
    } else {
      hideFieldError(field);
    }
  });
  
  if (!isValid) {
    showToast('אנא מלאו את כל השדות הנדרשים', 'error');
  }
  
  return isValid;
}

function showFieldError(field, message) {
  const fieldName = field.getAttribute('name');
  const errorEl = document.querySelector(`.field-error[data-field="${fieldName}"]`);
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
  
  field.style.borderColor = 'var(--error)';
}

function hideFieldError(field) {
  const fieldName = field.getAttribute('name');
  const errorEl = document.querySelector(`.field-error[data-field="${fieldName}"]`);
  
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
  
  field.style.borderColor = '';
}

function updateParentProgress() {
  const progressFill = document.getElementById('parentProgress');
  const progressText = document.getElementById('parentProgressText');
  
  if (!progressFill || !progressText) return;
  
  const step = AppState.parentData.step;
  const total = 4;
  const percentage = (step / total) * 100;
  
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `שלב ${step} מתוך ${total}`;
}

function setupSubSpecialties() {
  const mainTreatment = document.getElementById('main-treatment');
  const subSpecialty = document.getElementById('sub-specialty');
  
  if (!mainTreatment || !subSpecialty) return;
  
  const subSpecialtiesMap = {
    speech: [
      'עיכוב שפתי',
      'גמגום',
      'קשיי היגוי',
      'עיבוד שמיעתי',
      'תקשורת חברתית',
      'הזנה ואכילה',
      'תקשורת תומכת וחליפית (AAC)'
    ],
    ot: [
      'ויסות חושי',
      'מוטוריקה עדינה',
      'מוטוריקה גסה',
      'גרפומוטוריקה',
      'תפקודי יום-יום (ADL)',
      'עבודה עם ASD',
      'מיומנויות כיתה א׳'
    ],
    physio: [
      'פיזיותרפיה תינוקות',
      'פיזיותרפיה נשימתית',
      'פציעות ספורט ילדים',
      'שיקום לאחר פגיעה',
      'טיפול ביציבה'
    ],
    emotional: [
      'טיפול במשחק',
      'טיפול באמצעות אמנות',
      'ויסות רגשי',
      'חרדות ילדים',
      'טיפול דיאדי הורה-ילד'
    ],
    psychology: [
      'פסיכולוגיה התפתחותית',
      'פסיכולוגיה חינוכית',
      'CBT לילדים',
      'טיפול משפחתי',
      'טיפול בנוער עם חרדה'
    ]
  };
  
  mainTreatment.addEventListener('change', () => {
    const key = mainTreatment.value;
    const options = subSpecialtiesMap[key] || [];
    
    subSpecialty.innerHTML = '<option value="">בחרו תת-התמחות (אופציונלי)</option>';
    
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      subSpecialty.appendChild(option);
    });
  });
}

function setupChips(form) {
  const chipGroups = form.querySelectorAll('.chip-group');
  
  chipGroups.forEach(group => {
    const name = group.getAttribute('data-name');
    if (!name) return;
    
    const hiddenInput = form.querySelector(`input[name="${name}"]`);
    if (!hiddenInput) return;
    
    const chips = group.querySelectorAll('.chip');
    
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        chip.classList.toggle('active');
        
        const activeChips = group.querySelectorAll('.chip.active');
        const values = Array.from(activeChips).map(c => c.textContent.trim());
        
        hiddenInput.value = values.join('|');
        
        if (name === 'parent_preferences') {
          AppState.parentData.preferences = values;
        }
        
        saveStateToStorage();
      });
    });
  });
}

function setupFileUpload(flowType) {
  const uploadZone = document.getElementById(`${flowType === 'parent' ? 'upload-zone' : 'therapist-upload-zone'}`);
  const fileInput = document.getElementById(`${flowType === 'parent' ? 'parent-docs' : 'therapist-certs'}`);
  const uploadedFilesContainer = document.getElementById('uploaded-files');
  
  if (!uploadZone || !fileInput) return;
  
  // Click to upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.background = 'rgba(61, 123, 253, 0.1)';
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.background = '';
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.background = '';
    
    const files = e.dataTransfer.files;
    handleFiles(files, flowType, uploadedFilesContainer);
  });
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files, flowType, uploadedFilesContainer);
  });
}

function handleFiles(files, flowType, container) {
  if (!files || files.length === 0) return;
  
  Array.from(files).forEach(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast(`הקובץ ${file.name} גדול מדי (מקסימום 10MB)`, 'error');
      return;
    }
    
    const fileItem = createFileItem(file, flowType);
    if (container) {
      container.appendChild(fileItem);
    }
    
    if (flowType === 'parent') {
      AppState.parentData.uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
    
    showToast(`הקובץ ${file.name} הועלה בהצלחה`, 'success');
  });
  
  saveStateToStorage();
}

function createFileItem(file, flowType) {
  const div = document.createElement('div');
  div.className = 'uploaded-file';
  
  const fileIcon = getFileIcon(file.type);
  const fileSize = formatFileSize(file.size);
  
  div.innerHTML = `
    <div class="file-info">
      <span class="file-icon">${fileIcon}</span>
      <div>
        <div class="file-name">${file.name}</div>
        <div class="file-size" style="font-size: 12px; color: var(--text-muted);">${fileSize}</div>
      </div>
    </div>
    <button type="button" class="file-remove">הסר</button>
  `;
  
  const removeBtn = div.querySelector('.file-remove');
  removeBtn.addEventListener('click', () => {
    div.remove();
    showToast(`הקובץ ${file.name} הוסר`, 'info');
  });
  
  return div;
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  return '📎';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function validateParentForm() {
  const form = document.getElementById('parent-form');
  const requiredFields = form.querySelectorAll('[required]');
  
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      showFieldError(field, 'שדה חובה');
    } else {
      hideFieldError(field);
    }
  });
  
  return isValid;
}

function showParentResults() {
  const form = document.getElementById('parent-form');
  const resultsPanel = document.getElementById('parent-results');
  
  if (!form || !resultsPanel) return;
  
  // Hide all step panels
  form.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Show results
  resultsPanel.classList.add('active');
  
  // Simulate loading
  setTimeout(() => {
    animateResults();
  }, 300);
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function animateResults() {
  const resultCards = document.querySelectorAll('.result-card');
  
  resultCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, index * 200);
  });
}

function setupResultCards() {
  const resultsPanel = document.getElementById('parent-results');
  if (!resultsPanel) return;
  
  // Book buttons
  const bookButtons = resultsPanel.querySelectorAll('.btn-book');
  bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const therapistName = btn.getAttribute('data-therapist');
      showToast(`שולח בקשת תור אצל ${therapistName}... ✅`, 'success');
      
      setTimeout(() => {
        showToast('התור נקבע בהצלחה! נשלח אישור במייל', 'success');
      }, 2000);
    });
  });
  
  // Details buttons
  const detailsButtons = resultsPanel.querySelectorAll('.btn-details');
  detailsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.result-card');
      const matchReasons = card.querySelector('.match-reasons');
      
      if (matchReasons) {
        const isHidden = matchReasons.style.display === 'none';
        matchReasons.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? 'הסתר פרטים' : 'פרטים נוספים';
      }
    });
  });
  
  // Save buttons
  const saveButtons = resultsPanel.querySelectorAll('.btn-save');
  saveButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('saved');
      const isSaved = btn.classList.contains('saved');
      btn.innerHTML = isSaved ? '<span>💚</span> נשמר' : '<span>💾</span> שמירה';
      showToast(isSaved ? 'נשמר להמשך' : 'הוסר מהשמורים', 'info');
    });
  });
}

function resetParentForm() {
  const form = document.getElementById('parent-form');
  const resultsPanel = document.getElementById('parent-results');
  
  if (!form || !resultsPanel) return;
  
  form.reset();
  resultsPanel.classList.remove('active');
  
  goToStep('parent', 1);
  
  AppState.parentData = {
    step: 1,
    formData: {},
    preferences: [],
    uploadedFiles: []
  };
  
  saveStateToStorage();
}

// ============================================
// Therapist Flow
// ============================================

function initializeTherapistFlow() {
  const form = document.getElementById('therapist-form');
  if (!form) return;
  
  setupStepNavigation('therapist', form);
  setupChips(form);
  setupFileUpload('therapist');
  setupTherapistSubSpecialties(form); // Add dynamic sub-specializations
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showTherapistSuccess();
  });
  
  updateTherapistProgress();
}

function setupTherapistSubSpecialties(form) {
  const mainFieldsGroup = form.querySelector('.chip-group[data-name="therapist_main_fields"]');
  const subFieldsGroup = form.querySelector('.chip-group[data-name="therapist_sub_fields"]');
  
  if (!mainFieldsGroup || !subFieldsGroup) return;
  
  // Map of main fields to sub-specializations
  const subSpecialtiesMap = {
    'קלינאות תקשורת': [
      'עיכוב שפתי',
      'גמגום',
      'קשיי היגוי',
      'עיבוד שמיעתי',
      'תקשורת חברתית',
      'הזנה ואכילה',
      'תקשורת תומכת וחליפית (AAC)'
    ],
    'ריפוי בעיסוק': [
      'ויסות חושי',
      'מוטוריקה עדינה',
      'מוטוריקה גסה',
      'גרפומוטוריקה',
      'תפקודי יום-יום (ADL)',
      'עבודה עם ASD',
      'מיומנויות כיתה א׳'
    ],
    'פיזיותרפיה': [
      'פיזיותרפיה תינוקות',
      'פיזיותרפיה נשימתית',
      'פציעות ספורט ילדים',
      'שיקום לאחר פגיעה',
      'טיפול ביציבה'
    ],
    'טיפול רגשי': [
      'טיפול במשחק',
      'טיפול באמצעות אמנות',
      'ויסות רגשי',
      'חרדות ילדים',
      'טיפול דיאדי הורה-ילד'
    ],
    'פסיכולוגיה': [
      'פסיכולוגיה התפתחותית',
      'פסיכולוגיה חינוכית',
      'CBT לילדים',
      'טיפול משפחתי',
      'טיפול בנוער עם חרדה'
    ]
  };
  
  const mainChips = mainFieldsGroup.querySelectorAll('.chip');
  
  mainChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Wait a bit for the chip to toggle its active state
      setTimeout(() => {
        updateTherapistSubSpecialties(mainFieldsGroup, subFieldsGroup, subSpecialtiesMap);
      }, 50);
    });
  });
}

function updateTherapistSubSpecialties(mainFieldsGroup, subFieldsGroup, subSpecialtiesMap) {
  // Get active main fields
  const activeMainChips = mainFieldsGroup.querySelectorAll('.chip.active');
  const selectedFields = Array.from(activeMainChips).map(chip => {
    return chip.textContent.trim();
  });
  
  // Collect all relevant sub-specializations
  let allSubSpecialties = [];
  selectedFields.forEach(field => {
    if (subSpecialtiesMap[field]) {
      allSubSpecialties = allSubSpecialties.concat(subSpecialtiesMap[field]);
    }
  });
  
  // Remove duplicates
  allSubSpecialties = [...new Set(allSubSpecialties)];
  
  // Clear existing sub-specialty chips
  subFieldsGroup.innerHTML = '';
  
  // Create new chips for sub-specializations
  if (allSubSpecialties.length > 0) {
    allSubSpecialties.forEach(subSpec => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = subSpec;
      
      // Add click handler for the new chip
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        chip.classList.toggle('active');
        
        // Update hidden input
        const activeChips = subFieldsGroup.querySelectorAll('.chip.active');
        const values = Array.from(activeChips).map(c => c.textContent.trim());
        const hiddenInput = subFieldsGroup.parentElement.querySelector('input[name="therapist_sub_fields"]');
        if (hiddenInput) {
          hiddenInput.value = values.join('|');
        }
      });
      
      subFieldsGroup.appendChild(chip);
    });
    
    // Show the sub-fields container
    subFieldsGroup.parentElement.style.display = 'block';
  } else {
    // Hide if no main field selected
    subFieldsGroup.parentElement.style.display = 'none';
  }
}

function updateTherapistProgress() {
  const progressFill = document.getElementById('therapistProgress');
  const progressText = document.getElementById('therapistProgressText');
  
  if (!progressFill || !progressText) return;
  
  const step = AppState.therapistData.step;
  const total = 4;
  const percentage = (step / total) * 100;
  
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `שלב ${step} מתוך ${total}`;
}

function showTherapistSuccess() {
  const form = document.getElementById('therapist-form');
  const successEl = document.getElementById('therapist-success');
  
  if (!form || !successEl) return;
  
  form.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  successEl.classList.add('visible');
  successEl.style.display = 'block';
  
  showToast('ההרשמה הושלמה בהצלחה! 🎉', 'success');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Insurance Module
// ============================================

function initializeInsuranceModule() {
  const aiConsent = document.getElementById('ai-consent');
  const policyFileInput = document.getElementById('policy-file');
  const policyStatus = document.getElementById('policy-status');
  const analyzePolicyBtn = document.getElementById('analyze-policy-btn');
  const policyAnalysisBox = document.getElementById('policy-analysis-box');
  
  // Policy file upload
  if (policyFileInput && policyStatus) {
    const policyUploadZone = document.getElementById('policy-upload-zone');
    
    if (policyUploadZone) {
      policyUploadZone.addEventListener('click', () => {
        policyFileInput.click();
      });
    }
    
    policyFileInput.addEventListener('change', () => {
      if (policyFileInput.files && policyFileInput.files.length > 0) {
        const file = policyFileInput.files[0];
        policyStatus.textContent = `הקובץ "${file.name}" נטען בהצלחה ✅`;
        policyStatus.style.color = 'var(--success)';
        showToast('פוליסה הועלתה', 'success');
      } else {
        policyStatus.textContent = 'לא הועלה קובץ';
        policyStatus.style.color = '';
      }
    });
  }
  
  // Analyze policy button
  if (analyzePolicyBtn && policyAnalysisBox) {
    policyAnalysisBox.style.display = 'none';
    
    analyzePolicyBtn.addEventListener('click', () => {
      if (!aiConsent || !aiConsent.checked) {
        showToast('יש לסמן הסכמה לניתוח הפוליסה', 'error');
        return;
      }
      
      if (!policyFileInput || !policyFileInput.files || policyFileInput.files.length === 0) {
        showToast('יש להעלות קובץ פוליסה תחילה', 'error');
        return;
      }
      
      // Show loading state
      analyzePolicyBtn.disabled = true;
      analyzePolicyBtn.innerHTML = '<span class="btn-icon">⏳</span> מנתח...';
      
      // Simulate analysis
      setTimeout(() => {
        policyAnalysisBox.style.display = 'block';
        policyAnalysisBox.classList.add('visible');
        analyzePolicyBtn.disabled = false;
        analyzePolicyBtn.innerHTML = '<span class="btn-icon">✅</span> ניתוח הושלם';
        showToast('ניתוח הפוליסה הושלם! 📊', 'success');
        
        policyAnalysisBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 2500);
    });
  }
  
  // No policy form
  const noPolicyForm = document.getElementById('no-policy-form');
  const noPolicySuccess = document.getElementById('no-policy-success');
  
  if (noPolicyForm && noPolicySuccess) {
    noPolicySuccess.style.display = 'none';
    
    noPolicyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      noPolicyForm.style.display = 'none';
      noPolicySuccess.style.display = 'block';
      noPolicySuccess.classList.add('visible');
      showToast('הבקשה נשלחה בהצלחה! נחזור אליכם בקרוב', 'success');
    });
  }
}

// ============================================
// Autocomplete
// ============================================

function initializeAutocomplete() {
  const cities = [
    'אילת', 'אשדוד', 'אשקלון', 'באר שבע', 'בת ים', 'גבעתיים',
    'הרצליה', 'חדרה', 'חולון', 'חיפה', 'טבריה', 'יבנה', 'יהוד',
    'ירושלים', 'כפר סבא', 'כרמיאל', 'מודיעין', 'נס ציונה',
    'נהריה', 'נתניה', 'עפולה', 'פתח תקווה', 'צפת', 'קריית אונו',
    'קריית גת', 'קריית שמונה', 'ראש העין', 'ראשון לציון',
    'רחובות', 'רמלה', 'רמת גן', 'רעננה', 'תל אביב'
  ];
  
  const inputs = document.querySelectorAll('input[data-autocomplete="city"]');
  
  inputs.forEach(input => {
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-wrapper';
    wrapper.style.position = 'relative';
    
    const parent = input.parentElement;
    if (!parent) return;
    
    parent.replaceChild(wrapper, input);
    wrapper.appendChild(input);
    
    const list = document.createElement('div');
    list.className = 'autocomplete-list';
    list.style.display = 'none';
    list.style.position = 'absolute';
    list.style.top = '100%';
    list.style.right = '0';
    list.style.left = '0';
    list.style.background = 'white';
    list.style.border = '1px solid var(--border-light)';
    list.style.borderRadius = 'var(--radius-md)';
    list.style.boxShadow = 'var(--shadow-lg)';
    list.style.maxHeight = '200px';
    list.style.overflowY = 'auto';
    list.style.zIndex = '100';
    list.style.marginTop = '4px';
    
    wrapper.appendChild(list);
    
    input.addEventListener('input', () => {
      const value = input.value.trim();
      
      if (!value) {
        list.style.display = 'none';
        return;
      }
      
      const matches = cities.filter(city => 
        city.includes(value) || city.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matches.length === 0) {
        list.style.display = 'none';
        return;
      }
      
      list.innerHTML = '';
      
      matches.forEach(city => {
        const item = document.createElement('div');
        item.textContent = city;
        item.style.padding = '10px 16px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '14px';
        item.style.transition = 'background var(--transition-fast)';
        
        item.addEventListener('mouseenter', () => {
          item.style.background = 'var(--bg-soft)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.background = '';
        });
        
        item.addEventListener('click', () => {
          input.value = city;
          list.style.display = 'none';
        });
        
        list.appendChild(item);
      });
      
      list.style.display = 'block';
    });
    
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        list.style.display = 'none';
      }
    });
  });
}

// ============================================
// Toast Notifications
// ============================================

function initializeToasts() {
  // Toast container already in HTML
  const container = document.getElementById('toastContainer');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'toastContainer';
    newContainer.className = 'toast-container';
    document.body.appendChild(newContainer);
  }
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">×</button>
  `;
  
  container.appendChild(toast);
  
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100px)';
  
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// ============================================
// Global Event Listeners
// ============================================

function setupGlobalListeners() {
  // Save state before unload
  window.addEventListener('beforeunload', () => {
    saveStateToStorage();
  });
  
  // Handle form inputs
  document.addEventListener('input', (e) => {
    if (e.target.matches('input, select, textarea')) {
      const form = e.target.closest('form');
      if (!form) return;
      
      const flowType = form.id.includes('parent') ? 'parent' : 
                       form.id.includes('therapist') ? 'therapist' : null;
      
      if (flowType) {
        AppState[`${flowType}Data`].formData[e.target.name] = e.target.value;
        saveStateToStorage();
      }
    }
  });
  
  // Smooth scroll for anchor links
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
      e.preventDefault();
      const target = document.querySelector(e.target.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
}

// ============================================
// Utility Functions
// ============================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for debugging
window.FlowMatch = {
  AppState,
  showView,
  showToast,
  goToStep,
  resetParentForm
};

console.log('🚀 FlowMatch Enhanced System Ready!');
