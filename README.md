# Geosoftware-II
###### Softwareprojekt Geosoftware II - WWU Münster - Gruppe 4

SkyPaper is a web application for publishing scientific paper. The publisher can add temporal/spatial data which will be visualized in the paper with the ability for readers to interact.


#### System Requirements:
In theory, the software should run on any Linux-based server system.
Only the installation on Ubuntu 14.04.3 LTS and Ubuntu Server 14.04.3 LTS is described as only this systems were tested.

### Installation:

1. Install MongoDB. Recommended here is at least version 3, an installation guide 
   can be found at https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu

2. Install R with Ubuntu package r-base.
   In addition, the R-packages r-gdal and xts must be installed.
   R commands for this are: `install.packages("r-gdal")` and 
   `install.packages("xts")`
   

3. Install Nodejs. It is recommended to use at least version 4 LTS.

4. Install LaTeXML. At least version 8.1 is required because only from this version
   adequate HTML can be generated.
   - Install the packages as described in the "Installing prerequisites"-section 
     (for Ubuntu under "Debian-based systems") at http://dlmf.nist.gov/LaTeXML/get.html. 
   - Follow the guide "Installing tarball" on the same page. 

5. The package manager bower must be installed. This can be done via sudo npm install -g bower.

6. Install the direct dependencies for the project. Therefore go to the directory and run
  "npm install" and "bower install".

7. Finally create a keys.js in the root directory of the project with following content: 
   ```javascript
   var keys = {};
 
 
   keys.clientID = 'yourClientID';
   keys.clientSecret = 'yourClientSecret';
 
   module.exports = keys; 
   ```
   Replace yourClientID and yourClientSecret with your own Google ClientID
   and ClientSecret (see [google developers console](https://console.developers.google.com/)) 

### Start Skypaper:
1. Start your mongoDB

2. Start the server using `node Server.js`.

3. The application is available under port 8080.



### How to use Skypaper

see [doc.md](./doc.md)

### License

ISC
