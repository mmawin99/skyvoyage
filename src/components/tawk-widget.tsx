// components/TawkWidget.js
import { useEffect } from "react";
// <!--Start of Tawk.to Script-->
// <script type="text/javascript">
// var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
// (function(){
// var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
// s1.async=true;
// s1.src='https://embed.tawk.to/67fbc47f337fb2190cfd3108/1ionnf4mj';
// s1.charset='UTF-8';
// s1.setAttribute('crossorigin','*');
// s0.parentNode.insertBefore(s1,s0);
// })();
// </script>
// <!--End of Tawk.to Script-->
export default function TawkWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/67fbc47f337fb2190cfd3108/1ionnf4mj";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      // Clean up on unmount
      document.body.removeChild(script);
      const tawkIframe = document.querySelector("iframe[src*='tawk.to']");
      if (tawkIframe) {
        tawkIframe.remove();
      }
    };
  }, []);

  return null; // It's just a script, no UI needed
}