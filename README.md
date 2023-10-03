# 

## Development instructions

Starting the demo server:

Go to accessibility-checker-for-vaadin-demo and run:
```
mvn spring-boot:run
```

This deploys demo at http://localhost:8080

## How to use it

TODO


## How to setup a development environment

Run the application the first time to generate the node_modules
Create a symbolic link from the node_modules of the demo to the addon folder.

In the accessibility-checker-for-vaadin folder, run:
```
ln -s ../accessibility-checker-for-vaadin-demo/node_modules node_modules
```
That should help for the typescript definitions in your IDE.

Run the project from IntelliJ with the "Resolve workspace artifacts".
If you change the Java code and run "Recompile"it will be taken into account after a refresh of the page.

For the typescript changes, the folder in the addon library is already listened.

## Publishing to Vaadin Directory

With commit rights to the repository, issue:

    mvn release:prepare release:clean

Configured GH action will build a release and push to Maven Central.

## Licence

Apache 2.0