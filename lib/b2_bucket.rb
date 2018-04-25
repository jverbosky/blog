# -------------------- use for inline testing --------------------

# require 'base64'
# require 'open-uri'
# require 'json'
# require 'net/http'
# require 'digest/sha1'
# require 'pp'
# require 'mysql2'


# load "./local_env.rb" if File.exists?("./local_env.rb")

# Method to open a connection to the MySQL database
# def connection()
#   begin
#     db_params = {
#         host: ENV['host'],
#         port: ENV['port'],
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


# ---------------------------- core B2 API methods ----------------------------

# Returns autorization session info
# - had to use "net/http certificate verify failed" fix at the top of techhire/backblaze-gearhost/backblaze_b2.rb
def b2_authorize_account()

  account_id = ENV['account_id']
  application_key = ENV['application_key']

  uri = URI("https://api.backblazeb2.com/b2api/v1/b2_authorize_account")
  req = Net::HTTP::Get.new(uri)	
  req.basic_auth(account_id, application_key)    
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = true
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then res.body
      when Net::HTTPRedirection then fetch(res['location'], limit - 1)
      else res.error!
  end

end


# List all files in bucket that match file name prefix (for all files, use "" for file)
def b2_list_file_names(file)

  auth_hash = convert_json(b2_authorize_account)
  api_url = auth_hash["apiUrl"]
  account_authorization_token = auth_hash["authorizationToken"]
  bucket_id = ENV['bucket_id']
  prefix = file

  uri = URI("#{api_url}/b2api/v1/b2_list_file_names")
  req = Net::HTTP::Post.new(uri)
  req.add_field("Authorization","#{account_authorization_token}")
  req.body = "{\"bucketId\":\"#{bucket_id}\", \"prefix\":\"#{prefix}\"}"
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = true
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then res.body
      when Net::HTTPRedirection then fetch(res['location'], limit - 1)
      else res.error!
  end

end


# Get prerequisite values for uploading a file to B2 bucket
def b2_get_upload_url()

  auth_hash = convert_json(b2_authorize_account)
  api_url = auth_hash["apiUrl"]
  account_authorization_token = auth_hash["authorizationToken"]
  bucket_id = ENV['bucket_id']

  uri = URI("#{api_url}/b2api/v1/b2_get_upload_url")
  req = Net::HTTP::Post.new(uri)
  req.add_field("Authorization","#{account_authorization_token}")
  req.body = "{\"bucketId\":\"#{bucket_id}\"}"
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = true
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then res.body
      when Net::HTTPRedirection then fetch(res['location'], limit - 1)
      else res.error!
  end

end


# Upload file to b2 bucket
def b2_upload_file(file)

  upload_url_hash = convert_json(b2_get_upload_url)

  file_path = "./public/swap/" + file
  file_data = File.open(file_path, "rb") { |io| io.read }
  upload_url = upload_url_hash["uploadUrl"]
  upload_authorization_token = upload_url_hash["authorizationToken"]
  file_sha1 = generate_sha(file_path)
  file_length = File.size(file_path)

  uri = URI(upload_url)
  req = Net::HTTP::Post.new(uri)
  req.add_field("Authorization", upload_authorization_token)
  req.add_field("X-Bz-File-Name", file)
  req.add_field("Content-Type", "b2/x-auto")
  req.add_field("X-Bz-Content-Sha1", file_sha1)
  req.add_field("Content-Length", file_length)
  req.body = file_data
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = (req.uri.scheme == 'https')
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then res.body
      when Net::HTTPRedirection then fetch(res['location'], limit - 1)
      else res.error!
  end

end


# Download file from B2 bucket by name
def b2_download_file_by_name(file, *folder)

  if folder[0] != nil
      file_url = b2_generate_file_url(file, folder[0])
  else
      file_url = b2_generate_file_url(file)
  end

  uri = URI(file_url)
  req = Net::HTTP::Get.new(uri)
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = true
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then
          res.body
          swapfile = File.new("./public/swap/#{file}", 'wb')
          swapfile.puts(res.body)
          swapfile.close
      when Net::HTTPRedirection then
          fetch(res['location'], limit - 1)
      else
          res.error!
  end

