require('./code3.png');

const panels = document.querySelectorAll('.panel');
panels.forEach((panel) => {
  console.log(panel);
})
function toggleOpen() {
  panels.forEach((panel) => {
    panel.classList.remove('open');
    panel.classList.remove('open-active');        
  });
  this.classList.add('open');
}

function toggleActive(e) {
  console.log(e.propertyName);
  if (e.propertyName.includes('flex') && this.classList.value.includes('open')) {
    this.classList.add('open-active');
  }
}

panels.forEach(panel => panel.addEventListener('click', toggleOpen));
panels.forEach(panel => panel.addEventListener('transitionend', toggleActive));