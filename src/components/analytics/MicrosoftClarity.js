'use client';

import { useEffect } from 'react';
import { deferUntilIdle } from '@/lib/deferUntilIdle';

const CLARITY_SCRIPT_ATTR = 'data-microsoft-clarity';

export default function MicrosoftClarity({ enabled = false, projectId = '' }) {
  useEffect(() => {
    if (!enabled || !projectId) return undefined;

    return deferUntilIdle(() => {
      if (document.head.querySelector(`script[${CLARITY_SCRIPT_ATTR}]`)) {
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.setAttribute(CLARITY_SCRIPT_ATTR, projectId);
      script.text = `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${projectId}");`;
      document.head.appendChild(script);
    });
  }, [enabled, projectId]);

  return null;
}
