require 'base64'
require 'deep_merge'
require 'hashable'
require 'json'
require 'sinatra'
require 'singleton'

require_relative 'lib/blog_handler.rb'
require_relative 'lib/json_address.rb'
require_relative 'lib/json_compare.rb'
require_relative 'lib/json_filter.rb'
require_relative 'lib/json_parse.rb'
require_relative 'lib/json_read.rb'
require_relative 'lib/json_select.rb'
require_relative 'lib/json_update.rb'
require_relative 'lib/photo_handler.rb'


# /ERROR RangeError: exceeded available parameter key space/ workaround for large blogs
# Ex: 150 paragraphs, 13158 words, 88991 bytes of Lorem Ipsum
if Rack::Utils.respond_to?("key_space_limit=")
  Rack::Utils.key_space_limit = 88992
end


# Route to load main page
get '/' do

  erb :index

end


# Route to load blog page
get '/blog' do

  blogs_array = read_json()

  erb :blog, locals: {blogs_array: blogs_array}

end


# Route to load example JSON file for 08/16 OOP (Classes) blog
get '/json' do

  erb :json

end


# Route to receive new blog text JSON via AJAX
post '/ajax_blog' do

  blog_hash = JSON.parse(request.body.read)
  write_json(blog_hash)

end


# Route to receive new blog photo via AJAX
post '/ajax_photo' do

  filename = params[:filename]
  data = params[:data]

  PhotoHandler.new(filename, data)

end


# Route to load prototypes page
get '/prototypes' do

  # load JSON for specified animal type
  file = JsonRead.new
  data = file.json

  # animals form items
  feedback = ""
  filtered = JsonFilter.new
  animals = filtered.animals
  habitats = filtered.habitats
  menus = filtered.menus
  options = filtered.options

  # animals table items
  animals_data = data["Animals"]

  erb :prototypes, locals: {animals_data: animals_data, feedback: feedback, animals: animals, habitats: habitats, menus: menus, options: options}

end


# Route for receiving and processing animal type selection via prototypes view
post '/selanitype' do

  JsonSelect.instance.anitype = params[:anitype]

  redirect '/prototypes?anitype=' + JsonSelect.instance.anitype

end


# Route used by animals update form
post '/prototypes' do

  # animals form update items
  animal_array = [ params[:animal], params[:habitat], params[:menu], params[:option] ]
  change_type = params[:change_type]

  p "post animal_array: #{animal_array}"

  # update JSON before pulling drop-down & table data
  updater = JsonUpdate.new
  feedback = updater.update_json(animal_array, change_type)

  # animals form items
  filtered = JsonFilter.new
  animals = filtered.animals
  habitats = filtered.habitats
  menus = filtered.menus
  options = filtered.options

  # animals table items
  file = JsonRead.new
  data = file.json
  animals_data = data["Animals"]

  erb :prototypes, locals: {animals_data: animals_data, feedback: feedback, animals: animals, habitats: habitats, menus: menus, options: options}

end


# Route to receive/queue data from JavaScript via AJAX request
post '/queue_photos' do

  filename = params[:filename]
  data = params[:data]
  photo_data = [connection, filename, data]

  PhotoQueue.instance.push(photo_data)

end


# Route to load contact page
get '/about' do

  erb :about

end