// Content pool for the /learn/linux practice page.
//
// Structure follows docs/architecture/learning-systems.md: each command is a
// small reference card plus 2+ atomic retrieval prompts. Prompts are the unit
// of scheduling (the FSRS engine in src/components/learn/engine.ts tracks its
// own card per prompt); commands are the unit of introduction and of the wall
// chart.
//
// Prompt writing rules (Matuschak): one fact per prompt, phrased so the
// answer is short and unambiguous, scenario-flavored where possible.

export interface Prompt {
	id: string;
	q: string;
	a: string;
	note?: string;
}

export interface Command {
	id: string;
	cmd: string;
	syntax: string;
	description: string;
	example: string;
	exampleNote: string;
	prompts: Prompt[];
}

export interface Category {
	id: string;
	title: string;
	emoji: string;
	description: string;
	commands: Command[];
}

export const categories: Category[] = [
	{
		id: 'storage',
		title: 'Storage & Disks',
		emoji: '💾',
		description: 'Inspect disk usage, partitions, and mounted filesystems.',
		commands: [
			{
				id: 'df',
				cmd: 'df',
				syntax: 'df -h',
				description: 'Shows free and used disk space for mounted filesystems, in human-readable units.',
				example: 'df -h /var',
				exampleNote: 'Reports space usage for the filesystem containing /var.',
				prompts: [
					{
						id: 'df-1',
						q: 'Which command shows free and used disk space per mounted filesystem?',
						a: 'df -h',
						note: '-h prints sizes in human-readable units (GB/MB) instead of raw blocks.',
					},
					{
						id: 'df-2',
						q: 'df vs du — which reports whole filesystems, and which reports directory trees?',
						a: 'df: space per mounted filesystem. du: usage of a specific directory tree.',
						note: '“Disk is full — which mount?” → df. “What is eating this mount?” → du.',
					},
				],
			},
			{
				id: 'du',
				cmd: 'du',
				syntax: 'du -sh *',
				description: 'Estimates disk usage of files and directories, useful for finding what is eating up space.',
				example: 'du -sh /var/log/*',
				exampleNote: 'Shows a one-line summarized size for each item under /var/log.',
				prompts: [
					{
						id: 'du-1',
						q: 'You want to find which subdirectory of /home is the largest. What do you run?',
						a: 'du -sh /home/*',
						note: 'One summarized, human-readable size per item — easy to spot the biggest.',
					},
					{
						id: 'du-2',
						q: 'In `du -sh`, what do -s and -h each do?',
						a: '-s: one summary line per argument (no recursion spam). -h: human-readable sizes.',
					},
				],
			},
			{
				id: 'lsblk',
				cmd: 'lsblk',
				syntax: 'lsblk -f',
				description: 'Lists block devices (disks and partitions) as a tree, with the -f flag adding filesystem type and UUID.',
				example: 'lsblk -f',
				exampleNote: 'Shows each disk, its partitions, filesystem type, and mount point.',
				prompts: [
					{
						id: 'lsblk-1',
						q: 'Which command lists all block devices and their partition layout as a tree?',
						a: 'lsblk',
						note: '`fdisk -l` also works but is heavier and needs root.',
					},
					{
						id: 'lsblk-2',
						q: 'Which lsblk flag adds filesystem type and UUID to the listing?',
						a: 'lsblk -f',
					},
				],
			},
			{
				id: 'mount',
				cmd: 'mount',
				syntax: 'mount /dev/sdb1 /mnt/data',
				description: 'Attaches a filesystem on a device to a directory (mount point) so its contents become accessible.',
				example: 'mount /dev/sdb1 /mnt/data',
				exampleNote: 'Mounts the partition /dev/sdb1 at /mnt/data. Run `mount` with no args to list current mounts.',
				prompts: [
					{
						id: 'mount-1',
						q: 'What does running `mount` with no arguments do?',
						a: 'Lists every currently mounted filesystem, its device, and its options.',
					},
					{
						id: 'mount-2',
						q: 'How do you attach the partition /dev/sdb1 at the directory /mnt/data?',
						a: 'mount /dev/sdb1 /mnt/data',
						note: 'The directory (mount point) must already exist.',
					},
				],
			},
			{
				id: 'fdisk',
				cmd: 'fdisk',
				syntax: 'fdisk -l',
				description: "Views or edits a disk's partition table. `fdisk -l` lists partitions on all disks without changing anything.",
				example: 'sudo fdisk -l /dev/sda',
				exampleNote: 'Lists the partition table of /dev/sda: sizes, types, and start/end sectors.',
				prompts: [
					{
						id: 'fdisk-1',
						q: 'Which fdisk invocation is safe for inspecting partitions, with no risk of modifying the disk?',
						a: 'fdisk -l',
						note: 'Without -l, fdisk opens an interactive editor that can rewrite the partition table.',
					},
					{
						id: 'fdisk-2',
						q: 'Why is running `fdisk /dev/sda` (without -l) risky?',
						a: 'It opens the interactive partition editor — a stray write command can destroy the partition table.',
					},
				],
			},
			{
				id: 'blkid',
				cmd: 'blkid',
				syntax: 'blkid',
				description: 'Prints each partition\'s UUID, filesystem type, and label — the identifiers you use in /etc/fstab.',
				example: 'sudo blkid /dev/sdb1',
				exampleNote: 'Shows the UUID and filesystem type of /dev/sdb1, ready to paste into fstab.',
				prompts: [
					{
						id: 'blkid-1',
						q: 'Which command prints each partition\'s UUID and filesystem type (e.g. for writing /etc/fstab)?',
						a: 'blkid',
					},
					{
						id: 'blkid-2',
						q: 'Why mount by UUID in /etc/fstab instead of by device name like /dev/sdb1?',
						a: 'Device names can change between boots or when disks are added; UUIDs are stable.',
					},
				],
			},
		],
	},
	{
		id: 'logs',
		title: 'Logs',
		emoji: '📜',
		description: 'Read, filter, and follow system and service logs.',
		commands: [
			{
				id: 'journalctl',
				cmd: 'journalctl',
				syntax: 'journalctl -u nginx -f',
				description: 'Queries the systemd journal. -u filters by unit (service), -f follows new entries live.',
				example: 'journalctl -u ssh --since "1 hour ago"',
				exampleNote: 'Shows SSH service log entries from the last hour.',
				prompts: [
					{
						id: 'journalctl-1',
						q: 'Which journalctl flag streams new log entries live, like `tail -f`?',
						a: '-f',
					},
					{
						id: 'journalctl-2',
						q: 'Show only the SSH service\'s journal entries from the last hour — what do you run?',
						a: 'journalctl -u ssh --since "1 hour ago"',
						note: '-u scopes to a unit; --since takes human-friendly time expressions.',
					},
				],
			},
			{
				id: 'tail',
				cmd: 'tail',
				syntax: 'tail -f /var/log/syslog',
				description: 'Prints the last lines of a file; -f keeps watching and prints new lines as they are appended.',
				example: 'tail -n 100 -f /var/log/nginx/error.log',
				exampleNote: 'Shows the last 100 lines, then keeps streaming new ones.',
				prompts: [
					{
						id: 'tail-1',
						q: 'What does `tail -f access.log` do that plain `tail access.log` does not?',
						a: 'Keeps running and prints new lines as they are appended, in real time.',
					},
					{
						id: 'tail-2',
						q: 'Show the last 100 lines of a log, then keep following it — what do you run?',
						a: 'tail -n 100 -f file.log',
					},
				],
			},
			{
				id: 'dmesg',
				cmd: 'dmesg',
				syntax: 'dmesg -T | less',
				description: 'Prints kernel ring buffer messages: boot info, hardware events, driver errors. -T shows human-readable timestamps.',
				example: 'dmesg -T | grep -i usb',
				exampleNote: 'Shows kernel messages mentioning USB, with real timestamps instead of seconds-since-boot.',
				prompts: [
					{
						id: 'dmesg-1',
						q: 'A USB drive isn\'t being recognized. Which command shows kernel-level hardware messages that might explain why?',
						a: 'dmesg',
						note: 'The kernel ring buffer logs hardware detection and driver events like USB attach/detach.',
					},
					{
						id: 'dmesg-2',
						q: 'What does the -T flag change in dmesg output?',
						a: 'Timestamps become human-readable dates instead of seconds-since-boot.',
					},
				],
			},
			{
				id: 'less',
				cmd: 'less',
				syntax: 'less +G /var/log/auth.log',
				description: 'Opens a file for scrollable, searchable paging without loading it all into memory. /pattern searches forward.',
				example: 'less /var/log/auth.log',
				exampleNote: 'Opens the auth log; press G to jump to the end, /failed to search for "failed".',
				prompts: [
					{
						id: 'less-1',
						q: 'Inside less, how do you search forward for the text "failed"?',
						a: '/failed',
						note: '`?failed` searches backward; n / N repeat the search forward / backward.',
					},
					{
						id: 'less-2',
						q: 'Inside less, which key jumps to the end of the file (the newest log lines)?',
						a: 'G',
						note: 'Lowercase g jumps back to the top. `less +G file` opens already at the end.',
					},
				],
			},
			{
				id: 'logrotate',
				cmd: 'logrotate',
				syntax: 'logrotate -d /etc/logrotate.conf',
				description: "Rotates, compresses, and eventually removes old log files based on rules, so logs don't fill the disk forever.",
				example: 'logrotate -d /etc/logrotate.conf',
				exampleNote: '-d (debug/dry-run) shows what would happen without actually rotating anything.',
				prompts: [
					{
						id: 'logrotate-1',
						q: 'What problem does logrotate primarily solve?',
						a: 'It archives/compresses old logs and deletes ones past retention, so logs never fill the disk.',
					},
					{
						id: 'logrotate-2',
						q: 'Which logrotate flag does a dry run — showing what would rotate without doing it?',
						a: '-d',
					},
				],
			},
			{
				id: 'last',
				cmd: 'last',
				syntax: 'last -n 20',
				description: 'Shows recent login sessions (from /var/log/wtmp): who logged in, from where, and when.',
				example: 'last reboot',
				exampleNote: 'The pseudo-user "reboot" filters the history down to system reboots.',
				prompts: [
					{
						id: 'last-1',
						q: 'Which command shows the recent login history — who logged in, from where, and when?',
						a: 'last',
						note: 'It reads /var/log/wtmp; `lastb` shows failed login attempts.',
					},
					{
						id: 'last-2',
						q: 'How do you list the machine\'s recent reboots using `last`?',
						a: 'last reboot',
					},
				],
			},
		],
	},
	{
		id: 'processes',
		title: 'Processes',
		emoji: '⚙️',
		description: 'Inspect, prioritize, and stop running processes.',
		commands: [
			{
				id: 'ps',
				cmd: 'ps',
				syntax: 'ps aux',
				description: 'Snapshots currently running processes. `aux` shows every process for every user with CPU/memory usage.',
				example: 'ps aux | grep nginx',
				exampleNote: 'Lists all processes, filtered down to lines mentioning nginx.',
				prompts: [
					{
						id: 'ps-1',
						q: 'How do you get a one-time snapshot of all running processes, filtered to those mentioning nginx?',
						a: 'ps aux | grep nginx',
						note: 'pgrep -a nginx is the tidier purpose-built alternative.',
					},
					{
						id: 'ps-2',
						q: 'In `ps aux`, what does the aux combination mean?',
						a: 'a: all users\' processes, u: user-oriented columns (CPU/mem), x: include processes without a terminal (daemons).',
					},
				],
			},
			{
				id: 'top',
				cmd: 'top',
				syntax: 'top',
				description: 'Live, auto-refreshing view of running processes sorted by resource usage — the go-to first look at a loaded machine.',
				example: 'top -o %CPU',
				exampleNote: 'Sorts the live process list by CPU usage, highest first.',
				prompts: [
					{
						id: 'top-1',
						q: 'A server feels sluggish — which command gives a live, auto-updating view of the heaviest processes?',
						a: 'top',
						note: 'Unlike ps, top refreshes continuously.',
					},
					{
						id: 'top-2',
						q: 'Inside top, which key re-sorts the list by memory usage?',
						a: 'M (shift+m)',
						note: 'P sorts by CPU, q quits, k prompts for a PID to kill.',
					},
				],
			},
			{
				id: 'kill',
				cmd: 'kill',
				syntax: 'kill -9 1234',
				description: 'Sends a signal to a process by PID. The default signal (15/TERM) asks it to exit gracefully; -9 (KILL) forces it immediately.',
				example: 'kill -15 1234',
				exampleNote: 'Asks process 1234 to terminate gracefully, giving it a chance to clean up.',
				prompts: [
					{
						id: 'kill-1',
						q: 'What is the difference between `kill -15` and `kill -9`?',
						a: '-15 (SIGTERM) politely asks the process to exit and lets it clean up; -9 (SIGKILL) cannot be caught and kills it instantly.',
						note: 'Always try -15 first; -9 can leave temp files, locks, or corrupt state behind.',
					},
					{
						id: 'kill-2',
						q: 'Which signal does `kill 1234` send when no signal is specified?',
						a: 'SIGTERM (15) — the graceful-termination request.',
					},
				],
			},
			{
				id: 'nice',
				cmd: 'nice',
				syntax: 'nice -n 10 ./backup.sh',
				description: 'Starts a command with an adjusted CPU scheduling priority. Higher niceness (up to 19) means lower priority, being "nicer" to other processes.',
				example: 'nice -n 19 tar -czf backup.tar.gz /data',
				exampleNote: "Runs the backup with the lowest priority so it doesn't compete with other work for CPU.",
				prompts: [
					{
						id: 'nice-1',
						q: 'How do you start a heavy backup job so it yields CPU to everything else?',
						a: 'nice -n 19 <command>',
						note: 'Higher niceness = lower priority. renice changes it for an already-running process.',
					},
					{
						id: 'nice-2',
						q: 'What is the niceness range, and which end is highest priority?',
						a: '-20 (highest priority) to 19 (lowest priority).',
						note: 'Only root may set negative niceness.',
					},
				],
			},
			{
				id: 'pgrep',
				cmd: 'pgrep',
				syntax: 'pgrep -a python',
				description: 'Searches running processes by name and prints matching PIDs, without the noise of a full `ps` listing.',
				example: 'pgrep -a python',
				exampleNote: 'Prints the PID and full command line of every running process whose name matches "python".',
				prompts: [
					{
						id: 'pgrep-1',
						q: 'Which command gives you just the PIDs of all running "python" processes?',
						a: 'pgrep python',
						note: '-a adds the full command line next to each PID.',
					},
					{
						id: 'pgrep-2',
						q: 'What does pkill do?',
						a: 'Sends a signal (SIGTERM by default) to every process whose name matches — pgrep\'s acting sibling.',
					},
				],
			},
			{
				id: 'lsof',
				cmd: 'lsof',
				syntax: 'lsof -i :8080',
				description: 'Lists open files — and since sockets, devices, and mounts are files on Linux, it answers "who is using this?"',
				example: 'lsof /mnt/data',
				exampleNote: 'Shows which processes have files open under /mnt/data — e.g. why umount says "target is busy".',
				prompts: [
					{
						id: 'lsof-1',
						q: '`umount /mnt/data` fails with "target is busy". How do you find which process is holding it open?',
						a: 'lsof /mnt/data',
					},
					{
						id: 'lsof-2',
						q: 'Which lsof invocation shows the process using TCP port 8080?',
						a: 'lsof -i :8080',
						note: '`ss -tulpn | grep 8080` is the socket-tool equivalent.',
					},
				],
			},
		],
	},
	{
		id: 'networking',
		title: 'Networking',
		emoji: '🌐',
		description: 'Check interfaces, connections, and reachability.',
		commands: [
			{
				id: 'ip',
				cmd: 'ip',
				syntax: 'ip addr show',
				description: 'Modern tool for viewing and configuring network interfaces, addresses, and routes (the successor to `ifconfig`/`route`).',
				example: 'ip route show',
				exampleNote: 'Displays the routing table, including the default gateway.',
				prompts: [
					{
						id: 'ip-1',
						q: 'Which modern command shows a machine\'s IP addresses and network interfaces?',
						a: 'ip addr show (short: ip a)',
						note: 'It replaces the older ifconfig.',
					},
					{
						id: 'ip-2',
						q: 'How do you view the routing table, including the default gateway?',
						a: 'ip route show (short: ip r)',
					},
				],
			},
			{
				id: 'ss',
				cmd: 'ss',
				syntax: 'ss -tulpn',
				description: 'Shows socket statistics: which ports are listening and which processes own them (the modern replacement for `netstat`).',
				example: 'ss -tulpn | grep :443',
				exampleNote: 'Shows which process is listening on port 443.',
				prompts: [
					{
						id: 'ss-1',
						q: 'Which command (with flags) shows every listening port and the process that owns it?',
						a: 'ss -tulpn',
						note: 't/u: TCP/UDP, l: listening, p: owning process, n: numeric ports.',
					},
					{
						id: 'ss-2',
						q: 'ss replaces which older tool?',
						a: 'netstat',
					},
				],
			},
			{
				id: 'curl',
				cmd: 'curl',
				syntax: 'curl -I https://example.com',
				description: 'Transfers data to/from a URL. -I fetches just the response headers, handy for quickly checking if a service is up.',
				example: 'curl -o /dev/null -s -w "%{http_code}\\n" https://example.com',
				exampleNote: 'Prints only the HTTP status code returned by the server.',
				prompts: [
					{
						id: 'curl-1',
						q: 'Which curl flag fetches only the HTTP response headers, not the body?',
						a: '-I (or --head)',
						note: 'Fast way to check status, redirects, and server headers.',
					},
					{
						id: 'curl-2',
						q: 'How do you make curl print just the HTTP status code of a URL?',
						a: 'curl -o /dev/null -s -w "%{http_code}" <url>',
						note: '-o /dev/null discards the body, -s silences progress, -w prints the format string.',
					},
				],
			},
			{
				id: 'ping',
				cmd: 'ping',
				syntax: 'ping -c 4 8.8.8.8',
				description: 'Sends ICMP echo requests to test basic reachability and round-trip latency to a host.',
				example: 'ping -c 4 8.8.8.8',
				exampleNote: "Sends exactly 4 pings to Google's public DNS and then stops (without -c, it runs forever).",
				prompts: [
					{
						id: 'ping-1',
						q: 'What does -c 4 change about ping\'s behavior?',
						a: 'Sends exactly 4 echo requests and stops, instead of running until Ctrl+C.',
					},
					{
						id: 'ping-2',
						q: 'Which protocol does ping use?',
						a: 'ICMP (echo request / echo reply).',
						note: 'That\'s why ping can work when TCP services are down — and be blocked while they\'re up.',
					},
				],
			},
			{
				id: 'traceroute',
				cmd: 'traceroute',
				syntax: 'traceroute example.com',
				description: 'Shows the path (each router hop) packets take to reach a host, useful for spotting where connectivity breaks or slows down.',
				example: 'traceroute -n example.com',
				exampleNote: '-n skips reverse DNS lookups, making the hop list print much faster.',
				prompts: [
					{
						id: 'traceroute-1',
						q: 'Requests to a remote server die somewhere along the path. Which command shows each router hop on the way?',
						a: 'traceroute',
					},
					{
						id: 'traceroute-2',
						q: 'Why add -n to traceroute?',
						a: 'It skips reverse-DNS lookups on each hop, so results print much faster.',
					},
				],
			},
			{
				id: 'dig',
				cmd: 'dig',
				syntax: 'dig example.com',
				description: 'Queries DNS: what records a name resolves to, from which nameserver, with full timing detail.',
				example: 'dig +short example.com',
				exampleNote: '+short prints just the resolved addresses, without the query metadata.',
				prompts: [
					{
						id: 'dig-1',
						q: 'A hostname resolves to the wrong address and you suspect DNS. Which command inspects its DNS records?',
						a: 'dig <hostname>',
						note: 'dig MX example.com queries a specific record type; @8.8.8.8 asks a specific nameserver.',
					},
					{
						id: 'dig-2',
						q: 'What does +short do in `dig +short example.com`?',
						a: 'Prints only the answer values (the IPs), omitting all query metadata.',
					},
				],
			},
		],
	},
	{
		id: 'users-permissions',
		title: 'Users & Permissions',
		emoji: '🔐',
		description: 'Manage accounts, ownership, and file permissions.',
		commands: [
			{
				id: 'chmod',
				cmd: 'chmod',
				syntax: 'chmod 755 deploy.sh',
				description: "Changes a file's permission bits for owner, group, and others (read/write/execute).",
				example: 'chmod +x deploy.sh',
				exampleNote: 'Adds execute permission for everyone, without touching read/write bits.',
				prompts: [
					{
						id: 'chmod-1',
						q: 'What permissions does `chmod 644 file.txt` set?',
						a: 'rw-r--r-- : owner read+write, group read, others read.',
						note: 'Read=4, write=2, execute=1; each octal digit is one of owner/group/others.',
					},
					{
						id: 'chmod-2',
						q: 'How do you add execute permission to a script without changing any other bits?',
						a: 'chmod +x script.sh',
					},
				],
			},
			{
				id: 'chown',
				cmd: 'chown',
				syntax: 'chown www-data:www-data /var/www/app',
				description: 'Changes the owning user and/or group of a file or directory.',
				example: 'chown -R deploy:deploy /opt/app',
				exampleNote: '-R applies the ownership change recursively to every file and subdirectory.',
				prompts: [
					{
						id: 'chown-1',
						q: 'App files are owned by root but the www-data service account needs to write them. What is the correct fix?',
						a: 'chown -R www-data:www-data /var/www/app',
						note: 'Fix ownership — don\'t reach for chmod 777, which makes files world-writable.',
					},
					{
						id: 'chown-2',
						q: 'What is the chown syntax to set user and group in one command?',
						a: 'chown user:group file',
					},
				],
			},
			{
				id: 'useradd',
				cmd: 'useradd',
				syntax: 'useradd -m -s /bin/bash alice',
				description: 'Creates a new user account. -m creates a home directory, -s sets the login shell.',
				example: 'sudo useradd -m -s /bin/bash alice',
				exampleNote: 'Creates user "alice" with a home directory at /home/alice and bash as her shell.',
				prompts: [
					{
						id: 'useradd-1',
						q: 'Which useradd flag ensures a home directory is created for the new user?',
						a: '-m',
					},
					{
						id: 'useradd-2',
						q: 'In `useradd -m -s /bin/bash alice`, what does -s set?',
						a: 'The login shell (/bin/bash here).',
					},
				],
			},
			{
				id: 'passwd',
				cmd: 'passwd',
				syntax: 'passwd alice',
				description: "Sets or changes a user's password. Run without arguments to change your own; with a username (as root) to change someone else's.",
				example: 'sudo passwd -l alice',
				exampleNote: '-l locks the account by disabling its password, without deleting the account itself.',
				prompts: [
					{
						id: 'passwd-1',
						q: 'Disable a former contractor\'s login without deleting their account or files — what do you run?',
						a: 'sudo passwd -l alice',
						note: '-l locks the password so the account can\'t authenticate.',
					},
					{
						id: 'passwd-2',
						q: 'How do you re-enable a password-locked account?',
						a: 'sudo passwd -u alice',
					},
				],
			},
			{
				id: 'sudo',
				cmd: 'sudo',
				syntax: 'sudo systemctl restart nginx',
				description: "Runs a single command with another user's privileges (root by default), based on rules in /etc/sudoers.",
				example: 'sudo -u postgres psql',
				exampleNote: 'Runs `psql` as the "postgres" user instead of root, using -u to pick the target user.',
				prompts: [
					{
						id: 'sudo-1',
						q: 'How do you run a command as a specific non-root user with sudo?',
						a: 'sudo -u <user> <command> — e.g. sudo -u postgres psql',
					},
					{
						id: 'sudo-2',
						q: 'Which file defines who may use sudo, and what is the safe way to edit it?',
						a: '/etc/sudoers, edited via visudo',
						note: 'visudo syntax-checks before saving — a broken sudoers can lock everyone out of root.',
					},
				],
			},
			{
				id: 'usermod',
				cmd: 'usermod',
				syntax: 'usermod -aG docker alice',
				description: 'Modifies an existing account: group membership, shell, home, lock state.',
				example: 'sudo usermod -aG docker alice',
				exampleNote: 'Appends alice to the docker group. She must log out and back in for it to apply.',
				prompts: [
					{
						id: 'usermod-1',
						q: 'How do you add alice to the docker group without touching her other groups?',
						a: 'usermod -aG docker alice',
					},
					{
						id: 'usermod-2',
						q: 'Why is the -a flag critical when using usermod -G?',
						a: 'Without -a, -G replaces the user\'s entire supplementary group list with just the ones named.',
						note: 'A classic footgun: forgetting -a silently strips the user from every other group.',
					},
				],
			},
		],
	},
	{
		id: 'packages',
		title: 'Package Management',
		emoji: '📦',
		description: 'Install, query, and remove software packages.',
		commands: [
			{
				id: 'apt',
				cmd: 'apt',
				syntax: 'apt install nginx',
				description: "Debian/Ubuntu's package manager front-end for installing, updating, and removing software from configured repositories.",
				example: 'sudo apt update && sudo apt upgrade',
				exampleNote: 'Refreshes the package index, then upgrades every installed package to its latest version.',
				prompts: [
					{
						id: 'apt-1',
						q: 'Before `apt install`, which command should usually run first, and why?',
						a: 'apt update — it refreshes the local package index so install sees current versions.',
					},
					{
						id: 'apt-2',
						q: 'apt update vs apt upgrade — what does each do?',
						a: 'update refreshes the package index only; upgrade actually installs the newer versions.',
					},
				],
			},
			{
				id: 'dpkg',
				cmd: 'dpkg',
				syntax: 'dpkg -i app_1.0.deb',
				description: 'Lower-level Debian package tool. -i installs a local .deb file; -S finds which package owns a file.',
				example: 'dpkg -S /usr/bin/curl',
				exampleNote: 'Reports which installed package provides /usr/bin/curl.',
				prompts: [
					{
						id: 'dpkg-1',
						q: 'You downloaded a standalone .deb file. Which command installs it directly from disk?',
						a: 'dpkg -i app.deb',
						note: 'apt normally installs from repositories; dpkg handles local files.',
					},
					{
						id: 'dpkg-2',
						q: 'How do you find which installed package owns a given file, like /usr/bin/curl?',
						a: 'dpkg -S /usr/bin/curl',
					},
				],
			},
			{
				id: 'dnf',
				cmd: 'dnf',
				syntax: 'dnf install httpd',
				description: "Fedora/RHEL's package manager (successor to yum), used for installing and updating RPM-based packages.",
				example: 'sudo dnf update',
				exampleNote: 'Updates all installed packages on a Fedora/RHEL-family system.',
				prompts: [
					{
						id: 'dnf-1',
						q: 'On a RHEL/Fedora server, what is the equivalent of Debian\'s `apt install`?',
						a: 'dnf install',
					},
					{
						id: 'dnf-2',
						q: 'dnf is the successor to which older RHEL package tool?',
						a: 'yum',
					},
				],
			},
			{
				id: 'apt-cache',
				cmd: 'apt-cache',
				syntax: 'apt-cache search redis',
				description: 'Queries the local APT package cache/metadata: search for packages, show details, without installing anything.',
				example: 'apt-cache policy nginx',
				exampleNote: 'Shows the installed and candidate versions of nginx, and which repository each comes from.',
				prompts: [
					{
						id: 'apt-cache-1',
						q: 'What version of nginx would install, and from which repository — how do you check without installing?',
						a: 'apt-cache policy nginx',
					},
					{
						id: 'apt-cache-2',
						q: 'How do you search available packages by keyword on Debian/Ubuntu?',
						a: 'apt-cache search <keyword> (or apt search <keyword>)',
					},
				],
			},
			{
				id: 'apt-list',
				cmd: 'apt list',
				syntax: 'apt list --installed',
				description: "Lists packages by state: every installed package, or those with pending upgrades.",
				example: 'apt list --upgradable',
				exampleNote: 'Shows which installed packages have newer versions available.',
				prompts: [
					{
						id: 'apt-list-1',
						q: 'How do you list every package currently installed on a Debian/Ubuntu system?',
						a: 'apt list --installed',
						note: 'dpkg -l is the lower-level equivalent.',
					},
					{
						id: 'apt-list-2',
						q: 'Which command previews which packages have upgrades pending?',
						a: 'apt list --upgradable',
					},
				],
			},
			{
				id: 'apt-autoremove',
				cmd: 'apt autoremove',
				syntax: 'apt autoremove',
				description: 'Removes packages that were installed as dependencies and are no longer needed by anything.',
				example: 'sudo apt autoremove --purge',
				exampleNote: '--purge also deletes those packages\' config files, not just their binaries.',
				prompts: [
					{
						id: 'autoremove-1',
						q: 'Which command cleans out packages that were pulled in as dependencies but are no longer needed?',
						a: 'apt autoremove',
					},
					{
						id: 'autoremove-2',
						q: 'apt remove vs apt purge — what is the difference?',
						a: 'remove deletes the package but keeps its config files; purge deletes the config files too.',
					},
				],
			},
		],
	},
	{
		id: 'text-tools',
		title: 'File & Text Tools',
		emoji: '🔎',
		description: 'Search, filter, and transform files from the command line.',
		commands: [
			{
				id: 'grep',
				cmd: 'grep',
				syntax: 'grep -ri "error" /var/log/app.log',
				description: 'Searches text for lines matching a pattern. -r recurses into directories, -i ignores case.',
				example: 'grep -rn "TODO" src/',
				exampleNote: 'Recursively finds every "TODO" in the src/ directory, printing file name and line number (-n).',
				prompts: [
					{
						id: 'grep-1',
						q: 'Search a whole directory tree for "TODO", showing file names and line numbers — what do you run?',
						a: 'grep -rn "TODO" src/',
						note: '-r recurses, -n adds line numbers, -i would ignore case.',
					},
					{
						id: 'grep-2',
						q: 'Which grep flag inverts the match — printing lines that do NOT contain the pattern?',
						a: '-v',
						note: 'e.g. `grep -v "^#"` strips comment lines from a config file.',
					},
				],
			},
			{
				id: 'find',
				cmd: 'find',
				syntax: 'find /var/log -name "*.log" -mtime +30',
				description: 'Walks a directory tree and finds files matching criteria: name, size, modification time, and more.',
				example: 'find /tmp -type f -mtime +7 -delete',
				exampleNote: 'Finds files in /tmp untouched for 7+ days and deletes them.',
				prompts: [
					{
						id: 'find-1',
						q: 'Delete log files in /var/log older than 30 days — what do you run?',
						a: 'find /var/log -name "*.log" -mtime +30 -delete',
						note: '-mtime +30 = modified more than 30 days ago. Run without -delete first to preview.',
					},
					{
						id: 'find-2',
						q: 'How do you find every file larger than 100 MB under / ?',
						a: 'find / -type f -size +100M',
					},
				],
			},
			{
				id: 'awk',
				cmd: 'awk',
				syntax: "awk '{print $1}' access.log",
				description: 'Pattern-scanning and text-processing tool, great for pulling specific columns out of structured text.',
				example: "awk '{print $1}' access.log | sort | uniq -c | sort -rn",
				exampleNote: 'Extracts the first column (IP address) from each log line, then counts and ranks occurrences.',
				prompts: [
					{
						id: 'awk-1',
						q: 'Print just the first whitespace-separated field of every line in a log — what do you run?',
						a: "awk '{print $1}' file.log",
					},
					{
						id: 'awk-2',
						q: 'In awk, how do you print the LAST field of each line, whatever its position?',
						a: "awk '{print $NF}'",
						note: 'NF is the field count of the current line, so $NF is always the last field.',
					},
				],
			},
			{
				id: 'sed',
				cmd: 'sed',
				syntax: "sed -i 's/foo/bar/g' config.txt",
				description: 'Stream editor for find-and-replace and other line-based text transformations.',
				example: "sed -i 's/DEBUG=false/DEBUG=true/' .env",
				exampleNote: '-i edits the file in place, replacing the first match of the pattern on each line.',
				prompts: [
					{
						id: 'sed-1',
						q: "What does `sed -i 's/old/new/g' file.txt` do?",
						a: 'Replaces every occurrence of "old" with "new", editing the file in place.',
						note: 's = substitute, g = all occurrences per line, -i = write back to the file.',
					},
					{
						id: 'sed-2',
						q: 'How do you delete every line matching a pattern with sed?',
						a: "sed '/pattern/d' file",
						note: 'Add -i to apply it to the file rather than just printing the result.',
					},
				],
			},
			{
				id: 'xargs',
				cmd: 'xargs',
				syntax: 'find . -name "*.tmp" | xargs rm',
				description: "Builds and runs commands from lines of input, letting you pipe a list of items into a command that doesn't read stdin itself.",
				example: 'find . -name "*.tmp" -print0 | xargs -0 rm',
				exampleNote: 'Deletes every .tmp file found; -print0/-0 safely handles filenames containing spaces.',
				prompts: [
					{
						id: 'xargs-1',
						q: 'find prints a list of files, but rm doesn\'t read filenames from stdin. What bridges them?',
						a: 'xargs — it turns stdin lines into command arguments: find ... | xargs rm',
					},
					{
						id: 'xargs-2',
						q: 'Why pair `find -print0` with `xargs -0`?',
						a: 'They delimit filenames with NUL bytes, so names containing spaces or newlines are handled safely.',
					},
				],
			},
			{
				id: 'cut',
				cmd: 'cut',
				syntax: 'cut -d: -f1 /etc/passwd',
				description: 'Extracts fields or character ranges from each line, split on a single-character delimiter.',
				example: 'cut -d: -f1 /etc/passwd',
				exampleNote: 'Prints every username — field 1 of the colon-separated passwd file.',
				prompts: [
					{
						id: 'cut-1',
						q: 'Extract just the usernames (field 1) from the colon-separated /etc/passwd — what do you run?',
						a: 'cut -d: -f1 /etc/passwd',
						note: '-d sets the delimiter, -f picks the field(s).',
					},
					{
						id: 'cut-2',
						q: 'When do you reach for cut, and when for awk?',
						a: 'cut for simple splits on a fixed single-char delimiter; awk when fields are whitespace-separated or you need logic.',
					},
				],
			},
		],
	},
	{
		id: 'monitoring',
		title: 'System Monitoring',
		emoji: '📊',
		description: 'Check memory, uptime, and overall system load.',
		commands: [
			{
				id: 'free',
				cmd: 'free',
				syntax: 'free -h',
				description: 'Shows total, used, and free physical memory and swap, in human-readable units with -h.',
				example: 'free -h',
				exampleNote: 'Displays RAM and swap usage in MB/GB instead of raw kilobytes.',
				prompts: [
					{
						id: 'free-1',
						q: 'Which command shows how much RAM and swap are currently in use?',
						a: 'free -h',
					},
					{
						id: 'free-2',
						q: 'In free\'s output, why is "available" the number to look at rather than "free"?',
						a: '"available" includes cache/buffers the kernel can instantly reclaim; "free" alone looks alarmingly low on healthy systems.',
					},
				],
			},
			{
				id: 'uptime',
				cmd: 'uptime',
				syntax: 'uptime',
				description: 'Shows how long the system has been running plus the load average over the last 1, 5, and 15 minutes.',
				example: 'uptime',
				exampleNote: 'Example output: "up 14 days, load average: 0.15, 0.22, 0.30".',
				prompts: [
					{
						id: 'uptime-1',
						q: 'The three load-average numbers from uptime cover which time windows?',
						a: 'The last 1, 5, and 15 minutes.',
					},
					{
						id: 'uptime-2',
						q: 'What does a load average of 4.0 mean on a 4-core machine?',
						a: 'The CPUs are exactly saturated on average — anything above 4.0 means work is queuing.',
						note: 'Load average counts runnable (and uninterruptible-IO) tasks, so compare it to core count.',
					},
				],
			},
			{
				id: 'vmstat',
				cmd: 'vmstat',
				syntax: 'vmstat 2 5',
				description: 'Reports virtual memory, process, CPU, and I/O statistics, optionally repeated at an interval.',
				example: 'vmstat 2 5',
				exampleNote: 'Prints a stats snapshot every 2 seconds, 5 times total.',
				prompts: [
					{
						id: 'vmstat-1',
						q: 'What do the two numbers mean in `vmstat 2 5`?',
						a: 'Interval and count: print a snapshot every 2 seconds, 5 times total.',
					},
					{
						id: 'vmstat-2',
						q: 'In vmstat output, what do persistently high si/so columns tell you?',
						a: 'The system is swapping memory in/out — a sign of memory pressure.',
					},
				],
			},
			{
				id: 'iostat',
				cmd: 'iostat',
				syntax: 'iostat -x 2',
				description: 'Reports CPU and disk I/O statistics, helpful for diagnosing whether a slowdown is disk-bound.',
				example: 'iostat -x 2',
				exampleNote: '-x shows extended stats like %util per device, repeated every 2 seconds.',
				prompts: [
					{
						id: 'iostat-1',
						q: 'You suspect a slowdown is disk-bound, not CPU-bound. Which command breaks down per-device disk I/O?',
						a: 'iostat -x',
					},
					{
						id: 'iostat-2',
						q: 'In iostat -x output, what does %util near 100 indicate?',
						a: 'The device is saturated — requests are arriving as fast as it can service them.',
					},
				],
			},
			{
				id: 'w',
				cmd: 'w',
				syntax: 'w',
				description: 'Shows who is logged in and what they are running, plus the same load averages as `uptime`.',
				example: 'w',
				exampleNote: 'Lists each logged-in user, their terminal, login time, idle time, and current command.',
				prompts: [
					{
						id: 'w-1',
						q: 'Which command shows who is currently logged in AND what each of them is running?',
						a: 'w',
					},
					{
						id: 'w-2',
						q: 'What does w show that the simpler `who` does not?',
						a: 'Each user\'s current command and idle time, plus the system load averages.',
					},
				],
			},
			{
				id: 'watch',
				cmd: 'watch',
				syntax: 'watch -n 2 df -h',
				description: 'Re-runs any command at a fixed interval and shows its output full-screen — a live dashboard from any one-shot command.',
				example: 'watch -d -n 2 "ss -tulpn"',
				exampleNote: '-d highlights what changed between refreshes; -n 2 refreshes every 2 seconds.',
				prompts: [
					{
						id: 'watch-1',
						q: 'How do you re-run `df -h` every 2 seconds and watch its output update in place?',
						a: 'watch -n 2 df -h',
					},
					{
						id: 'watch-2',
						q: 'What does watch\'s -d flag add?',
						a: 'It highlights the differences between successive refreshes, so changes jump out.',
					},
				],
			},
		],
	},
	{
		id: 'archives',
		title: 'Archives & Transfer',
		emoji: '🗜️',
		description: 'Package, compress, and move files between machines.',
		commands: [
			{
				id: 'tar',
				cmd: 'tar',
				syntax: 'tar -czvf backup.tar.gz /data',
				description: 'Bundles files into an archive (and usually compresses it). -c create, -z gzip, -v verbose, -f filename; -x extracts.',
				example: 'tar -xzvf backup.tar.gz -C /restore',
				exampleNote: 'Extracts (-x) a gzip-compressed (-z) archive verbosely into the /restore directory.',
				prompts: [
					{
						id: 'tar-1',
						q: 'Which tar flags extract a gzip-compressed archive?',
						a: '-xzvf (extract, gzip, verbose, file)',
						note: '-c creates instead of extracting; -t lists contents without extracting.',
					},
					{
						id: 'tar-2',
						q: 'Create a gzip-compressed archive of /data — what do you run?',
						a: 'tar -czvf backup.tar.gz /data',
					},
				],
			},
			{
				id: 'rsync',
				cmd: 'rsync',
				syntax: 'rsync -avz /data/ user@host:/backup/',
				description: 'Efficiently syncs files/directories locally or over SSH, transferring only the differences on repeat runs.',
				example: 'rsync -avz --delete /data/ user@host:/backup/',
				exampleNote: '--delete also removes files at the destination that no longer exist in the source, keeping them in sync.',
				prompts: [
					{
						id: 'rsync-1',
						q: 'Why is rsync preferred over scp for repeated backups of the same directory?',
						a: 'Its delta-transfer algorithm sends only what changed since last time, so repeat syncs are fast.',
					},
					{
						id: 'rsync-2',
						q: 'What does rsync\'s --delete flag do?',
						a: 'Removes destination files that no longer exist in the source — making the destination a true mirror.',
						note: 'Powerful but destructive: run with -n (dry run) first.',
					},
				],
			},
			{
				id: 'scp',
				cmd: 'scp',
				syntax: 'scp file.txt user@host:/remote/path/',
				description: 'Copies files to or from a remote machine over SSH, a quick one-off alternative to rsync.',
				example: 'scp -r ./dist user@host:/var/www/app',
				exampleNote: '-r recursively copies a whole directory to the remote server.',
				prompts: [
					{
						id: 'scp-1',
						q: 'Copy a single config file to a remote server over SSH, one time — simplest tool and syntax?',
						a: 'scp config.yml user@host:/etc/app/',
					},
					{
						id: 'scp-2',
						q: 'Which scp flag copies a whole directory recursively?',
						a: '-r',
					},
				],
			},
			{
				id: 'gzip',
				cmd: 'gzip',
				syntax: 'gzip access.log',
				description: 'Compresses a file in place, replacing it with a .gz version (use gunzip or `gzip -d` to reverse it).',
				example: 'gzip -k access.log',
				exampleNote: '-k (keep) compresses to access.log.gz but keeps the original file too.',
				prompts: [
					{
						id: 'gzip-1',
						q: 'By default, what happens to the original file when you run `gzip file.txt`?',
						a: 'It is replaced by file.txt.gz — the original is removed.',
						note: 'Use -k to keep the original alongside the compressed copy.',
					},
					{
						id: 'gzip-2',
						q: 'Two ways to decompress a .gz file?',
						a: 'gunzip file.gz, or gzip -d file.gz',
						note: 'zcat / zless read the contents without decompressing on disk.',
					},
				],
			},
			{
				id: 'wget',
				cmd: 'wget',
				syntax: 'wget https://example.com/file.tar.gz',
				description: 'Downloads files from the web via HTTP/HTTPS/FTP, well suited to scripting and unattended/background downloads.',
				example: 'wget -O app.tar.gz https://example.com/latest',
				exampleNote: '-O sets the output filename explicitly instead of guessing from the URL.',
				prompts: [
					{
						id: 'wget-1',
						q: 'Download a release tarball in a script, saving it under a specific filename — what do you run?',
						a: 'wget -O app.tar.gz <url>',
					},
					{
						id: 'wget-2',
						q: 'A large download was interrupted. Which wget flag resumes it instead of restarting?',
						a: '-c (continue)',
					},
				],
			},
			{
				id: 'dd',
				cmd: 'dd',
				syntax: 'dd if=image.iso of=/dev/sdX bs=4M status=progress',
				description: 'Copies raw bytes between devices and files — writing boot images to USB sticks, cloning disks, wiping drives.',
				example: 'dd if=ubuntu.iso of=/dev/sdb bs=4M status=progress',
				exampleNote: 'Writes the ISO directly onto the USB stick at /dev/sdb. Triple-check of= — dd overwrites without asking.',
				prompts: [
					{
						id: 'dd-1',
						q: 'Write an ISO image onto a USB stick at /dev/sdb — what do you run?',
						a: 'dd if=ubuntu.iso of=/dev/sdb bs=4M status=progress',
						note: 'if= input file, of= output device, bs= block size, status=progress shows a live counter.',
					},
					{
						id: 'dd-2',
						q: 'Why is dd famously dangerous?',
						a: 'It writes raw bytes to whatever of= points at, with no confirmation — a mistyped device name destroys a disk.',
						note: 'Verify the target with lsblk before every dd run.',
					},
				],
			},
		],
	},
	{
		id: 'services',
		title: 'Services & Scheduling',
		emoji: '⏰',
		description: 'Manage systemd services and schedule recurring jobs.',
		commands: [
			{
				id: 'systemctl',
				cmd: 'systemctl',
				syntax: 'systemctl restart nginx',
				description: 'Controls systemd services: start, stop, restart, enable at boot, and check status.',
				example: 'systemctl status nginx',
				exampleNote: 'Shows whether nginx is running, its recent log lines, and its enabled/disabled state.',
				prompts: [
					{
						id: 'systemctl-1',
						q: 'systemctl start vs systemctl enable — what is the difference?',
						a: 'start runs the service right now; enable makes it start automatically on every boot.',
						note: 'They\'re independent — a freshly enabled service isn\'t running until started (or use enable --now).',
					},
					{
						id: 'systemctl-2',
						q: 'A service just failed. Which command shows its state plus its most recent log lines in one view?',
						a: 'systemctl status <unit>',
					},
				],
			},
			{
				id: 'crontab',
				cmd: 'crontab',
				syntax: 'crontab -e',
				description: "Edits the current user's scheduled cron jobs. -l lists them, -e opens them in an editor.",
				example: '0 3 * * * /opt/scripts/backup.sh',
				exampleNote: 'A crontab line running backup.sh every day at 3:00 AM.',
				prompts: [
					{
						id: 'crontab-1',
						q: 'What does the cron schedule `0 3 * * *` mean?',
						a: 'Every day at 3:00 AM (minute 0 of hour 3).',
					},
					{
						id: 'crontab-2',
						q: 'What are the five cron fields, in order?',
						a: 'minute, hour, day-of-month, month, day-of-week',
					},
				],
			},
			{
				id: 'journalctl-u',
				cmd: 'journalctl -u',
				syntax: 'journalctl -u sshd.service --no-pager',
				description: 'Filters the systemd journal to logs from one specific unit — the fastest way to see why a service failed to start.',
				example: 'journalctl -u sshd.service -p err',
				exampleNote: '-p err further filters to only error-priority-or-worse messages from that unit.',
				prompts: [
					{
						id: 'journalctl-u-1',
						q: 'A service failed to start. Which command shows just that service\'s recent journal entries?',
						a: 'journalctl -u <service>',
					},
					{
						id: 'journalctl-u-2',
						q: 'How do you filter a unit\'s journal down to error-priority-and-worse messages only?',
						a: 'journalctl -u <unit> -p err',
					},
				],
			},
			{
				id: 'timedatectl',
				cmd: 'timedatectl',
				syntax: 'timedatectl set-timezone UTC',
				description: 'Views and controls the system clock, timezone, and NTP synchronization status.',
				example: 'timedatectl',
				exampleNote: 'With no arguments, shows local time, UTC time, timezone, and whether NTP sync is active.',
				prompts: [
					{
						id: 'timedatectl-1',
						q: 'Cron jobs fire at odd times and you suspect the server\'s timezone. Which command both shows and can fix it?',
						a: 'timedatectl (and timedatectl set-timezone <tz> to fix)',
					},
					{
						id: 'timedatectl-2',
						q: 'How do you turn on NTP clock synchronization with timedatectl?',
						a: 'timedatectl set-ntp true',
					},
				],
			},
			{
				id: 'at',
				cmd: 'at',
				syntax: 'echo "systemctl restart app" | at 02:00',
				description: 'Schedules a one-off command to run once at a future time — unlike cron, which is for recurring schedules.',
				example: 'at now + 30 minutes',
				exampleNote: 'Opens a prompt to enter a command that runs exactly once, 30 minutes from now.',
				prompts: [
					{
						id: 'at-1',
						q: 'Run a single command once, tonight at 2 AM — cron or at, and why?',
						a: 'at (e.g. `at 02:00`) — it schedules one-time execution; cron is for recurring schedules.',
					},
					{
						id: 'at-2',
						q: 'How do you list pending `at` jobs, and cancel one?',
						a: 'atq lists them; atrm <job-number> cancels one.',
					},
				],
			},
			{
				id: 'systemd-analyze',
				cmd: 'systemd-analyze',
				syntax: 'systemd-analyze blame',
				description: 'Measures boot performance: total boot time, and which units took longest to start.',
				example: 'systemd-analyze blame | head',
				exampleNote: 'Ranks units by startup time — the usual suspects when boot feels slow.',
				prompts: [
					{
						id: 'systemd-analyze-1',
						q: 'Boot feels slow. Which command ranks services by how long each took to start?',
						a: 'systemd-analyze blame',
					},
					{
						id: 'systemd-analyze-2',
						q: 'How do you see the machine\'s total boot time, split into firmware/loader/kernel/userspace?',
						a: 'systemd-analyze (with no arguments)',
					},
				],
			},
		],
	},
];

export const allCommands: Command[] = categories.flatMap((c) => c.commands);

export const promptCount = allCommands.reduce((n, c) => n + c.prompts.length, 0);

export function categoryOf(commandId: string): Category | undefined {
	return categories.find((c) => c.commands.some((cmd) => cmd.id === commandId));
}

/**
 * Order in which new commands are introduced: round-robin across categories,
 * so early days mix topics instead of grinding one category at a time.
 */
export const introductionOrder: string[] = (() => {
	const order: string[] = [];
	const maxLen = Math.max(...categories.map((c) => c.commands.length));
	for (let i = 0; i < maxLen; i++) {
		for (const category of categories) {
			const cmd = category.commands[i];
			if (cmd) order.push(cmd.id);
		}
	}
	return order;
})();
