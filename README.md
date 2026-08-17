# Inuit Style Concierge

Build a complete, polished, production-ready web application for a fictional luxury footwear brand called INUIT.

The final application should be deployable directly to Vercel with no backend required for the demo.

This is an evaluation assignment. The evaluator will judge:

Personality and tone

Creative use of Quick Replies, Carousels, Emojis, Buttons, Videos and Cards

How easily users can navigate the conversation

User onboarding and service conclusion

Handling of messages the bot doesn't understand

Overall UI/UX quality

How clearly the conversation flow can be reviewed

The goal is NOT to build a generic chatbot.

Build a premium luxury footwear personal concierge that feels like a real ecommerce experience.

BRAND

Brand name:

INUIT

Tagline:

Crafted for the way you move.

Chatbot name:

Inuit Concierge

Brand personality:

Sophisticated

Warm

Personal

Confident

Minimal

Fashion-forward

Helpful

Human

The bot should feel like a luxury personal stylist.

Never sound robotic.

Avoid phrases such as:

"Please select an option."

"Invalid input."

"Your request has been processed."

Instead use natural language such as:

"Looking for something timeless, or something with a little more edge?"

"Beautiful choice."

"Let me find a few pairs that fit your style."

TECHNOLOGY

Use:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui where useful

Lucide icons

Framer Motion if available

Use local mock data.

No authentication.

No database.

No backend required.

Persist the current conversation in localStorage so refreshing the page does not immediately destroy the demo.

The application must be fully responsive.

It must work beautifully on:

Desktop

Tablet

Mobile

Make the application Vercel-ready.

Use environment variables only if absolutely necessary.

The application should run with:

npm run dev

and build with:

npm run build

Do not introduce unnecessary dependencies.

VISUAL DIRECTION

The visual identity should feel like:

Aesop × high-end fashion ecommerce × modern AI concierge

Do NOT make it look like:

WhatsApp

Intercom

Discord

Generic ChatGPT clone

SaaS dashboard

Use:

Background:

Warm ivory / cream

Primary text:

Deep charcoal

Secondary:

Warm taupe / brown

Accent:

Muted champagne / soft gold

Typography:

Use an elegant serif for major brand headings.

Recommended:

Cormorant Garamond or Playfair Display

Use a clean sans-serif for UI:

Inter / Manrope

Design principles:

Lots of whitespace

Thin borders

Subtle shadows

Editorial typography

Large footwear imagery

Premium cards

Smooth micro-interactions

Restrained animations

Avoid excessive rounded cards.

Avoid excessive gradients.

Avoid neon colors.

APPLICATION STRUCTURE

Create a premium landing page with the chatbot as the primary experience.

Desktop layout:

LEFT SIDE:

Large editorial brand area.

Display:

INUIT

"Crafted for the way you move."

Short description:

"Hand-finished footwear designed around timeless silhouettes, considered materials and everyday luxury."

Show a beautiful footwear image.

RIGHT SIDE:

The Inuit Concierge chat interface.

Mobile:

The chat should become the primary full-screen experience.

LANDING SCREEN

At the top:

INUIT

Small label:

PRIVATE CONCIERGE

Then:

"Find the pair that feels like you."

Supporting text:

"Tell us a little about your style. We'll curate the rest."

Primary CTA:

Meet your concierge →

Secondary CTA:

Explore collection

When the user clicks the primary CTA, open the chatbot.

CHAT HEADER

Chat header should contain:

INUIT CONCIERGE

Small status:

● Available to help

On the right:

Menu icon

Restart icon

Menu should open a compact navigation panel.

Menu items:

🏠 Start over

✨ Find my pair

👞 Browse collection

🎥 How they're made

🛍 My selection

❓ Help

CHAT WELCOME

First bot message:

"Welcome to Inuit. 👋

I'm your personal footwear concierge.

From hand-finished loafers to refined sneakers and statement boots, every Inuit pair is designed around timeless style, comfort and craftsmanship.

Shall we find yours?"

Show Quick Reply buttons:

Find my pair ✨

Explore collection

How Inuit shoes are made

I already know what I want

Buttons should trigger the relevant conversation state.

CONVERSATION STATE MACHINE

Implement a clear state machine.

States:

WELCOME

CATEGORY

STYLE

COLOR

