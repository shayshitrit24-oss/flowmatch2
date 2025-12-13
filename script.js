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
// Initialization - Immediate execution
// ============================================

initializeApp();

function initializeApp() {
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
// Navigation - Event Delegation
// ============================================

function initializeNavigation() {
  // Single document-level click listener for all navigation
  document.addEventListener('click', (e) => {
    // Find closest element with data-view attribute
    const target = e.target.closest('[data-view]');
    
    // If we clicked inside a [data-view] element but not directly on it,
    // forward the click to the parent
    if (target && e.target !== target) {
      target.click();
      return;
    }
  });
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
      notRelevantMsg.style.display = 'block';
      setTimeout(() => {
        notRelevantMsg.style.display = 'none';
      }, 5000);
    });
  }
  
  updateParentProgress();
}

function setupStepNavigation(flowType, form) {
  const nextButtons = form.querySelectorAll('.js-next-step');
  const prevButtons = form.querySelectorAll('.js-prev-step');
  
  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.getAttribute('data-next'));
      if (nextStep) {
        navigateToStep(flowType, nextStep, form);
      }
    });
  });
  
  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.getAttribute('data-prev'));
      if (prevStep) {
        navigateToStep(flowType, prevStep, form);
      }
    });
  });
}

function navigateToStep(flowType, step, form) {
  const panels = form.querySelectorAll('.step-panel');
  
  panels.forEach(panel => {
    const panelStep = parseInt(panel.getAttribute('data-step'));
    panel.classList.toggle('active', panelStep === step);
  });
  
  if (flowType === 'parent') {
    AppState.parentData.step = step;
    updateParentProgress();
  } else if (flowType === 'therapist') {
    AppState.therapistData.step = step;
    updateTherapistProgress();
  }
  
  saveStateToStorage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateParentProgress() {
  const currentStep = AppState.parentData.step;
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  const progressFill = document.getElementById('parentProgress');
  const progressText = document.getElementById('parentProgressText');
  
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressText) progressText.textContent = `שלב ${currentStep} מתוך ${totalSteps}`;
}

function validateParentForm() {
  const childName = document.getElementById('child-name');
  const childAge = document.getElementById('child-age');
  
  if (!childName || !childName.value.trim()) {
    showToast('נא למלא את שם הילד/ה', 'error');
    return false;
  }
  
  if (!childAge || !childAge.value) {
    showToast('נא למלא את גיל הילד/ה', 'error');
    return false;
  }
  
  return true;
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
  // This function now only handles initial setup
  // Modal buttons are handled by initializeResultModals()
  console.log('Result cards setup complete');
}

function resetParentForm() {
  const form = document.getElementById('parent-form');
  const resultsPanel = document.getElementById('parent-results');
  
  if (!form || !resultsPanel) return;
  
  // Reset form
  const formElement = form.querySelector('form');
  if (formElement) formElement.reset();
  
  // Reset state
  AppState.parentData = {
    step: 1,
    formData: {},
    preferences: [],
    uploadedFiles: []
  };
  
  // Hide results and show step 1
  resultsPanel.classList.remove('active');
  navigateToStep('parent', 1, form);
  
  saveStateToStorage();
}

// ============================================
// Therapist Flow
// ============================================

function initializeTherapistFlow() {
  const form = document.getElementById('therapist-form');
  if (!form) return;
  
  // Step navigation
  setupStepNavigation('therapist', form);
  
  // File upload
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
    'ריפוי בעיסוק': [
      'שילוב חושי',
      'מיומנויות חברתיות',
      'מיומנויות גרפו-מוטוריות',
      'פיתוח עצמאות',
      'קשיי אכילה',
      'קשיים חושיים',
      'קשיי ויסות'
    ],
    'קלינאות תקשורת': [
      'עיכוב שפתי',
      'גמגום',
      'קושי בהיגוי',
      'תקשורת חברתית-פרגמטית',
      'AAC - תקשורת תומכת',
      'קושי בהבנה',
      'בליעה'
    ],
    'פיזיותרפיה': [
      'התפתחות מוטורית',
      'שיקום אורטופדי',
      'שיווי משקל ותנועה',
      'כאבי גב וצוואר',
      'ספורט וטראומה',
      'נוירו-פיזיותרפיה'
    ],
    'פסיכולוגיה': [
      'חרדות ופחדים',
      'דימוי עצמי',
      'קשיי התנהגות',
      'גירושין והפרדה',
      'טראומה',
      'ADD/ADHD',
      'אוטיזם',
      'הדרכת הורים'
    ],
    'ייעוץ חינוכי': [
      'קשיי למידה',
      'ארגון וניהול זמן',
      'קשב וריכוז',
      'מוטיבציה ללמידה',
      'חרדת מבחנים',
      'מעבר לכיתה א׳',
      'קשיי הסתגלות'
    ]
  };

  // Find all specialization blocks
  const specBlocks = form.querySelectorAll('[data-spec-block]');
  
  specBlocks.forEach((block, blockIndex) => {
    const mainFieldSelect = block.querySelector('.main-field-select');
    const subFieldsContainer = block.querySelector('.sub-fields-chips');
    
    if (!mainFieldSelect || !subFieldsContainer) return;
    
    mainFieldSelect.addEventListener('change', () => {
      const selectedField = mainFieldSelect.value;
      subFieldsContainer.innerHTML = '';
      
      if (selectedField && specializationsData[selectedField]) {
        const subFields = specializationsData[selectedField];
        
        subFields.forEach(subField => {
          const chip = document.createElement('label');
          chip.className = 'chip';
          chip.innerHTML = `
            <input type="checkbox" name="therapist-subfield-${blockIndex}" value="${subField}">
            <span>${subField}</span>
          `;
          subFieldsContainer.appendChild(chip);
        });
      }
    });
  });
}

