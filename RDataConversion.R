library(raster)
library(rgdal)

args <- commandArgs(trailingOnly = TRUE)
env <- new.env()
nm <- load(args[1], env)[1]
print(class(env[[nm]]))

spToGeoJSON <- function(x){
  # Return sp spatial object as geojson by writing a temporary file.
  # It seems the only way to convert sp objects to geojson is
  # to write a file with OGCGeoJSON driver and read the file back in.
  # The R process must be allowed to write and delete temporoary files.
  #tf<-tempfile('tmp',fileext = '.geojson')
  tf<-tempfile()
  writeOGR(x, tf,layer = "geojson", driver = "GeoJSON")
  js <- paste(readLines(tf), collapse=" ")
  file.remove(tf)
  return(js)
}


if(class(env[[nm]]) == 'zoo' || class(env[[nm]]) == 'mts' || class(env[[nm]]) == 'xts'){
	write.csv(env[[nm]], file = gsub("\\.[r|R][d|D][a|A][t|T][a|A]", ".csv", args[1]))
} else if(attributes(class(env[[nm]])) == 'sp') {
	write(spToGeoJSON(env[[nm]]), file=gsub("\\.[r|R][d|D][a|A][t|T][a|A]", ".json", args[1]))
}
