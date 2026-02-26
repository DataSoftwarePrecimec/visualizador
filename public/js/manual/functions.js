function show_section(sectionId) {
  document.querySelectorAll('.manual-section').forEach(s =>
    s.classList.remove('active')
  );
  document.querySelectorAll('.manual-index a').forEach(a =>
    a.classList.remove('active')
  );
  document.getElementById(sectionId)?.classList.add('active');
  document.querySelector(`.manual-index a[data-section="${sectionId}"]`)
    ?.classList.add('active');
}