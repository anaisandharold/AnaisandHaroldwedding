const opening = document.querySelector('#opening');
const openButton = document.querySelector('#open-curtain');

openButton.addEventListener('click', () => {
  opening.classList.add('opened');
  document.body.classList.remove('locked');
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const selectedEvents = data.getAll('events');
  const sundayChoice = data.get('sunday');
  if (!selectedEvents.length && !sundayChoice) {
    status.textContent = 'Please select at least one part of the celebration.';
    return;
  }
  if (sundayChoice) selectedEvents.push(sundayChoice);
  const subject = encodeURIComponent(`Wedding RSVP — ${data.get('name')}`);
  const body = encodeURIComponent([
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    '',
    'Attending:',
    ...selectedEvents.map((item) => `- ${item}`),
    '',
    `Dietary requirements / note: ${data.get('message') || 'None'}`
  ].join('\n'));
  window.location.href = `mailto:anaisetharoldgrosjean@gmail.com?subject=${subject}&body=${body}`;
  status.textContent = 'Your email app should open with the RSVP ready to send.';
});
