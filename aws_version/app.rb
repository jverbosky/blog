require 'aws-sdk'
require 'base64'
require 'deep_merge'
require 'fileutils'
require 'hashable'
require 'json'
require 'mail'
require 'open-uri'
require 'pg'
require 'sinatra'
require 'singleton'

require_relative './lib/ajax_interface.rb'
require_relative './lib/blog_handler.rb'
require_relative './lib/db_query.rb'
require_relative './lib/json_address.rb'
require_relative './lib/json_compare.rb'
require_relative './lib/json_filter.rb'
require_relative './lib/json_parse.rb'
require_relative './lib/json_read.rb'
require_relative './lib/json_select.rb'
require_relative './lib/json_update.rb'
require_relative './lib/mail_pdf.rb'
require_relative './lib/photo_handler.rb'
require_relative './lib/photo_queue.rb'
require_relative './lib/photo_upload.rb'
require_relative './lib/s3_bucket.rb'

Aws.use_bundled_cert!  # resolves "certificate verify failed" error

load './lib/local_env.rb' if File.exist?('./lib/local_env.rb')

# /ERROR RangeError: exceeded available parameter key space/ workaround for large blogs
# Ex: 150 paragraphs, 13158 words, 88991 bytes of Lorem Ipsum
if Rack::Utils.respond_to?("key_space_limit=")
  Rack::Utils.key_space_limit = 88992
end


# For Heroku logging to work (heroku logs --app portfolio-jv)
configure do

  $stdout.sync = true
  
end


# Configuration for sending email via AWS SES
Mail.defaults do

  delivery_method :smtp,
  address: "email-smtp.us-west-2.amazonaws.com",
  port: 587,
  :user_name  => ENV['a3smtpuser'],
  :password   => ENV['a3smtppass'],
  :enable_ssl => true

end


# Method to open a connection to the PostgreSQL database
def connection()

  begin
    db_params = {
          host: ENV['dbhost'],
          port:ENV['dbport'],
          dbname:ENV['dbname'],
          user:ENV['dbuser'],
          password:ENV['dbpass']
        }
    db = PG::Connection.new(db_params)
  rescue PG::Error => e
    puts 'Exception occurred'
    puts e.message
  end

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


# Route to load example logging output for 08/30 Heroku Logging blog
get '/herokulog' do

  erb :herokulog

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

  # S3 bucket images
  images = query_s3(connection)
  # images = []  # workaround for Internal Server Error on Heroku

  # species and sightings tables
  db = connection()
  all_records = combine_all_records(db)
  db.close

  # validated addresses
  validated_addresses = encrypt_string(ENV['emails'])

  erb :prototypes, locals: {animals_data: animals_data, feedback: feedback, animals: animals, habitats: habitats, menus: menus, options: options, images: images, all_records: all_records, validated_addresses: validated_addresses}

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

  # S3 bucket images
  # TODO - sessions weren't working, so calling again here
  images = query_s3(connection)
  # images = []  # workaround for Internal Server Error on Heroku

  # species and sightings tables
  db = connection()
  all_records = combine_all_records(db)
  db.close

  # validated addresses
  validated_addresses = encrypt_string(ENV['emails'])

  erb :prototypes, locals: {animals_data: animals_data, feedback: feedback, animals: animals, habitats: habitats, menus: menus, options: options, images: images, all_records: all_records, validated_addresses: validated_addresses}

end


# Route to receive/queue data from JavaScript via AJAX request
post '/queue_photos' do

  filename = params[:filename]
  data = params[:data]
  photo_data = [connection, filename, data]

  PhotoQueue.instance.push(photo_data)

end


# Route to pop photo data from queue for processing
post '/upload_photos' do

  status = params[:photoUploadStatus]

  receive_photo_data(status)

end


# Route for deleting photos from S3 bucket and PG DB
post '/delete_photos' do

  selected = params[:selected]
  remove_photos(connection, selected)

  redirect '/prototypes'

end


# Route to receive/queue data from JavaScript via AJAX request
post '/cache_image' do

  image_info = params[:image_info]
  url_type = params[:url_type]
  sighting_count = params[:sighting_count]  # optional (splat)

  # download image to ./public/swap
  if url_type == "S3"
    download_s3_file(image_info, sighting_count)
  else
    download_image(image_info)
  end

  "<p hidden>AJAX request successfully received - image cached.</p>"  # update HTML to trigger JS

end


# Route to receive/queue data from JavaScript via AJAX request
post '/purge_image' do

  image_name = params[:image_name]

  cleanup_swap_dir(image_name)  # delete image from ./public/swap

  "<p hidden>AJAX request successfully received - image purged.</p>"  # update HTML to trigger JS

end


# Route to receive/queue data from JavaScript via AJAX request
post '/purge_swap_dir' do

  cleanup_cached_images()  # delete exposure images directory from ./public/swap

  # update HTML to trigger JS function cleanupSwap()
  "<p hidden>AJAX request successfully received - images purged.</p>"

end


# Route to receive PDF data and email address from JavaScript via AJAX request
post '/email_pdf' do

  pdf_data = params[:pdf_data]
  pdf_filename = params[:pdf_filename]
  email = params[:email]

  # MailPdf.new(pdf_data, pdf_filename, connection, session[:user])
  MailPdf.new(pdf_data, pdf_filename, connection, email)

end


# Route to load contact page
get '/about' do

  erb :about

end