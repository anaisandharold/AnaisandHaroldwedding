const opening = document.querySelector('#opening');
const accessForm = document.querySelector('#access-form');
const accessInput = document.querySelector('#access-code');
const accessStatus = document.querySelector('#access-status');

const INVITATION_CODES = {
  PREMIERE2027: 'full',
  VAUDEVILLE2027: 'limited'
};

let accessLevel = null;

function applyAccess(level) {
  accessLevel = level;
  document.body.dataset.access = level;

  document.querySelectorAll('[data-access="full"]').forEach((element) => {
    const hidden = level !== 'full';
    element.hidden = hidden;
    element.querySelectorAll('input').forEach((input) => {
      input.disabled = hidden;
      if (hidden) input.checked = false;
    });
  });

  document.querySelectorAll('.access-sensitive').forEach((element) => {
    element.textContent = level === 'full' ? element.dataset.fullText : element.dataset.limitedText;
  });

  opening.classList.add('opened');
  document.body.classList.remove('locked');
  sessionStorage.setItem('weddingAccess', level);
}

accessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const code = accessInput.value.trim().toUpperCase().replace(/\s+/g, '');
  const level = INVITATION_CODES[code];
  if (!level) {
    accessStatus.textContent = 'That code is not recognised. Please check your invitation.';
    accessInput.focus();
    return;
  }
  accessStatus.textContent = '';
  applyAccess(level);
});

const rememberedAccess = sessionStorage.getItem('weddingAccess');
if (rememberedAccess === 'full' || rememberedAccess === 'limited') applyAccess(rememberedAccess);

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('input[data-group]').forEach((input) => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    const peers = [...document.querySelectorAll(`input[data-group="${input.dataset.group}"]:not(:disabled)`)];
    if (input.hasAttribute('data-decline')) {
      peers.filter((peer) => peer !== input).forEach((peer) => { peer.checked = false; });
    } else {
      peers.filter((peer) => peer.hasAttribute('data-decline')).forEach((peer) => { peer.checked = false; });
    }
  });
});

const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const day15 = data.getAll('day15');
  const day16 = data.getAll('day16');

  if (!day15.length) {
    status.textContent = 'Please select at least one answer for 15 January.';
    return;
  }
  if (accessLevel === 'full' && !day16.length) {
    status.textContent = 'Please select at least one answer for 16 January.';
    return;
  }

  const lines = [
    `Invitation type: ${accessLevel === 'full' ? 'Full weekend' : 'Church, reception & party'}`,
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    '',
    'Friday 15 January:',
    ...day15.map((item) => `- ${item}`)
  ];

  if (accessLevel === 'full') {
    lines.push('', 'Saturday 16 January:', ...day16.map((item) => `- ${item}`));
    lines.push('', `Meal preference: ${data.get('diet') || 'Not specified'}`);
  }

  lines.push('', 'A nice memory:', data.get('message') || '—');

  const subject = encodeURIComponent(`Wedding RSVP — ${data.get('name')}`);
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:anaisetharoldgrosjean@gmail.com?subject=${subject}&body=${body}`;
  status.textContent = 'Your email app should open with the RSVP ready to send.';
});
