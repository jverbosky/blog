# --------------- use for inline testing ---------------
# require 'base64'
# require 'mail'
# require 'pg'
# require_relative 's3_bucket.rb'

# load './local_env.rb' if File.exist?('./local_env.rb')
# ------------------------------------------------------


# Class to send email with audit PDF attachment
class MailPdf

  # Call helper methods to decode/save PDF, send email and clean swap directory
  def initialize(pdf_data, pdf_filename, db, user)

    attachment = "./public/swap/#{pdf_filename}"
    decoded_pdf = decode_pdf(pdf_data)
    recipient = lookup_email(db, user)

    write_attachment(attachment, decoded_pdf)
    send_email(pdf_filename, attachment, recipient)
    cleanup_swap_dir(pdf_filename)  # s3_bucket.rb method

  end


  # Method to extract & decode base64 string for PDF
  def decode_pdf(pdf_data)

    data_index = pdf_data.index('base64') + 7
    filedata = pdf_data.slice(data_index, pdf_data.length)
    decoded_pdf = Base64.decode64(filedata)

  end


  # Method to write decoded photo to swap directory
  def write_attachment(file_path, decoded_pdf)

    f = File.new file_path, "wb"
    f.write(decoded_pdf)
    f.close if f

  end


  # Method to look up email address for current user
  def lookup_email(db, user)

    query = db.exec("select email from users where username = '#{user}'")
    recipient = query.to_a[0]["email"]

  end


  # Method to send email with PDF attachment
  def send_email(pdf_filename, attachment, recipient)

    email_subject = "Species sightings: #{pdf_filename}"
    email_body = "Here is the PDF for your species."
    
    mail = Mail.new do

      from         ENV['from']
      to           "jverbosk@gmail.com" # recipient
      # bcc        # TBD
      subject      email_subject

      html_part do
        content_type 'text/html'
        body         email_body
      end

      add_file       attachment

    end

    mail.deliver!

  end

end