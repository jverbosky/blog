require 'base64'

class PhotoHandler


  def initialize(filename, data)

    write_image(filename, decode_image(data))

  end


  # Method to extract & decode base64 string
  def decode_image(data)

    data_index = data.index('base64') + 7
    filedata = data.slice(data_index, data.length)
    decoded_image = Base64.decode64(filedata)

  end


  # Method to write file to swap directory
  def write_image(filename, decoded_image)

    f = File.new "./public/images/blog/#{filename}", "wb"
    f.write(decoded_image)
    f.close if f

  end


end