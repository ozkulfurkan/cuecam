import listings from './listings.json';

// Store limits (App Store Connect and Play Console reject longer text).
const LIMITS = {
  appStoreName: 30,
  subtitle: 30,
  promotionalText: 170,
  keywords: 100,
  whatsNew: 4000,
  playTitle: 30,
  shortDescription: 80,
  description: 4000,
  // Our own limit so captions fit on two lines of the framed screenshots.
  caption: 40,
};

describe.each(Object.entries(listings))('%s listing', (_locale, listing) => {
  it('fits the App Store limits', () => {
    expect(listing.appStore.name.length).toBeLessThanOrEqual(LIMITS.appStoreName);
    expect(listing.appStore.subtitle.length).toBeLessThanOrEqual(LIMITS.subtitle);
    expect(listing.appStore.promotionalText.length).toBeLessThanOrEqual(LIMITS.promotionalText);
    expect(listing.appStore.whatsNew.length).toBeLessThanOrEqual(LIMITS.whatsNew);
    expect(listing.description.length).toBeLessThanOrEqual(LIMITS.description);
  });

  it('has a keyword list Apple accepts', () => {
    const { keywords, name, subtitle } = listing.appStore;
    // Counted in bytes by Apple for some scripts; UTF-8 bytes is the safe bound.
    expect(new TextEncoder().encode(keywords).length).toBeLessThanOrEqual(LIMITS.keywords);
    expect(keywords).not.toMatch(/\s,|,\s/);
    const words = keywords.split(',');
    expect(new Set(words).size).toBe(words.length);
    // Words already in the name or subtitle are indexed anyway; repeating them wastes space.
    const titleWords = `${name} ${subtitle}`.toLowerCase().split(/[^\p{L}\d]+/u);
    expect(words.filter((word) => titleWords.includes(word))).toEqual([]);
  });

  it('fits the Play Store limits', () => {
    expect(listing.play.title.length).toBeLessThanOrEqual(LIMITS.playTitle);
    expect(listing.play.shortDescription.length).toBeLessThanOrEqual(LIMITS.shortDescription);
  });

  it('has a short caption for each screenshot', () => {
    expect(listing.screenshotCaptions).toHaveLength(6);
    for (const caption of listing.screenshotCaptions) {
      expect(caption.length).toBeLessThanOrEqual(LIMITS.caption);
    }
  });
});
