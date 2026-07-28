"use client";

import { Accordion, type AccordionItem } from "./motion/Accordion";
import { PinnedPanel } from "./motion/PinnedPanel";
import { Reveal } from "./motion/Reveal";

const ITEMS: AccordionItem[] = [
  {
    q: "How long does a story take to make?",
    a: "Under a minute. Tell us the hero and the lesson, and five illustrated, narrated chapters appear before eyelids get heavy.",
  },
  {
    q: "Will my child look like themselves in the pictures?",
    a: "Yes. Our character-consistency magic keeps the same face — freckles, curls, brave little chin — across every chapter of every story.",
  },
  {
    q: "Is it safe for young children? (COPPA)",
    a: "We never store real surnames or sensitive details, and you can delete all of your family's data at any time from your account.",
  },
  {
    q: "Can I get a story as a real book?",
    a: "Any favourite tale can become a linen-spined hardcover keepsake, printed on demand and shipped to your door.",
  },
  {
    q: "What does it cost?",
    a: "Your first tale is free. After that, a simple monthly plan covers unlimited stories for the whole family — cancel anytime.",
  },
];

export function Faq() {
  // Pinned like the hero: a full-viewport dark panel that scales down in place
  // into a rounded inset panel (cream on all four sides), then holds while the
  // footer reveals beneath. This keeps the whole rounded card in view — no
  // square-topped clip from a tall section scrolling past.
  return (
    <PinnedPanel id="faq" className="u-faq u-dark-section" pinnedClassName="u-faq-panel" staticOnNarrow>
      <div className="u-dark-inner u-faq-inner">
        <Reveal>
          <h2 className="u-faq-head">Questions, before lights out.</h2>
        </Reveal>
        <Accordion items={ITEMS} />
      </div>
    </PinnedPanel>
  );
}