end


# Delete the specific file
# - throws a 404 error if file doesn't exist, so use b2_delete_file() which wraps this method
def b2_delete_file_version(file)

  auth_hash = convert_json(b2_authorize_account)
  api_url = auth_hash["apiUrl"]
  account_authorization_token = auth_hash["authorizationToken"]

  file_hash = parse_files_json(file)
  file_name = file
  file_id = file_hash[file]

  uri = URI("#{api_url}/b2api/v1/b2_delete_file_version")
  req = Net::HTTP::Post.new(uri)
  req.add_field("Authorization","#{account_authorization_token}")
  req.body = "{\"fileName\":\"#{file_name}\", \"fileId\":\"#{file_id}\"}"
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = true
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then res.body
      when Net::HTTPRedirection then fetch(res['location'], limit - 1)
      else res.error!
  end

end


# ---------------------------- helper methods ----------------------------

# Returns Ruby hash for input JSON (string)
def convert_json(json)

  return JSON.parse(json)

end


# Create a hash of file names + file IDs
def parse_files_json(file)

  files_hash = convert_json(b2_list_file_names(file))
  files = {}

  files_hash["files"].each do |file_hash|
      files[file_hash["fileName"]] = file_hash["fileId"]
  end

  return files

end


# Create URL for specified B2 file, optional folder(s)
def b2_generate_file_url(file, *folder)

  subdir = "#{folder[0]}/" if folder[0] != nil

  return "#{ENV['download_url']}#{subdir}#{file}"

end


# Generate the SHA1 hash for the specified file (point to /path/file)
def generate_sha(file)

  sha1 = Digest::SHA1.file file
  return sha1

end


# Method to create /imageuploader folder in swap
def create_folder()

  directory_name = "./public/swap/imageuploader"
  Dir.mkdir(directory_name) unless File.exists?(directory_name)

end


# Method to clean up temp file after uploading to AWS S3 bucket
def cleanup_swap_dir(file)

  image_path = "./public/swap/#{file}"
  # image_path = "../public/swap/#{file}"  # inline testing version

  if File.exist?(image_path)
    File.delete(image_path)  # delete temp file from /public/swap
  else
    puts "temp file does not exist!"
  end

end

# cleanup_swap_dir("nemo.png")
# jv - tested & working


# Method to clean up sightings directory after PDF processing
def cleanup_cached_images()

  # swap_dir = "../public/swap"  # use when running locally from /lib/b2_bucket.rb
  swap_dir = "./public/swap"  # use when running via app.rb
  swap_contents = "#{swap_dir}/*"
  gitkeep = "#{swap_dir}/.gitkeep"

  if File.directory?(swap_dir)
    FileUtils.rm_rf(Dir.glob(swap_contents))  # delete contents of /public/swap    
    file = File.new(gitkeep, 'w')  # recreate .gitkeep file
    file.close if file
  else
    puts "Directory does not exist!"
  end

end


# Method to encrypt non-sensitive/critical values
def encrypt_string(string)

  return string.tr("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", "9nopqrs8tuvwxy7zabcde6fghijk5lmNOPQ4RSTUVW3XYZABC2DEFGHI1JKLM0")

end

# -------------------- upload photos to B2 bucket --------------------


# Checks if file is already in bucket before attempting to upload
# - no way to specify a folder
# - to upload an image into a folder, need to make sure the same directory exists locally so file can be reached
#   ex: backblaze.rb file called from C:\b2, image path needs to be C:\b2\imageuploader\butterfly.png
def save_file_to_b2_bucket(file)

  result = parse_files_json(file)

  if result == {}  # file not in bucket
      b2_upload_file(file)
      cleanup_cached_images()
      puts "Image uploaded to bucket!"
  else
      cleanup_cached_images()
      puts "Image already in bucket!"
  end

