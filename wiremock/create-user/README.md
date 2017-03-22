#create-user.js

##Purpose

to quickly create a new mocked android user by using an
existing mocked users data.

##Before Using
````
install node.js
cd create-user
npm install
````

##Generating a User

````
node create-user.js error-a a 2213E5DB-48D9-454A-93E5-DB48D9754IUY 2213E5DB-48D9-454A-93E5-DB48D9754AF5 _CvtwRu09r8PhBMeWkwWE4R _CvtwRu09r8PhBMeWkwWEQA
````

###Arguments

- the name of the user you want to create(spaces must be hyphen delimited)
- the name of the user to copy data from
- the swid of the new user
- the swid of the existing user
- the refresh token of the new user
- the refresh token of the existing user