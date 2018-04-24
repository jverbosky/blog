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

    # drop imageuploader table if it exists
    client.query("DROP TABLE IF EXISTS imageuploader")
  
    # create the imageuploader table
    client.query(
        "CREATE TABLE portfoliojv.imageuploader (
            id SMALLINT NOT NULL AUTO_INCREMENT,
            photo varchar(5000) NOT NULL,
            CONSTRAINT PK_imageuploader PRIMARY KEY (id)
        )"
    ) 
  
  rescue Mysql2::Error => e
  
    puts 'Exception occurred'
    puts e.message
  
  ensure
  
    client.close if client
  
  end