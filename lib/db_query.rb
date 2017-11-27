# --------------- use for inline testing ---------------
require 'pg'
require 'pp'

require_relative 's3_bucket.rb'

load './local_env.rb' if File.exist?('./local_env.rb')

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

# ------------------------------------------------------


# Method to retrieve all species_details records from PG
def get_species_records(db)

  species_records = db.exec("select * from species_details order by common_name")

  return species_records.to_a

end


# Method to generate array of subdirectory names based on common name
def get_subdirectories(species_records)

  subdirectories = []

  species_records.each do |record|
    subdirectories.push(record["common_name"].gsub(/[- ]/, "_").downcase!)
  end

  return subdirectories

end


# Method to retrieve all sighting_details records from PG
def get_sighting_records(db)

  sighting_records = db.exec("select * from sighting_details order by id")
  return sighting_records.to_a

end


# Method to generate secure URLs for each photo in photos string
def parse_photos(photos_string, subdirectories)

  urls_array = []

  if photos_string != nil

    photos_array = photos_string.split(',')
    
    photos_array.each do |photo|

      path = "sightings"

      subdirectories.each do |subdirectory|
        path = "sightings/#{subdirectory}" if photo.include?(subdirectory)
      end

      photo_url = generate_url(path, photo)
      urls_array.push(photo_url)
    end
  
  end

  return urls_array

end


# Method to update photo names with secure URLs in sighting_details record hash
def update_photo_urls(records, subdirectories)

  updated_records = []

  records.each do |record_hash|

    urls_array = parse_photos(record_hash["photos"], subdirectories)
    record_hash["photos"] = urls_array
    updated_records.push(record_hash)

  end

  return updated_records  

end


# Method to route handling of photo names to secure URLs
def get_updated_sighting(db, subdirectories)

  sighting_records = get_sighting_records(db)
  updated_records = update_photo_urls(sighting_records, subdirectories)

end


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