# Vltava Casino

A browser casino in plain HTML, CSS and JavaScript (no frameworks, no build step). Chips only, no real money.

## Games
- **Roulette**: European wheel with 37 pockets, animated ball, full betting table, result history.
- **Blackjack**: 3:2 blackjack, double down, dealer draws to 17.
- **Slots**: three reels with a paytable.
- **Horse racing**: six horses with odds and an animated race.

## The bank
There is no "new game". When you run low you borrow from the Vltava National Bank and pay it back.
- Four loan offers (4% to 18% interest), charged every 5 rounds on the outstanding balance.
- Credit limit starts at 5,000 and grows by 500 for every loan you fully repay.
- Repay partially or in full at any time. Your debt, net worth and credit rating are tracked live.
- If you are out of chips with no credit left, the account is closed. Progress is stored in `localStorage`, so clearing site data is the only reset.

## Run
Open `index.html` in a browser. For GitHub Pages: Settings, Pages, branch `main`, folder `/ (root)`.

For entertainment only. Gambling can be addictive.