SIZE

RECOMMENDATION

PRODUCT_DETAIL

CRAFTSMANSHIP

DELIVERY

ORDER_SUMMARY

CONFIRMATION

UNKNOWN

The user should never get stuck.

Every state must have a valid next action.

SHOPPING FLOW

When user selects:

Find my pair ✨

Bot:

"Perfect. Let's make this easy."

Then:

"What are you shopping for?"

Quick replies:

👞 Loafers

👟 Sneakers

🥾 Boots

👔 Dress shoes

Then:

"What kind of look are you after?"

Quick replies:

✨ Classic

◼ Minimal

🔥 Statement

🌿 Relaxed

Then:

"Which shade feels most like you?"

Quick replies:

🖤 Black

🤎 Tan

🤍 White

🌰 Dark Brown

Then:

"Last one — what's your usual size?"

Buttons:

UK 6

UK 7

UK 8

UK 9

UK 10

UK 11

Below the buttons:

"Not sure about your size?"

Button:

Size guide

Clicking size guide opens a beautiful modal with simple instructions for measuring foot length.

PROGRESS INDICATOR

During the four preference questions display:

STYLE PROFILE

● Category
○ Style
○ Colour
○ Size

Update the active step as the user progresses.

Keep this subtle.

Do not make it feel like a boring form.

TYPING INDICATOR

Before important bot responses show:

● ● ●

for around 600ms.

Then reveal the message with a subtle fade/slide animation.

PERSONALIZED RECOMMENDATION

After the user answers the four questions:

Show typing state:

"Let me curate something for you… ✨"

Then:

"Based on your choices, I have a few pairs in mind."

Create a horizontal product carousel.

Create at least 6 realistic fictional Inuit products.

Example:

Milano Loafer
₹18,900

"Hand-finished full-grain leather"

Atelier Sneaker
₹15,500

"Minimal leather and suede construction"

Heritage Boot
₹22,900

"Full-grain leather with a structured silhouette"

Verona Oxford
₹19,800

"Refined cap-toe formal silhouette"

Monaco Slip-On
₹16,900

"Soft leather with an understated profile"

Aspen Chelsea
₹21,500

"Classic Chelsea construction with a modern edge"

Each product card must include:

Large product image

Product name

Price

Material

Color

Small luxury badge

View details

Choose this pair

Use high-quality appropriate footwear imagery.

Use remote image URLs only from reliable public sources or create elegant visual placeholders if necessary.

Do not use recognizable competing footwear brands.

RECOMMENDATION LOGIC

Implement simple deterministic recommendation scoring.

Category:

+5

Style:

+3

Color:

+2

Sort products by score.

The recommendation message should dynamically reference the user's choices.

For example:

"Classic black loafers are a strong choice. I'd start with the Milano."

Do not show generic recommendations regardless of the user's answers.

PRODUCT DETAIL

When user clicks:

View details

Open a premium product detail drawer/modal.

Show:

Product image

Product name

Price

Material

Description

Available colors

Available sizes

Delivery estimate

CTA:

Choose this pair

Secondary:

Back to recommendations

CHOOSE PRODUCT

After selection:

Bot:

"Excellent choice.

The Milano is one of our most versatile silhouettes — equally at home at dinner or in the boardroom."

Show:

Add to my selection

See another pair

If user selects another pair, return to carousel.

If they add to selection:

Bot:

"Perfect. I've added it to your selection."

Then:

"Before we arrange delivery, want to see how your pair is made?"

Buttons:

Show me the craftsmanship 🎥

Skip to delivery

CRAFTSMANSHIP EXPERIENCE

The assignment requires exactly THREE videos.

Create a premium "Inside the Atelier" section.

Intro:

"Every Inuit pair has a story behind it.

Here's a quick look inside the atelier."

Show exactly three video cards.

VIDEO 01

Title:

"Selecting the Leather"

Description:

"Every pair begins with carefully selected hides chosen for grain, durability and feel."

VIDEO 02

Title:

"Hand Assembly"

Description:

"Skilled artisans shape, stitch and construct each pair with precision."

VIDEO 03

Title:

"The Final Finish"

Description:

"Every pair is inspected, polished and finished before it leaves the atelier."

Each card must have:

Video thumbnail

Play button

Duration

Number

Title

Description

