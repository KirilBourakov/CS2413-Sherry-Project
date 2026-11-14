# 2413 Project: Sherry Filesharing Service
This is the code base for the 2413 code. The app we have chosen is Sherry, and old project one of our teammates made (original code at: https://github.com/KirilBourakov/Sherry-filesharer) 


# File Structure
The codebase is structured as such:

- **exploit/** contains the attacks server, as well as the exploit code. The exploit is an XSS caused by an SVG.

- **fixed-filesharer/** contains the code for the web app, with the vulnerability batched. Three primary fixes were done:
    1. The vulnerable version stored the authentication token in localhost. Now, we store a refresh token in http only cookie, and a short lived access token in memory. The refresh token is used refresh the in memory access token.
    2. The filestorage is now handled on a seperate webserver. These would be deployed to different URLs. This means that even if XSS was successfully done, it would be running on a website that stores no credentials. Messages are passed securly useing a shared private key and the AESGM algorithm.
    3. Dependencies were updated from known vulnerable versions.

- **vulnerable-filesharer/** contains the vulnerable app. The code here is taken from the [original code](https://github.com/KirilBourakov/Sherry-filesharer), with only minor changes for app stability.

# Running
This project recommends [docker](https://docs.docker.com/desktop/setup/install/windows-install/) to run. With docker installed, and docker desktop running, use:

``docker compose -f docker-compose.vuln.yml up --build`` to run the vulnerable app and attacker service.

``docker compose -f docker-compose.fixed.yml up --build`` to run the fixed app and attacker service.

Running requires the following ports:
1. 3000 (frontend)
2. 8000 (backend)
3. 8080 (fileserver in fixed app)
4. 9000 (attacker server)

# The vulnerability
The vulnerability is that a XSS can extract a authentication token in localstore. 

For testing both fixed and vulnerable were seeded with two accounts:

|username | password 
| --- | --- | 
| attacker | attacker |
| target| target |

The attacker has uploaded **exploit\attack.svg** to the fileserver, and has shared it with target. 

To see the attack in action, login at localhost:3000 as target, navigate to the shared_with_me folder, and click on attack.svg. Open the image in a new tab.
Then, navigate to localhost:9000 to see the exfiltrated token.

It is recommended to close all tabs before switching between the vulnerable and fixed server versions.
