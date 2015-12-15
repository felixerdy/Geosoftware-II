args <- commandArgs(trailingOnly = TRUE)
env <- new.env()
nm <- load(args[1], env)[1]
env[[nm]]
write.csv(env[[nm]], file = gsub("\\.[r|R][d|D][a|A][t|T][a|A]", ".csv", args[1]))
