require 'json'  # use for inline testing
require 'deep_merge'  # use for inline testing (gem install deep_merge)
require 'pp'  # use for inline testing - pretty print hash for easier review of update_hash() output

require_relative 'json_parse.rb'  # use for inline testing
require_relative 'json_compare.rb'  # use for inline testing


# Class to update JSON file with new animal items identified via JsonCompare
class JsonUpdate

  attr_accessor  :raw
  attr_reader :ani, :hab, :menu, :opt

  def initialize()
  
    @raw = JsonParse.new
    @compare = ""

    @ani = ""  # target animal branch marked for deletion
    @hab = ""  # target habitat branch marked for deletion
    @menu = ""  # target menu branch marked for deletion
    @opt = ""  # target option marked for deletion

  end


  # Method to format animal_array as animal_hash to prepare for JSON merge
  def make_animal_hash(animal_array)

    animal_hash = {
      "Animals" => { animal_array[0] => {
        "Habitats" => { animal_array[1] => {
          "Menus" => { animal_array[2] => {
            "Options" => [ animal_array[3] ]
            } }
          } }
        } }
      }

  end


  # Method to strip '<' and '>' from exposure instance variables for messaging
  def strip_carets(inst_var_hash)

    inst_var_hash.each do |string|
      string[0] = "" if string[0] == "<"
      string[-1] = "" if string[-1] == ">"
    end

  end


  # Method to assign exposure array items to instance variables when deleting items
  def define_exp_items(animal_array)

    @ani = animal_array[0]
    @hab = animal_array[1]
    @menu = animal_array[2]
    @opt = animal_array[3]

    strip_carets([@ani, @hab, @menu, @opt])

  end


  # Method to merge a submitted animal hash into the JSON file
  def json_extend(animal_array)

    json = @raw.json

    animal_hash = make_animal_hash(animal_array)
    File.open(@raw.json_path, "w") { |f| f.puts JSON.pretty_generate(json.deep_merge!(animal_hash)) }

  end


  # Method to evaluate specified item(s) prior to extending the JSON file
  def json_eval_merge(animal_array)

    puts "animal_array: #{animal_array}"

    invalid = ["Select an Animal...", "Select a Habitat...", "Select a Menu...", "Select an Option...", "All Habitats", "All Menus", "All Options"]

    if (animal_array & invalid).length > 0 || animal_array[0] == ""
      feedback = msg_update_status("invalid_add")
    else
      json_extend(animal_array)
      feedback = msg_update_status("valid_add")
    end

  end


  # Method to save pruned JSON hash to JSON file
  def json_prune()

    File.open(@raw.json_path, "w") { |f| f.puts JSON.pretty_generate(@raw.json_hash) }

  end


  # Method to delete specified animal branch, call if lower-levels are 0
  def delete_exp_area()

    @raw.json_hash["Animals"].tap do |animal|
      animal.delete(@ani)
    end

    json_prune()

  end


  # Method to delete specified habitat branch, call if lower-levels are 0
  def delete_habitat()

    @raw.json_hash["Animals"][@ani]["Habitats"].tap do |habitats|
      habitats.delete(@hab)
    end

    json_prune()

  end


  # Method to delete specified menu branch, call if lower-levels are 0
  def delete_menu()

    @raw.json_hash["Animals"][@ani]["Habitats"][@hab]["Menus"].tap do |menus|
      menus.delete(@menu)
    end

    json_prune()

  end


  # Method to delete specified option
  def delete_option()

    @raw.json_hash["Animals"][@ani]["Habitats"][@hab]["Menus"][@menu]["Options"].tap do |options|
      options.delete(@opt)
    end

    json_prune()

  end


  # Method to prune specified item(s) from the JSON hash
  # - example valid path: ["Lion (Panthera leo)", "Savannah", "Breakfast", "Mouse"]
  def json_eval_del(animal_array)

    @compare = JsonCompare.new(animal_array)
    eval_array = [@compare.match_animal, @compare.match_habitat, @compare.match_menu, @compare.match_option]
    all = ["All Habitats", "All Menus", "All Options"]

    if eval_array == [true, true, true, true]  # if full path is specified
      delete_option(); feedback = msg_update_status("valid_del")
    elsif eval_array == [true, true, true, false]  # if menu branch is specified
      (all & [@opt]).length == 1 ? (delete_menu(); feedback = msg_update_status("valid_del")) : feedback = msg_update_status("invalid_del")
    elsif eval_array == [true, true, false, false]  # if habitat branch is specified
      (all & [@menu, @opt]).length == 2 ? (delete_habitat(); feedback = msg_update_status("valid_del")) : feedback = msg_update_status("invalid_del")
    elsif eval_array == [true, false, false, false]  # if animal branch is specified
      (all & [@hab, @menu, @opt]).length == 3 ? (delete_exp_area(); feedback = msg_update_status("valid_del")) : feedback = msg_update_status("invalid_del")
    else
      feedback = msg_update_status("invalid_del")
    end

    return feedback

  end


  # Method to message on valid/invalid updates
  def msg_update_status(status)

    merge_success = "Animal path successfully added: "
    merge_fail = "Invalid animal path specified: "
    del_success = "Animal path successfully deleted: "
    del_fail = "Animal path not found, please try again: "

    if status == "valid_add"
      feedback = merge_success << "&&&#{@ani} > #{@hab} > #{@menu} > #{@opt}"
    elsif status == "invalid_add"
      feedback = merge_fail << "&&&#{@ani} > #{@hab} > #{@menu} > #{@opt}"
    elsif status == "valid_del"
      feedback = del_success << "&&&#{@ani} > #{@hab} > #{@menu} > #{@opt}"
    elsif status == "invalid_del"
      feedback = del_fail << "&&&#{@ani} > #{@hab} > #{@menu} > #{@opt}"
    end

    return feedback

  end


  # Method to drive JSON extending and pruning methods
  def update_json(animal_array, change_type)

    puts "update_json - animal_array: #{animal_array}"

    define_exp_items(animal_array)

    if change_type == "extend"
      feedback = json_eval_merge(animal_array)
    elsif change_type == "prune"
      feedback = json_eval_del(animal_array)
    end

  end


end