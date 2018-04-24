# --------------- use for inline testing ---------------
# require 'base64'
# require 'mysql2'
# require 'json'
# require 'net/http'
# require 'digest/sha1'
# require 'pp'
# require 'mysql2'

# require_relative 'b2_bucket.rb'

# load './local_env.rb' if File.exist?('./local_env.rb')

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


# Class to handle photo uploads via prototypes view
class PhotoUpload


  # Initialize method that parses photo_data hash and calls process_photo()
  def initialize(photo_data)

    db = photo_data[0]
    filename = photo_data[1]
    data = photo_data[2]

    process_photo(db, filename, data)

  end


  # Method to readback existing photos string and update with names of uploaded files
  def photo_exists?(db, filename)

    statement = db.prepare("select photo from imageuploader where photo = ?")
    results = statement.execute(filename)

    results == nil ? true : false

  end


  # Method to update imageuploader record with photo name for photos uploaded via Image Uploader prototype
  def update_mysql(db, filename)

    begin
      statement = db.prepare("insert into imageuploader (photo) values (?)")
      statement.execute(filename)
    rescue Mysql2::Error => e
      puts 'Exception occurred'
      puts e.message
    ensure
      db.close if db
    end

  end


  # Method to extract & decode base64 string
  def decode_image(filename, data)

    data_index = data.index('base64') + 7
    filedata = data.slice(data_index, data.length)
    decoded_image = Base64.decode64(filedata)

  end


  # Method to write decoded photo to swap directory
  def write_swap_file(filename, decoded_image)

    create_folder()

    f = File.new "./public/swap/#{filename}", "wb"
    f.write(decoded_image)
    f.close if f

    puts "swap file written"

  end


  # Method to call photo processing methods
  def process_photo(db, filename, data)

    filepath = "imageuploader/" + filename

    # MySQL update-related methods
    update_mysql(db, filepath) if photo_exists?(db, filepath) == false

    # B2 update-related methods
    decoded_image = decode_image(filename, data)
    write_swap_file(filepath, decoded_image)
    save_file_to_b2_bucket(filepath)

  end

end