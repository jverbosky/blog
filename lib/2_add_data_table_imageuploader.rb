require 'mysql2'
load "./local_env.rb" if File.exists?("./local_env.rb")


begin

    # define connection parameters
    db_params = {
        host: ENV['host'],
        port: ENV['port'],
        username: ENV['username'],
        password: ENV['password'],
        database: ENV['database']
    }

    # connect to the database
    client = Mysql2::Client.new(db_params)

    # ------------------- initialize imageuploader data -----------------------------

    # initialize image_names array
    image_names = ["anole.png", "butterfly.png", "caterpillar.png", "nemo.png", "snail.png"]

    # ------------------- load image_names data -----------------------------

    # iterate through multi-dimensional image_names array for data
    image_names.each do |image_name|

        # initialize variables for SQL insert statements
        v_photo = image_name

        statement = "insert into imageuploader (photo) 
                     values ('imageuploader/#{v_photo}')"

        client.query(statement)

    end

  rescue Mysql2::Error => e
  
    puts 'Exception occurred'
    puts e.message
  
  ensure
  
    client.close if client
  
  end