function initializeScheduleManager() {
  const scheduleBtn = document.getElementById('open-schedule-manager');
  const scheduleContainer = document.getElementById('schedule-manager-container');
  const closeScheduleBtn = document.getElementById('close-schedule-manager');
  const saveScheduleBtn = document.getElementById('save-schedule');
  
  if (!scheduleBtn || !scheduleContainer) return;
  
  scheduleBtn.addEventListener('click', () => {
    scheduleContainer.style.display = 'block';
    createWeeklySchedule();
  });
  
  if (closeScheduleBtn) {
    closeScheduleBtn.addEventListener('click', () => {
      scheduleContainer.style.display = 'none';
    });
  }
  
  if (saveScheduleBtn) {
    saveScheduleBtn.addEventListener('click', () => {
      saveScheduleData();
      scheduleContainer.style.display = 'none';
      showToast('הזמנים נשמרו בהצלחה', 'success');
    });
  }
}

function createWeeklySchedule() {
  const scheduleGrid = document.getElementById('weekly-schedule-grid');
  if (!scheduleGrid) return;
  
  scheduleGrid.innerHTML = '';
  
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const times = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];
  
  days.forEach(day => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    dayColumn.appendChild(dayHeader);
    
    times.forEach(time => {
      const timeSlot = document.createElement('div');
      timeSlot.className = 'time-slot';
      timeSlot.textContent = time;
      timeSlot.dataset.day = day;
      timeSlot.dataset.time = time;
      
      timeSlot.addEventListener('click', () => {
        timeSlot.classList.toggle('selected');
      });
      
      dayColumn.appendChild(timeSlot);
    });
    
    scheduleGrid.appendChild(dayColumn);
  });
}

function saveScheduleData() {
  const selectedSlots = document.querySelectorAll('.time-slot.selected');
  const schedule = {};
  
  selectedSlots.forEach(slot => {
    const day = slot.dataset.day;
    const time = slot.dataset.time;
    
    if (!schedule[day]) schedule[day] = [];
    schedule[day].push(time);
  });
  
  AppState.therapistData.weeklySchedule = schedule;
  saveStateToStorage();
}

function updateTherapistProgress() {
  const currentStep = AppState.therapistData.step;
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  const progressFill = document.getElementById('therapistProgress');
  const progressText = document.getElementById('therapistProgressText');
  
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressText) progressText.textContent = `שלב ${currentStep} מתוך ${totalSteps}`;
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
      if (policyFileInput.files.length > 0) {
        const fileName = policyFileInput.files[0].name;
        policyStatus.textContent = `קובץ נבחר: ${fileName}`;
        policyStatus.style.color = 'var(--success)';
        
        if (analyzePolicyBtn) {
          analyzePolicyBtn.disabled = false;
        }
      }
    });
  }
  
  // Analyze policy button
  if (analyzePolicyBtn && policyAnalysisBox) {
    analyzePolicyBtn.addEventListener('click', () => {
      if (!aiConsent || !aiConsent.checked) {
        showToast('נא לאשר את השימוש ב-AI לניתוח הפוליסה', 'warning');
        return;
      }
      
      analyzePolicyBtn.textContent = 'מנתח...';
      analyzePolicyBtn.disabled = true;
      
      setTimeout(() => {
        policyAnalysisBox.style.display = 'block';
        analyzePolicyBtn.textContent = 'ניתוח הושלם ✓';
        showToast('הפוליסה נותחה בהצלחה', 'success');
      }, 2000);
    });
  }
}

// ============================================
// Chips (Multi-select)
// ============================================

