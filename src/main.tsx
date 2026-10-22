import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*
 * Easter egg #1 — the boot note.
 *
 * Party games are passed between drunk people at 1am. Almost nobody will ever
 * open devtools on this. That is exactly why it belongs here: it costs one
 * console line and it rewards the one person who does.
 */
console.log(
  `%c H O T   S E A T %c\n\n` +
    `You found the back of the card.\n` +
    `Everything here is text. No images, no fonts, no network calls.\n` +
    `The whole game is 135 questions, 85 dares and one bad attitude.\n\n` +
    `If you are reading this you are that kind of person:\n` +
    `the one who checks the kitchen cabinets at a house party.\n`,
  'background:#E4472B;color:#121110;font:700 13px ui-monospace,monospace;padding:3px 6px',
  'color:#6E6757;font:400 11px ui-monospace,monospace',
)
