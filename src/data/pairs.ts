/**
 * Curated comparison pairs — the discovery layer's SEO pages.
 *
 * Every pair must pass the integrity test in pairs.test.ts: both ids
 * exist in the library, and both objects carry the shared attribute.
 * Blurbs are hand-written; no template-generated N² combinations.
 */

import { LIBRARY_BY_ID } from './library';
import type { AttributeKey } from '../lib/attributes';

export interface Pair {
  /** Library id of object A (the "bigger" side is computed at render). */
  a: string;
  b: string;
  /** The attribute every visitor compares. */
  attr: AttributeKey;
  /** Hand-written page title without the names (names are prepended). */
  title: string;
  /** One-sentence editorial hook shown as the page lede. */
  blurb: string;
  /** Suggested question for the Studio preload. */
  question: string;
}

export const PAIRS: Pair[] = [
  /* commercial — beds, TVs, luggage (buyer-intent keywords) */
  {
    a: 'bed-queen',
    b: 'bed-full',
    attr: 'width',
    title: '— which bed fits your room?',
    blurb:
      'The most-asked mattress question: a Queen is 15 cm (6 in) wider and 13 cm (5 in) longer than a Full — drawn here at true scale.',
    question: 'How much floor space does the Queen really add?',
  },
  {
    a: 'bed-king',
    b: 'bed-queen',
    attr: 'width',
    title: '— Queen vs King mattress',
    blurb:
      'A King is 41 cm (16 in) wider than a Queen at the same length — nearly a whole extra Twin mattress of width.',
    question: 'Is the King worth the extra floor space in your room?',
  },
  {
    a: 'bed-full',
    b: 'bed-twin',
    attr: 'width',
    title: '— which single bed is right?',
    blurb:
      'A Full (Double) is 41 cm (16 in) wider than a Twin but exactly the same length — wider, not longer.',
    question: 'Can two people really share a Full?',
  },
  {
    a: 'bed-twin-xl',
    b: 'bed-twin',
    attr: 'height',
    title: '— the 5-inch difference that matters',
    blurb:
      'Identical 38-inch width, 13 cm (5 in) more length: the Twin XL is the dorm-room classic built for taller sleepers.',
    question: 'Do those extra 5 inches matter for how tall you are?',
  },
  {
    a: 'tv-65',
    b: 'tv-55',
    attr: 'width',
    title: '— which TV size is right for your room?',
    blurb:
      'Going from 55 to 65 inches adds 22 cm (9 in) of width and about 40% more screen area — see both on your wall at true scale.',
    question: 'Will the 65-inch fit your TV stand or wall?',
  },
  {
    a: 'tv-75',
    b: 'tv-65',
    attr: 'width',
    title: '— how much bigger is it really?',
    blurb:
      'From 65 to 75 inches adds another 22 cm (9 in) of width and a third more screen area — the last step before true home-cinema money.',
    question: 'How much wall does the 75-inch actually need?',
  },
  {
    a: 'luggage-carry-on',
    b: 'luggage-personal-item',
    attr: 'height',
    title: '— what fits under the seat vs overhead',
    blurb:
      'The overhead-bin case against the under-seat bag: a maximum carry-on stands 16 cm taller and 15 cm wider than a typical personal item.',
    question: 'Which bag is your free allowance on the next flight?',
  },
  {
    a: 'luggage-carry-on',
    b: 'luggage-cabin-eu',
    attr: 'height',
    title: '— will a US bag pass a European sizer?',
    blurb:
      'The IATA-guideline carry-on is 11 cm taller and 9 cm wider than easyJet\u2019s free small bag — the reason US-sized cases get gate-checked in Europe.',
    question: 'Does your bag pass the sizer at the gate?',
  },
  /* animals — height */
  {
    a: 'elephant',
    b: 'adult',
    attr: 'height',
    title: '— How tall is an elephant next to a person?',
    blurb:
      'The tallest land animal alive today against a typical adult human — the difference is larger than most people expect.',
    question: 'How many adults, standing on each other, would reach the elephant?',
  },
  {
    a: 'giraffe',
    b: 'elephant',
    attr: 'height',
    title: '— The two tallest giants compared',
    blurb:
      'Giraffe vs elephant: the tallest animal against the heaviest land animal. Which one actually stands taller?',
    question: 'Which is taller — and by how many metres?',
  },
  {
    a: 'trex',
    b: 'elephant',
    attr: 'height',
    title: '— Dinosaur vs elephant',
    blurb:
      'If T. rex walked past an African elephant, who would look down at whom? (All dinosaur sizes here are fossil estimates.)',
    question: 'Could T. rex have looked over the elephant?',
  },
  {
    a: 'giraffe',
    b: 'child',
    attr: 'height',
    title: '— A giraffe next to an 8-year-old',
    blurb:
      'A giraffe stands roughly four times taller than an average 8-year-old — a favourite first scale comparison.',
    question: 'How many children stacked up would match one giraffe?',
  },
  {
    a: 'ostrich',
    b: 'adult',
    attr: 'height',
    title: '— The tallest bird vs a person',
    blurb:
      'An ostrich stands about 2.7 m tall — noticeably taller than most adults, and the fastest two-legged runner on Earth.',
    question: 'Is the ostrich taller than you?',
  },
  {
    a: 'polarbear',
    b: 'lion',
    attr: 'height',
    title: '— Two big predators, shoulder to shoulder',
    blurb:
      'Polar bear and lion, compared at the shoulder. One is built for Arctic ambush, the other for savanna teamwork.',
    question: 'Which predator stands taller at the shoulder?',
  },
  {
    a: 'horse',
    b: 'cow',
    attr: 'height',
    title: '— Farm giants compared',
    blurb:
      'A riding horse and a dairy cow measured at the withers — closer in size than many people guess.',
    question: 'Which is taller, and how close is the other?',
  },
  {
    a: 'penguin',
    b: 'cat',
    attr: 'height',
    title: '— An emperor penguin next to a cat',
    blurb:
      'The largest living penguin stands well over twice the shoulder height of a typical house cat.',
    question: 'How many cats stacked up match one emperor penguin?',
  },
  /* animals — length */
  {
    a: 'bluewhale',
    b: 'bus',
    attr: 'length',
    title: '— The largest animal ever vs a school bus',
    blurb:
      'An adult blue whale is roughly twice as long as a full-size school bus — the largest animal ever measured against an everyday giant.',
    question: 'About how many school buses laid end to end equal one blue whale?',
  },
  {
    a: 'shark',
    b: 'car',
    attr: 'length',
    title: '— Great white shark vs a car',
    blurb:
      'A large great white shark is about as long as the sedan in your driveway — with roughly a tonne more mass.',
    question: 'Would a great white fit in one parking space?',
  },
  {
    a: 'rabbit',
    b: 'mouse',
    attr: 'length',
    title: '— Rabbit vs mouse',
    blurb:
      'A rabbit is about five times longer than a house mouse (head-and-body) — small animals, big visible difference.',
    question: 'About how many mice long is the rabbit?',
  },
  /* animals — weight */
  {
    a: 'bluewhale',
    b: 'elephant',
    attr: 'weight',
    title: '— The two heaviest animals compared',
    blurb:
      'The largest animal ever recorded against the heaviest land animal alive: a blue whale weighs roughly 25 elephants.',
    question: 'How many elephants weigh as much as one blue whale?',
  },
  {
    a: 'elephant',
    b: 'dog-labrador',
    attr: 'weight',
    title: '— Elephant vs Labrador',
    blurb:
      'A family dog against an African elephant: the scale factor is the kind of number students remember.',
    question: 'About how many Labradors weigh as much as one elephant?',
  },
  {
    a: 'car',
    b: 'elephant',
    attr: 'weight',
    title: '— Car vs elephant',
    blurb:
      'A mid-size sedan weighs about a quarter of an African elephant — metal and glass against muscle and bone.',
    question: 'Which is heavier — and by roughly how much?',
  },
  {
    a: 'bus',
    b: 'elephant',
    attr: 'weight',
    title: '— School bus vs elephant',
    blurb:
      'A full-size school bus outweighs an adult elephant by roughly two to one — empty, without any passengers.',
    question: 'How many elephants balance one empty school bus?',
  },
  {
    a: 'bicycle',
    b: 'car',
    attr: 'weight',
    title: '— Bicycle vs car',
    blurb:
      'A city bike weighs about 125 times less than a mid-size sedan — the clearest everyday weight contrast there is.',
    question: 'About how many bicycles weigh as much as one car?',
  },
  {
    a: 'elephant',
    b: 'trex',
    attr: 'weight',
    title: '— Elephant vs T. rex',
    blurb:
      'Mass estimates put an adult T. rex a bit heavier than an African elephant — with far more of that weight on two legs. (Fossil estimate.)',
    question: 'Which weighed more, and how uncertain are the numbers?',
  },
  {
    a: 'giraffe',
    b: 'horse',
    attr: 'weight',
    title: '— Giraffe vs horse',
    blurb:
      'A giraffe weighs roughly two to three riding horses — most of it high up on that long neck.',
    question: 'How many horses balance one giraffe?',
  },
  /* space — diameter & volume */
  {
    a: 'sun',
    b: 'earth',
    attr: 'diameter',
    title: '— Sun vs Earth',
    blurb:
      'About 109 Earths would fit across the Sun’s face — and over a million Earths inside it.',
    question: 'How many Earths wide is the Sun?',
  },
  {
    a: 'jupiter',
    b: 'earth',
    attr: 'diameter',
    title: '— Jupiter vs Earth',
    blurb:
      'Jupiter is the largest planet in the solar system — about 11 Earth diameters across, and it could swallow 1,300 Earths by volume.',
    question: 'How many Earths would fit across Jupiter?',
  },
  {
    a: 'earth',
    b: 'moon',
    attr: 'diameter',
    title: '— Earth vs Moon',
    blurb:
      'The Moon is about a quarter of Earth’s diameter — the largest moon relative to its planet in the solar system.',
    question: 'About how many Moons would span Earth?',
  },
  {
    a: 'earth',
    b: 'mars',
    attr: 'diameter',
    title: '— Earth vs Mars',
    blurb:
      'Mars is about half the diameter of Earth — the reason a day there is similar but everything else is smaller.',
    question: 'Roughly how many Mars diameters equal Earth’s?',
  },
  {
    a: 'sun',
    b: 'jupiter',
    attr: 'volume',
    title: '— Sun vs Jupiter (volume)',
    blurb:
      'Even Jupiter is tiny next to the Sun: about 1,000 Jupiters would fit inside it.',
    question: 'About how many Jupiters would fill the Sun?',
  },
  {
    a: 'moon',
    b: 'earth',
    attr: 'volume',
    title: '— Moon vs Earth (volume)',
    blurb:
      'Diameters are only 4× apart, but volumes are 49× apart — a striking lesson in how cubes grow faster than lines.',
    question: 'About how many Moons would fill Earth?',
  },
  /* buildings — height */
  {
    a: 'burj',
    b: 'eiffel',
    attr: 'height',
    title: '— Burj Khalifa vs Eiffel Tower',
    blurb:
      'The tallest building in the world against the tower that held the record for 41 years — more than 2.5× taller.',
    question: 'How many Eiffel Towers tall is the Burj Khalifa?',
  },
  {
    a: 'eiffel',
    b: 'liberty',
    attr: 'height',
    title: '— Eiffel Tower vs Statue of Liberty',
    blurb:
      'Paris’s iron lady against New York’s copper one — the Eiffel Tower is more than three times taller, pedestal included.',
    question: 'About how many Statues of Liberty stack up to the Eiffel Tower?',
  },
  {
    a: 'everest',
    b: 'burj',
    attr: 'height',
    title: '— Mount Everest vs Burj Khalifa',
    blurb:
      'The tallest mountain against the tallest building: you could stack more than ten Burj Khalifas up Everest’s flank. (Everest height is measured from sea level.)',
    question: 'About how many Burj Khalifas would reach up Everest?',
  },
  {
    a: 'giraffe',
    b: 'burj',
    attr: 'height',
    title: '— Giraffe vs Burj Khalifa',
    blurb:
      'The tallest animal against the tallest building: about 150 giraffes, trunk to toe, would match the Burj Khalifa.',
    question: 'About how many giraffes tall is the Burj Khalifa?',
  },
  /* vehicles — length */
  {
    a: 'bus',
    b: 'car',
    attr: 'length',
    title: '— School bus vs sedan',
    blurb:
      'A full-size school bus is about two and a half sedans long — easy to see in any school pickup line.',
    question: 'About how many cars long is the bus?',
  },
  {
    a: 'car',
    b: 'bicycle',
    attr: 'length',
    title: '— Sedan vs bicycle',
    blurb:
      'A mid-size sedan is nearly three bicycles long — the everyday comparison that makes metres tangible.',
    question: 'About how many bikes long is the car?',
  },
  /* everyday — diameter & volume */
  {
    a: 'basketball',
    b: 'tennisball',
    attr: 'diameter',
    title: '— Basketball vs tennis ball',
    blurb:
      'The two most-compared balls in sport: a basketball’s diameter is about 3.5 tennis balls.',
    question: 'About how many tennis balls wide is the basketball?',
  },
  {
    a: 'apple',
    b: 'orange',
    attr: 'diameter',
    title: '— Apple vs orange',
    blurb:
      'The classic fruit comparison — and closer in size than most people guess before they measure.',
    question: 'Which fruit is wider, and by how much?',
  },
  {
    a: 'bottle',
    b: 'sodacan',
    attr: 'volume',
    title: '— 500 ml bottle vs soda can (volume)',
    blurb:
      'A 500 ml bottle holds 145 ml more than a 12 oz can — a small-looking difference that is 40% extra.',
    question: 'How much more does the bottle hold than the can?',
  },
  {
    a: 'basketball',
    b: 'sodacan',
    attr: 'volume',
    title: '— Basketball vs soda can (volume)',
    blurb:
      'A basketball’s volume is about 20 soda cans — a great way to feel what litres mean.',
    question: 'About how many cans of soda would fill a basketball?',
  },
  {
    a: 'dog-great-dane',
    b: 'dog-chihuahua',
    attr: 'height',
    title: "\u2014 The tallest lapdog gap in dogs",
    blurb: "A Great Dane stands roughly four times taller than a Chihuahua \u2014 the widest size spread inside any single species.",
    question: "About how many Chihuahuas tall is the Great Dane?",
  },
  {
    a: 'dog-golden-retriever',
    b: 'dog-french-bulldog',
    attr: 'weight',
    title: "\u2014 Retriever vs French Bulldog",
    blurb: "A Golden Retriever outweighs a French Bulldog by more than two to one \u2014 same species, very different builds.",
    question: "Which is heavier, and by roughly how much?",
  },
  {
    a: 'dog-husky',
    b: 'dog-pomeranian',
    attr: 'height',
    title: "\u2014 Sled dog vs sofa dog",
    blurb: "A Siberian Husky is about three Pomeranians tall at the shoulder.",
    question: "How many Pomeranians stack up to the Husky?",
  },
  {
    a: 'dog-saint-bernard',
    b: 'dog-corgi',
    attr: 'weight',
    title: "\u2014 Rescue giant vs herding shorty",
    blurb: "A Saint Bernard weighs roughly five Pembroke Welsh Corgis.",
    question: "About how many Corgis weigh as much as the Saint Bernard?",
  },
  {
    a: 'dog-doberman',
    b: 'dog-beagle',
    attr: 'height',
    title: "\u2014 Guard tower vs scent hound",
    blurb: "A Doberman stands noticeably taller than a Beagle at the shoulder.",
    question: "Which is taller, and by how many centimetres?",
  },
  {
    a: 'dog-rottweiler',
    b: 'dog-dalmatian',
    attr: 'weight',
    title: "\u2014 Two heavyweights compared",
    blurb: "A Rottweiler outweighs a Dalmatian by nearly two to one.",
    question: "Roughly how many Dalmatians balance a Rottweiler?",
  },
  {
    a: 'dog-great-dane',
    b: 'adult',
    attr: 'height',
    title: "\u2014 Great Dane vs person",
    blurb: "A Great Dane standing on its hind legs can look a typical adult in the eye.",
    question: "Is the Dane taller than you on all fours?",
  },
  {
    a: 'dog-german-shepherd',
    b: 'dog-boxer',
    attr: 'weight',
    title: "\u2014 Shepherd vs Boxer",
    blurb: "German Shepherds and Boxers are close in weight \u2014 but the Shepherd stands a bit taller.",
    question: "Which breed is heavier?",
  },
  {
    a: 'cat-maine-coon',
    b: 'cat-siamese',
    attr: 'weight',
    title: "\u2014 The gentle giant vs the svelte classic",
    blurb: "A Maine Coon can weigh more than twice as much as a Siamese.",
    question: "How many Siamese weigh as much as a Maine Coon?",
  },
  {
    a: 'cat-maine-coon',
    b: 'dog-beagle',
    attr: 'weight',
    title: "\u2014 Maine Coon vs Beagle",
    blurb: "A large Maine Coon weighs about as much as a Beagle \u2014 cats rarely get this heavy.",
    question: "Is the Maine Coon really as heavy as a Beagle?",
  },
  {
    a: 'cat-persian',
    b: 'cat-siamese',
    attr: 'length',
    title: "\u2014 Persian vs Siamese",
    blurb: "The two most famous cat breeds, compared nose-to-body.",
    question: "Which breed is longer?",
  },
  {
    a: 'cat-british-shorthair',
    b: 'cat-russian-blue',
    attr: 'weight',
    title: "\u2014 Two plush blue-greys",
    blurb: "British Shorthairs run a little heavier than Russian Blues.",
    question: "Which breed weighs more?",
  },
  {
    a: 'tv-85',
    b: 'tv-43',
    attr: 'width',
    title: "\u2014 Home cinema vs living room TV",
    blurb: "An 85-inch TV is nearly twice as wide as a 43-inch one \u2014 measure your wall first.",
    question: "About how many 43-inch TVs wide is the 85?",
  },
  {
    a: 'tv-98',
    b: 'tv-65',
    attr: 'width',
    title: "\u2014 The giant class vs the people\u2019s favourite",
    blurb: "A 98-inch screen is over one and a half times as wide as the bestselling 65-inch size.",
    question: "How much wider is the 98-inch?",
  },
  {
    a: 'tv-75',
    b: 'tv-55',
    attr: 'width',
    title: "\u2014 Upgrade math",
    blurb: "Going from 55 to 75 inches adds about a third more screen width \u2014 and a lot more impact.",
    question: "How much wider is the 75-inch?",
  },
  {
    a: 'bed-king',
    b: 'bed-full',
    attr: 'width',
    title: "\u2014 King vs Full",
    blurb: "A King mattress is about 40 cm wider than a Full \u2014 roughly the width of a pillow.",
    question: "How much wider is the King?",
  },
  {
    a: 'bed-queen',
    b: 'bed-twin',
    attr: 'width',
    title: "\u2014 Queen vs Twin",
    blurb: "A Queen is nearly 60 cm wider than a Twin \u2014 the difference between one sleeper and two.",
    question: "About how many Twins across is a Queen?",
  },
  {
    a: 'bed-cal-king',
    b: 'bed-queen',
    attr: 'width',
    title: "\u2014 California King vs Queen",
    blurb: "The California King trades 10 cm of width for 10 cm of extra length compared to a Queen.",
    question: "Which is wider, and which is longer?",
  },
  {
    a: 'ball-soccer',
    b: 'ball-volleyball',
    attr: 'diameter',
    title: "\u2014 Pitch vs court balls",
    blurb: "A soccer ball and a volleyball are nearly the same size \u2014 about 2 cm apart.",
    question: "Which ball is slightly bigger?",
  },
  {
    a: 'ball-rugby',
    b: 'ball-football',
    attr: 'length',
    title: "\u2014 Rugby vs gridiron balls",
    blurb: "Rugby and American football balls are close cousins \u2014 the football is slightly longer and pointier.",
    question: "Which ball is longer?",
  },
  {
    a: 'ball-soccer',
    b: 'tennisball',
    attr: 'diameter',
    title: "\u2014 Soccer vs tennis ball",
    blurb: "A soccer ball\u2019s diameter is a little over three tennis balls.",
    question: "About how many tennis balls wide is the soccer ball?",
  },
  {
    a: 'ball-baseball',
    b: 'ball-pingpong',
    attr: 'diameter',
    title: "\u2014 Baseball vs ping pong ball",
    blurb: "A baseball is not quite twice the diameter of a ping pong ball \u2014 but nearly eight times heavier per volume.",
    question: "How many ping pong balls across is a baseball?",
  },
  {
    a: 'ball-bowling',
    b: 'basketball',
    attr: 'diameter',
    title: "\u2014 Bowling vs basketball",
    blurb: "A bowling ball and a basketball are almost identical in diameter \u2014 wildly different in mass.",
    question: "Same size \u2014 so why does one weigh so much more?",
  },
  {
    a: 'ball-hockeypuck',
    b: 'ball-baseball',
    attr: 'diameter',
    title: "\u2014 Puck vs baseball",
    blurb: "A hockey puck is nearly the same diameter as a baseball \u2014 but flat, frozen, and rubber.",
    question: "Which is wider?",
  },
  {
    a: 'ball-eightball',
    b: 'tennisball',
    attr: 'diameter',
    title: "\u2014 Pool ball vs tennis ball",
    blurb: "The pool 8-ball sits comfortably inside a tennis ball\u2019s width.",
    question: "How many 8-balls across is a tennis ball?",
  },
  {
    a: 'watermelon',
    b: 'orange',
    attr: 'diameter',
    title: "\u2014 Melon vs orange",
    blurb: "A whole watermelon is nearly four oranges across.",
    question: "About how many oranges across is the watermelon?",
  },
  {
    a: 'food-hamburger',
    b: 'food-donut',
    attr: 'diameter',
    title: "\u2014 Burger vs doughnut",
    blurb: "A quarter-pound burger is just a little wider than a ring doughnut.",
    question: "Which is wider?",
  },
  {
    a: 'food-broccoli',
    b: 'food-mushroom',
    attr: 'diameter',
    title: "\u2014 Crown vs button",
    blurb: "A broccoli crown is about two and a half button mushrooms across.",
    question: "How many mushrooms across is the crown?",
  },
  {
    a: 'food-tomato',
    b: 'food-lemon',
    attr: 'diameter',
    title: "\u2014 Salad staples",
    blurb: "A medium tomato and a lemon are almost the same size \u2014 swap-friendly in the kitchen.",
    question: "Which is slightly wider?",
  },
  {
    a: 'banana',
    b: 'food-carrot',
    attr: 'length',
    title: "\u2014 Fruit bowl vs veg drawer",
    blurb: "A banana and a carrot are nearly the same length \u2014 around 18 cm.",
    question: "Which is heavier?",
  },
  {
    a: 'food-corn',
    b: 'food-carrot',
    attr: 'length',
    title: "\u2014 Corn vs carrot",
    blurb: "An ear of corn is slightly longer than a medium carrot.",
    question: "Which is longer, and by how much?",
  },
  {
    a: 'food-baguette',
    b: 'food-pizza-slice',
    attr: 'length',
    title: "\u2014 Paris vs Naples",
    blurb: "A traditional baguette is more than four pizza slices long.",
    question: "About how many slices long is the baguette?",
  },
  {
    a: 'food-hotdog',
    b: 'food-sushi',
    attr: 'length',
    title: "\u2014 Street food lengths",
    blurb: "A hot dog in its bun is about two nigiri pieces long.",
    question: "How many sushi pieces equal a hot dog?",
  },
  {
    a: 'food-taco',
    b: 'food-croissant',
    attr: 'length',
    title: "\u2014 Mexico City vs Paris bakeries",
    blurb: "A taco and a croissant are nearly the same length \u2014 about 14\u201315 cm.",
    question: "Which is heavier?",
  },
  {
    a: 'food-avocado',
    b: 'food-peach',
    attr: 'weight',
    title: "\u2014 Green gold vs stone fruit",
    blurb: "A medium avocado weighs about one and a half peaches.",
    question: "Which weighs more?",
  },
  {
    a: 'food-hamburger',
    b: 'food-taco',
    attr: 'weight',
    title: "\u2014 Burger vs taco",
    blurb: "A quarter-pound burger weighs a bit more than a filled taco.",
    question: "Which is heavier?",
  },
  {
    a: 'food-pizza-slice',
    b: 'food-sushi',
    attr: 'weight',
    title: "\u2014 Slice vs nigiri",
    blurb: "One pizza slice weighs about three nigiri pieces.",
    question: "About how many nigiri weigh as much as the slice?",
  },
  {
    a: 'food-bread',
    b: 'food-baguette',
    attr: 'weight',
    title: "\u2014 Loaf vs baguette",
    blurb: "A sandwich loaf outweighs a traditional baguette by nearly two to one.",
    question: "How many baguettes weigh as much as the loaf?",
  },
  {
    a: 'food-beer',
    b: 'food-milk',
    attr: 'volume',
    title: "\u2014 Pint vs glass",
    blurb: "A US pint of beer holds almost exactly twice a standard glass of milk.",
    question: "How many milk glasses fill the pint?",
  },
  {
    a: 'food-ramen',
    b: 'food-coffee',
    attr: 'volume',
    title: "\u2014 Bowl vs cup",
    blurb: "A ramen bowl holds about two standard cups of coffee.",
    question: "How many coffees fill the ramen bowl?",
  },
  {
    a: 'animal-zebra',
    b: 'horse',
    attr: 'height',
    title: "\u2014 Striped cousin vs work horse",
    blurb: "Zebras and riding horses stand nearly the same height at the shoulder.",
    question: "Which is taller, and how close?",
  },
  {
    a: 'animal-gorilla',
    b: 'animal-panda',
    attr: 'weight',
    title: "\u2014 Two bamboo-adjacent heavyweights",
    blurb: "A silverback gorilla outweighs a giant panda by half again.",
    question: "About how many pandas weigh as much as the gorilla?",
  },
  {
    a: 'animal-rhino',
    b: 'animal-hippo',
    attr: 'weight',
    title: "\u2014 White rhino vs hippo",
    blurb: "Africa\u2019s two river giants: the white rhino edges out the hippo on the scales.",
    question: "Which is heavier?",
  },
  {
    a: 'animal-brown-bear',
    b: 'polarbear',
    attr: 'weight',
    title: "\u2014 Brown bear vs polar bear",
    blurb: "The polar bear is the largest bear \u2014 typically outweighing a brown bear by half.",
    question: "Which bear is heavier?",
  },
  {
    a: 'animal-camel',
    b: 'horse',
    attr: 'height',
    title: "\u2014 Camel vs horse",
    blurb: "A camel, measured to the top of its hump, stands taller than a riding horse.",
    question: "Which stands taller?",
  },
  {
    a: 'animal-llama',
    b: 'animal-goat',
    attr: 'height',
    title: "\u2014 Llama vs goat",
    blurb: "A llama stands more than twice as tall as a typical domestic goat.",
    question: "About how many goats tall is the llama?",
  },
  {
    a: 'animal-sheep',
    b: 'animal-goat',
    attr: 'weight',
    title: "\u2014 Ewe vs doe",
    blurb: "A domestic ewe is typically a bit heavier than a goat of the same age.",
    question: "Which weighs more?",
  },
  {
    a: 'animal-mallard-duck',
    b: 'animal-chicken',
    attr: 'weight',
    title: "\u2014 Duck vs hen",
    blurb: "A mallard weighs a little less than a typical hen.",
    question: "Which is heavier?",
  },
  {
    a: 'animal-mute-swan',
    b: 'penguin',
    attr: 'weight',
    title: "\u2014 Swan vs emperor penguin",
    blurb: "A mute swan weighs about three Emperor penguins \u2014 despite living lighter on the water.",
    question: "How many penguins weigh as much as the swan?",
  },
  {
    a: 'animal-bald-eagle',
    b: 'animal-great-horned-owl',
    attr: 'weight',
    title: "\u2014 Eagle vs owl",
    blurb: "A bald eagle outweighs a great horned owl by roughly three to one.",
    question: "About how many owls weigh as much as the eagle?",
  },
  {
    a: 'animal-harbor-seal',
    b: 'cow',
    attr: 'weight',
    title: "\u2014 Harbor seal vs dairy cow",
    blurb: "A harbor seal weighs about one seventh of a dairy cow.",
    question: "About how many seals weigh as much as the cow?",
  },
  {
    a: 'animal-honeybee',
    b: 'mouse',
    attr: 'length',
    title: "\u2014 Bee vs mouse",
    blurb: "A house mouse is about six honeybees long.",
    question: "About how many bees long is the mouse?",
  },
  {
    a: 'animal-ball-python',
    b: 'rabbit',
    attr: 'length',
    title: "\u2014 Python vs rabbit",
    blurb: "A ball python is about three times as long as a rabbit (head-and-body).",
    question: "About how many rabbits long is the python?",
  },
  {
    a: 'animal-turtle',
    b: 'animal-koala',
    attr: 'length',
    title: "\u2014 Sea turtle vs koala",
    blurb: "A green sea turtle is a little longer than a koala\u2019s body.",
    question: "Which is heavier?",
  },
  {
    a: 'animal-red-kangaroo',
    b: 'adult',
    attr: 'height',
    title: "\u2014 Big red vs person",
    blurb: "A large male red kangaroo, standing upright, can match a typical adult.",
    question: "Who is taller in your class?",
  },
  {
    a: 'delivery-truck',
    b: 'bus',
    attr: 'length',
    title: "\u2014 Box truck vs school bus",
    blurb: "A delivery box truck is shorter than a full-size school bus by nearly half.",
    question: "About how many trucks long is the bus?",
  },
  {
    a: 'fire-engine',
    b: 'delivery-truck',
    attr: 'length',
    title: "\u2014 Fire engine vs box truck",
    blurb: "A fire engine is longer than a delivery truck \u2014 and a lot heavier.",
    question: "Which is heavier?",
  },
  {
    a: 'motorcycle',
    b: 'bicycle',
    attr: 'length',
    title: "\u2014 Two wheels, two engines (one human)",
    blurb: "A motorcycle is only slightly longer than a bicycle \u2014 the difference is mostly mass.",
    question: "Which is heavier?",
  },
  {
    a: 'rocket',
    b: 'bluewhale',
    attr: 'weight',
    title: "\u2014 Saturn V vs blue whale",
    blurb: "Fully fuelled, the Saturn V outweighed the largest animal ever by roughly nineteen to one.",
    question: "About how many blue whales weigh as much as the Saturn V at liftoff?",
  },
  {
    a: 'airplane-737',
    b: 'bluewhale',
    attr: 'length',
    title: "\u2014 737 vs blue whale",
    blurb: "A Boeing 737 is about one and a half blue whales long.",
    question: "How many whales equal one 737?",
  },
  {
    a: 'helicopter',
    b: 'car',
    attr: 'length',
    title: "\u2014 Helicopter vs sedan",
    blurb: "A light helicopter is a little more than twice as long as a mid-size sedan \u2014 rotors included.",
    question: "About how many cars long is the helicopter?",
  },
  {
    a: 'saturn',
    b: 'jupiter',
    attr: 'diameter',
    title: "\u2014 The two giants compared",
    blurb: "Jupiter is the bigger giant \u2014 Saturn is about 84% of its diameter and famous for the rings.",
    question: "How much smaller is Saturn than Jupiter?",
  },
  {
    a: 'saturn',
    b: 'earth',
    attr: 'diameter',
    title: "\u2014 Saturn vs Earth",
    blurb: "More than nine Earths would fit across Saturn\u2019s equator.",
    question: "About how many Earths across is Saturn?",
  },
  {
    a: 'guitar',
    b: 'violin',
    attr: 'weight',
    title: "\u2014 String family sizes",
    blurb: "A full-size violin weighs about a fifth as much as an acoustic guitar.",
    question: "About how many violins weigh as much as the guitar?",
  },
  {
    a: 'trumpet',
    b: 'violin',
    attr: 'length',
    title: "\u2014 Brass vs strings",
    blurb: "A trumpet is a bit shorter than a violin \u2014 all that tubing is coiled inside.",
    question: "Which is heavier?",
  },
  {
    a: 'banjo',
    b: 'guitar',
    attr: 'weight',
    title: "\u2014 Banjo vs guitar",
    blurb: "A five-string banjo outweighs an acoustic guitar by around 70% — resonators are heavy.",
    question: "Which is heavier?",
  },
  {
    a: 'chair',
    b: 'adult',
    attr: 'height',
    title: "\u2014 Chair vs person",
    blurb: "A dining chair\u2019s back reaches about half an adult\u2019s height.",
    question: "About how many chairs tall are you?",
  },
  {
    a: 'chair',
    b: 'child',
    attr: 'height',
    title: "\u2014 Chair vs 8-year-old",
    blurb: "A dining chair stands about two-thirds as tall as an average 8-year-old.",
    question: "About how many toothbrushes long is the broom?",
  },
  {
    a: 'bed-king',
    b: 'tv-85',
    attr: 'width',
    title: "\u2014 King bed vs 85-inch TV",
    blurb: "A King mattress is wider than an 85-inch TV\u2019s screen \u2014 the TV is nearly as wide as your bed.",
    question: "Which is wider?",
  },
  {
    a: 'umbrella',
    b: 'alarm-clock',
    attr: 'diameter',
    title: "\u2014 Canopy vs clock face",
    blurb: "An open umbrella\u2019s canopy is ten alarm-clock faces across.",
    question: "About how many clock faces across is the canopy?",
  },
  {
    a: 'hammer',
    b: 'wrench',
    attr: 'length',
    title: "\u2014 Two toolbox basics",
    blurb: "A 16 oz claw hammer is a bit longer than an 8-inch wrench.",
    question: "Which is heavier?",
  },
  {
    a: 'battery-aa',
    b: 'pencil',
    attr: 'length',
    title: "\u2014 AA vs pencil",
    blurb: "A new pencil is nearly four AA batteries long.",
    question: "About how many batteries long is the pencil?",
  },
  {
    a: 'camera',
    b: 'smartphone',
    attr: 'weight',
    title: "\u2014 Camera vs phone",
    blurb: "A mirrorless camera with kit lens weighs about four flagship phones.",
    question: "About how many phones weigh as much as the camera?",
  },
  {
    a: 'headphones',
    b: 'cat',
    attr: 'weight',
    title: "\u2014 Headphones vs cat",
    blurb: "Your over-ear headphones weigh about as much as one-eighteenth of a cat \u2014 cats are heavier than they look.",
    question: "How much heavier is the cat?",
  },
  {
    a: 'toothbrush',
    b: 'ruler',
    attr: 'length',
    title: "\u2014 Brush vs ruler",
    blurb: "A toothbrush is about two-thirds the length of a 30 cm ruler.",
    question: "Which is heavier?",
  },
  {
    a: 'broom',
    b: 'toothbrush',
    attr: 'length',
    title: "\u2014 Broom vs person",
    blurb: "A push broom is about seven toothbrushes long.",
    question: "About how many toothbrushes long is the broom?",
  },
  {
    a: 'light-bulb',
    b: 'chair',
    attr: 'height',
    title: "\u2014 Bulb vs chair",
    blurb: "A standard A19 bulb stands about one-eighth of a dining chair\u2019s height.",
    question: "About how many bulbs tall is the chair?",
  }
];

export function pairSlug(pair: Pair): string {
  return `${pair.a}-vs-${pair.b}`;
}

export function pairBySlug(slug: string): Pair | null {
  return PAIRS.find((p) => pairSlug(p) === slug) ?? null;
}

/** Integrity check used by tests and by build-time validation. */
export function validatePairs(): { ok: true } | { ok: false; error: string } {
  for (const pair of PAIRS) {
    for (const id of [pair.a, pair.b]) {
      if (!(id in LIBRARY_BY_ID)) return { ok: false, error: `Unknown id: ${id}` };
    }
    const has = [pair.a, pair.b].every((id) => pair.attr in LIBRARY_BY_ID[id].measurements);
    if (!has) {
      return { ok: false, error: `${pair.a} vs ${pair.b}: attribute ${pair.attr} missing` };
    }
  }
  const slugs = new Set(PAIRS.map(pairSlug));
  if (slugs.size !== PAIRS.length) return { ok: false, error: 'Duplicate pair slugs' };
  return { ok: true };
}
