# HeroTales Brand Guidelines

> Version 1.0 | Last Updated: January 2026

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Brand Positioning](#brand-positioning)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Visual Elements](#visual-elements)
6. [Logo & Brand Identity](#logo--brand-identity)
7. [Voice & Tone](#voice--tone)
8. [UI/UX Patterns](#uiux-patterns)
9. [Technical Implementation](#technical-implementation)
10. [Usage Examples](#usage-examples)

---

## Brand Overview

**HeroTales** is an AI-powered personalized story creation platform that transforms bedtime stories into magical experiences where children become the heroes of their own adventures.

### The Brand Philosophy

> *"The Digital Pop-Up Book"*

HeroTales combines the warmth and nostalgia of traditional storybooks with modern digital innovation. We create experiences that feel both familiar and magical—like opening a beloved pop-up book, but with the endless possibilities of AI.

### What We Do

- Create personalized stories where the child is the main character
- Teach core values through "Value Blueprints" (Bravery, Honesty, Patience, Kindness, Persistence)
- Generate consistent, beautiful character illustrations
- Provide audio narration capabilities
- Maintain a safe, COPPA-compliant environment

### Who We Serve

| Audience | Description | Needs |
|----------|-------------|-------|
| **Parents** | Primary users with children aged 2-8 | Screen-time alternatives, educational content, bedtime routine support |
| **Educators** | Teachers and homeschooling parents | Custom stories for teaching values |
| **Grandparents** | Gift-givers seeking personalization | Meaningful, personalized gifts |

---

## Brand Positioning

### Brand Attributes

| Attribute | Description |
|-----------|-------------|
| **Magical** | Every interaction feels enchanted and special |
| **Safe** | Trustworthy, COPPA-compliant, parent-controlled |
| **Educational** | Values-driven content that teaches character |
| **Personal** | Each story is unique to the child |
| **Nostalgic** | Warmth of traditional storybooks |
| **Modern** | Clean, contemporary technology experience |

### Brand Personality

```
The Magical Storyteller - Wise, warm, and whimsical

Like a beloved grandparent who tells the best stories, combined with
the creative spark of an imaginative child.
```

### Brand Promise

> *"Every child deserves to be the hero of their own story."*

---

## Color System

Our color palette is designed to evoke warmth, magic, and trust—balancing playful energy with parental confidence.

### Primary Colors

#### Periwinkle Blue `#6A89CC`
**Purpose:** Trust, calm, reliability
**Usage:** Primary buttons, links, key UI elements, brand moments

| Shade | Hex | Usage |
|-------|-----|-------|
| Base | `#6A89CC` | Default state |
| Light | `#8BA3D9` | Hover states, backgrounds |
| Dark | `#4A6DB3` | Active states, text |

```css
/* Tailwind usage */
class="bg-[#6A89CC]"           /* Default */
class="hover:bg-[#8BA3D9]"     /* Light */
class="active:bg-[#4A6DB3]"    /* Dark */
```

#### Soft Sage `#A1BE95`
**Purpose:** Growth, nature, values, nurturing
**Usage:** Secondary actions, success states, nature-themed elements

| Shade | Hex | Usage |
|-------|-----|-------|
| Base | `#A1BE95` | Default state |
| Light | `#B8CFAE` | Hover states, backgrounds |
| Dark | `#7FA070` | Active states, text |

```css
/* Tailwind usage */
class="bg-[#A1BE95]"
class="hover:bg-[#B8CFAE]"
class="active:bg-[#7FA070]"
```

#### Coral `#F98866`
**Purpose:** Magic, energy, special moments, calls-to-action
**Usage:** Primary CTAs, important highlights, magical elements

| Shade | Hex | Usage |
|-------|-----|-------|
| Base | `#F98866` | Default state |
| Light | `#FAAB94` | Hover states, backgrounds |

```css
/* Tailwind usage */
class="bg-[#F98866]"
class="hover:bg-[#FAAB94]"
```

### Neutral Colors

#### Cream Series
**Purpose:** Paper texture, warmth, storybook nostalgia

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#FFF2D7` | Primary background, paper texture |
| Cream Dark | `#F5E4C3` | Secondary backgrounds |
| Cream Light | `#FFFBF5` | Alternative light background |
| Muted Cream | `#F7F3ED` | Subtle backgrounds |

```css
/* Tailwind usage */
class="bg-[#FFF2D7]"  /* Primary cream background */
class="bg-[#F5E4C3]"  /* Secondary cream */
```

#### Background & Foreground

| Mode | Background | Foreground |
|------|------------|------------|
| Light | `#FFFBF5` | `#2D3748` |
| Dark | `#1A1D29` | `#F7FAFC` |

### Semantic Colors

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | Periwinkle | `#6A89CC` | Main brand color |
| Secondary | Sage | `#A1BE95` | Supporting elements |
| Accent | Coral | `#F98866` | CTAs, highlights |
| Muted | Light Cream | `#F7F3ED` | Subtle backgrounds |
| Border | Periwinkle 20% | `rgba(106, 137, 204, 0.2)` | Borders, dividers |

### Color Accessibility

All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio minimum

### Gradient System

#### Periwinkle to Coral Gradient
```css
background: linear-gradient(135deg, #6A89CC 0%, #F98866 100%);
```
**Usage:** Hero text, magical highlights, special CTAs

#### Soft Paper Gradient
```css
background: linear-gradient(180deg, #FFF2D7 0%, #F7F3ED 100%);
```
**Usage:** Story page backgrounds, reader mode

---

## Typography

Our typography system balances readability with whimsy—professional enough for parents, friendly enough for children.

### Font Families

#### Heading Font: Lexend
**Purpose:** Titles, headers, important text
**Characteristics:** Clean, modern, excellent readability

| Weight | Usage | Example |
|--------|-------|---------|
| 300 (Light) | Subtle headings | *Your Child is the Hero* |
| 400 (Regular) | Body headings | Create Your Story |
| 500 (Medium) | Emphasized headings | Start Your Adventure |
| 600 (SemiBold) | Primary headings | Welcome to HeroTales |
| 700 (Bold) | Display headings | The Magic Begins |

```css
/* Tailwind usage */
class="font-lexend font-light"    /* 300 */
class="font-lexend font-normal"   /* 400 */
class="font-lexend font-medium"   /* 500 */
class="font-lexend font-semibold" /* 600 */
class="font-lexend font-bold"     /* 700 */
```

#### Body Font: Quicksand
**Purpose:** Body copy, readable text, paragraphs
**Characteristics:** Friendly, approachable, rounded

| Weight | Usage | Example |
|--------|-------|---------|
| 300 (Light) | Large body text, quotes | *"Every child deserves..."* |
| 400 (Regular) | Default body text | Create personalized bedtime stories |
| 500 (Medium) | Emphasized body text | AI-powered illustrations |
| 600 (SemiBold) | Strong body text | COPPA Compliant |
| 700 (Bold) | Labels, small headings | Get Started |

```css
/* Tailwind usage */
class="font-quicksand font-light"    /* 300 */
class="font-quicksand font-normal"   /* 400 */
class="font-quicksand font-medium"   /* 500 */
class="font-quicksand font-semibold" /* 600 */
class="font-quicksand font-bold"     /* 700 */
```

#### Monospace: Geist Mono
**Purpose:** Code, technical elements (if needed)
**Usage:** Error messages, technical labels

### Type Scale

| Size | Tailwind Class | Usage |
|------|----------------|-------|
| 72px | `text-7xl` | Hero titles |
| 60px | `text-6xl` | Section titles |
| 48px | `text-5xl` | Page titles |
| 36px | `text-4xl` | Large headings |
| 30px | `text-3xl` | Headings |
| 24px | `text-2xl` | Subheadings |
| 20px | `text-xl` | Large body |
| 16px | `text-base` | Default body |
| 14px | `text-sm` | Small body |
| 12px | `text-xs` | Labels, captions |

### Line Height

| Context | Ratio | Value |
|---------|-------|-------|
| Headings | 1.2 | tight, impactful |
| Body | 1.6 | readable, comfortable |
| Large Display | 1.1 | dramatic |

### Letter Spacing

| Context | Value | Usage |
|---------|-------|-------|
| Uppercase Headers | 0.05em | HERO TITLES |
| Navigation | 0.025em | Nav Items |
| Body Text | 0 (default) | Paragraphs |

---

## Visual Elements

### Icons

#### Primary Brand Icon: Sparkles
**Icon:** Lucide React `Sparkles`
**Color:** Periwinkle gradient or solid Periwinkle
**Usage:** Logo, magical indicators, premium features

```jsx
import { Sparkles } from 'lucide-react';

<Sparkles className="text-[#6A89CC]" />
```

#### Feature Icons

| Icon | Purpose | Color |
|------|---------|-------|
| `Palette` | Personalized Characters | Periwinkle |
| `BookOpen` | Value Blueprints | Sage |
| `Heart` | Reader Mode Magic | Coral |
| `Shield` | Safety & COPPA Compliance | Sage |
| `Sparkles` | Magic/AI Features | Periwinkle |
| `Wand2` | Story Creation | Coral |

### Illustration Style

#### Character Guidelines
- **Style:** Consistent AI-generated characters
- **Proportions:** Friendly, slightly exaggerated features
- **Expression:** Warm, approachable, expressive
- **Detail Level:** Simplified but detailed enough for recognition
- **Background:** Minimal, allowing characters to stand out

#### Scene Composition
- **Layout:** Storybook-style, full-bleed or bordered
- **Depth:** Layered elements with soft shadows
- **Lighting:** Warm, magical glow effect
- **Colors:** Harmony with brand palette, Periwinkle dominant

### Photography Style

**Note:** HeroTales primarily uses illustrations rather than photography. When photos are necessary:

- **Style:** Warm, soft lighting
- **Subjects:** Children reading, families together
- **Tone:** Candid, joyful moments
- **Editing:** Soft contrast, warm temperature, cream tint

### Graphic Elements

#### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(106, 137, 204, 0.2);
  border-radius: 1.5rem;
}
```
**Usage:** Feature cards, overlays, floating elements

#### Rounded Corners (Radius System)
All UI elements use a bubbly, friendly radius system based on `--radius: 1rem`:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 1rem (16px) | Base radius |
| `radius-sm` | 12px | Small elements |
| `radius-md` | 14px | Medium elements |
| `radius-lg` | 16px | Default cards, buttons |
| `radius-xl` | 24px | Large cards |
| `radius-2xl` | 32px | Extra large elements |
| `radius-3xl` | 40px | Hero elements |
| `radius-4xl` | 48px | Special elements |

#### Shadows
```css
/* Soft shadow for cards */
box-shadow: 0 4px 24px rgba(106, 137, 204, 0.12);

/* Elevated shadow for hover */
box-shadow: 0 8px 32px rgba(106, 137, 204, 0.18);

/* Magical glow */
box-shadow: 0 0 20px rgba(249, 136, 102, 0.3);
```

---

## Logo & Brand Identity

### Logo Usage

#### Primary Logo
**Composition:** Sparkles icon + "HeroTales" wordmark
**Font:** Lexend Bold
**Color:** Periwinkle gradient or solid Periwinkle
**Minimum Size:** 120px width (digital)
**Clear Space:** 1x height of logo

#### Logo Variations

| Variation | Usage |
|-----------|-------|
| Full color (horizontal) | Default, headers |
| Full color (stacked) | Compact spaces |
| Icon only | Mobile, favicon, app icons |
| White/monochrome | Dark backgrounds |

#### Logo Don'ts

- ❌ Don't stretch or distort the logo
- ❌ Don't change the logo colors
- ❌ Don't add effects or filters
- ❌ Don't place on busy backgrounds without container
- ❌ Don't recreate or modify the logo
- ❌ Don't use the icon as a bullet point

### Favicon & App Icons

| Size | Platform |
|------|----------|
| 16x16, 32x32 | Favicon |
| 180x180 | Apple Touch Icon |
| 192x192, 512x512 | PWA Manifest |
| 1024x1024 | App Store |

### Brand Mark

**Element:** Sparkles icon
**Standalone Usage:** Social media avatars, app icons, notifications
**Minimum Size:** 24x24px

---

## Voice & Tone

### Brand Voice

**The Magical Storyteller**

Our voice is the thread that weaves through every word we write. It's the voice of a beloved storyteller—warm, wise, and full of wonder.

### Voice Characteristics

| Characteristic | Description | Example |
|----------------|-------------|---------|
| **Warm** | Friendly, inviting, like a hug | *"Welcome to the magic"* |
| **Whimsical** | Playful, imaginative, enchanting | *"Where stories come alive"* |
| **Wise** | Knowledgeable, trustworthy, guiding | *"Teaching values that last"* |
| **Wonder** | Awe-inspiring, magical, special | *"Your child is the hero"* |

### Tone Guidelines

#### When We're... ✨
| Situation | Tone | Example |
|-----------|-------|---------|
| Welcoming users | Warm & Inviting | *"Step into a world where your child becomes the hero..."* |
| Explaining features | Clear & Magical | *"Watch as AI brings your story to life with beautiful illustrations"* |
| Addressing parents | Trustworthy & Reassuring | *"Safe, COPPA-compliant, and designed with care"* |
| Celebrating success | Joyful & Proud | *"Your first magical tale is ready!"* |
| Handling errors | Gentle & Helpful | *"Oh, pixie dust! Let's try that again..."* |

### Writing Principles

1. **Lead with Magic**: Start with wonder, follow with function
2. **Child-Centric Language**: "Your child" not "the user"
3. **Active Voice**: "Create your story" not "Stories can be created"
4. **Emotional Connection**: Connect to feelings, not just features
5. **Simple Words**: Accessible to busy parents, enchanting to children

### Key Brand Words

| Category | Words |
|----------|-------|
| **Magic** | magic, spark, tale, adventure, wonder, enchant |
| **Hero** | hero, brave, courageous, champion, protagonist |
| **Story** | story, tale, narrative, chapter, adventure |
| **Values** | bravery, honesty, patience, kindness, persistence |
| **Growth** | grow, learn, discover, explore, imagine |
| **Safety** | safe, protected, secure, COPPA, compliant |

### Copy Examples

#### Headlines
```
✓ Your Child is the Hero
✓ Where Imagination Meets Values
✕ Kids Can Make Stories
✕ HeroTales Application
```

#### Calls-to-Action
```
✓ Start Your Adventure
✓ Create a Magical Tale
✓ Begin the Journey
✕ Submit Form
✕ Click Here
```

#### Error Messages
```
✓ Oh, pixie dust! The story scroll is stuck. Let's try again.
✕ Error 500: Server error
```

---

## UI/UX Patterns

### Component Library

#### Buttons

##### Primary Button (Coral Gradient)
```tsx
<button className="
  bg-gradient-to-r from-[#F98866] to-[#FAAB94]
  text-white font-semibold
  px-6 py-3 rounded-2xl
  hover:shadow-lg hover:scale-105
  active:scale-95
  transition-all duration-200
">
  Get Started
</button>
```

##### Secondary Button (Periwinkle)
```tsx
<button className="
  bg-[#6A89CC] text-white font-medium
  px-6 py-3 rounded-2xl
  hover:bg-[#8BA3D9]
  transition-colors duration-200
">
  Learn More
</button>
```

##### Ghost Button
```tsx
<button className="
  border-2 border-[#6A89CC] text-[#6A89CC]
  px-6 py-3 rounded-2xl
  hover:bg-[#6A89CC] hover:text-white
  transition-all duration-200
">
  Explore Features
</button>
```

#### Cards

##### Glass Card (Feature Card)
```tsx
<div className="
  glass-card
  bg-white/70 backdrop-blur-md
  border border-[#6A89CC]/20
  rounded-3xl p-6
  hover:shadow-xl hover:-translate-y-1
  transition-all duration-300
">
  <div className="text-[#6A89CC] mb-4">
    <Sparkles className="w-8 h-8" />
  </div>
  <h3 className="font-lexend font-semibold text-xl mb-2">
    Card Title
  </h3>
  <p className="font-quicksand text-gray-600">
    Card description goes here with friendly, warm copy.
  </p>
</div>
```

##### Story Card
```tsx
<div className="
  bg-[#FFF2D7] rounded-3xl overflow-hidden
  shadow-lg hover:shadow-xl
  transition-shadow duration-300
">
  <div className="aspect-[4/3] bg-[#F7F3ED]">
    {/* Story illustration */}
  </div>
  <div className="p-4">
    <h3 className="font-lexend font-semibold text-lg">
      Story Title
    </h3>
    <p className="font-quicksand text-sm text-gray-600 mt-1">
      A tale about bravery and friendship
    </p>
  </div>
</div>
```

#### Input Fields

```tsx
<input
  className="
    w-full px-4 py-3
    bg-white/50 backdrop-blur-sm
    border-2 border-[#6A89CC]/20
    rounded-2xl
    font-quicksand
    focus:outline-none focus:border-[#6A89CC]
    placeholder:text-gray-400
    transition-colors duration-200
  "
  placeholder="Enter your child's name..."
/>
```

#### Navigation

##### Desktop Nav
```tsx
<nav className="
  fixed top-0 w-full
  bg-white/80 backdrop-blur-lg
  border-b border-[#6A89CC]/10
  z-50
">
  <div className="max-w-6xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Sparkles className="text-[#6A89CC]" />
        <span className="font-lexend font-bold text-xl">
          HeroTales
        </span>
      </div>
      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <a className="font-quicksand font-medium hover:text-[#6A89CC]">
          Features
        </a>
        <a className="font-quicksand font-medium hover:text-[#6A89CC]">
          Stories
        </a>
        <button className="bg-[#6A89CC] text-white px-4 py-2 rounded-xl">
          Get Started
        </button>
      </div>
    </div>
  </div>
</nav>
```

### Layout Patterns

#### Hero Section
```
┌─────────────────────────────────────┐
│  [Logo]                    [CTA]    │
├─────────────────────────────────────┤
│                                     │
│  Your Child is the Hero             │
│  Where imagination meets values     │
│  [Get Started] [Learn More]         │
│                                     │
│  [Hero Illustration/Animation]      │
│                                     │
└─────────────────────────────────────┘
```

#### Feature Grid
```
┌──────────────┬──────────────┬──────────────┐
│   Feature 1  │   Feature 2  │   Feature 3  │
│   [Icon]     │   [Icon]     │   [Icon]     │
│   Title      │   Title      │   Title      │
│   Description│   Description│   Description│
├──────────────┼──────────────┼──────────────┤
│   Feature 4  │   Feature 5  │   Feature 6  │
│   [Icon]     │   [Icon]     │   [Icon]     │
│   Title      │   Title      │   Title      │
│   Description│   Description│   Description│
└──────────────┴──────────────┴──────────────┘
```

### Animation System

#### Micro-Interactions
```css
/* Button Hover */
.btn-magic:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(106, 137, 204, 0.25);
}

/* Card Hover */
.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(106, 137, 204, 0.18);
}

/* Sparkle Animation */
@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.sparkle {
  animation: sparkle 2s ease-in-out infinite;
}
```

#### Page Transitions
```css
/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}
```

### Accessibility

#### Touch Targets
- **Minimum size:** 44x44px (iOS), 48x48px (Android)
- **Recommended:** 60x60px for kid-friendly interactions

#### Focus States
```css
/* Visible focus indicator */
*:focus-visible {
  outline: 3px solid #6A89CC;
  outline-offset: 2px;
}
```

#### Screen Reader Support
```tsx
<button aria-label="Create a new magical story">
  <Sparkles aria-hidden="true" />
  Create Story
</button>
```

---

## Technical Implementation

### Tailwind Configuration

#### Custom Colors (tailwind.config.ts)
```ts
export default {
  theme: {
    extend: {
      colors: {
        // Brand colors
        periwinkle: {
          DEFAULT: '#6A89CC',
          light: '#8BA3D9',
          dark: '#4A6DB3',
        },
        sage: {
          DEFAULT: '#A1BE95',
          light: '#B8CFAE',
          dark: '#7FA070',
        },
        coral: {
          DEFAULT: '#F98866',
          light: '#FAAB94',
        },
        cream: {
          DEFAULT: '#FFF2D7',
          dark: '#F5E4C3',
          light: '#FFFBF5',
          muted: '#F7F3ED',
        },
        // Semantic colors
        primary: '#6A89CC',
        secondary: '#A1BE95',
        accent: '#F98866',
        muted: '#F7F3ED',
        border: 'rgba(106, 137, 204, 0.2)',
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      borderRadius: {
        'base': '1rem',
        '3xl': 'calc(1rem + 24px)',
        '4xl': 'calc(1rem + 32px)',
      },
    },
  },
}
```

#### CSS Custom Properties (globals.css)
```css
:root {
  --radius: 1rem;
  --color-periwinkle: #6A89CC;
  --color-sage: #A1BE95;
  --color-coral: #F98866;
  --color-cream: #FFF2D7;
}

.dark {
  --color-periwinkle: #8BA3D9;
  --color-cream: #1A1D29;
}
```

### Component Utilities

#### Custom Classes
```css
/* Glassmorphism card */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(106, 137, 204, 0.2);
}

/* Magic button */
.btn-magic {
  background: linear-gradient(135deg, #F98866 0%, #FAAB94 100%);
  transition: all 0.3s ease;
}

.btn-magic:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(249, 136, 102, 0.3);
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, #6A89CC 0%, #F98866 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Paper texture background */
.paper-bg {
  background: linear-gradient(180deg, #FFF2D7 0%, #F7F3ED 100%);
}
```

### Dark Mode

#### Theme Colors
```css
.dark {
  /* Background becomes "cozy night" */
  --bg-primary: #1A1D29;
  --bg-secondary: #252A3B;

  /* Text becomes warm */
  --text-primary: #F7FAFC;
  --text-secondary: #CBD5E0;

  /* Periwinkle brightens */
  --periwinkle: #8BA3D9;
}
```

#### Dark Mode Usage
```tsx
<div className="
  bg-[#FFFBF5] dark:bg-[#1A1D29]
  text-[#2D3748] dark:text-[#F7FAFC]
">
  <!-- Content -->
</div>
```

### Responsive Design

#### Breakpoints
```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

#### Container Patterns
```tsx
<div className="
  max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
">
  <!-- Content -->
</div>
```

---

## Usage Examples

### Landing Page Hero
```tsx
<section className="
  min-h-screen
  bg-gradient-to-b from-[#FFFBF5] to-[#FFF2D7]
  flex items-center justify-center
  relative overflow-hidden
">
  {/* Animated background */}
  <div className="absolute inset-0 opacity-20">
    {/* Sparkle animations */}
  </div>

  <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
    <h1 className="
      font-lexend font-bold text-6xl md:text-7xl
      text-gradient mb-6
    ">
      Your Child is the Hero
    </h1>
    <p className="
      font-quicksand text-xl md:text-2xl
      text-gray-600 mb-8 max-w-2xl mx-auto
    ">
      Where imagination meets values. Create personalized
      bedtime stories that teach bravery, kindness, and more.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="btn-magic text-white font-semibold px-8 py-4 rounded-2xl">
        Start Your Adventure
      </button>
      <button className="
        border-2 border-[#6A89CC] text-[#6A89CC]
        font-semibold px-8 py-4 rounded-2xl
        hover:bg-[#6A89CC] hover:text-white
        transition-all
      ">
        See How It Works
      </button>
    </div>
  </div>
</section>
```

### Feature Card
```tsx
<div className="glass-card rounded-3xl p-8">
  <div className="
    w-16 h-16 rounded-2xl
    bg-gradient-to-br from-[#6A89CC] to-[#8BA3D9]
    flex items-center justify-center mb-6
  ">
    <Sparkles className="text-white w-8 h-8" />
  </div>
  <h3 className="
    font-lexend font-semibold text-2xl
    text-[#2D3748] mb-3
  ">
    Magical Illustrations
  </h3>
  <p className="
    font-quicksand text-gray-600 leading-relaxed
  ">
    AI generates beautiful, consistent character
    illustrations that bring your child's story
    to life with every page turn.
  </p>
</div>
```

### Story Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {stories.map(story => (
    <div key={story.id} className="
      bg-[#FFF2D7] rounded-3xl overflow-hidden
      shadow-lg hover:shadow-xl
      transition-all duration-300
      hover:-translate-y-1
      cursor-pointer
    ">
      <div className="aspect-[4/3] bg-gradient-to-br from-[#F7F3ED] to-[#FFF2D7]">
        {/* Story preview image */}
      </div>
      <div className="p-5">
        <span className="
          inline-block px-3 py-1 rounded-full
          bg-[#A1BE95] text-white text-xs
          font-quicksand font-medium mb-3
        ">
          {story.value}
        </span>
        <h3 className="font-lexend font-semibold text-lg mb-2">
          {story.title}
        </h3>
        <p className="font-quicksand text-sm text-gray-600">
          {story.description}
        </p>
      </div>
    </div>
  ))}
</div>
```

---

## Brand Assets

### File Naming Convention

```
herotales-[element]-[variant]-[size].[ext]

Examples:
herotales-logo-horizontal.svg
herotales-logo-stacked.png
herotales-icon-512.png
herotales-pattern-sparkle.svg
```

### Asset Formats

| Asset Type | Primary Format | Fallback |
|------------|----------------|----------|
| Logo | SVG | PNG @2x |
| Icons | SVG | PNG |
| Photos | WebP | JPG |
| Illustrations | PNG | JPG |

---

## Resources

### Design Tools
- **Figma:** Component library and design system
- **Tailwind CSS:** Utility-first styling
- **Lucide Icons:** Icon set

### Font Resources
- **Lexend:** https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700
- **Quicksand:** https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700

### Color Tools
- **Coolors:** https://coolors.co (palette generation)
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

## Brand Guidelines Maintenance

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial brand guidelines |

### Feedback & Updates

For brand questions, asset requests, or guideline updates:
- **Design Team:** [design@herotales.com]
- **Brand Contact:** [brand@herotales.com]

---

**© 2026 HeroTales. All rights reserved.**

These guidelines are confidential and intended for internal use, approved partners, and contractors working on HeroTales projects.
