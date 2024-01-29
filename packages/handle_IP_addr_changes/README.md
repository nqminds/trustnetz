# Handle IP Address Changes

Bash script which handles changes in IP address during operation and restarts the required services.

## Requirements:

You will need to run `sudo apt-get install jq` to install [jq](https://linuxhint.com/bash_jq_command/) which is used to parse json files in bash.

In order for this to work you also need to make sure that the user running the script has the necessary sudo privileges without a password prompt for these specific systemctl commands. You can configure sudo by editing the sudoers file using the `visudo` command:

```bash
sudo visudo
```

Add the following lines to allow the user to run systemctl restart commands without a password prompt:

```bash
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart tdxvolt.service
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart vc-server.service
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart registrar-rest-server.service
your_username ALL=(ALL) NOPASSWD: /bin/systemctl restart registrar-app.service
```

Replace your_username with the actual username running the script.

## Usage:
`./restart_on_IP_changes.sh <network interface> </path/to/your/volt.config.json>`

Where the network interface is chosen from those seen when using `ifconfig`.