function setupChips(form) {
  const chips = form.querySelectorAll('.chip input[type="checkbox"]');
  
  chips.forEach(chip => {
    chip.addEventListener('change', () => {
      const parent = chip.closest('.chip');
      if (parent) {
        parent.classList.toggle('chip-selected', chip.checked);
      }
    });
  });
}

// ============================================
// Sub-Specialties (Dynamic)
// ============================================

function setupSubSpecialties() {
  const mainFieldSelect = document.getElementById('therapy-field');
  const subFieldsContainer = document.getElementById('sub-fields');
  
  if (!mainFieldSelect || !subFieldsContainer) return;
  
  const subFieldsData = {
    'ריפוי בעיסוק': ['שילוב חושי', 'מיומנויות חברתיות', 'מיומנויות גרפו-מוטוריות', 'פיתוח עצמאות'],
    'קלינאות תקשורת': ['עיכוב שפתי', 'גמגום', 'קושי בהיגוי', 'תקשורת חברתית'],
    'פיזיותרפיה': ['התפתחות מוטורית', 'שיקום אורטופדי', 'שיווי משקל ותנועה'],
    'פסיכולוגיה': ['חרדות ופחדים', 'דימוי עצמי', 'קשיי התנהגות', 'ADD/ADHD'],
    'ייעוץ חינוכי': ['קשיי למידה', 'ארגון וניהול זמן', 'קשב וריכוז']
  };
  
  mainFieldSelect.addEventListener('change', () => {
    const selectedField = mainFieldSelect.value;
    subFieldsContainer.innerHTML = '';
    
    if (selectedField && subFieldsData[selectedField]) {
      const subFields = subFieldsData[selectedField];
      
      subFields.forEach(subField => {
        const chip = document.createElement('label');
        chip.className = 'chip';
        chip.innerHTML = `
          <input type="checkbox" name="sub-field" value="${subField}">
          <span>${subField}</span>
        `;
        subFieldsContainer.appendChild(chip);
      });
      
      setupChips(subFieldsContainer.closest('form'));
    }
  });
}

// ============================================
// File Upload
// ============================================

function setupFileUpload(flowType) {
  const uploadZone = document.getElementById(`${flowType}-upload-zone`);
  const fileInput = document.getElementById(`${flowType}-file-input`);
  const fileStatus = document.getElementById(`${flowType}-file-status`);
  
  if (!uploadZone || !fileInput) return;
  
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
    uploadZone.style.background = 'rgba(61, 123, 253, 0.05)';
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, flowType, fileStatus);
    }
  });
  
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileUpload(fileInput.files, flowType, fileStatus);
    }
  });
}

function handleFileUpload(files, flowType, statusElement) {
  const fileNames = Array.from(files).map(f => f.name).join(', ');
  
  if (statusElement) {
    statusElement.textContent = `קבצים נבחרו: ${fileNames}`;
    statusElement.style.color = 'var(--success)';
  }
  
  if (flowType === 'parent') {
    AppState.parentData.uploadedFiles = Array.from(files).map(f => f.name);
  } else if (flowType === 'therapist') {
    AppState.therapistData.uploadedFiles = Array.from(files).map(f => f.name);
  }
  
  saveStateToStorage();
  showToast(`${files.length} קבצים הועלו בהצלחה`, 'success');
}

// ============================================
// Autocomplete
// ============================================

function initializeAutocomplete() {
  const locationInput = document.getElementById('location');
  if (!locationInput) return;
  
  const israelCities = [
    'תל אביב-יפו', 'ירושלים', 'חיפה', 'ראשון לציון', 'פתח תקווה',
    'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'חולון',
    'רמת גן', 'אשקלון', 'רחובות', 'בת ים', 'כפר סבא',
    'הרצליה', 'חדרה', 'מודיעין', 'נצרת', 'לוד',
    'רעננה', 'רמלה', 'קריית אתא', 'גבעתיים', 'קריית גת'
  ];
  
  locationInput.addEventListener('input', () => {
    const value = locationInput.value.toLowerCase();
    
    if (value.length < 2) return;
    
    const matches = israelCities.filter(city => 
      city.toLowerCase().includes(value)
    );
    
    console.log('City matches:', matches);
  });
}

// ============================================
// Toasts (Notifications)
// ============================================

