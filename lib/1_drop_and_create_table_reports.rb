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

    # drop species_details table if it exists
    client.query("DROP TABLE IF EXISTS species_details")
  
    # create the species_details table
    client.query(
        "CREATE TABLE portfoliojv.species_details (
            id SMALLINT NOT NULL AUTO_INCREMENT,
            common_name varchar(50) NULL,
            scientific_name varchar(50) NULL,
            s_kingdom varchar(50) NULL,
            s_phylum varchar(50) NULL,
            s_class varchar(50) NULL,
            s_order varchar(50) NULL,
            s_family varchar(50) NULL,
            s_subfamily varchar(50) NULL,
            s_genus varchar(50) NULL,
            description varchar(500) NULL,
            CONSTRAINT PK_species PRIMARY KEY (id)
        )"
    ) 
  
    # drop sighting_details table if it exists
    client.query("DROP TABLE IF EXISTS sighting_details")

    # create the sighting_details table
    client.query(
        "CREATE TABLE portfoliojv.sighting_details (
            id SMALLINT NOT NULL AUTO_INCREMENT,
            species_id int NULL,
            location varchar(50) NULL,
            habitat varchar(50) NULL,
            date date NULL,
            time time NULL,
            notes varchar(500) NULL,
            photos varchar(500) NULL,
            CONSTRAINT PK_sightings PRIMARY KEY (id)
        )"
    ) 

  rescue Mysql2::Error => e
  
    puts 'Exception occurred'
    puts e.message
  
  ensure
  
    client.close if client
  
  end