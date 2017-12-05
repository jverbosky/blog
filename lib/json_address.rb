require 'json'  # use for inline testing
require 'pp'  # use for inline testing - pretty print hash for easier review of update_hash() output

require_relative 'json_parse.rb'  # use for inline testing


# Class to hierarchically address (key) every item (animal.habitat.menu.option)
class JsonAddress

  # attr_reader :keyed_animals, :keyed_habitats, :keyed_menus, :keyed_options
  attr_reader :keyed_animals, :keyed_habitats, :keyed_menus_raw, :keyed_menus, :keyed_options_raw, :keyed_options  # use for inline testing

  def initialize

    @raw = JsonParse.new

    @keyed_animals = {}  # keyed hashes for mapping hierarchy
    @keyed_habitats = {}
    @keyed_menus_raw = []  # ungrouped menus
    @keyed_menus = []  # nested menu hashes due to overlapping key values
    @keyed_options_raw = []  # ungrouped options
    @keyed_options = []  # nested option hashes due to overlapping key values

    @habitats_sec_subkeys = []  # helper array for keying menus
    @menus_sec_subkeys = []  # helper array for keying options

    key_animals()  # call methods to develop relational hierarchy of keyed values for mapping locations
    key_habitats()
    get_habitats_sec_subkeys()  # helper for mapping relationship between habitats and menus
    key_menus_raw()  # helper for creating non-grouped array of menu hashes
    key_menus()
    get_menus_sec_subkeys()  # helper for mapping relationship between menus and options
    key_options_raw()  # helper for creating non-grouped array of option hashes
    key_options()

  end


  # Method to create hash of animal values with keys mapped to location in JSON hierarchy
  def key_animals()

    animal_position = 1

    @raw.raw_animals.each_key do |key|
      @keyed_animals["#{animal_position}"] = key
      animal_position += 1
    end

  end


  # Method to create hash of habitat values with relational keys mapped to location in JSON hierarchy
  def key_habitats()

    animal_position = 1

    @raw.raw_habitats.each do |habitat_hash|

      unless habitat_hash == {}

        habitat_position = 1

        habitat_hash.each_key do |key|
          @keyed_habitats["#{animal_position}.#{habitat_position}"] = key
          habitat_position += 1
        end

        animal_position += 1

      end

    end

  end


  # Method to create array of habitat subkeys to ensure menu items are keyed relationally to habitat items
  def get_habitats_sec_subkeys()
    
    @keyed_habitats.each_key do |key| 
      subkey = key.split('.')[-1]  # get second number in key (ex: "2.4" -> "4")
      @habitats_sec_subkeys.push(subkey)
    end

  end


  # Method to create hash of menu values with relational keys mapped to location in JSON hierarchy
  def key_menus_raw()

    habitat_sec_subkeys_position = 0

    @raw.raw_menus.each do |menus_set|

      menus_group = {}
      menu_keys_subposition = 1

      menus_set.each_key do |menu|
        menus_group["#{@habitats_sec_subkeys[habitat_sec_subkeys_position]}.#{menu_keys_subposition}"] = menu
        menu_keys_subposition += 1
      end

      habitat_sec_subkeys_position += 1
      @keyed_menus_raw.push(menus_group)

    end

  end


  # Method to group keyed menus to correspond to habitat subkeys
  def key_menus()

    counter = 1
    menu_hash_group = []  # temp array to hold each group of keyed menus (corresponds to each habitat item)

    @keyed_menus_raw.each do |menu_hash|

      unless menu_hash == {}  # skip if all menus have been deleted

        habitat_group = menu_hash.first[0].split('.')[0].to_i  # first number in first hash item's address

        if habitat_group == counter
          menu_hash_group.push(menu_hash)
          counter +=1
        else
          @keyed_menus.push(menu_hash_group)  # push the current menu hash group to the instance array
          menu_hash_group = []  # re-initialize the temp array
          menu_hash_group.push(menu_hash)  # push the current hash (1.x) to the temp array
          counter = 2  # set the counter to 2 to potentially match the next hash (2.x) on next iteration
        end

      end

    end

    @keyed_menus.push(menu_hash_group)  # push the last menu hash group to the instance array

  end


  # Method to create array of menu subkeys to ensure option items are keyed relationally to menu items
  def get_menus_sec_subkeys()
    
    @keyed_menus.each do |menu_group_set|

      menu_group_set.each do |menu_group|

        menu_group.each_key do |key|
          subkey = key.split('.')[-1]  # get second number in key (ex: "2.4" -> "4")
          @menus_sec_subkeys.push(subkey)
        end

      end

    end

  end


  # Method to create hash of option values with keys mapped to location in JSON hierarchy
  def key_options_raw()

    menu_sec_subkeys_position = 0

    @raw.raw_options.each do |options_set|

      options_group = {}
      option_keys_subposition = 1

      options_set.each do |option|
        options_group["#{@menus_sec_subkeys[menu_sec_subkeys_position]}.#{option_keys_subposition}"] = option
        option_keys_subposition += 1
      end

      menu_sec_subkeys_position += 1
      @keyed_options_raw.push(options_group)

    end

  end


  # Method to group keyed options to correspond to menu subkeys
  def key_options()

    counter = 1
    option_hash_group = []  # temp array to hold each group of keyed options (corresponds to each menu item)

      @keyed_options_raw.each do |option_hash|

        unless option_hash == {}  # skip if all options have been deleted

          menu_group = option_hash.first[0].split('.')[0].to_i  # first number in first hash item's address

          if menu_group == counter
            option_hash_group.push(option_hash)
            counter +=1
          else
            @keyed_options.push(option_hash_group)  # push the current option hash group to the instance array
            option_hash_group = []  # re-initialize the temp array
            option_hash_group.push(option_hash)  # push the current hash (1.x) to the temp array
            counter = 2  # set the counter to 2 to potentially match the next hash (2.x) on next iteration
          end

        end

      end

      @keyed_options.push(option_hash_group)  # push the last option hash group to the instance array

  end


end


# --- Inline testing ---

# address = JsonAddress.new

# pp address.keyed_animals
# pp address.keyed_habitats
# pp address.keyed_menus_raw
# pp address.keyed_menus
# pp address.keyed_options_raw
# pp address.keyed_options