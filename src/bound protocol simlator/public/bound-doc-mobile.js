(function () {
  var MOBILE_MQ = window.matchMedia("(max-width: 1024px)");

  function initSidebar() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".sb-toggle")) return;

    var nav = sidebar.querySelector(".snav");
    if (!nav) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sb-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "doc-sidenav");
    btn.textContent = "Table of contents";

    nav.id = "doc-sidenav";

    btn.addEventListener("click", function () {
      var open = sidebar.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Hide table of contents" : "Table of contents";
    });

    var head = sidebar.querySelector(".sb-head");
    if (head) head.appendChild(btn);

    function syncLayout() {
      if (MOBILE_MQ.matches) {
        sidebar.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Table of contents";
        btn.style.display = "flex";
      } else {
        sidebar.classList.add("nav-open");
        btn.setAttribute("aria-expanded", "true");
        btn.style.display = "none";
      }
    }

    if (typeof MOBILE_MQ.addEventListener === "function") {
      MOBILE_MQ.addEventListener("change", syncLayout);
    } else if (typeof MOBILE_MQ.addListener === "function") {
      MOBILE_MQ.addListener(syncLayout);
    }

    syncLayout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidebar);
  } else {
    initSidebar();
  }
})();
