# --------------- use for inline testing ---------------
# require_relative 'photo_upload.rb'
# ------------------------------------------------------


# -------------- pass queued AJAX request data to objects for processing --------------------


# Method to pop photo data from PhotoQueue for processing via PhotoUpload class
def receive_photo_data(status)

  puts "receive_photo_data called... status: #{status}"
  puts "PhotoQueue size before processing: #{PhotoQueue.instance.size}"

  if status == "OK"
    while PhotoQueue.instance.size > 0
      PhotoUpload.new(PhotoQueue.instance.pop)
    end
  end

  puts "PhotoQueue size after processing: #{PhotoQueue.instance.size}"

end