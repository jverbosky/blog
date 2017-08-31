require 'json'  # use for inline testing
require 'pp'  # use for inline testing - pretty print hash for easier review of update_hash() output

require_relative 'json_parse.rb'  # use for inline testing


# Class to filter (and sort) unique items from each level for drop-down population
class JsonFilter

  attr_reader :animals, :habitats, :menus, :options


  def initialize

    @raw = JsonParse.new

    @animals = []  # filtered, sorted arrays
    @habitats = []
    @menus = []
    @options = []

    get_animals()  # call methods to populate filtered, sorted arrays
    get_habitats()
    get_menus()
    get_options()

  end


  # Method to return sorted list of Animals
  def get_animals()

    puts "This is output from a method..."
    @animals = @raw.raw_animals.keys.uniq.sort_by(&:downcase)

  end


  # Method to return sorted, unique Habitats entries from JSON file
  def get_habitats()

    all_habitats = []

    @raw.raw_habitats.each do |habitat|
      all_habitats.push(habitat.keys)
    end

    @habitats = all_habitats.flatten.uniq.sort_by(&:downcase)

  end


  # Method to return sorted, unique Menus entries from JSON file
  def get_menus()

    all_menus = []

    @raw.raw_menus.each do |menu|     
      all_menus.push(menu.keys)
    end

    @menus = all_menus.flatten.uniq.sort_by(&:downcase)

  end


  # Method to return sorted, unique Options entries from JSON file
  def get_options()

    all_options = []

    @raw.raw_options.each do |set|
        
      set.each do |option|
        all_options.push(option)
      end

    end

    @options = all_options.flatten.uniq.sort_by(&:downcase)

  end


end


# --- Inline testing ---

# filter = JsonFilter.new

# pp filter.animals
# pp filter.habitats
# pp filter.menus
# pp filter.options