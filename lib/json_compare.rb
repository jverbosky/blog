require 'json'  # use for inline testing

require_relative 'json_parse.rb'  # use for inline testing
require_relative 'json_address.rb'  # use for inline testing


# Class to compare a single animal set to the existing JSON entries to identify new item(s) and location(s)
class JsonCompare

  # attr_reader :eval_animal, :eval_habitat, :eval_menu, :eval_option, :match_animal, :match_habitat, :match_menu, :match_option, :animal_key, :habitat_key, :menu_key, :option_key
  attr_reader :addressed, :eval_animal, :eval_habitat, :eval_menu, :eval_option, :match_animal, :match_habitat, :match_menu, :match_option, :animal_key, :habitat_key, :menu_key, :option_key  # use for inline testing


  def initialize(animal_array)

    @addressed = JsonAddress.new

    @eval_animal = ""  # hold animal array values for comparison
    @eval_habitat = ""
    @eval_menu = ""
    @eval_option = ""

    @match_animal = false  # track animal item comparisons
    @match_habitat = false
    @match_menu = false
    @match_option = false

    @animal_key = 0  # track address of each animal item
    @habitat_key = 0
    @menu_key = 0
    @option_key = 0

    parse_animal_array(animal_array)
    animal_exist?()
    habitat_exist?()
    menu_exist?()
    option_exist?()

  end


  # Method to assign animal array values to animal info instance variables
  def parse_animal_array(animal_array)

    @eval_animal = animal_array[0]
    @eval_habitat = animal_array[1]
    @eval_menu = animal_array[2]
    @eval_option = animal_array[3]

  end


  # Method to compare animal from POST against animals in JSON
  def animal_exist?()

    @addressed.keyed_animals.each do |key, value|

      if value == @eval_animal
        @match_animal = true
        @animal_key = key
        break
      end

    end

  end


  # Method to compare habitat from POST against habitats in JSON
  def habitat_exist?()

    unless @match_animal == false  # if there is no match on higher level item, skip evaluation

      @addressed.keyed_habitats.each do |key, value|

        if key.split('.')[0] == @animal_key  # compare first number in key (ex: "2.4" -> "2")

          if value == @eval_habitat
            @match_habitat = true
            @habitat_key = key.split('.')[-1]  # get second number in key (ex: "2.4" -> "4")
            break
          end

        end

      end

    end

  end


  # Method to compare menu from POST against menus in specified habitat branch of JSON
  def menu_exist?()

    unless @match_habitat == false  # if there is no match on higher level item, skip evaluation

      unless @addressed.keyed_menus[(@animal_key.to_i - 1)] == nil  # skip if target menu hash is empty (all menus deleted)

        # select the keyed_menus group that corresponds to the animal key
        @addressed.keyed_menus[(@animal_key.to_i - 1)].each do |keyed_menu|

          keyed_menu.each do |key, value|

            if key.split('.')[0] == @habitat_key  # compare first number in key (ex: "2.4" -> "2")

              if value == @eval_menu
                @match_menu = true
                @menu_key = key.split('.')[-1]  # get second number in key (ex: "2.4" -> "4")
                break
              end

            end

          end

        end

      end

    end

  end


  # Method to compare option from AJAX request against options in JSON
  def option_exist?()

    unless @match_menu == false  # if there is no match on higher level item, skip evaluation

      habitat_address = "#{@animal_key}.#{@habitat_key}"  # current address for eval habitat (ex: "2.4")
      habitat_index = @addressed.keyed_habitats.find_index { | key, _ | key == habitat_address }  # index of habitat item with habitat_address

      unless @addressed.keyed_options[habitat_index] == nil  # skip if target option array is empty (all options deleted)

        # select the keyed_options group that corresponds to the habitat index
        @addressed.keyed_options[habitat_index].each do |keyed_option|

          keyed_option.each do |key, value|

            if key.split('.')[0] == @menu_key  # compare first number in key (ex: "2.4" -> "2")

              if value == @eval_option
                @match_option = true
                @option_key = key.split('.')[-1]  # get second number in key (ex: "2.4" -> "4")
                break
              end

            end

          end

        end

      end

    end

  end

end


# --- Inline testing ---

# {"Lion (Panthera leo)"=> {"Habitats"=> {"Savannah"=> {"Menus"=> {"Breakfast"=> {"Options"=> ["Mouse","Python","Hare","Bird"]}}}}}}}

# animal_array = ["Lion (Panthera leo)", "Savannah", "Breakfast", "Mouse"]
# 1.1.1.1

# animal_array = ["Tiger (Panthera tigris)", "Jungle", "Dinner", "Rhinoceros Calf"]
# 2.2.3.5

# animal_array = ["Lion (Panthera leo)", "Savannah", "Breakfast", "Invalid"]
# 1.1.1.0

# animal_array = ["Lion (Panthera leo)", "Savannah", "Invalid", "Invalid"]
# 1.1.0.0

# animal_array = ["Lion (Panthera leo)", "Invalid", "Invalid", "Invalid"]
# 1.0.0.0

# animal_array = ["Invalid", "Invalid", "Invalid", "Invalid"]
# 0.0.0.0

# compare = JsonCompare.new(animal_array)

# puts compare.eval_animal
# puts compare.eval_habitat
# puts compare.eval_menu
# puts compare.eval_option

# puts compare.match_animal
# puts compare.match_habitat
# puts compare.match_menu
# puts compare.match_option

# puts compare.animal_key
# puts compare.habitat_key
# puts compare.menu_key
# puts compare.option_key