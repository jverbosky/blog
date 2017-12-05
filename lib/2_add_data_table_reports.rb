# Example program to insert data into species_details and sighting_details tables

require 'pg'
load "./local_env.rb" if File.exists?("./local_env.rb")

begin

  # connect to the database
  db_params = {
        host: ENV['dbhost'],  # AWS link
        port:ENV['dbport'],  # AWS port, always 5432
        dbname:ENV['dbname'],
        user:ENV['dbuser'],
        password:ENV['dbpass']
      }
  conn = PG::Connection.new(db_params)

# ------------------- initialize species_sets data -----------------------------

  # common_name, scientific_name, kingdom, phylum, class, order, family, subfamily, genus, description
  # filter ideas: order, diet (description string contains - insects, fruits, seeds)

  # initialize species_details data sets
  species_1 = ["American Goldfinch", "Spinus tristis", "Animalia", "Chordata", "Aves", "Passeriformes", "Fringillidae", "Carduelinae", "Spinus", "The American goldfinch is a small finch, 11 to 14 cm (4.3 to 5.5 in) long, with a wingspan of 19 to 22 cm (7.5 to 8.7 in). It weighs between 11 to 20 g (0.39 to 0.71 oz). The beak is small, conical, and pink for most of the year, but turns bright orange with the spring molt in both sexes. The shape and size of the beak aid in the extraction of seeds from the seed heads of thistles, sunflowers, and other plants."]
  species_2 = ["Carolina Wren", "Thryothorus ludovicianus", "Animalia", "Chordata", "Aves", "Passeriformes", "Troglodytidae", nil, "Thryothorus", "At 12.5 to 14 cm (4.9 to 5.5 in) long, with a 29 cm (11 in) wingspan and a weight of about 18 to 23 g (0.63 to 0.81 oz), the Carolina wren is a fairly large wren; the second largest in the United States species after the cactus wren. Their diet consists of invertebrates, such as beetles, true bugs, grasshoppers, katydids, spiders, ants, bees and wasps."]
  species_3 = ["House Finch", "Haemorhous mexicanus", "Animalia", "Chordata", "Aves", "Passeriformes", "Fringillidae", "Carduelinae", "Haemorhous", "Adult birds are 12.5 to 15 cm (4.9 to 5.9 in) and span 20 to 25 cm (7.9 to 9.8 in). Body mass can vary from 16 to 27 g (0.56 to 0.95 oz), with an average weight of 21 g (0.74 oz). House finches forage on the ground or in vegetation normally. They primarily eat grains, seeds and berries, being voracious consumers of weed seeds such as nettle and dandelion; included are incidental small insects such as aphids."]
  species_4 = ["Indigo Bunting", "Passerina cyanea", "Animalia", "Chordata", "Aves", "Passeriformes", "Cardinalidae", nil, "Passerina", "The indigo bunting is a smallish songbird, around the size of a small sparrow. It measures 11.5 to 15 cm (4.5 to 5.9 in) long, with a wingspan of 18 to 23 cm (7.1 to 9.1 in). Body mass averages 14.5 g (0.51 oz), with a reported range of 11.2 to 21.4 g (0.40 to 0.75 oz). During the breeding season they eat insects, seeds and berries, including caterpillars, grasshoppers, spiders, beetles and grass seeds."]
  species_5 = ["Northern Cardinal", "Cardinalis cardinalis", "Animalia", "Chordata", "Aves", "Passeriformes", "Cardinalidae", nil, "Cardinalis", "The northern cardinal is a mid-sized songbird with a body length of 21 to 23 cm (8.3 to 9.1 in). It has a distinctive crest on the head and a mask on the face which is black in the male and gray in the female. The male is a vibrant red, while the female is a dull reddish olive. The northern cardinal is mainly granivorous, but also feeds on insects and fruit."]
  species_6 = ["Northern Flicker", "Colaptes auratus", "Animalia", "Chordata", "Aves", "Piciformes", "Picidae", nil, "Colaptes", "Adults are brown with black bars on the back and wings. A mid- to large-sized woodpecker, measures 28 to 36 cm (11 to 14 in) in length and 42 to 54 cm (17 to 21 in) in wingspan. The body mass can vary from 86 to 167 g (3.0 to 5.9 oz). Although they eat fruits, berries, seeds and nuts, their primary food is insects. Ants alone can make up almost half of their diet."]
  species_7 = ["Pileated Woodpecker", "Dryocopus pileatus", "Animalia", "Chordata", "Aves", "Piciformes", "Picidae", nil, "Dryocopus", "Adults are 40 to 49 cm (16 to 19 in) long, span 66 to 75 cm (26 to 30 in) across the wings, and weigh 250 to 400 g (8.8 to 14.1 oz), with an average weight of 300 g (11 oz). These birds mainly eat insects, especially carpenter ants and wood-boring beetle larvae. They also eat fruits, nuts, and berries, including poison ivy berries."]
  species_8 = ["Red-Bellied Woodpecker", "Melanerpes carolinus", "Animalia", "Chordata", "Aves", "Piciformes", "Picidae", "Picinae", "Melanerpes", "They are 22.85 to 26.7 cm (9 to 10.51 in) long, and have a wingspan of 38 to 46 cm (15 to 18 in). The woodpecker uses its bill for foraging as a chisel drilling into bark or probing cracks on trunk of trees. In this manner, the red-bellied woodpecker is able to pull out beetles and other insects from the tree with the help of its long tongue."]
  species_9 = ["Red-Tailed Hawk", "Buteo jamaicensis", "Animalia", "Chordata", "Aves", "Accipitriformes", "Accipitridae", nil, "Buteo", "Adults typically weigh from 690 to 1,600 g (1.5 to 3.5 lb) and measure 45 to 65 cm (18 to 26 in) in length, with a wingspan from 110 to 145 cm (43 to 57 in). The red-tailed hawk displays sexual dimorphism in size, with females typically a quarter heavier than males. Their most common prey are small mammals such as rodents and lagomorphs, but they will also consume birds, fish, reptiles and amphibians."]
  species_10 = ["Rose-Breasted Grosbeak", "Pheucticus ludovicianus", "Animalia", "Chordata", "Aves", "Passeriformes", "Cardinalidae", nil, "Pheucticus", "Adult birds are 18 to 22 cm (7.1 to 8.7 in) long, span 29 to 33 cm (11 to 13 in) across the wings and weigh 35 to 65 g (1.2 to 2.3 oz). The rose-breasted grosbeak forages in shrubs or trees for insects, seeds and berries, also catching insects in flight and occasionally eating nectar. It usually keeps to the treetops, and only rarely can be seen on the ground."]
  species_11 = ["Turkey Vulture", "Cathartes aura", "Animalia", "Chordata", "Aves", "Accipitriformes", "Cathartidae", nil, "Cathartes", "A large bird, it has a wingspan of 160 to 183 cm (63 to 72 in), a length of 62 to 81 cm (24 to 32 in), and weight of 0.8 to 2.41 kg (1.8 to 5.3 lb). The turkey vulture feeds primarily on a wide variety of carrion, from small mammals to large grazers, preferring those recently dead, and avoiding carcasses that have reached the point of putrefaction. They may rarely feed on plant matter, shoreline vegetation, pumpkin, coconut and other crops, live insects and other invertebrates."]

  # aggregate species_details data into multi-dimensional array for iteration
  species_sets = []
  species_sets.push(species_1, species_2, species_3, species_4, species_5, species_6, species_7, species_8, species_9, species_10, species_11)

