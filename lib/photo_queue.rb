# Singleton class to queue photo_data received via AJAX requests (photoUpload.js)
class PhotoQueue

  private_class_method :new

  @@instance = Queue.new

  def self.instance
    return @@instance
  end

end