# SecondBeat

A platform where musicians buy and sell used instruments, connect with tutors, and grow their community. The landing page speaks to all three verticals; Used Gear early access is opening soon.

## Language

**SecondBeat**:
The product and brand. A marketplace and community hub for musicians — not a generic classifieds site.
_Avoid_: Second Beat (two words), SB (internal shorthand only)

**Artist**:
A musician who uses SecondBeat — as a buyer, seller, tutor, or community member.
_Avoid_: User (implementation term), customer (too transactional)

**Used Gear**:
The marketplace vertical for buying and selling pre-owned instruments. Listings are called ads.
_Avoid_: Used instruments (too generic), marketplace (platform-level term)

**Instrument Ad**:
A single listing for one used instrument. Has a title, description, price, condition, make, and up to five images.
_Avoid_: Product, listing, post

**Ad limit**:
Each artist may have at most three active Instrument Ads at a time. To list something new, they must remove an existing ad first.
_Avoid_: Listing cap (use ad limit), unlimited listings

**Make**:
The manufacturer or brand of an instrument (e.g. Yamaha, Fender). Referenced by `make_id` in the backend.
_Avoid_: Brand (acceptable in UI filters, but Make is the domain term)

**Condition**:
The physical state of a listed instrument — Excellent, Good, or Fair.
_Avoid_: Quality, grade

**Tutors**:
The lessons vertical where artists offer or find music instruction. Planned; not yet live on the website.
_Avoid_: Teachers, instructors (UI-friendly synonyms, but Tutors is the nav label)

**Community**:
The social vertical for connecting with other musicians — follow, discover, share. Planned; not yet live.
_Avoid_: Social network, feed

**Visitor**:
Someone on the landing page who has not created a SecondBeat account. A Visitor who submits their email for early access is still a Visitor — not an Artist yet.
_Avoid_: User, lead, subscriber

**Join the waitlist**:
The act of a Visitor submitting their email (and optional instrument interest) to be contacted when Used Gear early access opens. Primary CTA label: **Join the waitlist**.
_Avoid_: Sign up, register, subscribe, get notified (retired CTA label)

**Instrument interest**:
The type of instrument a Visitor cares about when joining the waitlist. Optional at signup; used for launch segmentation only — not an Instrument Ad. Allowed values: Acoustic, Electric, Drums, Piano, Classical, or Not sure. If the same email joins again, update instrument interest and still confirm success.
_Avoid_: Category filter, listing type

**Used Gear early access**:
The upcoming opening of the Used Gear vertical. Visitors on the early access waitlist are emailed a link to create an Artist account when it opens.
_Avoid_: Beta, launch, go-live (use early access)

**Early access waitlist**:
The collection of Visitors who have joined the waitlist to be contacted when **Used Gear** early access opens.
_Avoid_: Mailing list, newsletter, user database

**Waitlist email use**:
SecondBeat may email a Visitor on the waitlist only about Used Gear availability and early access. Their email is not used for any other purpose.
_Avoid_: Marketing list, promotional emails, third-party sharing

## Flagged ambiguities

- **"Product" vs "Instrument Ad"**: The website route uses `/product/:id`, but the domain term is Instrument Ad. The route name is legacy; new copy should say "ad" or "listing."
- **"Account" vs "Artist"**: Auth flows create a user account; in product copy, refer to the person as an Artist.

## Example dialogue

> **Dev:** When someone posts a guitar for sale, what do we call that?
>
> **Domain expert:** An Instrument Ad. They pick the Make, set the Condition, upload photos — max five per ad — and set a price in rupees.
>
> **Dev:** How many ads can one artist have?
>
> **Domain expert:** Three. That's the ad limit. If they want to list a fourth instrument, they delete or sell one first.
>
> **Dev:** And the Used Gear page shows all active ads?
>
> **Domain expert:** Right. When early access opens, browse Used Gear, tap an ad to see details, or go to Sell Your Instrument if you want to list one. You need to be signed in to sell.
>
> **Dev:** What about someone who only leaves their email on the landing page?
>
> **Domain expert:** They're still a Visitor — not an Artist yet. They join the waitlist for Used Gear early access. When we open, we email them a link to create their account.
