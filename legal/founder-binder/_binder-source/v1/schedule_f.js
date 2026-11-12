'use strict';
// Schedule F to the Operating Agreement: Company business description and product scope for Nosebleed Sports LLC.
const { tbl } = require('./helpers.js');

module.exports = function scheduleF() {
  return `<h2>SCHEDULE F – COMPANY BUSINESS DESCRIPTION AND PRODUCT SCOPE</h2>
<h3>Part 1. Business description</h3>
<p>The business of the Company is to develop, own, operate, market and commercialize the Nosebleed Sports Platform: a sports application, a website and a Discord community for sports fans and sports bettors, together with the Premium Offering delivered through them, in each case under the Brand licensed from JGN and fed by the audience of the Nosebleed Sports media network that JGN owns and operates.</p>
<p>Such business includes live scores, game centers and box scores across major leagues; sportsbook odds and prediction-market prices; picks, player props and handicapping analysis, including the picks delivered by the Company's handicapper under the Talent Agreement and the Company's own tracked and graded picks; picks records, grading and performance history; sports news, notes and editorial content; watchlists, alerts and personalization; community features, including the Discord community, live sessions and member discussion; paid subscriptions, memberships and other premium access to picks, analysis, community and tools; sponsorship, advertising and affiliate arrangements that relate to the Platform; and the data pipelines, integrations and tooling that support these products.</p>
<p>The Company's existing and contemplated products comprise the Nosebleed Sports application (including the application known as Nosebleed Live), the Nosebleed Sports website, the Nosebleed Sports Discord community and the Premium Offering, together with related data services and integrations.</p>
<p>The Nosebleed Sports media network, including the Social Accounts, their audiences and the content published on them, and the sale of advertising and sponsorships on them, is JGN's business and not the Company's; the Company benefits from it through the Brand License and the promotion covenant in the JGN Agreement.</p>
<p>Part 2 details this Part 1 and does not enlarge it. This Schedule covers existing and planned products and does not represent that every capability is commercially available. It does not limit the Company's purpose under Section 2.4 or the products the Company may add. Section 11.5, and not this Schedule, states the competition restriction. A function listed in this Schedule is not by itself a Company product: for the Founder PIIA, the Company products listed in this Schedule are the four products named in this Part 1 and any product added under Section 11.5(c). The Company may add a product approved under Section 11.5(c) to this Schedule without a further amendment.</p>
<h3>Part 2. Product scope</h3>
<p class="sub"><strong>Company business and purpose</strong></p>
<p>The Company develops, operates, markets and commercializes a sports application, a website, a community and a premium picks and analysis offering for sports fans and sports bettors in the United States and elsewhere. The Company's business supports the discovery, tracking, discussion and enjoyment of games, odds and picks, and the delivery of paid picks, analysis and community to subscribers.</p>
<p>Its product scope includes:</p>
<ul class="tight">
<li>Live scores, schedules, game status and gamecast updates.</li>
<li>Box scores, player statistics, line scores and recent-game history.</li>
<li>Sportsbook odds (moneyline, spread and total markets), line movement and prediction-market prices shown side by side.</li>
<li>Expert picks, handicapper picks, player props and model-generated picks, with confidence, price and graded results.</li>
<li>Picks records, grading, performance history and transparency reporting.</li>
<li>Sports news, notes, editorial posts and newsletter content for the Platform.</li>
<li>Watchlists, favorites, alerts, notifications and personalization.</li>
<li>Community features: the Discord community, member roles tied to subscription status, live sessions, discussion and support.</li>
<li>Subscriptions, memberships, promo codes, referral tracking and premium access control.</li>
<li>Sponsorship, advertising and affiliate placements within the Platform.</li>
<li>Data pipelines, provider integrations, caching, normalization and internal tooling for all of the above.</li>
</ul>
<p>The Company's product strategy comprises four connected offerings, which operate together through shared accounts, subscriptions and data:</p>
${tbl(['Product', 'Intended users', 'Primary purpose'], [
  ['Nosebleed Sports application (Nosebleed Live)', 'Sports fans and sports bettors on mobile and web', 'Follow live games, scores, box scores and odds; track picks and results; read news; manage watchlists; access premium picks and community.'],
  ['Nosebleed Sports website', 'The same users, and visitors arriving from the media network', 'Present the Brand, the products and the picks record; convert visitors into members and subscribers; host content and account management.'],
  ['Nosebleed Sports Discord community', 'Members and subscribers', 'Deliver picks and analysis, host live sessions and discussion, and provide member support, with roles tied to subscription status.'],
  ['Premium Offering', 'Paying subscribers', 'Daily picks with research write-ups, player props, live sessions during major slates, premium community access and related tools.'],
])}
<p class="sub"><strong>Nosebleed Sports application</strong></p>
<p>The application is a mobile-first web and installable application that brings live scores, gamecast updates, box scores, odds, picks tracking, news and watchlists into one place. Its functional scope includes:</p>
<ul class="tight">
<li><strong>Scoreboard and game center.</strong> Live, upcoming and recent games across supported leagues, sorted live first; game status, clock and scoring; team and player views.</li>
<li><strong>Box scores and history.</strong> Player and team statistics for synced games, line scores, previous games and recent stat leaders.</li>
<li><strong>Odds.</strong> Sportsbook moneyline, spread and total prices, line movement and prediction-market probabilities for the selected game.</li>
<li><strong>Picks.</strong> Expert, handicapper and model picks with price, confidence, result and public or premium visibility; the Company's picks record and grading.</li>
<li><strong>News and content.</strong> Editorial posts, notes, tags, authors and links to the Platform's content and newsletter.</li>
<li><strong>Watchlists and alerts.</strong> Favorite teams, players and games; notifications for starts, scores and picks.</li>
<li><strong>Accounts and subscriptions.</strong> Sign-in, membership status, premium access and Discord role linkage.</li>
</ul>
<p>Planned functionality includes distribution through app stores, licensed sports-data providers for production scores, box scores and historical statistics, push notifications, and expanded premium tools.</p>
<p class="sub"><strong>Nosebleed Sports website</strong></p>
<p>The website presents the Brand and the products, publishes the picks record and content, converts visitors from the media network into members and subscribers, and provides account, subscription and support pages. It shares accounts, subscriptions and data with the application.</p>
<p class="sub"><strong>Nosebleed Sports Discord community</strong></p>
<p>The Discord community is the Company's member community and the primary delivery channel for the Premium Offering. It includes public and premium channels, member roles tied to subscription status through role integrations, picks and analysis delivery, live sessions during major slates, discussion, announcements and support. The Company owns and administers the server; the Class B Member maintains an active daily presence in it under the Talent Agreement.</p>
<p class="sub"><strong>Premium Offering</strong></p>
<p>The Premium Offering is the Company's paid product. Its scope includes daily picks with accompanying research write-ups in the Company's system and format; player props and other wagering analysis; live sessions, including a session of at least thirty minutes on each NFL Sunday during the regular season and postseason and sessions for major games and events across sports; premium Discord access and community; the picks record and grading; subscription tiers, promo codes and referral attribution; and the responsible-gambling messaging, disclaimers and age and jurisdiction controls the Company requires. Picks are provided for informational and entertainment purposes, are not financial advice and carry no guarantee of any outcome.</p>
<p class="sub"><strong>Relationship to the media network</strong></p>
<p>The Nosebleed Sports media network owned by JGN, with its social accounts across TikTok, Instagram, X and YouTube and its sub-brands, is the Platform's principal audience source. Under the JGN Agreement, JGN licenses the Brand to the Company for the Platform and promotes the Platform through the Social Accounts, and the Class B Member manages the Nosebleed Sports TikTok and Instagram accounts and serves as the on-camera face of the Brand under the Talent Agreement. Sponsorships and brand deals that relate to the Platform are Company business; sponsorships and advertising sold on the Social Accounts are JGN business, and revenue is allocated as the JGN Agreement and the Talent Agreement provide.</p>
<p class="sub"><strong>Commercial activities and supporting technology</strong></p>
<p>The Company's existing and contemplated commercial activities include subscriptions and memberships to the Premium Offering, premium tools and content, sponsorship and advertising placements within the Platform, affiliate arrangements permitted under Section 2.5, and events. Its supporting technology includes web and mobile interfaces, a server-side proxy and API layer, sports-data, scores and odds provider integrations, prediction-market integrations, picks storage and grading, subscription and payment platform integrations, Discord bots and role integrations, notification services, analytics and monitoring, and access-controlled administration. Pricing and monetization are determined by the Company.</p>
<p class="sub"><strong>Development scope</strong></p>
<p>This Schedule includes existing functionality, functionality under development and planned capabilities. App-store distribution, licensed production data providers, expanded premium tools, additional leagues and markets, and newsletter and content integrations form part of the intended product scope. Specific data sources, grading methods, feature thresholds and implementation details are determined by the Company. Future enhancements may extend the described workflows. A materially different business line must be approved by Supermajority Approval under Section 2.4 and, if it is to be covered by Section 11.5, under Section 11.5(c).</p>`;
};
