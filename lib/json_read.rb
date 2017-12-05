# require 'json'  # use for inline testing

require_relative 'json_select.rb'  # use for inline testing


# Class to open the JSON file, leveraged by JsonParse class
class JsonRead

  attr_accessor :json_path, :json
  

  def initialize()

    @json_path = "public/json/#{JsonSelect.instance.anitype}.json"  # production app version
    # @json_path = "../public/json/#{JsonSelect.instance.anitype}.json"  # inline testing version

    @json = {}

    # update_json_path(anitype)
    get_json_data()

  end


  # # Method to update path to JSON file based on specified anitype
  # def update_json_path(anitype)

    # @json_path = "public/json/#{JsonSelect.instance.anitype}.json"  # production app version
    # @json_path = "../public/json/#{JsonSelect.instance.anitype}.json"  # inline testing version

  # end


  # Method to return exposure entries from setup.json
  def get_json_data()

    @json = JSON.parse(File.read(@json_path))

  end


end