end


# Create an array of URLs for all files specified in query
# - the parameter is the Mysql2::Client database connection
# - note that this doesn't verify files are in the bucket, just the DB
def query_b2(client)

  urls = []
  results = client.query("select photo from imageuploader")

  results.each do |result|
      file = result["photo"]

      url = b2_generate_file_url(file)
      urls.push(url)
  end

  return urls

end


# Verifies file is present before attempting to delete
# - file parameter only targets files in root of bucket if only "filename" is provided
# - file parameter needs to be "folder/filename" if file exists inside bucket folder
def b2_delete_file(file)

  if parse_files_json(file) == {}

      puts "File not present"

  else
      
      result_hash = convert_json(b2_delete_file_version(file))

      if result_hash["fileName"] == file
          puts "File deleted successfully"
      else
          puts "Error deleting file"
      end

  end

end


# Method to delete record for specified image from MySQL DB
def delete_db_record(db, photo)

  begin

    statement = db.prepare("delete from imageuploader where photo = ?")
    statement.execute(photo)

  rescue Mysql2::Error => e

    puts 'Exception occurred'
    puts e.message

  end

end


# Method to delete all files from B2 bucket and DB references
def remove_photos(db, selected)

  photos = selected.split(",")

  photos.each do |photo|
    photo = "imageuploader/" + photo
    b2_delete_file(photo)
    delete_db_record(db, photo)
  end

end


# Method to create directory in ./public/swap for sightings photos
def create_directory(subdirectory, sightings_count)

  swap_dir = "./public/swap"  # use when running via app.rb
  # swap_dir = "../public/swap"  # use when running locally from /lib/b2_bucket.rb
  sightings_dir = "#{swap_dir}/#{subdirectory}/#{sightings_count}"

  unless File.directory?(sightings_dir)
    FileUtils.mkdir_p(sightings_dir)
  end

  return sightings_dir

end


# Method to download specified B2 folder/file to ./public/swap
def download_b2_file(image_info, *sightings_count)

  folder = image_info[0]
  filename = image_info[1]
  b2_file_path = "#{folder}/#{filename}"

  if sightings_count
    sightings_count = sightings_count[0]
    subdirectory = folder.split("/")[1]
    sightings_dir = create_directory(subdirectory, sightings_count)
    swap_file = "#{sightings_dir}/#{filename}"
  else
    create_folder()
    swap_file = "./public/swap/#{filename}"  # use when running via app.rb
    # swap_file = "../public/swap/#{file}"  # use when running locally from /lib/b2_bucket.rb
  end

  file_url = b2_generate_file_url(filename, folder)

  uri = URI(file_url)
  req = Net::HTTP::Get.new(uri)
  http = Net::HTTP.new(req.uri.host, req.uri.port)
  http.use_ssl = true
  res = http.start {|http| http.request(req)}

  case res
      when Net::HTTPSuccess then
          res.body
          swapfile = File.new(swap_file, 'wb')
          swapfile.puts(res.body)
          swapfile.close
      when Net::HTTPRedirection then
          fetch(res['location'], limit - 1)
      else
          res.error!
  end

end


# -------------------- non-B2 image download methods --------------------

# Method to create base64 string from avatar image URL
def image_url_to_base64(url)

  img = open(url,{ssl_verify_mode: 0})
  Base64.encode64(img.read)

end


# Method to extract & decode avatar URL base64 string
def decode_base64_string(filename, data)

  decoded_image = Base64.decode64(data)

end


# Method to write decoded photo to swap directory
def write_swap_file(filename, decoded_image)

  f = File.new "./public/swap/#{filename}", "wb"
  # f = File.new "../public/swap/#{filename}", "wb"  # inline testing path
  f.write(decoded_image)
  f.close if f

end


# Method to driver other non-B2 image download methods
def download_image(image_url)

  filename = "temp.png"
  data = image_url_to_base64(image_url)
  decoded_image = decode_base64_string(filename, data)
  write_swap_file(filename, decoded_image)

end