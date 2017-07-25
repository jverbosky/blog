require 'sinatra'
require 'json'
require_relative 'lib/blog_handler.rb'


# /ERROR RangeError: exceeded available parameter key space/ workaround for large blogs
# Ex: 150 paragraphs, 13158 words, 88991 bytes of Lorem Ipsum
# if Rack::Utils.respond_to?("key_space_limit=")
#   Rack::Utils.key_space_limit = 88992
# end


# Route to load main blog page
get '/' do

  blogs_array = read_json()

  erb :blog, locals: {blogs_array: blogs_array}

end


# Route to receive new blog text JSON via AJAX
post '/ajax_verify' do

  blog_hash = JSON.parse(request.body.read)
  write_json(blog_hash)

end