function initializeToasts() {
  // Toast container will be created on-demand
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    'success': '✓',
    'error': '✕',
    'warning': '⚠',
    'info': 'ℹ'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('toast-show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// Global Listeners
// ============================================

function setupGlobalListeners() {
  // Handle stepper clicks
  document.querySelectorAll('.stepper-item').forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'));
      const flowType = item.closest('#parent-form') ? 'parent' : 'therapist';
      const form = document.getElementById(`${flowType}-form`);
      
      if (step && form) {
        navigateToStep(flowType, step, form);
      }
    });
  });
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
    dayColumn.appendChild(dayHeader);
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'booking-slots';
    
    times.forEach((time, timeIndex) => {
      const slot = document.createElement('div');
      
      // Simulate availability (60% available)
      const isAvailable = Math.random() > 0.4;
      
      if (!isAvailable) {
        slot.className = 'booking-slot booking-slot-unavailable';
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
  
  modal.classList.add('active');
  
  // Generate full details
  detailsContainer.innerHTML = generateFullDetails(therapistName);
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
      organizations: ['קופת חולים כללית', 'מרכז תקשורת מתקדם'],
      location: 'רחובות, מרכז',
      approach: 'גישה הוליסטית המשלבת משחק, טכנולוגיה ושיתוף פעולה הדוק עם ההורים',
      languages: ['עברית', 'אנגלית', 'רוסית'],
      price: '320 ₪ לפגישה'
    },
    'ד״ר רון לוי': {
      title: 'פסיכולוג התפתחותי',
      experience: '12 שנות ניסיון',
      education: 'דוקטורט בפסיכולוגיה התפתחותית, אוניברסיטת בר אילן',
      specializations: ['חרדות', 'ADD/ADHD', 'הדרכת הורים', 'ויסות רגשי'],
      organizations: ['מכון פסיכולוגי ירושלים', 'בתי ספר בעיר'],
      location: 'ירושלים',
      approach: 'גישה קוגניטיבית-התנהגותית עם דגש על העצמה וכלים מעשיים',
      languages: ['עברית', 'אנגלית'],
      price: '400 ₪ לפגישה'
    },
    'לירון מזרחי': {
      title: 'מרפא בעיסוק',
      experience: '8 שנות ניסיון',
      education: 'תואר ראשון בריפוי בעיסוק, המכללה האקדמית תל אביב-יפו',
      specializations: ['שילוב חושי', 'מיומנויות חברתיות', 'גרפו-מוטוריקה'],
      organizations: ['גני חינוך מיוחד', 'מרפאה פרטית'],
      location: 'תל אביב',
      approach: 'גישה מבוססת שילוב חושי ומשחק מכוון מטרה',
      languages: ['עברית', 'אנגלית'],
      price: '350 ₪ לפגישה'
    }
  };
  
  const therapist = details[therapistName] || details['נועה כהן'];
  
  return `
    <div class="therapist-details-full">
      <div class="details-section">
        <h4>${therapistName}</h4>
        <p>${therapist.title}</p>
        <p><strong>ניסיון:</strong> ${therapist.experience}</p>
      </div>
      
      <div class="details-section">
        <h5>השכלה והסמכות</h5>
        <p>${therapist.education}</p>
      </div>
      
      <div class="details-section">
        <h5>התמחויות</h5>
        <div class="spec-tags">
          ${therapist.specializations.map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
      </div>
      
      <div class="details-section">
        <h5>ארגונים ומסגרות</h5>
        <p>${therapist.organizations.join(' • ')}</p>
      </div>
      
      <div class="details-section">
        <h5>מיקום</h5>
        <p>📍 ${therapist.location}</p>
      </div>
      
      <div class="details-section">
        <h5>גישה טיפולית</h5>
        <p>${therapist.approach}</p>
      </div>
      
      <div class="details-section">
        <h5>שפות</h5>
        <p>${therapist.languages.join(' • ')}</p>
      </div>
      
      <div class="details-section">
        <h5>תמחור</h5>
        <p><strong>${therapist.price}</strong></p>
        <p class="price-note">*ניתן להגיש לביטוח משלים</p>
      </div>
    </div>
  `;
}

// ============================================
// Exports (for debugging)
// ============================================

window.FlowMatch = {
  AppState,
  saveStateToStorage,
  loadStateFromStorage,
  resetParentForm,
  showToast,
  navigateToStep
};
// ===============================
// SIMPLE VIEW NAVIGATION (SAFE)
// ===============================

function showView(viewId) {
  // hide all views
  document.querySelectorAll('[data-view-content]').forEach(el => {
    el.style.display = 'none';
  });

  // show requested view
  const view = document.querySelector(`[data-view-content="${viewId}"]`);
  if (view) {
    view.style.display = 'block';
  }

  // optional state tracking
  if (window.AppState) {
    AppState.currentView = viewId;
  }
}

// global click handler for navigation
document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-view]');
  if (!nav) return;

  const viewId = nav.getAttribute('data-view');
  if (!viewId) return;

  e.preventDefault();
  showView(viewId);
});