Use reliable publicly accessible sample video URLs or elegant local placeholder videos.

Videos should open in an inline player/modal.

After the user interacts with the three videos, show:

"Beautiful, isn't it?

Ready to bring your pair home?"

Buttons:

Yes, deliver it to me 🏠

Keep browsing

Track whether the user has opened each of the three videos.

Display:

3 / 3 explored

when all three have been viewed/opened.

DIRECT CRAFTSMANSHIP FLOW

If the user selects:

How Inuit shoes are made

from the initial welcome screen:

Do NOT force them through the shopping questionnaire.

Immediately open the three-video craftsmanship experience.

After videos:

"Now that you've seen how they're made, want to find your pair?"

Buttons:

Find my pair ✨

Order now

EXPLORE COLLECTION FLOW

If user selects:

Explore collection

Show three editorial collection cards.

CLASSICS

"Loafers, Oxfords and refined dress shoes."

EVERYDAY

"Sneakers and effortless slip-ons."

STATEMENT

"Boots and limited-edition silhouettes."

Each card:

Explore →

Clicking opens a relevant product carousel.

I ALREADY KNOW WHAT I WANT

If user selects:

I already know what I want

Say:

"Perfect. No need to make you answer twenty questions."

Then:

"What are you looking for?"

Buttons:

👞 Loafers

👟 Sneakers

🥾 Boots

👔 Dress shoes

Show relevant product carousel immediately.

DELIVERY FLOW

After selecting:

Yes, deliver it to me 🏠

Bot:

"Let's get your pair home."

Show a clean form.

Fields:

Full name

Phone number

Address

City

State

PIN code

Keep the form visually integrated into the conversation.

Do NOT make it look like a generic checkout page.

Validate required fields.

If something is missing:

"Just one more detail — what's your PIN code?"

Do not reset previous information.

ORDER SUMMARY

After completing delivery information:

Bot:

"Almost there. Here's everything I've got."

Show premium order summary.

Product:

Milano Loafer

Size:

UK 9

Color:

Black

Price:

₹18,900

Delivery:

Home delivery

Address:

