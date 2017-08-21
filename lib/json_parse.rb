# JSON hash format example (Animals > Habitats > Menus > Options):
# {"Animals"=> {"Lion (Panthera leo)"=> {"Habitats"=> {"Savannah"=> {"Menus"=> {"Breakfast"=> {"Options"=> ["Mouse","Python","Hare","Bird"]}}}}}}}

require 'hashable'  # use for inline testing
require 'json'  # use for inline testing
require 'pp'  # use for inline testing - pretty print hash for easier review of update_hash() output

require_relative 'json_read.rb'  # use for inline testing


# Class to parse the JSON file at each level (animals, habitats, menus, options)
class JsonParse

  include Hashable

  attr_accessor :json, :json_hash, :id, :name  # id and name required by hashable gem
  attr_reader :json_path, :raw_animals, :raw_habitats, :raw_menus, :raw_options


  def initialize

    file = JsonRead.new
    @json = file.json
    @json_path = file.json_path

    @json_hash = {}  # hold hash-formatted JSON data for deleting items (ExposureUpdater)

    @raw_animals = []  # hold raw lists to reduce JSON parsing
    @raw_habitats = []
    @raw_menus = []
    @raw_options = []

    get_animal_data()

    get_raw_animals()  # call methods to populate raw lists
    get_raw_habitats()
    get_raw_menus()
    get_raw_options()

  end


  # Method to return exposure entries from JSON file
  def get_animal_data()

    @json_hash = @json.to_dh  # hash format for delete methods in JsonUpdate

  end


  # Method to return raw list of all Animals in JSON file
  def get_raw_animals()

    @raw_animals = @json["Animals"]

  end


  # Method to return raw list of all Habitats in JSON file
  def get_raw_habitats()

    raw_habitats = []

    @raw_animals.each do |animal, habitat|
      raw_habitats.push(habitat["Habitats"])
    end

    @raw_habitats = raw_habitats

  end


  # Method to return raw list of all Menus in JSON file
  def get_raw_menus()

    raw_menus = []

    @raw_habitats.each do |habitat|

      values = habitat.values

      values.each do |value|
        raw_menus.push(value["Menus"])
      end

    end

    @raw_menus = raw_menus

  end


  # Method to return raw list of all Options in JSON file
  def get_raw_options()

    raw_options = []

    @raw_menus.each do |menu|

      values = menu.values

      values.each do |value|
        raw_options.push(value["Options"])
      end
    
    end

    @raw_options = raw_options

  end


end


# --- Inline testing ---

# parse = JsonParse.new

# pp parse.json
# pp parse.json_path
# pp parse.json_hash
# pp parse.raw_animals
# pp parse.raw_habitats
# pp parse.raw_menus
# pp parse.raw_options