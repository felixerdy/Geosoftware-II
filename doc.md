### How to use Skypaper

##### How to Login

  - Use the login button for authentication with Google.
  - A Google account is required to use Skypaper.

#### How to publish a paper

  Publications need to be submitted as LaTeX files. Optionally, additional files like images or spatial/temporal data can be included using the second file chooser.
  Spatial data will be visualized with Leaflet, Time series data with Flot.

###### Include temporal/spatial data for visualization 
  - Supported file formats are TIFF, JSON and Rdata (only sp, zoo or xts objects)

  - Include the Skypaper tag `:!:` and your filename at every position you like to visualize data.
    Make sure you have added exactly the name of the file including the extension.

   Example: If you want to insert a .tif file, include: `:!:yourFileName.tif`
   at the appropriate spot in your LaTeX code.
   ![Beispiel Tag](/public/images/BeispielTag2.JPG "Tag")

###### Upload process 
  - It is strongly recommended to copy all files used in the paper in one directory before starting the upload process
  
  - Click the upload button and choose title, date, author(s) and search terms. A value for each section is required.
  
  - Select your main LaTeX document from your files at the first file chooser.
  
  - Select additional data such as images or temporal/spatial data as described above at the second file chooser.

  - Click *Upload* and you're done. It may take a few minutes to do all conversions.
  
  - Check the paper for red colored error tags. If necessary delete it and reupload a corrected version. 

#### How to show only paper uploaded by yourself

  If you want to have a look on your own publications, click the login button in the upper right corner after loggin in and select *Show my publications*.

#### How to delete a paper

  To delete a paper you have to select the appropriate paper and scroll down to the delete button at end of the page.
  It is only possible to delete papers uploaded from your account. 
