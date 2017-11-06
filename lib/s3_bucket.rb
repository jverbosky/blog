# --------------- use for inline testing ---------------
# require 'aws-sdk'
# require 'base64'
# require 'open-uri'
# require 'pg'

# load 'local_env.rb' if File.exist?('local_env.rb')

# Aws.use_bundled_cert!  # resolves "certificate verify failed"
# ------------------------------------------------------


#------- upload photos to S3 bucket, empty temp directory, generate secure URL --------------------


# Method to connect to AWS S3 bucket
def connect_to_s3()

  Aws::S3::Client.new(
    access_key_id: ENV['S3_KEY'],
    secret_access_key: ENV['S3_SECRET'],
    region: ENV['AWS_REGION'],
    force_path_style: ENV['PATH_STYLE']
  )

end


# Method to clean up temp file after uploading to AWS S3 bucket
def cleanup_swap_dir(file)

  image_path = "./public/swap/#{file}"

  if File.exist?(image_path)
    File.delete(image_path)  # delete temp file from /public/swap
  else
    puts "temp file does not exist!"
  end

end


# Method to upload file to AWS S3 bucket if not already present
def save_file_to_s3_bucket(file)

  bucket = "prototype-jv"
  temp_file = "./public/swap/#{file}"
  s3_file_path = "imageuploader/#{file}"

  connect_to_s3()
  s3 = Aws::S3::Resource.new(region: ENV['AWS_REGION'])
  obj = s3.bucket(bucket).object(s3_file_path)

  if obj.exists?  # file already exists in bucket
    cleanup_swap_dir(file)  # being called by process_photo() in photo_upload, review for Upload to Cloud
    puts "Image already in bucket!"
  else
    obj.upload_file(temp_file)  # put file in bucket
    cleanup_swap_dir(file)  # being called by process_photo() in photo_upload, review for Upload to Cloud
    puts "Image uploaded to bucket!"
  end

end


# Method to generate secure URL for target file (expires after 15 minutes)
def generate_url(file)

  bucket = "prototype-jv"
  s3_file_path = "imageuploader/#{file}"

  connect_to_s3()
  signer = Aws::S3::Presigner.new
  url = signer.presigned_url(:get_object, bucket: bucket, key: s3_file_path)

end


# Method to generate an array of secure URLs for photos in S3 bucket
def query_s3(db)

  secure_urls = []
  query = db.exec("select photo from imageuploader")

  query.to_a.each do |hash|
    secure_url = generate_url(hash["photo"])
    secure_urls.push(secure_url)
  end

  return secure_urls

end


# Method to delete specified image from S3 bucket
def delete_s3_file(file)

  bucket = "prototype-jv"
  s3_file_path = "imageuploader/#{file}"
  
  connect_to_s3()
  s3 = Aws::S3::Resource.new(region: ENV['AWS_REGION'])
  obj = s3.bucket(bucket).object(s3_file_path)

  obj.delete(file, s3_file_path)

end


# Method to delete record for specified image from PostgreSQL DB
def delete_db_record(db, photo)

  db.exec("delete from imageuploader where photo = '#{photo}'")

end


# Method to delete all files from S3 bucket and DB references
def remove_photos(db, selected)

  photos = selected.split(",")

  photos.each do |photo|
    delete_s3_file(photo)
    delete_db_record(db, photo)
  end

end


# Method to download specified S3 folder/file to ./public/swap
def download_s3_file(image_info)

  folder = image_info[0]
  filename = image_info[1]
  bucket = "prototype-jv"
  s3_file_path = "#{folder}/#{filename}"
  swap_file = "./public/swap/#{filename}"  # use when running via app.rb
  # swap_file = "../public/swap/#{file}"  # use when running locally from /lib/s3_bucket.rb
  
  s3 = connect_to_s3()
  file = File.new(swap_file, 'wb')
  s3.get_object({ bucket:bucket, key:s3_file_path }, target: swap_file)
  file.close if file

end


################################
# Non-S3 image download methods
################################


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


# Method to driver other non-S3 image download methods
def download_image(image_url)

  filename = "temp.png"
  data = image_url_to_base64(image_url)
  decoded_image = decode_base64_string(filename, data)
  write_swap_file(filename, decoded_image)

end