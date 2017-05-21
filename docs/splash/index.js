const panels = document.querySelectorAll('.panel');
panels.forEach((panel) => {
  console.log(panel);
})
function toggleOpen() {
  panels.forEach((panel) => {
    panel.classList.remove('open');        
  });
  this.classList.toggle('open');
}

function toggleActive(e) {
  console.log(e.propertyName);
  if (e.propertyName.includes('flex') && this.classList.value.includes('open')) {
    this.classList.toggle('open-active');
  }
}

panels.forEach(panel => panel.addEventListener('click', toggleOpen));
panels.forEach(panel => panel.addEventListener('transitionend', toggleActive));