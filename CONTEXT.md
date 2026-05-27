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
