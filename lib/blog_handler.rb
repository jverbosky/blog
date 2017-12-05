# require 'json'  # use for inline testing


# Method to verify AJAX data is being received
def read_ajax(json_data)

  puts "json_data: #{json_data}"

end


# Method to return the contents of JSON file
def read_json()

  # if /public/blogs.json exists, read/parse its contents; otherwise set it to an empty array
  File.exist?('public/blogs.json') ? json = JSON.parse(File.read('public/blogs.json')) : json = []

end


# Method to add current user hash to JSON file
def write_json(blog_hash)

  json = read_json()
  # append user_hash array (using shovel operator: <<) to json data (existing or empty), then write beautified data to user.json
  File.open("public/blogs.json","w") { |f| f.puts JSON.pretty_generate(json << blog_hash) }

end
