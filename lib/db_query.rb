# Methods
# ------------------------------------------------------
# connection()
# get_species_records(db)
# get_subdirectories(species_records)
# get_sighting_records(db)
# generate_image_urlsphotos_string, subdirectories)
# update_photo_urls(records, subdirectories)
# get_updated_sighting(db, subdirectories)
# combine_all_records(db)


# --------------- use for inline testing ---------------
# require 'mysql2'
# require 'pp'

# require_relative 'b2_bucket.rb'  # b2_generate_file_url() called by generate_image_urls)

# load "./methods/local_env.rb" if File.exists?("./methods/local_env.rb")  # production version
# load "./local_env.rb" if File.exists?("./local_env.rb")  # local version (if previous doesn't work)

# Method to open a connection to the MySQL database
# def connection()
#   begin
#     db_params = {
#         host: ENV['host'],  # AWS link
#         port: ENV['port'],  # AWS port, always 5432
#         username: ENV['username'],
#         password: ENV['password'],
#         database: ENV['database']
#     }
#     client = Mysql2::Client.new(db_params)
#   rescue Mysql2::Error => e
#     puts 'Exception occurred'
#     puts e.message
#   end
# end

# ------------------------------------------------------


# Method to retrieve all species_details records from MySQL
def get_species_records(db)

  species_records = db.query("select * from species_details order by common_name")

  return species_records.to_a

end

# p get_species_records(connection)

# Results:
# [[{"id"=>1, "common_name"=>"American Goldfinch", "scientific_name"=>"Spin...

# Results:
#[{"id"=>1, "common_name"=>"American Goldfinch", "scientific_name"=>"Spin...


# Method to generate array of subdirectory names based on common name
def get_subdirectories(species_records)

  subdirectories = []

  species_records.each do |record|
    subdirectories.push(record["common_name"].gsub(/[- ]/, "_").downcase!)
  end

  return subdirectories

end

# p get_subdirectories(get_species_records(connection))

# Results:
# ["american_goldfinch", "carolina_wren", "hou...


# Method to retrieve all sighting_details records from MySQL
def get_sighting_records(db)

  sighting_records = db.query("select * from sighting_details order by id")

  return sighting_records.to_a

end

# p get_sighting_records(connection)

# Results:
# [{"id"=>1, "species_id"=>1, "location"=>"Be...


# Method to generate URLs for each photo in photos string
# - need to require b2_bucket.rb for b2_generate_file_url() call
# def parse_photos(photos_string, subdirectories)
def generate_image_urls(photos_string, subdirectories)

  urls_array = []

  if photos_string != nil

    photos_array = photos_string.split(',')
    
    photos_array.each do |photo|

      path = "sightings"

      subdirectories.each do |subdirectory|
        path = "sightings/#{subdirectory}" if photo.include?(subdirectory)
      end

      photo_url = b2_generate_file_url(photo, path)
      urls_array.push(photo_url)
    end
  
  end

  return urls_array

end

# Can get this by adding this to update_photo_urls() after the call to generate_image_urls():
# pp urls_array
# And then call combine_all_records(connection) at the bottom

# Results:
# ["https://f002.backblazeb2.com/file/portfolio-jv/sightings/american_goldfinch/american_goldfinch_s1_01.png", "https://f...


# Method to update photo names with URLs in sighting_details record hash
def update_photo_urls(records, subdirectories)

  updated_records = []

  records.each do |record_hash|

    urls_array = generate_image_urls(record_hash["photos"], subdirectories)
    record_hash["photos"] = urls_array
    updated_records.push(record_hash)

  end

  return updated_records  

end

# Can get this by adding this to update_photo_urls() before the return updated_records statement:
# p updated_records
# And then call combine_all_records(connection) at the bottom

# Results:
# [{"id"=>1, "species_id"=>1, "loc... inch/american_goldfinch_s1_01.png", "https://f002.backblaz...


# Method to route handling of photo names to URLs
def get_updated_sighting(db, subdirectories)

  sighting_records = get_sighting_records(db)
  updated_records = update_photo_urls(sighting_records, subdirectories)

end

# Can get this by adding this to get_updated_sighting() after the call to update_photo_urls():
# p updated_records
# And then call combine_all_records(connection) at the bottom

# Results:
# [{"id"=>1, "species_id"=>1, "location"=>"Bethel Par...


# Method to create a multi-dimensional array of corresponding species & sighting record hashes
def combine_all_records(db)

  all_records = []
  species_records = get_species_records(db)
  subdirectories = get_subdirectories(species_records)
  sighting_records = get_updated_sighting(db, subdirectories)  # get sighting records with S3 URLs for photos
  counter = 0

  species_records.each do |spr|

    all_records.push([spr])

    sighting_records.each do |sir|
      all_records[counter].push(sir) if spr["id"] == sir["species_id"]
    end

    counter += 1

  end

  return all_records

end

# pp combine_all_records(connection)

# Results:
# [[{"id"=>1, "common_name"=>"American Goldfinch", "scientific_name"=>"Spin...

# combine_all_records(connection)  # for getting results from other methods (get_updated_sighting(), etc.)