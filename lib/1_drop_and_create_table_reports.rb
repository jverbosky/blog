# Example program to drop (delete) and create details and quotes tables

require 'pg'
load "./local_env.rb" if File.exists?("./local_env.rb")

begin

  # connect to the database
  db_params = {
        host: ENV['dbhost'],  # AWS link
        port:ENV['dbport'],  # AWS port, always 5432
        dbname:ENV['dbname'],
        user:ENV['dbuser'],
        password:ENV['dbpass']
      }
  conn = PG::Connection.new(db_params)

  # drop species_details table if it exists
  conn.exec "drop table if exists species_details"

  # create the species_details table
  conn.exec "create table species_details (
             id bigserial primary key,
             common_name varchar,
             scientific_name varchar,
             s_kingdom varchar,
             s_phylum varchar,
             s_class varchar,
             s_order varchar,
             s_family varchar,
             s_subfamily varchar,
             s_genus varchar,
             description varchar)"

  # drop sighting_details table if it exists
  conn.exec "drop table if exists sighting_details"

  # create the sighting_details table
  conn.exec "create table sighting_details (
             id bigserial primary key,
             species_id int,
             location varchar,
             habitat varchar,
             date date,
             time time,
             notes varchar,
             photos varchar)"

rescue PG::Error => e

  puts 'Exception occurred'
  puts e.message

ensure

  conn.close if conn

end