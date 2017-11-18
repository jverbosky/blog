# Example program to drop (delete) and create details and quotes tables

require 'pg'
load "./local_env.rb" if File.exists?("./local_env.rb")

begin

  # connect to the database
  db_params = {
        host: ENV['host'],  # AWS link
        port:ENV['port'],  # AWS port, always 5432
        dbname:ENV['dbname'],
        user:ENV['dbuser'],
        password:ENV['dbpassword']
      }
  conn = PG::Connection.new(db_params)

  # drop imageuploader table if it exists
  conn.exec "drop table if exists imageuploader"

  # create the imageuploader table
  conn.exec "create table imageuploader (
             id bigserial primary key,
             photo varchar)"

rescue PG::Error => e

  puts 'Exception occurred'
  puts e.message

ensure

  conn.close if conn

end