# ------------------- load species_sets data -----------------------------

  # iterate through multi-dimensional species_sets array for data
  species_sets.each do |species|

    # initialize variables for SQL insert statements
    v_common_name = species[0]
    v_scientific_name = species[1]
    v_kingdom = species[2]
    v_phylum = species[3]
    v_class = species[4]
    v_order = species[5]
    v_family = species[6]
    v_subfamily = species[7]
    v_genus = species[8]
    v_description = species[9]

    # prepare SQL statement to insert species data into species_details table
    conn.prepare('q_statement',
                 "insert into species_details (common_name, scientific_name, s_kingdom, s_phylum, s_class, s_order, s_family, s_subfamily, s_genus, description)
                  values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)")  # bind parameters

    # execute prepared SQL statement
    conn.exec_prepared('q_statement', [v_common_name, v_scientific_name, v_kingdom, v_phylum, v_class, v_order, v_family, v_subfamily, v_genus, v_description])

    # deallocate prepared statement variable (avoid error "prepared statement already exists")
    conn.exec("deallocate q_statement")

  end

# ------------------- initialize sighting_sets data -----------------------------

  # species_id, location, habitat, date, time, notes, photos
  # filter ideas: location, habitat, season (calculate based on months)

  # initialize sighting_details data sets
  sighting_1 = [1, "Bethel Park, PA", "Suburban", "2017-04-23", "10:30", "The goldfinch pair is back and are nesting in the front yard again this year. I saw the male several times this morning around the butterfly bushes.", "american_goldfinch_s1_01.png,american_goldfinch_s1_02.png,american_goldfinch_s1_03.png,american_goldfinch_s1_04.png,american_goldfinch_s1_05.png,american_goldfinch_s1_06.png,american_goldfinch_s1_07.png,american_goldfinch_s1_08.png"]
  sighting_2 = [1, "Warren, OH", "Suburban", "2017-08-06", "18:00", "I saw several pairs of goldfinches flying in for the sunflower seed that my parents have in their feeders. They didn't spend a lot of time at the feeders - just grabbed seed and returned to the large maples in the yard.", "american_goldfinch_s2.png"]
  sighting_3 = [2, "Bethel Park, PA", "Suburban", "2017-11-11", "22:00", "A pair of carolina wrens were sleeping next to each other under the back porch overhang. I had to identify them from the pictures I took as it wasn't clear which birds they were when I initially spotted them.", "carolina_wren_s3.png"]
  sighting_4 = [3, "Bethel Park, PA", "Suburban", "2017-03-05", "14:15", "The house finch pair has returned and is nesting again under the back porch overhang. The female seems to have a clutch of eggs already, as she only leaves the nest when the back door opens.", "house_finch_s4.png"]
  sighting_5 = [3, "Waynesburg, PA", "Rural", "2017-06-19", "16:30", "Spotted a house finch on a bird feeder while driving home from work.", nil]
  sighting_6 = [3, "Warren, OH", "Suburban", "2017-07-16", "15:00", "Several house finches helped themselves to the sunflower seeds at feeders in my parents' front yard this afternoon.", "house_finch_s6.png"]
  sighting_7 = [4, "Robinson Township, PA", "Urban", "2017-04-10", "12:45", "I saw an indigo bunting for the first time in my life while waiting for my sister outside her office. It was jumping from branch to branch in a large oak tree, until it finally flew away after several minutes. Very bright blue.", "indigo_bunting_s7.png"]
  sighting_8 = [5, "Bethel Park, PA", "Suburban", "2017-02-05", "08:00", "The cardinal pair has been quite active this morning in the firebushes on the side of the house.", "northern_cardinal_s8_01.png,northern_cardinal_s8_02.png,northern_cardinal_s8_03.png,northern_cardinal_s8_04.png,northern_cardinal_s8_05.png,northern_cardinal_s8_06.png,northern_cardinal_s8_07.png,northern_cardinal_s8_08.png,northern_cardinal_s8_09.png"]
  sighting_9 = [5, "Warren, OH", "Suburban", "2017-08-06", "17:15", "There were at least seven male cardinals at my parents' feeder this afternoon, quite a popular place to be!", nil]
  sighting_10 = [6, "Bethel Park, PA", "Suburban", "2017-06-17", "14:30", "The neighborhood flicker flew down to the back yard and picked around the flower beds. The flash of yellow under his wings when he flies off is as bright as ever.", "northern_flicker_s10.png"]
  sighting_11 = [7, "Bethel Park, PA", "Suburban", "2017-05-07", "15:00", "I saw the largest woodpecker that I've ever seen in my life near the woodpile on the side of Ed's house. It was larger than a crow and had a brilliant red head. After some quick research, determined it was this kind.", "pileated_woodpecker_s11.png"]
  sighting_12 = [8, "Bethel Park, PA", "Suburban", "2017-05-21", "09:30", "A red-bellied woodpecker has been pretty busy lately on the dead white pines up on the hill. ", "red_bellied_woodpecker_s12.png"]
  sighting_13 = [8, "Warren, OH", "Suburban", "2017-08-12", "17:15", "A pair of red-bellied woodpeckers flew in for some suet that my parents put out. When they come in, the grackles and other blackbirds get out of the way as quickly as possible.", nil]
  sighting_14 = [9, "Bethel Park, PA", "Suburban", "2017-08-20", "13:30", "A pair of red-tailed hawks has moved into the neightborhood and the gang of crows that live in the woods out back are not pleased - they've been fighting since this morning. Would be nice if the hawks evicted the crows so I don't lose so much fruit from the trees...", "red_tailed_hawk_s14.png"]
  sighting_15 = [9, "Waynesburg, PA", "Rural", "2017-10-24", "17:30", "Saw a number of red-tailed hawks on poles during my drive home. Seeing one or two isn't unusual, but there were more than usual out today.", nil]
  sighting_16 = [9, "Robinson Township, PA", "Urban", "2017-11-04", "10:45", "There was a dead red-tailed hawk on the side of the road while on my way up to see my parents. I was tempted to grab some tail feathers for the kids, but wasn't sure how long it had been sitting there so decided against it.", nil]
  sighting_17 = [10, "Warren, OH", "Suburban", "2017-04-09", "18:00", "A rose-breasted grosbeak made an appearance at the feeder for some sunflower seed.", "rose_breasted_grosbeak_s17.png"]
  sighting_18 = [10, "Warren, OH", "Suburban", "2017-08-06", "16:30", "There was a pair of rose-breased grosebeaks at the feeder today. First time in a while that I've seen the female while visiting my parents.", "rose_breasted_grosbeak_s18.png"]
  sighting_19 = [11, "Waynesburg, PA", "Rural", "2017-06-19", "07:45", "I counted at least forty turkey vultures while coming in to work this morning. Haven't seen that many all flying together in a long time.", "turkey_vulture_s19.png"]
  sighting_20 = [11, "Bethel Park, PA", "Suburban", "2017-08-20", "10:30", "A turkey vulture landed on the back hill about fifty feet away from me while I was walking the dogs. First time that I've had one land that close to me and it definitely looked like a vulture.", nil]

  # aggregate sighting_details data into multi-dimensional array for iteration
  sighting_sets = []
  sighting_sets.push(sighting_1, sighting_2, sighting_3, sighting_4, sighting_5, sighting_6, sighting_7, sighting_8, sighting_9, sighting_10, sighting_11, sighting_12, sighting_13, sighting_14, sighting_15, sighting_16, sighting_17, sighting_18, sighting_19, sighting_20)

# ------------------- load sighting_sets data -----------------------------

  # iterate through multi-dimensional sighting_sets array for data
  sighting_sets.each do |sighting|

    # initialize variables for SQL insert statements
    v_species_id = sighting[0]
    v_location = sighting[1]
    v_habitat = sighting[2]
    v_date = sighting[3]
    v_time = sighting[4]
    v_notes = sighting[5]
    v_photos = sighting[6]

    # prepare SQL statement to insert sighting data into sighting_details table
    conn.prepare('q_statement',
                 "insert into sighting_details (species_id, location, habitat, date, time, notes, photos)
                  values($1, $2, $3, $4, $5, $6, $7)")  # bind parameters


    # execute prepared SQL statement
    conn.exec_prepared('q_statement', [v_species_id, v_location, v_habitat, v_date, v_time, v_notes, v_photos])

    # deallocate prepared statement variable (avoid error "prepared statement already exists")
    conn.exec("deallocate q_statement")

  end

rescue PG::Error => e

  puts 'Exception occurred'
  puts e.message

ensure

  conn.close if conn

end