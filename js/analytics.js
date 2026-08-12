/**
 * Vercel Web Analytics Initialization
 * https://vercel.com/docs/analytics
 * 
 * This script initializes Vercel Web Analytics for the static site.
 * When deployed on Vercel with Analytics enabled in the dashboard,
 * page views and events are automatically tracked.
 */

(function() {
  'use strict';
  
  // Initialize Vercel Analytics queue if not already present
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
  
  // Track page views automatically
  if (typeof window !== 'undefined' && window.va) {
    // Page view is automatically tracked by Vercel Analytics
    // when the script is loaded
    
    // Optional: Track custom events
    // Example: window.va('event', { name: 'custom_event' });
  }
})();
