# --------------- use for inline testing ---------------
# require 'aws-sdk'
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

  s3_file_path = "imageuploader/#{file}"
  bucket = "prototype-jv"
  connect_to_s3()
  signer = Aws::S3::Presigner.new
  url = signer.presigned_url(:get_object, bucket: bucket, key: s3_file_path)

end


# Use for inline testing
# def connection()

#   begin
#     db_params = {
#           host: ENV['host'],
#           port:ENV['port'],
#           dbname:ENV['dbname'],
#           user:ENV['dbuser'],
#           password:ENV['dbpassword']
#         }
#     db = PG::Connection.new(db_params)
#   rescue PG::Error => e
#     puts 'Exception occurred'
#     puts e.message
#   end

# end


# Method to generate an array of secure URLs for photos in S3 bucket
def create_urls(db)

  secure_urls = []
  results = db.exec("select photo from imageuploader")

  results.to_a.each do |hash|
    secure_url = generate_url(hash["photo"])
    secure_urls.push(secure_url)
  end

  return secure_urls

end


# Method to delete all files from S3 bucket and DB references
def remove_photos(db)

  # empty bucket
  connect_to_s3()
  s3 = Aws::S3::Resource.new(region: ENV['AWS_REGION'])
  obj = s3.bucket("prototype-jv").clear!

  # drop & recreate imageuploader table
  db.exec "drop table if exists imageuploader"
  db.exec "create table imageuploader (
             id bigserial primary key,
             photo varchar)"

end