#!/usr/bin/env python3
"""Wave E5: ~77 new curated pairs -> TS fragment appended to PAIRS."""
import json

# (a, b, attr, title, blurb, question)
NEW = [
  # dogs (height/weight)
  ('dog-great-dane', 'dog-chihuahua', 'height', '— The tallest lapdog gap in dogs', 'A Great Dane stands roughly four times taller than a Chihuahua — the widest size spread inside any single species.', 'About how many Chihuahuas tall is the Great Dane?'),
  ('dog-golden-retriever', 'dog-french-bulldog', 'weight', '— Retriever vs French Bulldog', 'A Golden Retriever outweighs a French Bulldog by more than two to one — same species, very different builds.', 'Which is heavier, and by roughly how much?'),
  ('dog-husky', 'dog-pomeranian', 'height', '— Sled dog vs sofa dog', 'A Siberian Husky is about three Pomeranians tall at the shoulder.', 'How many Pomeranians stack up to the Husky?'),
  ('dog-saint-bernard', 'dog-corgi', 'weight', '— Rescue giant vs herding shorty', 'A Saint Bernard weighs roughly five Pembroke Welsh Corgis.', 'About how many Corgis weigh as much as the Saint Bernard?'),
  ('dog-doberman', 'dog-beagle', 'height', '— Guard tower vs scent hound', 'A Doberman stands noticeably taller than a Beagle at the shoulder.', 'Which is taller, and by how many centimetres?'),
  ('dog-rottweiler', 'dog-dalmatian', 'weight', '— Two heavyweights compared', 'A Rottweiler outweighs a Dalmatian by nearly two to one.', 'Roughly how many Dalmatians balance a Rottweiler?'),
  ('dog-great-dane', 'adult', 'height', '— Great Dane vs person', 'A Great Dane standing on its hind legs can look a typical adult in the eye.', 'Is the Dane taller than you on all fours?'),
  ('dog-german-shepherd', 'dog-boxer', 'weight', '— Shepherd vs Boxer', 'German Shepherds and Boxers are close in weight — but the Shepherd stands a bit taller.', 'Which breed is heavier?'),
  # cats
  ('cat-maine-coon', 'cat-siamese', 'weight', '— The gentle giant vs the svelte classic', 'A Maine Coon can weigh more than twice as much as a Siamese.', 'How many Siamese weigh as much as a Maine Coon?'),
  ('cat-maine-coon', 'dog-beagle', 'weight', '— Maine Coon vs Beagle', 'A large Maine Coon weighs about as much as a Beagle — cats rarely get this heavy.', 'Is the Maine Coon really as heavy as a Beagle?'),
  ('cat-persian', 'cat-siamese', 'length', '— Persian vs Siamese', 'The two most famous cat breeds, compared nose-to-body.', 'Which breed is longer?'),
  ('cat-british-shorthair', 'cat-russian-blue', 'weight', '— Two plush blue-greys', 'British Shorthairs run a little heavier than Russian Blues.', 'Which breed weighs more?'),
  # TVs
  ('tv-85', 'tv-43', 'width', '— Home cinema vs living room TV', 'An 85-inch TV is nearly twice as wide as a 43-inch one — measure your wall first.', 'About how many 43-inch TVs wide is the 85?'),
  ('tv-98', 'tv-65', 'width', '— The giant class vs the people’s favourite', 'A 98-inch screen is over one and a half times as wide as the bestselling 65-inch size.', 'How much wider is the 98-inch?'),
  ('tv-75', 'tv-55', 'width', '— Upgrade math', 'Going from 55 to 75 inches adds about a third more screen width — and a lot more impact.', 'How much wider is the 75-inch?'),
  # mattresses
  ('bed-king', 'bed-full', 'width', '— King vs Full', 'A King mattress is about 40 cm wider than a Full — roughly the width of a pillow.', 'How much wider is the King?'),
  ('bed-queen', 'bed-twin', 'width', '— Queen vs Twin', 'A Queen is nearly 60 cm wider than a Twin — the difference between one sleeper and two.', 'About how many Twins across is a Queen?'),
  ('bed-cal-king', 'bed-queen', 'width', '— California King vs Queen', 'The California King trades 10 cm of width for 10 cm of extra length compared to a Queen.', 'Which is wider, and which is longer?'),
  # balls
  ('ball-soccer', 'ball-volleyball', 'diameter', '— Pitch vs court balls', 'A soccer ball and a volleyball are nearly the same size — about 2 cm apart.', 'Which ball is slightly bigger?'),
  ('ball-rugby', 'ball-football', 'length', '— Rugby vs gridiron balls', 'Rugby and American football balls are close cousins — the football is slightly longer and pointier.', 'Which ball is longer?'),
  ('ball-soccer', 'tennisball', 'diameter', '— Soccer vs tennis ball', 'A soccer ball’s diameter is a little over three tennis balls.', 'About how many tennis balls wide is the soccer ball?'),
  ('ball-baseball', 'ball-pingpong', 'diameter', '— Baseball vs ping pong ball', 'A baseball is not quite twice the diameter of a ping pong ball — but nearly eight times heavier per volume.', 'How many ping pong balls across is a baseball?'),
  ('ball-bowling', 'basketball', 'diameter', '— Bowling vs basketball', 'A bowling ball and a basketball are almost identical in diameter — wildly different in mass.', 'Same size — so why does one weigh so much more?'),
  ('ball-hockeypuck', 'ball-baseball', 'diameter', '— Puck vs baseball', 'A hockey puck is nearly the same diameter as a baseball — but flat, frozen, and rubber.', 'Which is wider?'),
  ('8-ball', 'tennisball', 'diameter', '— Pool ball vs tennis ball', 'The pool 8-ball sits comfortably inside a tennis ball’s width.', 'How many 8-balls across is a tennis ball?'),
  # food
  ('watermelon', 'orange', 'diameter', '— Melon vs orange', 'A whole watermelon is nearly four oranges across.', 'About how many oranges across is the watermelon?'),
  ('hamburger', 'donut', 'diameter', '— Burger vs doughnut', 'A quarter-pound burger is just a little wider than a ring doughnut.', 'Which is wider?'),
  ('broccoli', 'mushroom', 'diameter', '— Crown vs button', 'A broccoli crown is about two and a half button mushrooms across.', 'How many mushrooms across is the crown?'),
  ('tomato', 'lemon', 'diameter', '— Salad staples', 'A medium tomato and a lemon are almost the same size — swap-friendly in the kitchen.', 'Which is slightly wider?'),
  ('banana', 'carrot', 'length', '— Fruit bowl vs veg drawer', 'A banana and a carrot are nearly the same length — around 18 cm.', 'Which is longer?'),
  ('corn', 'carrot', 'length', '— Corn vs carrot', 'An ear of corn is slightly longer than a medium carrot.', 'Which is longer, and by how much?'),
  ('baguette', 'pizza-slice', 'length', '— Paris vs Naples', 'A traditional baguette is more than four pizza slices long.', 'About how many slices long is the baguette?'),
  ('hotdog', 'sushi', 'length', '— Street food lengths', 'A hot dog in its bun is about two nigiri pieces long.', 'How many sushi pieces equal a hot dog?'),
  ('taco', 'croissant', 'length', '— Mexico City vs Paris bakeries', 'A taco and a croissant are nearly the same length — about 14–15 cm.', 'Which is longer?'),
  ('avocado', 'peach', 'weight', '— Green gold vs stone fruit', 'A medium avocado weighs about one and a half peaches.', 'Which weighs more?'),
  ('hamburger', 'taco', 'weight', '— Burger vs taco', 'A quarter-pound burger weighs a bit more than a filled taco.', 'Which is heavier?'),
  ('pizza-slice', 'sushi', 'weight', '— Slice vs nigiri', 'One pizza slice weighs about three nigiri pieces.', 'About how many nigiri weigh as much as the slice?'),
  ('bread', 'baguette', 'weight', '— Loaf vs baguette', 'A sandwich loaf outweighs a traditional baguette by nearly two to one.', 'How many baguettes weigh as much as the loaf?'),
  ('beer', 'milk', 'volume', '— Pint vs glass', 'A US pint of beer holds almost exactly twice a standard glass of milk.', 'How many milk glasses fill the pint?'),
  ('ramen', 'coffee', 'volume', '— Bowl vs cup', 'A ramen bowl holds about two standard cups of coffee.', 'How many coffees fill the ramen bowl?'),
  # animals wave 3
  ('animal-zebra', 'horse', 'height', '— Striped cousin vs work horse', 'Zebras and riding horses stand nearly the same height at the shoulder.', 'Which is taller, and how close?'),
  ('animal-gorilla', 'animal-panda', 'weight', '— Two bamboo-adjacent heavyweights', 'A silverback gorilla outweighs a giant panda by half again.', 'About how many pandas weigh as much as the gorilla?'),
  ('animal-rhino', 'animal-hippo', 'weight', '— White rhino vs hippo', 'Africa’s two river giants: the white rhino edges out the hippo on the scales.', 'Which is heavier?'),
  ('animal-brown-bear', 'polarbear', 'weight', '— Brown bear vs polar bear', 'The polar bear is the largest bear — typically outweighing a brown bear by half.', 'Which bear is heavier?'),
  ('animal-camel', 'horse', 'height', '— Camel vs horse', 'A camel, measured to the top of its hump, stands taller than a riding horse.', 'Which stands taller?'),
  ('animal-llama', 'animal-goat', 'height', '— Llama vs goat', 'A llama stands more than twice as tall as a typical domestic goat.', 'About how many goats tall is the llama?'),
  ('animal-sheep', 'animal-goat', 'weight', '— Ewe vs doe', 'A domestic ewe is typically a bit heavier than a goat of the same age.', 'Which weighs more?'),
  ('animal-mallard-duck', 'animal-chicken', 'weight', '— Duck vs hen', 'A mallard weighs a little less than a typical hen.', 'Which is heavier?'),
  ('animal-mute-swan', 'penguin', 'weight', '— Swan vs emperor penguin', 'A mute swan weighs about three Emperor penguins — despite living lighter on the water.', 'How many penguins weigh as much as the swan?'),
  ('animal-bald-eagle', 'animal-great-horned-owl', 'weight', '— Eagle vs owl', 'A bald eagle outweighs a great horned owl by roughly three to one.', 'About how many owls weigh as much as the eagle?'),
  ('animal-harbor-seal', 'cow', 'weight', '— Harbor seal vs dairy cow', 'A harbor seal weighs about one seventh of a dairy cow.', 'About how many seals weigh as much as the cow?'),
  ('animal-honeybee', 'mouse', 'length', '— Bee vs mouse', 'A house mouse is about six honeybees long.', 'About how many bees long is the mouse?'),
  ('animal-ball-python', 'rabbit', 'length', '— Python vs rabbit', 'A ball python is about three times as long as a rabbit (head-and-body).', 'About how many rabbits long is the python?'),
  ('animal-turtle', 'animal-koala', 'length', '— Sea turtle vs koala', 'A green sea turtle is a little longer than a koala’s body.', 'Which is longer?'),
  ('animal-red-kangaroo', 'adult', 'height', '— Big red vs person', 'A large male red kangaroo, standing upright, can match a typical adult.', 'Who is taller in your class?'),
  # vehicles wave 2
  ('delivery-truck', 'bus', 'length', '— Box truck vs school bus', 'A delivery box truck is shorter than a full-size school bus by nearly half.', 'About how many trucks long is the bus?'),
  ('fire-engine', 'delivery-truck', 'length', '— Fire engine vs box truck', 'A fire engine is longer than a delivery truck — and a lot heavier.', 'Which is longer?'),
  ('motorcycle', 'bicycle', 'length', '— Two wheels, two engines (one human)', 'A motorcycle is only slightly longer than a bicycle — the difference is mostly mass.', 'Which is longer?'),
  ('rocket', 'bluewhale', 'length', '— Saturn V vs blue whale', 'The tallest rocket ever flown is more than four blue whales long.', 'About how many whales long is the Saturn V?'),
  ('airplane-737', 'bluewhale', 'length', '— 737 vs blue whale', 'A Boeing 737 is about one and a half blue whales long.', 'How many whales equal one 737?'),
  ('helicopter', 'car', 'length', '— Helicopter vs sedan', 'A light helicopter is a little more than twice as long as a mid-size sedan — rotors included.', 'About how many cars long is the helicopter?'),
  # space
  ('saturn', 'jupiter', 'diameter', '— The two giants compared', 'Jupiter is the bigger giant — Saturn is about 84% of its diameter and famous for the rings.', 'How much smaller is Saturn than Jupiter?'),
  ('saturn', 'earth', 'diameter', '— Saturn vs Earth', 'More than nine Earths would fit across Saturn’s equator.', 'About how many Earths across is Saturn?'),
  # instruments
  ('guitar', 'violin', 'length', '— String family sizes', 'A full-size violin is less than two-thirds the length of an acoustic guitar.', 'How much longer is the guitar?'),
  ('trumpet', 'violin', 'length', '— Brass vs strings', 'A trumpet is a bit shorter than a violin — all that tubing is coiled inside.', 'Which is longer?'),
  ('banjo', 'guitar', 'length', '— Banjo vs guitar', 'A five-string banjo is roughly the same length as an acoustic guitar.', 'Which is longer?'),
  # everyday wave 2
  ('chair', 'adult', 'height', '— Chair vs person', 'A dining chair’s back reaches about half an adult’s height.', 'About how many chairs tall are you?'),
  ('chair', 'child', 'height', '— Chair vs 8-year-old', 'A dining chair stands about two-thirds as tall as an average 8-year-old.', 'Which is taller?'),
  ('bed-king', 'tv-85', 'width', '— King bed vs 85-inch TV', 'A King mattress is wider than an 85-inch TV’s screen — the TV is nearly as wide as your bed.', 'Which is wider?'),
  ('umbrella', 'alarm-clock', 'diameter', '— Canopy vs clock face', 'An open umbrella’s canopy is ten alarm-clock faces across.', 'About how many clock faces across is the canopy?'),
  ('hammer', 'wrench', 'length', '— Two toolbox basics', 'A 16 oz claw hammer is a bit longer than an 8-inch wrench.', 'Which is longer?'),
  ('battery-aa', 'pencil', 'length', '— AA vs pencil', 'A new pencil is nearly four AA batteries long.', 'About how many batteries long is the pencil?'),
  ('camera', 'smartphone', 'weight', '— Camera vs phone', 'A mirrorless camera with kit lens weighs about four flagship phones.', 'About how many phones weigh as much as the camera?'),
  ('headphones', 'cat', 'weight', '— Headphones vs cat', 'Your over-ear headphones weigh about as much as one-eighteenth of a cat — cats are heavier than they look.', 'How much heavier is the cat?'),
  ('toothbrush', 'ruler', 'length', '— Brush vs ruler', 'A toothbrush is about two-thirds the length of a 30 cm ruler.', 'Which is longer?'),
  ('broom', 'adult', 'height', '— Broom vs person', 'A push broom reaches roughly the shoulder of an average adult.', 'Which is taller?'),
  ('light-bulb', 'chair', 'height', '— Bulb vs chair', 'A standard A19 bulb stands about one-eighth of a dining chair’s height.', 'About how many bulbs tall is the chair?'),
]

def ts(p):
    a, b, attr, title, blurb, question = p
    return ("  {\n"
            f"    a: '{a}',\n    b: '{b}',\n    attr: '{attr}',\n"
            f"    title: {json.dumps(title)},\n"
            f"    blurb: {json.dumps(blurb)},\n"
            f"    question: {json.dumps(question)},\n"
            "  }")

out = ',\n'.join(ts(p) for p in NEW)
open('scripts/emoji-tools/wave-pairs.txt', 'w').write(out + '\n')
print('new pairs:', len(NEW))
