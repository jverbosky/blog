require 'singleton'  # use for inline testing


# Class to handle animal type selection
class JsonSelect

  include Singleton

  attr_accessor :anitype


  def initialize()

    @anitype = 'carnivores'

  end

end