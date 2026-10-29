/**
 * Registry of the bundled artwork.
 *
 * IMPORTANT: the files in assets/images are generated PLACEHOLDER artwork, not photographs.
 * Replace each file (keeping the same file name) with real, licensed photography.
 * See assets/images/README.md for the full list.
 */
export const images = {
  logo: require('../../assets/favicon.svg'),
  loginBg: require('../../assets/images/login_bg.jpg'),
  heroLanding: require('../../assets/images/hero_landing.jpg'),
  slide2: require('../../assets/images/slide2.png'),
  slide3: require('../../assets/images/slide3.png'),
  heroOnboarding: require('../../assets/images/hero_onboarding.jpg'),
  hills: require('../../assets/images/hills.jpg'),
  lakeKivu: require('../../assets/images/lake_kivu.jpg'),
  volcanoes: require('../../assets/images/volcanoes.jpg'),
  tea: require('../../assets/images/tea.jpg'),
  kigali: require('../../assets/images/kigali.jpg'),
  imigongo: require('../../assets/images/imigongo.jpg'),
  basket: require('../../assets/images/basket.jpg'),
  coffee: require('../../assets/images/coffee.jpg'),
  honey: require('../../assets/images/honey.jpg'),
  dance: require('../../assets/images/dance.jpg'),
  festival: require('../../assets/images/festival.jpg'),
  coffeeHarvest: require('../../assets/images/coffee_harvest.jpg'),
  artisan: require('../../assets/images/artisan.jpg'),
  tshirt: require('../../assets/images/t.png'),
  bracelet: require('../../assets/images/b.png'),
  pen: require('../../assets/images/p.png'),
} as const;

export type ImageKey = keyof typeof images;
