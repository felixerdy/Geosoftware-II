# Geosoftware-II
###### Softwareprojekt Geosoftware II - WWU Münster - Gruppe 4


### Installation:

##### System Requirements:
In theory, the software should run on any Linux-based server system.
Only the installation of Ubuntu Server 14.04.3 LTS is described as only this system was tested.

    1. MongoDB has to be installed. Recommended here is at least version 3, an installation guide 
       can be found at https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu

    2. R with the normal basic packages is needed. This is Ubuntu package r-base.
       In addition, the R-packages r-gdal and xts must be installed.

    3. Node.JS has to be installed. It is recommended to use at least version 4 LTS.

    4. LatexML has to be installed. At least version 8.1 is required because only from this version
       adequate HTML can be generated.
       To install, the guide "Installing tarball" (http://dlmf.nist.gov/LaTeXML/get.html) was used,
       first, however, under "Installing prerequisites" section (for Ubuntu under "Debian-based systems")
       packages must be installed.

    5. The package manager bower must be installed. This can be done via sudo npm install -g bower.

    6. Last you need to install the project itself. Therefore one must go to the directory and run
      "npm install" and "bower install".

With node Server.js one starts the server, which is available under port 8080.



### How to use Skypaper

##### How to Login

  - For authentication on Skypaper please click the Login Button.
  - You will be redirected to Google, where you can enter your Google username and your Google password.

##### How to publish a paper

  Before publishing your paper, you must make some changes to your LaTeX file.

  - To insert your files, you must insert at each location in the LaTeX file, where for example an image is to be inserted,
    this certain tag: ":!:" ![Beispiel Tag](/public/images/Beispiel-tag.JPG "Tag")
  - Behind this tag you have to insert the file name with the appropriate file extension
  - An Example: If you want to insert a .tif file in your LaTeX file, then you have to include this: ":!:myImage.tif" 
    at the appropriate spot in your LaTeX code.

  - Once authenticated, you can click the Publish Button for uploading your own paper.
  - In the window that opens, you can give your paper a title, add the authors name and choose the actual date
    for your publication.
  - In the first file explorer you can choose your LaTeX document from your files.
  - Afterwards you can choose in the second file explorer all data which need to be included for your LaTeX document, as

    - GeoJSON files for vector data (.json),
    - GeoTIFF  files for raster data (.tif), 
    - RData files for time series (as zoo or xts objects) and 
    - RData files for spatial data (as sp objects)

  - Click Upload and you're done.
  - Now your paper will be uploaded, which could take a few seconds.

##### How to search a paper

  When you are looking for a previously published paper, you must enter a search term like the authors name, 
  the title of the paper or the release date in the appropriate box on homepage.

##### How to show your own papers

  When you want to have a look on your own publications, you need to click, after you have logged in, 
  the button in the upper right corner on which now your username should be. 
  Click on "Show your own publications" and you should be able to see your own publications.

##### How to delete a private paper

  To delete a private paper you have to select the appropriate paper and scroll down to the end of the page.
  There you will see a delete button. When you click to, your own paper will be cleared.

##### How to Logout from Skypaper

  When you're done and want to logout from Skypaper you only need to click the Logout Butten in the
  upper right corner and you will be logged out.

