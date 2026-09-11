/**
 * Paints the themed shell background before hydration on home, login and admin.
 * React-owned attributes remain untouched; ThemeProvider removes the temporary
 * style after resolving the preference. Keep the legacy key for saved choices.
 */
export const THEME_BOOT_SCRIPT = [
  "(function(){try{",
  'var p=window.location.pathname;if(p!=="/"&&p!=="/login"&&p!=="/login/"&&p!=="/admin"&&p.indexOf("/admin/")!==0)return;',
  'var t=null;try{t=localStorage.getItem("three-devs-admin-theme")}catch(e){}',
  'if(t!=="dark"&&t!=="light"){',
  't=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}',
  'if(t==="dark"){',
  'var s=document.createElement("style");s.id="admin-theme-boot";',
  "s.textContent=\"[data-theme-shell]{color-scheme:dark;background-color:#020617}\";",
  "document.head.appendChild(s)}",
  "}catch(e){}})();",
].join("");
