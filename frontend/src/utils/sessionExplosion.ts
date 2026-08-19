export const triggerShatterExplosion = (colors: string[] = ['#ef4444', '#f87171', '#dc2626', '#10b981', '#ffffff']) => {
  const isDark = document.documentElement.classList.contains('dark');
  const effectiveColors = colors.map(c => 
    c.toLowerCase() === '#ffffff' || c.toLowerCase() === '#fff'
      ? (isDark ? '#ffffff' : '#1e293b')
      : c
  );

  // Locate the active container in View tab to shatter
  let targetElement: HTMLElement | null = null;
  const activeSession = document.getElementById('active-session-card');
  const payloadShield = document.querySelector('.decrypted-payload-shield, [data-payload-renderer="true"], .no-whistle-menu, form') as HTMLElement | null;
  const viewMain = document.querySelector('#view-tab-container, main') as HTMLElement | null;

  if (activeSession) {
    targetElement = activeSession;
  } else if (payloadShield) {
    targetElement = payloadShield;
  } else if (viewMain) {
    targetElement = viewMain;
  }

  const rect = targetElement 
    ? targetElement.getBoundingClientRect() 
    : { x: window.innerWidth * 0.15, y: window.innerHeight * 0.2, width: window.innerWidth * 0.7, height: 350 };

  window.dispatchEvent(new CustomEvent('trigger-session-explosion', {
    detail: { element: targetElement, rect, colors: effectiveColors }
  }));
};


