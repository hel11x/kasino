# Casino Alpine Pro

A browser casino game in plain HTML, CSS and JavaScript (no frameworks, no build). Chips only, no real money.

## The casino floor
Walk the lobby and enter any venue: Roulette Salon, Blackjack Pit, Golden Slots, Alpine Downs Racetrack, the National Bank, the Boutique, the Gilded Pour bar and the Quest Board.

- **Bank**: borrow when you run low (4% to 18% interest every 5 rounds), repay any time. Credit limit grows as you repay.
- **Boutique**: permanent payout charms, a credit-limit card, and avatars.
- **Bar**: drinks give short boosts (payouts, XP).
- **Quests**: seven repeatable tasks that get harder and pay more each time you claim them.
- **Levels**: every round earns XP, every level pays a chip bonus.
- If you have no chips and no credit, the account closes. Progress lives in `localStorage`.

## Run
Open `index.html`. GitHub Pages: Settings, Pages, branch `main`, folder `/ (root)`.

For entertainment only. Gambling can be addictive.

## Multiplayer blackjack
Blackjack Pit, then Multiplayer. One player hosts a table and shares the 4-letter code, up to 3 friends join with it. Peer-to-peer via PeerJS (public cloud server for the handshake), so everyone needs internet access. The host runs the deck and the dealer; each player keeps their own chips. Casual, trust-based, not cheat-proof.
