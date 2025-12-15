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
  const goToParentStep1Buttons = document.querySelectorAll('.js-go-to-parent-step1');

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

  // Go to parent step 1 (child details)
  goToParentStep1Buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      showView('parent-flow');
      // Navigate to step 1
      setTimeout(() => {
        const form = document.getElementById('parent-form');
        if (form) {
          navigateToStep('parent', 1, form);
        }
      }, 100);
    });
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
  
  // Result modals (booking & details)
  initializeResultModals();
  
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
    // Initialize modal buttons after results are shown
    initializeResultModals();
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
  // This function now only handles initial setup
  // Modal buttons are handled by initializeResultModals()
  console.log('Result cards setup complete');
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
  initializeScheduleManager(); // Add weekly schedule manager
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Therapist form submitted!');
    // For MVP - skip validation and show success
    showTherapistSuccess();
  });
  
  updateTherapistProgress();
}

function setupTherapistSubSpecialties(form) {
  // Configuration
  const specializationsData = {
    'קלינאות תקשורת': {
      icon: '🗣️',
      subs: ['עיכוב שפתי', 'גמגום', 'קשיי היגוי', 'עיבוד שמיעתי', 'תקשורת חברתית', 'הזנה ואכילה', 'תקשורת תומכת וחליפית (AAC)']
    },
    'ריפוי בעיסוק': {
      icon: '✋',
      subs: ['ויסות חושי', 'מוטוריקה עדינה', 'מוטוריקה גסה', 'גרפומוטוריקה', 'תפקודי יום-יום (ADL)', 'עבודה עם ASD', 'מיומנויות כיתה א׳']
    },
    'פיזיותרפיה': {
      icon: '🏃',
      subs: ['פיזיותרפיה תינוקות', 'פיזיותרפיה נשימתית', 'פציעות ספורט ילדים', 'שיקום לאחר פגיעה', 'טיפול ביציבה']
    },
    'טיפול רגשי': {
      icon: '💭',
      subs: ['טיפול במשחק', 'טיפול באמצעות אמנות', 'ויסות רגשי', 'חרדות ילדים', 'טיפול דיאדי הורה-ילד']
    },
    'פסיכולוגיה': {
      icon: '🧠',
      subs: ['פסיכולוגיה התפתחותית', 'פסיכולוגיה חינוכית', 'CBT לילדים', 'טיפול משפחתי', 'טיפול בנוער עם חרדה']
    }
  };

  const container = document.getElementById('specializations-container');
  const addBtn = document.getElementById('add-specialization-btn');
  
  if (!container || !addBtn) return;

  let specializationCount = 0;
  const maxSpecializations = 3;
  const selectedMainFields = new Set();

  // Initialize with first specialization
  addSpecializationBlock();

  // Add button click handler
  addBtn.addEventListener('click', () => {
    if (specializationCount < maxSpecializations) {
      addSpecializationBlock();
    }
  });

  function addSpecializationBlock() {
    specializationCount++;
    const blockId = `spec-block-${specializationCount}`;
    
    const block = document.createElement('div');
    block.className = 'specialization-block';
    block.id = blockId;
    block.setAttribute('data-block-number', specializationCount);

    block.innerHTML = `
      <div class="specialization-header">
        <span class="specialization-number">${specializationCount}</span>
        ${specializationCount > 1 ? '<button type="button" class="remove-specialization-btn" title="הסר התמחות">✕</button>' : ''}
      </div>

      <div class="main-field-selector">
        <label>בחר תחום טיפול עיקרי ${specializationCount === 1 ? '<span class="field-required">*</span>' : ''}</label>
        <div class="main-field-chips" data-block-id="${blockId}">
          ${Object.keys(specializationsData).map(field => `
            <button type="button" class="main-field-chip" data-field="${field}">
              <span class="chip-icon">${specializationsData[field].icon}</span>
              <span>${field}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="sub-fields-container" id="${blockId}-subs">
        <label>בחר תתי-התמחויות (אופציונלי)</label>
        <div class="sub-field-chips"></div>
      </div>
    `;

    container.appendChild(block);

    // Setup main field selection
    const mainFieldChips = block.querySelectorAll('.main-field-chip');
    mainFieldChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const field = chip.getAttribute('data-field');
        
        // Deselect other chips in this block
        mainFieldChips.forEach(c => c.classList.remove('selected'));
        
        // Select this chip
        chip.classList.add('selected');
        
        // Update selected fields tracking
        const previousField = block.getAttribute('data-selected-field');
        if (previousField) {
          selectedMainFields.delete(previousField);
        }
        selectedMainFields.add(field);
        block.setAttribute('data-selected-field', field);
        
        // Show sub-specializations
        showSubSpecializations(blockId, field);
        
        // Update disabled states
        updateDisabledFields();
        
        // Update hidden inputs
        updateHiddenInputs();
      });
    });

    // Setup remove button
    if (specializationCount > 1) {
      const removeBtn = block.querySelector('.remove-specialization-btn');
      removeBtn.addEventListener('click', () => {
        const selectedField = block.getAttribute('data-selected-field');
        if (selectedField) {
          selectedMainFields.delete(selectedField);
        }
        block.remove();
        specializationCount--;
        updateAddButtonState();
        renumberBlocks();
        updateDisabledFields();
        updateHiddenInputs();
      });
    }

    updateAddButtonState();
    updateDisabledFields();
  }

  function showSubSpecializations(blockId, field) {
    const subsContainer = document.getElementById(`${blockId}-subs`);
    if (!subsContainer) return;

    const subsChipsContainer = subsContainer.querySelector('.sub-field-chips');
    const subs = specializationsData[field].subs;

    // Clear existing
    subsChipsContainer.innerHTML = '';

    // Add sub-specialization chips
    subs.forEach(sub => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'sub-field-chip';
      chip.textContent = sub;
      chip.setAttribute('data-sub', sub);
      
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        updateHiddenInputs();
      });
      
      subsChipsContainer.appendChild(chip);
    });

    // Show container
    subsContainer.classList.add('visible');
  }

  function updateDisabledFields() {
    const allMainChips = container.querySelectorAll('.main-field-chip');
    
    allMainChips.forEach(chip => {
      const field = chip.getAttribute('data-field');
      const block = chip.closest('.specialization-block');
      const blockSelectedField = block.getAttribute('data-selected-field');
      
      // Disable if selected in another block
      if (selectedMainFields.has(field) && blockSelectedField !== field) {
        chip.classList.add('disabled');
      } else {
        chip.classList.remove('disabled');
      }
    });
  }

  function updateAddButtonState() {
    addBtn.disabled = specializationCount >= maxSpecializations;
    if (specializationCount >= maxSpecializations) {
      addBtn.textContent = 'הגעת למקסימום 3 התמחויות';
    } else {
      addBtn.innerHTML = '<span class="btn-icon">+</span> הוסף התמחות נוספת';
    }
  }

  function renumberBlocks() {
    const blocks = container.querySelectorAll('.specialization-block');
    blocks.forEach((block, index) => {
      const number = index + 1;
      block.setAttribute('data-block-number', number);
      const numberSpan = block.querySelector('.specialization-number');
      if (numberSpan) numberSpan.textContent = number;
    });
  }

  function updateHiddenInputs() {
    const mainFieldsArray = Array.from(selectedMainFields);
    const mainFieldsInput = document.getElementById('therapist_main_fields_hidden');
    if (mainFieldsInput) {
      mainFieldsInput.value = mainFieldsArray.join('|');
    }

    // Collect all selected sub-fields
    const allActiveSubChips = container.querySelectorAll('.sub-field-chip.active');
    const subFieldsArray = Array.from(allActiveSubChips).map(chip => chip.getAttribute('data-sub'));
    const subFieldsInput = document.getElementById('therapist_sub_fields_hidden');
    if (subFieldsInput) {
      subFieldsInput.value = subFieldsArray.join('|');
    }
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

// ============================================
// Weekly Schedule Manager
// ============================================

function initializeScheduleManager() {
  const openBtn = document.getElementById('open-schedule-manager');
  const closeBtn = document.getElementById('close-schedule-manager');
  const scheduleContainer = document.getElementById('schedule-manager');
  const saveBtn = document.getElementById('save-schedule');
  
  if (!openBtn || !scheduleContainer) return;
  
  // Create weekly schedule on first open
  let scheduleCreated = false;
  
  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scheduleContainer.style.display = 'block';
    
    if (!scheduleCreated) {
      createWeeklySchedule();
      scheduleCreated = true;
    }
    
    // Smooth scroll to schedule
    setTimeout(() => {
      scheduleContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      scheduleContainer.style.display = 'none';
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveScheduleData();
      showToast('לוח הזמנים נשמר בהצלחה! 📅', 'success');
      scheduleContainer.style.display = 'none';
    });
  }
}

function createWeeklySchedule() {
  const weeklySchedule = document.querySelector('.weekly-schedule');
  if (!weeklySchedule) return;
  
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
    '18:00-20:00'
  ];
  
  weeklySchedule.innerHTML = '';
  
  days.forEach((day, dayIndex) => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';
    dayColumn.setAttribute('data-day', dayIndex);
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    
    const timeSlotsContainer = document.createElement('div');
    timeSlotsContainer.className = 'time-slots';
    
    timeSlots.forEach((time, timeIndex) => {
      const slot = document.createElement('label');
      slot.className = 'time-slot';
      slot.setAttribute('data-time', timeIndex);
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = `schedule_${dayIndex}_${timeIndex}`;
      checkbox.value = time;
      
      const timeText = document.createElement('span');
      timeText.textContent = time;
      
      slot.appendChild(checkbox);
      slot.appendChild(timeText);
      
      // Toggle selected class on click
      slot.addEventListener('click', () => {
        slot.classList.toggle('selected');
      });
      
      timeSlotsContainer.appendChild(slot);
    });
    
    dayColumn.appendChild(dayHeader);
    dayColumn.appendChild(timeSlotsContainer);
    weeklySchedule.appendChild(dayColumn);
  });
}

function saveScheduleData() {
  const selectedSlots = document.querySelectorAll('.time-slot.selected input[type="checkbox"]');
  const scheduleData = {};
  
  selectedSlots.forEach(checkbox => {
    const slot = checkbox.closest('.time-slot');
    const dayColumn = slot.closest('.day-column');
    const day = dayColumn.getAttribute('data-day');
    const time = slot.getAttribute('data-time');
    
    if (!scheduleData[day]) {
      scheduleData[day] = [];
    }
    scheduleData[day].push(checkbox.value);
  });
  
  // Save to AppState
  if (!AppState.therapistData) {
    AppState.therapistData = {};
  }
  AppState.therapistData.weeklySchedule = scheduleData;
  saveStateToStorage();
  
  console.log('✅ Schedule saved:', scheduleData);
}

// ============================================
// Booking Modal & Details Modal
// ============================================

function initializeResultModals() {
  const bookButtons = document.querySelectorAll('.btn-book');
  const detailsButtons = document.querySelectorAll('.btn-details');
  
  // Book appointment buttons
  bookButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const therapistName = btn.getAttribute('data-therapist');
      openBookingModal(therapistName);
    });
  });
  
  // Details buttons
  detailsButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const therapistName = btn.getAttribute('data-therapist');
      openDetailsModal(therapistName);
    });
  });
  
  // Close modals
  document.getElementById('close-booking-modal')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeBookingModal();
  });
  document.getElementById('close-details-modal')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeDetailsModal();
  });
  
  // Back to results buttons
  document.getElementById('back-to-results')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeDetailsModal();
  });
  document.getElementById('back-to-results-from-booking')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeBookingModal();
  });
  
  // Close on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        resetBookingModal();
      }
    });
  });
}

function openBookingModal(therapistName) {
  const modal = document.getElementById('booking-modal');
  const therapistNameEl = document.getElementById('booking-therapist-name');
  
  if (!modal || !therapistNameEl) return;
  
  therapistNameEl.textContent = therapistName;
  modal.classList.add('active');
  
  // Generate calendar
  generateBookingCalendar(therapistName);
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('active');
  resetBookingModal();
}

function resetBookingModal() {
  const calendarView = document.getElementById('booking-calendar-view');
  const successView = document.getElementById('booking-success-view');
  const summary = document.getElementById('booking-summary');
  
  if (calendarView) calendarView.style.display = 'block';
  if (successView) successView.style.display = 'none';
  if (summary) summary.style.display = 'none';
  
  // Deselect all slots
  document.querySelectorAll('.booking-slot.selected').forEach(slot => {
    slot.classList.remove('selected');
  });
}

function generateBookingCalendar(therapistName) {
  const calendar = document.getElementById('booking-calendar');
  if (!calendar) return;
  
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  calendar.innerHTML = '';
  
  days.forEach((day, dayIndex) => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'booking-day';
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'booking-day-header';
    dayHeader.textContent = day;
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'booking-slots';
    
    times.forEach(time => {
      const slot = document.createElement('div');
      
      // Simulate some unavailable slots
      const isUnavailable = Math.random() > 0.6;
      
      if (isUnavailable) {
        slot.className = 'booking-slot unavailable';
        slot.textContent = time;
      } else {
        slot.className = 'booking-slot';
        slot.textContent = time;
        
        slot.addEventListener('click', () => {
          // Deselect all
          document.querySelectorAll('.booking-slot').forEach(s => s.classList.remove('selected'));
          // Select this
          slot.classList.add('selected');
          // Show summary
          showBookingSummary(therapistName, day, time);
        });
      }
      
      slotsContainer.appendChild(slot);
    });
    
    dayColumn.appendChild(dayHeader);
    dayColumn.appendChild(slotsContainer);
    calendar.appendChild(dayColumn);
  });
}

function showBookingSummary(therapist, day, time) {
  const summary = document.getElementById('booking-summary');
  const summaryTherapist = document.getElementById('summary-therapist');
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  
  if (!summary) return;
  
  summaryTherapist.textContent = therapist;
  summaryDate.textContent = `יום ${day}`;
  summaryTime.textContent = time;
  
  summary.style.display = 'block';
  
  // Save booking button
  const saveBtn = summary.querySelector('.btn-save-booking');
  if (saveBtn) {
    // Remove old listeners
    saveBtn.onclick = null;
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showBookingSuccess(therapist, day, time);
    });
  }
}

function showBookingSuccess(therapist, day, time) {
  const calendarView = document.getElementById('booking-calendar-view');
  const successView = document.getElementById('booking-success-view');
  const successTherapistName = document.getElementById('success-therapist-name');
  const successDateTime = document.getElementById('success-date-time');
  const contactBtn = document.getElementById('contact-therapist-btn');
  const backBtn = document.getElementById('back-to-results-from-booking');
  
  if (!successView) return;
  
  // Hide calendar, show success
  calendarView.style.display = 'none';
  successView.style.display = 'block';
  
  // Fill in details
  successTherapistName.textContent = therapist;
  successDateTime.textContent = `יום ${day} בשעה ${time}`;
  
  // Mock phone numbers for demo
  const therapistPhones = {
    'נועה כהן': '052-1234567',
    'ד״ר רון לוי': '054-7654321',
    'לירון מזרחי': '053-9876543'
  };
  
  const phone = therapistPhones[therapist] || '050-0000000';
  
  // Contact button
  if (contactBtn) {
    contactBtn.href = `tel:${phone}`;
    contactBtn.onclick = (e) => {
      showToast(`מתקשר ל-${therapist} - ${phone}`, 'info');
    };
  }
  
  // Back to results button
  if (backBtn) {
    backBtn.onclick = () => {
      closeBookingModal();
      // Reset views for next time
      calendarView.style.display = 'block';
      successView.style.display = 'none';
    };
  }
}

function openDetailsModal(therapistName) {
  const modal = document.getElementById('details-modal');
  const detailsContainer = document.getElementById('therapist-full-details');
  
  if (!modal || !detailsContainer) return;
  
  // Generate full details
  detailsContainer.innerHTML = generateFullDetails(therapistName);
  
  modal.classList.add('active');
}

function closeDetailsModal() {
  const modal = document.getElementById('details-modal');
  if (modal) modal.classList.remove('active');
}

function generateFullDetails(therapistName) {
  // Mock data - in real version this would come from backend
  const details = {
    'נועה כהן': {
      title: 'קלינאית תקשורת בכירה',
      experience: '15 שנות ניסיון',
      education: 'תואר שני בקלינאות תקשורת, אוניברסיטת תל אביב',
      specializations: ['עיכוב שפתי', 'גמגום', 'תקשורת חברתית', 'AAC'],
      organizations: ['מכבי זהב', 'עמותת אלה', 'בתי ספר ברמת גן'],
      location: 'רמת גן, תל אביב',
      clinic: 'קליניקה נגישה, חנייה פרטית, משחקייה לילדים',
      approach: 'גישה הוליסטית המשלבת משחק, אמנות ותקשורת. דגש על שיתוף הורים בתהליך.',
      languages: 'עברית, אנגלית, רוסית',
      pricing: '₪350-450 לפגישה'
    },
    'ד״ר רון לוי': {
      title: 'פסיכולוג קליני וחינוכי',
      experience: '12 שנות ניסיון',
      education: 'דוקטורט בפסיכולוגיה קלינית, אוניברסיטת חיפה',
      specializations: ['CBT', 'ADHD', 'חרדות', 'טיפול משפחתי'],
      organizations: ['קופת חולים כללית', 'משרד החינוך', 'יועץ ל-SHEKEL'],
      location: 'חיפה, קריות',
      clinic: 'חדרי טיפול שקטים, נגיש למוגבלות, טיפול אונליין זמין',
      approach: 'שילוב CBT וטיפול התנהגותי-רגשי מותאם גיל. דגש על כלים מעשיים.',
      languages: 'עברית, אנגלית',
      pricing: '₪400-500 לפגישה'
    },
    'לירון מזרחי': {
      title: 'מרפאה בעיסוק',
      experience: '8 שנות ניסיון',
      education: 'תואר ראשון בריפוי בעיסוק + הסמכה בויסות חושי',
      specializations: ['ויסות חושי', 'מוטוריקה עדינה', 'ADL', 'ASD'],
      organizations: ['עמותת נצח', 'גנים בתל אביב', 'מרכז התפתחות הילד'],
      location: 'תל אביב מרכז',
      clinic: 'ציוד מקצועי מלא, משחקייה חושית, קומת קרקע',
      approach: 'טיפול חושי מבוסס מחקר. שילוב הורים בתהליך הטיפולי.',
      languages: 'עברית, אנגלית',
      pricing: '₪320-400 לפגישה'
    }
  };
  
  const data = details[therapistName] || details['נועה כהן'];
  
  return `
    <div class="therapist-details-full">
      <div class="details-section">
        <h4>👤 ${therapistName}</h4>
        <p class="therapist-title">${data.title}</p>
        <p><strong>ניסיון:</strong> ${data.experience}</p>
      </div>
      
      <div class="details-section">
        <h4>🎓 השכלה והסמכות</h4>
        <p>${data.education}</p>
      </div>
      
      <div class="details-section">
        <h4>🎯 התמחויות</h4>
        <div class="spec-tags">
          ${data.specializations.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
      </div>
      
      <div class="details-section">
        <h4>🏢 ארגונים ומסגרות</h4>
        <ul>
          ${data.organizations.map(o => `<li>${o}</li>`).join('')}
        </ul>
      </div>
      
      <div class="details-section">
        <h4>📍 מיקום וקליניקה</h4>
        <p><strong>איזור:</strong> ${data.location}</p>
        <p><strong>הקליניקה:</strong> ${data.clinic}</p>
      </div>
      
      <div class="details-section">
        <h4>💡 גישה טיפולית</h4>
        <p>${data.approach}</p>
      </div>
      
      <div class="details-section">
        <h4>🗣️ שפות</h4>
        <p>${data.languages}</p>
      </div>
      
      <div class="details-section">
        <h4>💰 מחיר משוער</h4>
        <p>${data.pricing}</p>
        <p class="price-note">* ניתן להגיש לביטוח דרך מודול ההחזרים של FlowInsurance</p>
      </div>
    </div>
  `;
}

// ============================================
// NAVIGATION FIX - Added for reliability
// ============================================

// Make sure navigation is initialized
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Navigation safety check...');
  
  // Add backup navigation handler
  setTimeout(function() {
    const navButtons = document.querySelectorAll('[data-view]');
    console.log('📊 Found navigation elements:', navButtons.length);
    
    if (navButtons.length > 0) {
      console.log('✅ Navigation elements present');
    } else {
      console.warn('⚠️ No navigation elements found');
    }
  }, 500);
}, false);

