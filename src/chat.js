// Chat con mensajes en memoria, para probar la interfaz antes de conectar la IA.
import { createMessage, formatTime } from './utils.js';

const GREETING = 'Buenas tardes. Soy Sherlock Holmes. Exponga su caso, y sea breve: el tiempo es un lujo.';
const REPLY_DELAY_MS = 600;
const MOCK_REPLIES = [
  'Elemental. Tres detalles bastan, y usted pasó por alto los tres.',
  'Observe las manos, no las palabras: ahí está la verdad.',
  'El caso es simple. La gente complica lo que no quiere ver.',
  'Interesante. Continúe, pero omita lo irrelevante.',
  'Ya lo tengo. El resto es mera confirmación.',
];

let messages = [];
let loading = false;
let replyIndex = 0;

function nextReply() {
  const text = MOCK_REPLIES[replyIndex % MOCK_REPLIES.length];
  replyIndex += 1;
  return text;
}

function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export function getMessages() { return messages; }

export function clearHistory() {
  messages = [createMessage('assistant', GREETING)];
}

function messageEl(m) {
  const li = document.createElement('li');
  li.className = `msg msg--${m.role}${m.isError ? ' msg--error' : ''}`;
  const p = document.createElement('p');
  p.textContent = m.text;
  const meta = document.createElement('div');
  meta.className = 'msg__meta';
  const time = document.createElement('time');
  time.textContent = formatTime(m.timestamp);
  meta.append(time);
  if (m.role === 'assistant' && !m.isError) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copiar';
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(m.text); btn.textContent = '¡Copiado!'; } catch { btn.textContent = 'Error'; }
      setTimeout(() => { btn.textContent = 'Copiar'; }, 1500);
    });
    meta.append(btn);
  }
  li.append(p, meta);
  return li;
}

function typingEl() {
  const li = document.createElement('li');
  li.className = 'msg msg--assistant msg--typing';
  li.setAttribute('aria-label', 'Sherlock está escribiendo');
  li.innerHTML = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span> <small>escribiendo…</small>';
  return li;
}

function render(list) {
  list.replaceChildren(...messages.map(messageEl));
  if (loading) list.append(typingEl());
  list.scrollTop = list.scrollHeight;
}

let view = null;

function refresh() {
  if (!view) return;
  render(view.list);
  view.badge.hidden = true;
  view.sendBtn.disabled = view.input.disabled = loading;
}

async function send(text) {
  messages.push(createMessage('user', text));
  loading = true;
  refresh();
  await delay(REPLY_DELAY_MS);
  messages.push(createMessage('assistant', nextReply()));
  loading = false;
  refresh();
  if (view && document.body.contains(view.input)) view.input.focus();
}

export function mountChat(root) {
  view = {
    list: root.querySelector('#messages'),
    input: root.querySelector('#chat-input'),
    sendBtn: root.querySelector('#send-btn'),
    badge: root.querySelector('#saved-badge'),
  };
  const form = root.querySelector('#chat-form');
  const clearBtn = root.querySelector('#clear-btn');

  if (!messages.length) clearHistory();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = view.input.value.trim();
    if (!text || loading) return;
    view.input.value = '';
    send(text);
  });

  clearBtn.addEventListener('click', () => {
    if (loading) return;
    clearHistory();
    refresh();
  });

  refresh();
}
