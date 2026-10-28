/* Front-end demo only: requests stay in this browser's localStorage. */
(() => {
  const form = document.querySelector("#request-form");
  const feedback = document.querySelector("#form-feedback");
  const category = document.querySelector("#service-category");
  const email = document.querySelector("#student-email");
  const details = document.querySelector("#request-details");
  const tableBody = document.querySelector("#requestsTableBody");
  const pendingCount = document.querySelector("#pendingCount");
  const tableNote = document.querySelector("#tableNote");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const menuToggle = document.querySelector("#menuToggle");
  const mobileOverlay = document.querySelector("#mobileOverlay");
  const breadcrumbCurrent = document.querySelector("#breadcrumbCurrent");
  const samples = [
    {id:"DR-1042",service:"Certificate of Enrollment",date:"Oct 24, 2026",status:"Pending"},
    {id:"SO-1038",service:"Subject Overload Permit",date:"Oct 21, 2026",status:"In review"},
    {id:"DR-1029",service:"Transcript of Records",date:"Oct 16, 2026",status:"Completed"}
  ];
  const loadRequests = () => {
    try { const data = JSON.parse(localStorage.getItem("dsscStudentRequests") || "[]"); return Array.isArray(data) ? data : []; }
    catch { return []; }
  };
  const saveRequests = (data) => localStorage.setItem("dsscStudentRequests", JSON.stringify(data));
  function cell(label, value, type = "") {
    const td = document.createElement("td");
    td.dataset.label = label;
    if (type === "id") { const strong = document.createElement("strong"); strong.textContent = value; td.append(strong); }
    else if (type === "status") {
      const badge = document.createElement("span");
      badge.className = "status status-" + (value === "Pending" ? "pending" : value === "In review" ? "review" : "complete");
      badge.textContent = value; td.append(badge);
    } else td.textContent = value;
    return td;
  }
  function renderRequests() {
    const saved = loadRequests();
    if (!tableBody) return;
    tableBody.replaceChildren();
    [...saved, ...samples].forEach((r) => {
      const row = document.createElement("tr");
      row.append(cell("Request ID", "#" + r.id, "id"));
      row.append(cell("Service Type", r.service));
      row.append(cell("Date Filed", r.date));
      row.append(cell("Status", r.status, "status"));
      tableBody.append(row);
    });
    if (pendingCount) pendingCount.innerHTML = `${2 + saved.filter(r => r.status === "Pending").length} <span>requests</span>`;
    if (tableNote) tableNote.textContent = saved.length
      ? `Showing ${saved.length} submitted request${saved.length === 1 ? "" : "s"} and 3 sample requests. Saved in this browser only.`
      : "Showing 3 sample requests. New requests are saved in this browser only.";
  }
  function clearErrors() {
    ["category-error","email-error","details-error"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ""; });
    [category,email,details].forEach(el => el?.removeAttribute("aria-invalid"));
  }
  function showError(field, id, message) {
    document.getElementById(id).textContent = message;
    field.setAttribute("aria-invalid","true");
  }
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault(); clearErrors(); feedback.textContent = ""; feedback.classList.remove("error");
      let valid = true;
      if (!category.value) { showError(category,"category-error","Please select a service category."); valid = false; }
      if (!email.value.trim() || !email.validity.valid) { showError(email,"email-error","Enter a valid email address."); valid = false; }
      if (details.value.trim().length < 10) { showError(details,"details-error","Please enter at least 10 characters."); valid = false; }
      if (!valid) {
        feedback.textContent = "Please review the highlighted fields."; feedback.classList.add("error");
        form.querySelector('[aria-invalid="true"]')?.focus(); return;
      }
      const requests = loadRequests();
      const request = {
        id: "DSSC-" + String(Date.now()).slice(-7),
        service: category.value, email: email.value.trim(), details: details.value.trim(),
        date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
        status: "Pending"
      };
      try { requests.unshift(request); saveRequests(requests); }
      catch {
        feedback.textContent = "Could not save the request in this browser. Check browser storage settings and try again.";
        feedback.classList.add("error"); return;
      }
      renderRequests();
      feedback.textContent = `Request submitted successfully! Reference number: ${request.id}. This demo saves requests in this browser only.`;
      form.reset(); clearErrors();
    });
    form.addEventListener("reset", () => setTimeout(() => { clearErrors(); feedback.textContent = ""; feedback.classList.remove("error"); }, 0));
    [category,email,details].forEach(field => {
      const clear = () => {
        const id = field === category ? "category-error" : field === email ? "email-error" : "details-error";
        document.getElementById(id).textContent = ""; field.removeAttribute("aria-invalid");
      };
      field.addEventListener("input", clear); field.addEventListener("change", clear);
    });
  }
  function closeMenu() {
    document.body.classList.remove("sidebar-open");
    if (mobileOverlay) mobileOverlay.hidden = true;
    if (menuToggle) { menuToggle.setAttribute("aria-expanded","false"); menuToggle.setAttribute("aria-label","Open navigation menu"); }
  }
  if (menuToggle) menuToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("sidebar-open");
    if (mobileOverlay) mobileOverlay.hidden = !open;
    menuToggle.setAttribute("aria-expanded",String(open));
    menuToggle.setAttribute("aria-label",open ? "Close navigation menu" : "Open navigation menu");
  });
  mobileOverlay?.addEventListener("click",closeMenu);
  document.addEventListener("keydown",event => { if (event.key === "Escape") closeMenu(); });
  navLinks.forEach(link => link.addEventListener("click",() => {
    navLinks.forEach(item => { item.classList.remove("active"); item.removeAttribute("aria-current"); });
    link.classList.add("active"); link.setAttribute("aria-current","page");
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = link.querySelector(".nav-text")?.textContent.trim() || "Dashboard";
    closeMenu();
  }));
  window.addEventListener("resize",() => { if (window.innerWidth > 1023) closeMenu(); });
  renderRequests();
})();
