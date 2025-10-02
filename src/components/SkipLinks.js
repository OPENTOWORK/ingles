'use client';
import Link from 'next/link';
import { useAccessibility } from './AccessibilityProvider';

const SkipLinks = () => {
  const { isEnabled } = useAccessibility();

  if (!isEnabled('skipLinks')) {
    return null;
  }

  return (
    <div className="skip-links">
      <Link href="#main-content" className="skip-link">
        Skip to main content
      </Link>
      <Link href="#navigation" className="skip-link">
        Skip to navigation
      </Link>
      <Link href="#progress-dashboard" className="skip-link">
        Skip to progress dashboard
      </Link>
      <Link href="#level-selection" className="skip-link">
        Skip to level selection
      </Link>
      <Link href="#accessibility-panel" className="skip-link">
        Skip to accessibility settings
      </Link>
    </div>
  );
};

export default SkipLinks;






















