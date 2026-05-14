import React, { useEffect } from 'react';

const TawkChat: React.FC = () => {
  useEffect(() => {
    // Tawk.to script injection
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/6a04728deec2f91c3400ac09/1jogluub3';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default TawkChat;