[User's address]

CTA:

Confirm my order

Secondary:

Edit details

CONFIRMATION

After clicking Confirm:

Show an elegant confirmation animation.

Bot:

"Your Inuit pair is on its way. ✨"

Then:

"Order #IN48291"

"Thank you, [Name]."

"Your pair will be delivered to [City]."

"You're now part of the Inuit journey."

Show:

Continue shopping

Start over

Make this the emotional conclusion of the experience.

UNKNOWN MESSAGE HANDLING

This is a required assignment criterion.

Allow users to type messages at any time.

Implement lightweight intent detection.

Examples:

If message contains:

"red", "colour", "color"

→ color state

"loafers", "loafer"

→ loafers

"sneakers", "shoes"

→ product/category

"boots"

→ boots

"order", "buy", "purchase"

→ ordering

"delivery", "shipping"

→ delivery

"made", "craft", "factory", "artisan"

→ craftsmanship

"help"

→ help menu

For genuinely unknown messages:

Bot:

"I'm sorry — I may have missed that. 😅

I can help you find a pair, explore our collections, show you how our shoes are made, or help with an order."

Quick replies:

Find my pair ✨

Explore shoes

How they're made

My selection

Start over

Never show a technical error.

BACK NAVIGATION

Every major conversation state should have:

← Back

The user can return to the previous step.

Important:

Do not erase the user's entire conversation.

Preserve previous chat messages.

If the user changes a previous preference, update their preference state and regenerate recommendations.

RESTART

Restart should show a confirmation:

"Start a fresh conversation?"

Buttons:

Start over

Keep my choices

If confirmed, clear conversation state.

CHAT HISTORY

Keep all messages in the conversation.

User messages:

right aligned

Bot messages:

left aligned

Use subtle timestamps only if they improve the design.

Do not show timestamps on every message.

FLOW MAP — IMPORTANT FOR REVIEWERS

Create a small button outside the chatbot:

View conversation flow

Clicking it opens an elegant flow-map modal/drawer.

Display:

WELCOME
↓
DISCOVER YOUR STYLE
↓
CATEGORY
↓
STYLE
↓
COLOUR
↓
SIZE
↓
PERSONALIZED RECOMMENDATION
↓
PRODUCT
↓
CRAFTSMANSHIP — 3 VIDEOS
↓
HOME DELIVERY
↓
ORDER SUMMARY
↓
CONFIRMATION

Also show alternate paths:

Explore Collection
→ Product Carousel

How They're Made
→ 3 Videos
→ Find My Pair

I Already Know
→ Category
→ Product Carousel
→ Delivery

Unknown Message
→ Recovery Menu

Make this extremely easy for an evaluator to understand.

Use connecting lines/arrows and clean typography.

REVIEW MODE

Add a small "Demo controls" area in the Flow Map.

Options:

▶ Run happy path

↻ Reset demo

Show current state:

Current state: RECOMMENDATION

This is primarily for assignment evaluation.

Do not make it look like developer tooling in the main experience.

MICRO-INTERACTIONS

Use subtle animations:

Chat messages fade upward

Quick replies gently appear

Product cards slide in

Buttons have subtle hover states

Modal opens smoothly

Video player transitions smoothly

Confirmation has a tasteful celebration animation

Do NOT overdo animations.

Luxury brands should feel calm.

RESPONSIVENESS

Desktop:

Use two-column editorial layout.

Mobile:

Chat takes almost the entire viewport.

Chat header remains fixed.

Input remains accessible.

Product carousels scroll horizontally.

Buttons should be large enough for touch.

Flow Map should work on mobile with vertical scrolling.

ACCESSIBILITY

Implement:

Semantic buttons

Keyboard navigation

Focus states

ARIA labels where necessary

Alt text

Proper modal behavior

Accessible form labels

Sufficient contrast

DATA STRUCTURE

Create typed objects for:

Product

Video

UserPreferences

Order

ChatMessage

ConversationState

Use clean separation between UI and data.

Do not hardcode everything inside App.tsx.

Suggested structure:

src/
components/
chatbot/
products/
videos/
order/
navigation/
data/
types/
utils/

LOCAL STORAGE

Persist:

conversation messages

selected product

user preferences

order draft

Use localStorage.

On refresh, restore the current demo.

Provide Restart to clear it.

FINAL QA

Before considering the project complete, test these exact paths:

PATH 1 — HAPPY PATH

Welcome
→ Find my pair
→ Loafers
→ Classic
→ Black
→ UK 9
→ Recommendation
→ Milano
→ Craftsmanship
→ Video 1
→ Video 2
→ Video 3
→ Delivery
→ Form
→ Order summary
→ Confirmation

PATH 2 — EXPLORE

Welcome
→ Explore collection
→ Classics
→ Product carousel
→ Product details

PATH 3 — CRAFTSMANSHIP

Welcome
→ How shoes are made
→ Video 1
→ Video 2
→ Video 3
→ Find my pair

PATH 4 — DIRECT ORDER

Welcome
→ I already know what I want
→ Category
→ Product
→ Delivery
→ Confirmation

PATH 5 — UNKNOWN INPUT

Welcome
→ Type random unsupported message
→ Friendly fallback
→ Quick reply recovery

PATH 6 — NAVIGATION

Go through preferences
→ Back
→ Change answer
→ Continue
→ Recommendations update

PATH 7 — RESTART

Start conversation
→ Restart
→ Confirm
→ Fresh conversation

IMPORTANT DESIGN RULE

Do not make the experience unnecessarily long.

The primary journey should be completable in approximately:

30–60 seconds.

Every message should earn its place.

The chatbot should feel like:

"Someone who works at a luxury footwear boutique is personally helping me."

NOT:

"I'm filling out a chatbot questionnaire."

FINAL OUTPUT

When complete:

Ensure the project builds successfully.

Ensure there are no console errors.

Ensure all buttons work.

Ensure all routes/states work.

Ensure the UI is responsive.

Ensure the three videos work or gracefully fall back.

Ensure product images load or have elegant fallbacks.

Ensure localStorage works.

Ensure the Flow Map works.

Ensure the application is ready to deploy to Vercel.

Create a polished README containing:

Project overview

Features

Tech stack

Local development instructions

Vercel deployment instructions

Conversation flow overview

The finished app should feel portfolio-quality and assignment-ready, not like a basic generated prototype.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inuitfootware.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/66bfd48c-9caf-4380-a09c-752c5edcf369).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
