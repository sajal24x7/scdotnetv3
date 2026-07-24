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
	// For plain q/a prompts, the question text. For cloze prompts
	// (kind: 'cloze'), the full statement with the hidden span(s) wrapped in
	// {{…}} markers.
	q: string;
	// Canonical short answer — a command, flag, or 1–2 words. For cloze
	// prompts, the hidden text (joined with ' · ' for multiple deletions).
	a: string;
	note?: string;
	// Absent = plain question/answer. 'cloze' = fill-in-the-blank.
	kind?: 'cloze';
}

export interface CommandExample {
	code: string;
	note?: string;
}

export interface Command {
	id: string;
	cmd: string;
	syntax: string;
	description: string;
	// Optional longer paragraph for the reference panel, below `description`.
	explanation?: string;
	// Required unless `examples` is given instead (richer commands use the
	// list below and drop this single-example pair).
	example?: string;
	exampleNote?: string;
	// Richer commands: extra worked examples beyond `example`/`exampleNote`,
	// shown as an additional list on the reference panel.
	examples?: CommandExample[];
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
				explanation:
					"df ('disk free') reports one line per mounted filesystem: total size, used space, available space, use percentage, and mount point. Without -h, sizes print in 1K blocks, which is why -h (human-readable — auto-scaling to K/M/G) is almost always worth adding. Run it bare with no arguments to see every mount at once, or point it at any path to see just the filesystem that path lives on.",
				examples: [
					{ code: 'df -h', note: 'Every mounted filesystem, sizes in human-readable units.' },
					{ code: 'df -h /var', note: 'Just the filesystem containing /var — handy when /var is its own partition.' },
					{ code: 'df -i', note: 'Shows inode usage instead of space — a filesystem can be "full" on inodes with plenty of bytes free.' },
				],
				prompts: [
					{
						id: 'df-1',
						q: 'Which command shows free and used disk space per mounted filesystem?',
						a: 'df -h',
						note: '-h prints sizes in human-readable units (GB/MB) instead of raw 1K blocks. “Disk is full — which mount?” → df. “What is eating this mount?” → du.',
					},
					{
						id: 'df-2',
						q: 'df -h shows plenty of free space, yet writes fail with "No space left on device". Which df flag reveals the likely cause?',
						a: '-i',
						note: 'Inode usage — a filesystem can run out of inodes with bytes to spare.',
					},
				],
			},
			{
				id: 'du',
				cmd: 'du',
				syntax: 'du -sh *',
				description: 'Estimates disk usage of files and directories, useful for finding what is eating up space.',
				explanation:
					"du ('disk usage') walks a directory tree and totals up the actual space files consume, recursing by default — which means an unadorned `du` on a big tree prints one line per file and buries you. -s collapses that to one summary line per argument, -h makes it human-readable, and combining them with a glob (`*`) gives a per-item breakdown you can scan or pipe to `sort -rh` to find the biggest offender fast.",
				examples: [
					{ code: 'du -sh /var/log/*', note: 'One summarized, human-readable size per item under /var/log.' },
					{ code: 'du -sh .', note: 'Total size of the current directory, recursively, as one line.' },
					{ code: 'du -ah --max-depth=1 /home | sort -rh', note: 'Depth-limited listing sorted largest-first — the fastest way to find what to delete.' },
				],
				prompts: [
					{
						id: 'du-1',
						q: 'You want one human-readable size per item under /home, to spot the biggest. What do you run?',
						a: 'du -sh /home/*',
						note: 'Canonical form here: -s (one summary line per argument) plus -h (human-readable). Pipe to `sort -rh` to rank largest-first.',
					},
					{
						id: 'du-2',
						q: 'Which du flag collapses output to one summary line per argument, instead of one line per subdirectory?',
						a: '-s',
						note: '-h (human-readable sizes) is its usual companion: du -sh.',
					},
				],
			},
			{
				id: 'lsblk',
				cmd: 'lsblk',
				syntax: 'lsblk -f',
				description: 'Lists block devices (disks and partitions) as a tree, with the -f flag adding filesystem type and UUID.',
				explanation:
					"lsblk reads what the kernel currently sees, not a config file, so it's always accurate for 'what disks and partitions actually exist right now.' The plain form shows the device tree (disk → partitions) with sizes; -f adds filesystem type, label, and UUID per partition; -o lets you pick exactly the columns you want when you're scripting against the output.",
				examples: [
					{ code: 'lsblk -f', note: 'Each disk, its partitions, filesystem type, and mount point.' },
					{ code: 'lsblk', note: 'Plain device tree with sizes — no filesystem info, just the physical layout.' },
					{ code: 'lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT', note: 'Custom column set — useful when piping into a script.' },
				],
				prompts: [
					{
						id: 'lsblk-1',
						q: 'Which command lists all block devices and their partition layout as a tree?',
						a: 'lsblk',
						note: '`fdisk -l` also works but is heavier and needs root.',
					},
					{
						id: 'lsblk-2',
						q: 'Which lsblk flag adds filesystem type, label, and UUID to the listing?',
						a: '-f',
					},
				],
			},
			{
				id: 'mount',
				cmd: 'mount',
				syntax: 'mount /dev/sdb1 /mnt/data',
				description: 'Attaches a filesystem on a device to a directory (mount point) so its contents become accessible.',
				explanation:
					"Before mounting, a device's contents are invisible to normal file access — mounting is what makes them appear under a directory. A manual `mount` like this is temporary and disappears on reboot; persistent mounts belong in /etc/fstab, and `mount -a` mounts everything listed there without a reboot. The target directory (mount point) must already exist and, ideally, be empty — anything already in it becomes hidden (not deleted) while the mount is active.",
				examples: [
					{ code: 'mount /dev/sdb1 /mnt/data', note: 'Mounts the partition /dev/sdb1 at /mnt/data.' },
					{ code: 'mount', note: 'No arguments — lists every currently mounted filesystem, device, and options.' },
					{ code: 'mount -a', note: "Mounts everything listed in /etc/fstab that isn't already mounted." },
				],
				prompts: [
					{
						id: 'mount-1',
						q: 'Which command, run with no arguments at all, lists every currently mounted filesystem and its options?',
						a: 'mount',
						note: 'findmnt shows the same data as a tree.',
					},
					{
						id: 'mount-2',
						q: 'Attach the partition /dev/sdb1 at the directory /mnt/data — what do you run?',
						a: 'mount /dev/sdb1 /mnt/data',
						note: 'Device first, mount point second. The directory must already exist; manual mounts vanish on reboot (persist them in /etc/fstab).',
					},
				],
			},
			{
				id: 'fdisk',
				cmd: 'fdisk',
				syntax: 'fdisk -l',
				description: "Views or edits a disk's partition table. `fdisk -l` lists partitions on all disks without changing anything.",
				explanation:
					"fdisk edits the classic MBR-style partition table (and has decent modern GPT support too — for GPT-heavy work, `gdisk` or `parted` are the traditional specialists). Called with -l it's purely read-only reporting. Called on a device with no -l, it drops into an interactive prompt where single-letter commands (n, d, w...) queue up real changes — and `w` writes them to disk immediately, so that mode is only for when you actually intend to repartition.",
				examples: [
					{ code: 'fdisk -l', note: 'Lists partitions on every disk — read-only, safe to run any time.' },
					{ code: 'sudo fdisk -l /dev/sda', note: 'Partition table of /dev/sda only: sizes, types, start/end sectors.' },
					{ code: 'sudo fdisk /dev/sdb', note: "Opens the interactive editor on /dev/sdb — nothing is written until you type 'w'." },
				],
				prompts: [
					{
						id: 'fdisk-1',
						q: 'Which fdisk invocation inspects partition tables read-only, with no risk of modifying any disk?',
						a: 'fdisk -l',
						note: 'Without -l, fdisk opens an interactive editor that can rewrite the partition table.',
					},
					{
						id: 'fdisk-2',
						q: '`fdisk /dev/sda` (no -l) does not just print the partition table — what does it open instead?',
						a: 'interactive partition editor',
						note: "Single-letter commands queue changes, and 'w' writes them to disk immediately — only enter it when you mean to repartition.",
					},
				],
			},
			{
				id: 'blkid',
				cmd: 'blkid',
				syntax: 'blkid',
				description: 'Prints each partition\'s UUID, filesystem type, and label — the identifiers you use in /etc/fstab.',
				explanation:
					"blkid reads the filesystem's own superblock rather than guessing from the device name, which is why its output — UUID, TYPE, LABEL — is trustworthy for /etc/fstab entries. Device names like /dev/sdb1 depend on enumeration order at boot and can silently shift when disks are added, removed, or a USB drive enumerates differently; the UUID is generated once when the filesystem is created and never changes, so fstab entries keyed on it survive hardware reshuffles that would otherwise mount the wrong disk in the wrong place.",
				examples: [
					{ code: 'blkid', note: 'Lists UUID, filesystem type, and label for every partition on the system.' },
					{ code: 'sudo blkid /dev/sdb1', note: 'Just this one partition — UUID and type, ready to paste into fstab.' },
					{ code: 'blkid -o value -s UUID /dev/sdb1', note: 'Prints only the raw UUID value — convenient for scripting.' },
				],
				prompts: [
					{
						id: 'blkid-1',
						q: 'Which command prints each partition\'s UUID and filesystem type (e.g. for writing /etc/fstab)?',
						a: 'blkid',
					},
					{
						id: 'blkid-2',
						q: 'In /etc/fstab, which identifier keeps mounting the right disk even when device names shift between boots?',
						a: 'UUID',
						note: 'Names like /dev/sdb1 depend on enumeration order at boot; the UUID is written into the filesystem at creation and never changes.',
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
						kind: 'cloze',
						q: 'Only SSH entries from the last hour: journalctl -u ssh {{--since}} "1 hour ago"',
						a: '--since',
						note: 'Takes human-friendly time expressions: "1 hour ago", "yesterday", "2026-01-01".',
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
						q: 'Which tail flag keeps the file open and prints new lines as they are appended, in real time?',
						a: '-f',
						note: 'Plain tail prints the last 10 lines and exits. -F additionally survives log rotation.',
					},
					{
						id: 'tail-2',
						kind: 'cloze',
						q: 'Show the last 100 lines, then keep streaming new ones: tail {{-n 100 -f}} file.log',
						a: '-n 100 -f',
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
						q: 'Which dmesg flag replaces seconds-since-boot with human-readable timestamps?',
						a: '-T',
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
						q: 'Which tool rotates, compresses, and eventually deletes old log files so they never fill the disk?',
						a: 'logrotate',
						note: 'Per-log rules live in /etc/logrotate.d/; a daily job runs them.',
					},
					{
						id: 'logrotate-2',
						q: 'Which logrotate flag does a dry run — showing what would rotate without doing it?',
						a: '-d',
						note: 'Debug mode: prints the plan without touching any file.',
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
						q: 'List the machine\'s recent reboots using `last` — what do you run?',
						a: 'last reboot',
						note: 'The pseudo-user "reboot" filters the history to system reboots.',
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
						q: 'Using ps, snapshot every running process and filter to lines mentioning nginx — what is the classic pipeline?',
						a: 'ps aux | grep nginx',
						note: 'pgrep -a nginx is the tidier purpose-built alternative.',
					},
					{
						id: 'ps-2',
						q: 'In `ps aux`, which letter includes daemons — processes with no controlling terminal?',
						a: 'x',
						note: "a = all users' processes, u = user-oriented columns (CPU/mem).",
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
						a: 'M',
						note: 'Shift+m. P sorts by CPU, k prompts for a PID to kill, q quits.',
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
						q: 'Which signal cannot be caught or ignored — the instant, no-cleanup kill?',
						a: 'SIGKILL (-9)',
						note: 'Always try plain kill (SIGTERM) first; -9 can leave temp files, locks, or corrupt state behind.',
					},
					{
						id: 'kill-2',
						q: 'Which signal does `kill 1234` send when no signal is specified?',
						a: 'SIGTERM (15)',
						note: 'The graceful request — the process may catch it and clean up before exiting.',
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
						q: 'Which niceness value gives a process the lowest possible CPU priority?',
						a: '19',
						note: 'The range is -20 (highest priority) to 19; only root may set negative values.',
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
						q: 'Which command prints just the PIDs of every running "python" process?',
						a: 'pgrep python',
						note: '-a adds the full command line next to each PID.',
					},
					{
						id: 'pgrep-2',
						q: 'Which command signals processes matched by name, instead of by PID?',
						a: 'pkill',
						note: "pgrep's acting sibling — same matching rules, but sends SIGTERM (by default) instead of printing PIDs.",
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
						a: 'ip addr show',
						note: 'Short form: ip a. Successor to the older ifconfig.',
					},
					{
						id: 'ip-2',
						q: 'View the routing table, including the default gateway — what do you run?',
						a: 'ip route show',
						note: 'Short form: ip r. The "default via …" line is the gateway.',
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
						q: 'ss replaces which older socket-inspection tool?',
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
						a: '-I',
						note: 'Long form --head. Fast way to check status, redirects, and server headers.',
					},
					{
						id: 'curl-2',
						kind: 'cloze',
						q: 'Print just the HTTP status code: curl -o /dev/null -s {{-w}} "%{http_code}" <url>',
						a: '-w',
						note: '-w prints the format string after the transfer; -o /dev/null discards the body, -s silences progress.',
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
						kind: 'cloze',
						q: 'Send exactly 4 pings, then stop: ping {{-c 4}} 8.8.8.8',
						a: '-c 4',
						note: 'Without -c, ping runs until Ctrl+C.',
					},
					{
						id: 'ping-2',
						q: 'Which protocol does ping use?',
						a: 'ICMP',
						note: 'Echo request / echo reply — that\'s why ping can work when TCP services are down, and be blocked while they\'re up.',
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
						q: 'Which traceroute flag skips reverse-DNS lookups so the hop list prints much faster?',
						a: '-n',
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
						q: 'Which dig option prints only the resolved values, omitting all query metadata?',
						a: '+short',
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
						a: 'rw-r--r--',
						note: 'Owner read+write, group and others read-only. Read=4, write=2, execute=1; each octal digit is one of owner/group/others.',
					},
					{
						id: 'chmod-2',
						q: 'Add execute permission to a script without changing any other bits — what do you run?',
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
						kind: 'cloze',
						q: 'Give alice ownership and set group devs in one command: chown {{alice:devs}} report.txt',
						a: 'alice:devs',
						note: 'user:group — one colon-joined argument sets both at once.',
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
						q: 'Which useradd flag sets the new account\'s login shell?',
						a: '-s',
						note: 'e.g. useradd -m -s /bin/bash alice',
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
						q: 'Re-enable a password-locked account — what do you run?',
						a: 'sudo passwd -u alice',
						note: '-u unlocks what -l locked.',
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
						q: 'Which sudo flag runs the command as a specific non-root user?',
						a: '-u',
						note: 'e.g. sudo -u postgres psql',
					},
					{
						id: 'sudo-2',
						q: 'What is the only safe way to edit /etc/sudoers (the file defining who may use sudo)?',
						a: 'visudo',
						note: 'It syntax-checks before saving — a broken sudoers can lock everyone out of root.',
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
						q: 'Add alice to the docker group without touching her other groups — what do you run?',
						a: 'usermod -aG docker alice',
						note: 'She must log out and back in for it to apply.',
					},
					{
						id: 'usermod-2',
						q: 'After `usermod -G docker alice` (note: no -a), what happens to alice\'s other supplementary groups?',
						a: 'all removed',
						note: 'The classic footgun: without -a (append), -G replaces the entire supplementary group list.',
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
						q: 'Which command refreshes the local package index, and should usually run before `apt install`?',
						a: 'apt update',
						note: 'Otherwise install resolves against a stale index.',
					},
					{
						id: 'apt-2',
						q: 'Which apt subcommand actually installs the newer versions of all installed packages?',
						a: 'apt upgrade',
						note: 'update only refreshes the index; upgrade does the installing.',
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
						q: 'Find which installed package owns the file /usr/bin/curl — what do you run?',
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
						q: 'Search available packages by keyword using the apt-cache tool — what do you run?',
						a: 'apt-cache search <keyword>',
						note: '`apt search` is the friendlier front-end for the same query.',
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
						q: 'Which apt subcommand uninstalls a package AND deletes its config files?',
						a: 'apt purge',
						note: 'apt remove keeps the config files around for a future reinstall.',
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
						kind: 'cloze',
						q: 'Delete logs untouched for over 30 days: find /var/log -name "*.log" {{-mtime +30}} -delete',
						a: '-mtime +30',
						note: '+30 = modified more than 30 days ago. Run without -delete first to preview.',
					},
					{
						id: 'find-2',
						q: 'Find every file larger than 100 MB under / — what do you run?',
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
						q: 'In awk, which expression always refers to the LAST field of a line, whatever its position?',
						a: '$NF',
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
						kind: 'cloze',
						q: "Write the substitution back into the file itself: sed {{-i}} 's/old/new/g' config.txt",
						a: '-i',
						note: 's = substitute; the trailing g replaces every match on each line, not just the first.',
					},
					{
						id: 'sed-2',
						q: 'Delete every line matching a pattern with sed — what do you run?',
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
						q: 'find prints a list of files, but rm doesn\'t read filenames from stdin. Which command bridges them?',
						a: 'xargs',
						note: 'It turns stdin lines into command arguments: find ... | xargs rm',
					},
					{
						id: 'xargs-2',
						q: 'Which find/xargs flag pair delimits filenames with NUL bytes, so names with spaces survive?',
						a: '-print0 and -0',
						note: 'find . -name "*.tmp" -print0 | xargs -0 rm',
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
						q: 'Fields split on one fixed character and nothing clever needed — which minimal tool slices them out?',
						a: 'cut',
						note: 'Reach for awk instead when fields are whitespace-separated or you need logic.',
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
						q: 'In free\'s output, which column shows memory the kernel can actually give to new processes (reclaimable cache included)?',
						a: 'available',
						note: 'The "free" column alone looks alarmingly low on healthy systems — page cache counts as used.',
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
						a: '1, 5, and 15 minutes',
					},
					{
						id: 'uptime-2',
						q: 'On a 4-core machine, above which load average does work start queuing?',
						a: '4.0',
						note: 'Load average counts runnable (and uninterruptible-IO) tasks — compare it to the core count, not to 1.0.',
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
						q: 'In `vmstat 2 5`, what are the 2 and the 5 (in order)?',
						a: 'interval, count',
						note: 'A snapshot every 2 seconds, 5 times total.',
					},
					{
						id: 'vmstat-2',
						q: 'Persistently high si/so columns in vmstat mean the system is doing what?',
						a: 'swapping',
						note: 'Swap-in / swap-out traffic — a sign of memory pressure.',
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
						q: 'In iostat -x output, %util pinned near 100 means the device is what?',
						a: 'saturated',
						note: 'Requests arrive as fast as the device can service them.',
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
						q: 'w\'s header line shows the same load averages as which other command?',
						a: 'uptime',
						note: 'Per user, w also adds idle time and current command — the things plain `who` lacks.',
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
						q: 'Re-run `df -h` every 2 seconds and watch its output update in place — what do you run?',
						a: 'watch -n 2 df -h',
						note: '-n sets the refresh interval in seconds.',
					},
					{
						id: 'watch-2',
						q: 'Which watch flag highlights the differences between successive refreshes?',
						a: '-d',
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
						a: '-xzvf',
						note: 'Extract, gzip, verbose, file. -t instead of -x lists contents without extracting.',
					},
					{
						id: 'tar-2',
						kind: 'cloze',
						q: 'Create a gzip-compressed archive of /data: tar {{-czvf}} backup.tar.gz /data',
						a: '-czvf',
						note: 'Create, gzip, verbose, file — -f must come last, right before the archive name.',
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
						q: 'Which transfer mechanism makes rsync faster than scp on repeated syncs of the same directory?',
						a: 'delta transfer',
						note: 'Only the parts that changed since last time are sent over the wire.',
					},
					{
						id: 'rsync-2',
						q: 'Which rsync flag removes destination files that no longer exist in the source, making a true mirror?',
						a: '--delete',
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
						q: 'Which gzip flag keeps the original file alongside the new .gz copy?',
						a: '-k',
						note: 'By default `gzip file.txt` replaces the file with file.txt.gz.',
					},
					{
						id: 'gzip-2',
						q: 'Decompress file.gz using the gzip binary itself — what do you run?',
						a: 'gzip -d file.gz',
						note: 'gunzip is the same thing; zcat / zless read the contents without decompressing on disk.',
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
						a: '-c',
						note: 'Mnemonic: continue.',
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
						q: 'dd overwrites whatever of= names, with no confirmation. Which command do you run first to verify the target device?',
						a: 'lsblk',
						note: 'A mistyped device name destroys a disk — check the device tree before every dd run.',
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
						q: 'Which systemctl verb makes a service start automatically at every boot (without starting it now)?',
						a: 'enable',
						note: 'start runs it right now; they\'re independent. `enable --now` does both at once.',
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
						kind: 'cloze',
						q: 'Run backup.sh every day at 3:00 AM: {{0 3 * * *}} /opt/scripts/backup.sh',
						a: '0 3 * * *',
						note: 'Minute 0 of hour 3, every day. Edit with crontab -e, list with crontab -l.',
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
						q: 'Filter a unit\'s journal to error-priority-and-worse messages only — which flag and value do you add?',
						a: '-p err',
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
						q: 'Cron jobs fire at odd times and you suspect the server\'s timezone. Which command shows time, timezone, and NTP state?',
						a: 'timedatectl',
						note: 'Fix it with timedatectl set-timezone <tz>.',
					},
					{
						id: 'timedatectl-2',
						q: 'Turn on NTP clock synchronization with timedatectl — what do you run?',
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
						q: 'Which scheduler runs a command exactly once at a future time, rather than on a recurring schedule?',
						a: 'at',
						note: 'echo "systemctl restart app" | at 02:00 — cron is for recurring jobs.',
					},
					{
						id: 'at-2',
						q: 'List the pending `at` jobs — what do you run?',
						a: 'atq',
					},
					{
						id: 'at-3',
						q: 'Cancel pending `at` job number 3 — what do you run?',
						a: 'atrm 3',
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
						q: 'See the machine\'s total boot time, split into firmware/loader/kernel/userspace — what do you run?',
						a: 'systemd-analyze',
						note: 'No arguments needed; blame and critical-chain drill into the slow parts.',
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

// Hand-curated, pedagogically ordered introduction — fundamentals first
// (reading files, searching, checking disk/process/memory health), then the
// text-processing pipeline, then services/users/networking/packages, then
// storage & transfer, ending with the specialist diagnostics. Categories are
// deliberately interleaved a little within each phase so early days mix
// topics instead of grinding one category at a time.
export const introductionOrder: string[] = [
	// Phase 1 — everyday fundamentals: read files, search, first health checks.
	'less',
	'grep',
	'tail',
	'df',
	'ps',
	'sudo',
	'find',
	'top',
	'du',
	'apt',
	'chmod',
	'free',
	// Phase 2 — core toolbelt: signals, services, logs, the text pipeline.
	'kill',
	'systemctl',
	'journalctl',
	'cut',
	'awk',
	'sed',
	'xargs',
	'chown',
	'pgrep',
	'uptime',
	'tar',
	'ss',
	// Phase 3 — broaden out: scheduling, networking basics, accounts, packages.
	'crontab',
	'ip',
	'ping',
	'curl',
	'useradd',
	'passwd',
	'usermod',
	'dpkg',
	'apt-cache',
	'apt-list',
	'watch',
	'w',
	// Phase 4 — storage & disks, file transfer, deeper networking.
	'lsblk',
	'mount',
	'scp',
	'rsync',
	'gzip',
	'wget',
	'blkid',
	'fdisk',
	'dig',
	'traceroute',
	'lsof',
	'nice',
	// Phase 5 — specialist diagnostics and the long tail.
	'journalctl-u',
	'dmesg',
	'vmstat',
	'iostat',
	'logrotate',
	'last',
	'timedatectl',
	'at',
	'dnf',
	'apt-autoremove',
	'systemd-analyze',
	'dd',
];
