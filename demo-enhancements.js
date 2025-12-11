/**
 * Demo Screens Enhancement
 * Adds rich demo screen functionality
 */

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemoEnhancements);
  } else {
    initDemoEnhancements();
  }
  
  function initDemoEnhancements() {
    console.log('🎭 Initializing demo enhancements...');
    
    // Setup demo menu navigation
    setupDemoMenu();
    
    // Setup demo screen switching
    setupDemoScreens();
    
    console.log('✅ Demo enhancements initialized');
  }
  
  function setupDemoMenu() {
    const demoMenuButtons = document.querySelectorAll('.demo-menu-btn');
    
    if (demoMenuButtons.length === 0) {
      console.log('⚠️  No demo menu buttons found');
      return;
    }
    
    demoMenuButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const demoId = this.getAttribute('data-demo');
        switchDemoScreen(demoId);
        
        // Update active state
        demoMenuButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    console.log(`✅ Setup ${demoMenuButtons.length} demo menu buttons`);
  }
  
  function setupDemoScreens() {
    // Ensure first demo screen is active
    const firstDemoScreen = document.querySelector('.demo-screen');
    if (firstDemoScreen && !document.querySelector('.demo-screen.active')) {
      firstDemoScreen.classList.add('active');
    }
  }
  
  function switchDemoScreen(demoId) {
    // Hide all demo screens
    const allScreens = document.querySelectorAll('.demo-screen');
    allScreens.forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show selected screen
    const targetScreen = document.getElementById(`demo-${demoId}`);
    if (targetScreen) {
      targetScreen.classList.add('active');
      
      // Scroll to top of demo section
      targetScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      console.log(`🎯 Switched to demo: ${demoId}`);
    } else {
      console.warn(`⚠️  Demo screen not found: ${demoId}`);
    }
  }
  
  // Export functions for external use
  window.FlowMatchDemo = {
    switchScreen: switchDemoScreen
  };
  
})();
