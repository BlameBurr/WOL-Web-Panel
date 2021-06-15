# WOL Web Panel

This project is a **WIP**, proof of concept. It is designed for my home network. It uses nmap to scan the network for devices and returns a list of mac addresses and IP addresses.

I will be working on a web-page that actually utilises the API that I have developed so far.

You will need to modify the SQLite database to add your user to it, using DB Browser for SQLite, this is available @ [DB Browser for SQLite (sqlitebrowser.org)](https://sqlitebrowser.org/)

# Pre-requisites
You will need:

[DB Browser for SQLite (sqlitebrowser.org)](https://sqlitebrowser.org/) - To edit the database at the beginning and add a user and key.

[Nmap: the Network Mapper - Free Security Scanner](https://nmap.org/)- as a dependency for one of the NPM Packages used to scan the network.

## Setup

Start by ensuring that any needed software is installed. Then run `npm install` to install any package dependencies.

Then run the program using `node .` to create the empty database.

Then edit the database and add a user. (At some point, I'll add a setup to alleviate the need to do this manually)

Then run again.

## Manual API Usage

As the project doesn't have a web page front-end you will have to use the API manually. To do this, you will need to use the following endpoints.

/wol/devices/get (parameters: username, key) - to get the list of devices active on the network

/wol/devices/new (parameters: username, key, mac, ip, hostname) - to link a device's mac to a hostname and ip for identification for wake-up requests

/wol/wake (parameters: username, key and mac, ip or hostname) - to send a wake on lan request


Where parameter username is the name of the user (spaces replaced with underscores) followed by a "." and the ID of the database entry.

>E.g. Name: James Walker ID: 1 => James_Walker.1

## Submissions
Feel free to test/use this, I have not managed to test the wake feature properly due to issues on my computers network drivers which are causing problems with WOL.
You can also contribute to this project should you be interested, I'm going to be working on an EJS web-panel but if you would like to contribute to it, feel free. Any submissions will be accepted; however, I'll go over the code and ensure consistency etc. Please just ensure that your code has no major errors before submission and if any obscure code is used to include comments to make it easier to maintain and update.

## Issues
Should you find any issues, which you probably will at some point, send a picture of the NodeJS console and the error you're receiving and I'll look into it when I get a moment.
