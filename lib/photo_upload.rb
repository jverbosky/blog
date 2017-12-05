# --------------- use for inline testing ---------------
# require 'base64'
# require 'pg'
# require_relative 's3_bucket.rb'

# load './local_env.rb' if File.exist?('./local_env.rb')
# ------------------------------------------------------


# Class to handle photo uploads via photo_upload view
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

    query = db.exec("select photo from imageuploader where photo = '#{filename}'")
    query == nil ? true : false

  end


  # Method to update imageuploader record with photo name for photos uploaded via Image Uploader prototype
  def update_pg(db, filename)

    v_filename = filename

    begin
      db.prepare('q_statement',
                   "insert into imageuploader (photo) values ($1)")  # bind parameters
      db.exec_prepared('q_statement', [v_filename])
      db.exec("deallocate q_statement")
    rescue PG::Error => e
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

    f = File.new "./public/swap/#{filename}", "wb"
    f.write(decoded_image)
    f.close if f

  end


  # Method to call photo processing methods
  def process_photo(db, filename, data)

    # PG update-related methods
    update_pg(db, filename) if photo_exists?(db, filename) == false

    # S3 update-related methods
    decoded_image = decode_image(filename, data)
    write_swap_file(filename, decoded_image)
    save_file_to_s3_bucket(filename)

  end

end