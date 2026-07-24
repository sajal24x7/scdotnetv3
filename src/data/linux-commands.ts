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
				explanation:
					"On systemd machines, journalctl replaces grepping through scattered files under /var/log — services log to a single structured, indexed binary journal instead, and journalctl is the query layer over it. That structure is what makes -u (filter to one unit), --since (time-range filtering), and -p (priority filtering) all fast even on a journal spanning months, where the equivalent grep over rotated text files would mean re-scanning everything.",
				examples: [
					{ code: 'journalctl -u ssh --since "1 hour ago"', note: 'SSH service log entries from the last hour.' },
					{ code: 'journalctl -u nginx -f', note: 'Follows nginx\'s journal live, like `tail -f`.' },
					{ code: 'journalctl -p err -b', note: 'Error-priority-or-worse messages since the current boot only.' },
				],
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
				explanation:
					"tail reads from the end of a file instead of the start, which is why it's the default tool for 'what just happened' on a log, versus `head` for 'what happened first' or `less` for browsing the whole thing. -f keeps the file descriptor open and streams new writes as they land, turning a static file into a live view — the standard way to watch a service log while reproducing a bug in real time.",
				examples: [
					{ code: 'tail -n 100 -f /var/log/nginx/error.log', note: 'Last 100 lines, then keeps streaming new ones.' },
					{ code: 'tail -f /var/log/syslog', note: 'Follows syslog live with the default 10-line initial window.' },
					{ code: 'tail -F /var/log/app.log', note: 'Like -f but also re-attaches if the file gets rotated out from under it.' },
				],
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
				explanation:
					"The kernel ring buffer is a fixed-size in-memory log the kernel itself writes to, below the level of any userspace logging daemon — it's where hardware detection, driver load/fail events, and OOM-killer activity show up, often before syslog or journald even exist for a given event. Being fixed-size, it's a ring: old messages get overwritten by new ones, so on a long-running system dmesg only shows the recent tail, and -T is worth adding since raw kernel timestamps are just seconds since boot, not wall-clock time.",
				examples: [
					{ code: 'dmesg -T | grep -i usb', note: 'Kernel messages mentioning USB, with real timestamps.' },
					{ code: 'dmesg | tail -20', note: 'The 20 most recent kernel messages, raw boot-relative timestamps.' },
					{ code: 'dmesg -T -l err,crit', note: 'Only error/critical-level kernel messages, human-readable time.' },
				],
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
				explanation:
					"less reads the file lazily as you scroll, rather than loading it all upfront the way its ancestor `more` (and a plain editor) does — that's the whole reason it can open a multi-gigabyte log instantly and why its name is the joke 'less is more'. Because it never loads everything, forward search (/) is efficient even on huge files, and +G on the command line jumps straight to the end before you even start scrolling — handy since logs are usually read newest-first.",
				examples: [
					{ code: 'less /var/log/auth.log', note: 'Opens the file; G jumps to the end, /failed searches for "failed".' },
					{ code: 'less +G /var/log/auth.log', note: 'Opens already scrolled to the end — the newest entries.' },
					{ code: 'command | less', note: 'Pages the output of any command that would otherwise scroll off-screen.' },
				],
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
				explanation:
					"Left alone, an actively-written log like /var/log/syslog grows forever, so logrotate runs periodically (usually via cron or a systemd timer) and, per rules in /etc/logrotate.conf and /etc/logrotate.d/*, renames the current log to a numbered/dated backup, starts the service writing a fresh file, compresses older backups, and deletes ones past the retention count — all without the writing process ever losing its file handle, since most service configs include `copytruncate` or a post-rotate signal to reopen the log file.",
				examples: [
					{ code: 'logrotate -d /etc/logrotate.conf', note: '-d (debug/dry-run) shows what would happen, changes nothing.' },
					{ code: 'logrotate -f /etc/logrotate.conf', note: '-f forces rotation now, even if the configured schedule says not yet.' },
					{ code: 'cat /etc/logrotate.d/nginx', note: 'Per-service rotation rules usually live here, one file per package.' },
				],
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
				explanation:
					"last reads the binary /var/log/wtmp file, which the login system appends to on every session start and end — it's a durable audit trail independent of shell history (which a user controls) or process listings (which only show what's running right now). Because reboots and shutdowns are recorded as special pseudo-events in the same file, `last reboot` doubles as a quick uptime-history check, and `lastb` reads the parallel btmp file of failed login attempts for spotting brute-force activity.",
				examples: [
					{ code: 'last -n 20', note: 'The 20 most recent login sessions.' },
					{ code: 'last reboot', note: 'Filters to system reboot events — a history of when the machine restarted.' },
					{ code: 'last alice', note: "Just this one user's login history: source, time, duration." },
				],
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
				explanation:
					"ps takes a single snapshot the instant you run it — unlike top, it doesn't refresh, which makes its output stable and pipeable (grep, sort, awk). The aux combination is BSD-style syntax (no dash) rather than the Unix-style `-ef`; both are common in the wild and show roughly the same information, so recognizing either is worth more than memorizing one over the other.",
				examples: [
					{ code: 'ps aux | grep nginx', note: 'All processes, filtered down to lines mentioning nginx.' },
					{ code: 'ps -ef', note: 'Unix-style equivalent listing — full command lines, parent PIDs included.' },
					{ code: 'ps aux --sort=-%mem | head', note: 'Top memory-consuming processes, highest first.' },
				],
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
				explanation:
					"top redraws its whole screen on an interval (3 seconds by default), recalculating CPU% and memory from the kernel each time — that's what makes it the reflexive first command on a machine that 'feels slow': one glance at the top few rows usually shows the runaway process. Its interactivity is also a limitation: because it's a full-screen live view, it's awkward to pipe or script, which is where a one-shot `ps` snapshot takes over.",
				examples: [
					{ code: 'top -o %CPU', note: 'Sorts the live list by CPU usage, highest first.' },
					{ code: 'top -u www-data', note: "Shows only one user's processes — filters the noise on a shared host." },
					{ code: 'top -n 1 -b', note: 'Batch mode: prints one static snapshot and exits, instead of a live screen.' },
				],
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
				explanation:
					"Despite the name, kill's real job is sending any signal, not just a fatal one — SIGTERM is a request the process can catch and handle (close files, flush buffers, remove a lock, then exit), while SIGKILL is delivered by the kernel directly and can't be caught, blocked, or ignored, which is exactly why it's the last resort rather than the default: a process killed with -9 mid-write can leave corrupt state behind. Signal numbers and names are interchangeable (`kill -9` and `kill -SIGKILL` are the same call).",
				examples: [
					{ code: 'kill -15 1234', note: 'Asks process 1234 to terminate gracefully (SIGTERM, the default).' },
					{ code: 'kill -9 1234', note: 'Forces immediate termination — use only after -15 fails to work.' },
					{ code: 'kill -l', note: 'Lists every available signal name and number.' },
				],
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
				explanation:
					"The kernel's scheduler uses niceness as a hint when deciding which runnable process gets the CPU next — a 'nicer' process (higher number) voluntarily steps back and yields more often to others. It only matters when the CPU is actually contended; on an idle machine a niced-down backup runs at full speed anyway. `nice` sets priority at launch; `renice` adjusts it for a process that's already running, without restarting it.",
				examples: [
					{ code: 'nice -n 19 tar -czf backup.tar.gz /data', note: "Lowest priority, so the backup doesn't compete for CPU." },
					{ code: 'nice ./build.sh', note: 'No -n given: applies the default niceness bump of 10.' },
					{ code: 'renice -n 5 -p 1234', note: 'Changes the niceness of an already-running process (PID 1234), no restart needed.' },
				],
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
				explanation:
					"pgrep matches against process names (or full command lines with -f) and prints just the PIDs — designed to be dropped directly into scripts and other commands (`kill $(pgrep myapp)`) instead of piping `ps` through `grep` and then `awk` to pull out a column. Its acting counterpart, pkill, skips the PID step entirely and signals matching processes directly, which is convenient but riskier: a loose pattern can match more than you intended.",
				examples: [
					{ code: 'pgrep -a python', note: 'PID and full command line of every process matching "python".' },
					{ code: 'pgrep python', note: 'Just the bare PIDs — the default, minimal output.' },
					{ code: 'pgrep -f "manage.py runserver"', note: '-f matches against the full command line, not just the process name.' },
				],
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
				explanation:
					"Linux's 'everything is a file' design means lsof's reach goes far beyond regular files: network sockets, open directories, mounted devices, and even another process's memory-mapped libraries all show up as file descriptors it can list and attribute to a PID. That generality is why it answers so many different 'who is using X' questions — a port, a mount point, a deleted-but-still-open log file — with the same one command, just different filters.",
				examples: [
					{ code: 'lsof /mnt/data', note: 'Which processes have files open under /mnt/data — e.g. why umount says "busy".' },
					{ code: 'lsof -i :8080', note: 'Which process is bound to TCP/UDP port 8080.' },
					{ code: 'lsof -p 1234', note: 'Every file (including sockets and libraries) a specific process has open.' },
				],
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
				explanation:
					"ip is a single tool covering what used to be several separate commands (ifconfig for addresses, route for routing, arp for neighbor tables), organized around a consistent `ip <object> <command>` grammar — `ip addr`, `ip route`, `ip link`, `ip neigh`. It talks to the kernel's netlink interface directly rather than parsing /proc text files the old tools relied on, which is also why it exposes things ifconfig never could, like multiple addresses per interface or fine-grained routing rules.",
				examples: [
					{ code: 'ip route show', note: "Displays the routing table, including the default gateway." },
					{ code: 'ip addr show', note: "Every interface's IP addresses (short form: ip a)." },
					{ code: 'ip link set eth0 up', note: 'Brings an interface up — configuration, not just viewing.' },
				],
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
				explanation:
					"ss reads socket information straight from the kernel rather than netstat's older /proc-parsing approach, which makes it noticeably faster on machines with many open connections — the difference is very visible on a busy server with thousands of sockets. The flag combination is worth memorizing as a set: t/u pick the protocol (TCP/UDP), l restricts to listening sockets (as opposed to established connections), p adds the owning process, and n keeps ports/addresses numeric instead of doing slow reverse lookups.",
				examples: [
					{ code: 'ss -tulpn | grep :443', note: 'Which process is listening on port 443.' },
					{ code: 'ss -tulpn', note: 'Every listening TCP/UDP socket and its owning process, numeric ports.' },
					{ code: 'ss -tan state established', note: 'All currently established TCP connections — no listeners.' },
				],
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
				explanation:
					"curl speaks a long list of protocols but is overwhelmingly used for HTTP(S), and its real strength is scriptability: every piece of a request or response — headers, status code, timing, body — can be pulled out individually and formatted, which is why it's the standard tool for health checks, API testing, and CI pipelines rather than a browser. -I sends a HEAD request (headers only, no body), which is both faster and enough to answer 'is this URL alive and what does it redirect to'.",
				examples: [
					{ code: 'curl -o /dev/null -s -w "%{http_code}\\n" https://example.com', note: 'Prints only the HTTP status code.' },
					{ code: 'curl -I https://example.com', note: 'Headers only (HEAD request) — status, server, redirects.' },
					{ code: 'curl -X POST -d \'{"key":"value"}\' -H "Content-Type: application/json" https://api.example.com', note: 'Sends a JSON POST body — the shape of most API testing.' },
				],
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
				explanation:
					"ping is deliberately the simplest possible network test — it operates below TCP/UDP, at the ICMP layer, so it can confirm a host is reachable even when every actual service on it is down or refusing connections. That simplicity cuts both ways: many hosts and firewalls block ICMP for security reasons, so a failed ping doesn't always mean the host is down, just that ICMP specifically isn't getting through — worth confirming with curl or a port check before concluding a host is unreachable.",
				examples: [
					{ code: 'ping -c 4 8.8.8.8', note: "Exactly 4 pings, then stops (without -c it runs until Ctrl+C)." },
					{ code: 'ping -i 0.2 -c 20 10.0.0.5', note: 'Faster interval (0.2s) for a quick burst of 20 pings.' },
					{ code: 'ping -c 1 example.com', note: "Single ping — often enough to confirm 'is DNS resolving and is the host up'." },
				],
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
				explanation:
					"traceroute works by sending packets with a gradually increasing TTL (time-to-live) — the packet with TTL=1 dies at the first router, which sends back an error revealing itself; TTL=2 dies at the second, and so on, building the path hop by hop. That's why some hops show as `* * *`: those routers are silently dropping the expiring packets or blocking the ICMP error, not necessarily broken — the technique reveals the path even when individual hops don't cooperate.",
				examples: [
					{ code: 'traceroute -n example.com', note: 'Skips reverse-DNS lookups per hop — much faster output.' },
					{ code: 'traceroute example.com', note: 'Default run: hostname, IP, and three round-trip times per hop.' },
					{ code: 'traceroute -I example.com', note: 'Uses ICMP echo probes instead of the default UDP — helps when UDP is filtered.' },
				],
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
				explanation:
					"dig's default output shows the whole DNS transaction — the question asked, the answer records with their TTLs, which nameserver answered, and how long the query took — which is exactly the detail you need when a domain resolves to the wrong thing or not at all, but is noisy for everyday use, hence +short. Pointing it at a specific server with @ (bypassing your configured resolver) is the key trick for telling apart 'DNS hasn't propagated yet' from 'my local resolver has stale cache'.",
				examples: [
					{ code: 'dig +short example.com', note: 'Just the resolved IP addresses, no metadata.' },
					{ code: 'dig MX example.com', note: 'Queries a specific record type — here, mail exchangers.' },
					{ code: 'dig @8.8.8.8 example.com', note: "Asks Google's public resolver directly, bypassing your local DNS cache." },
				],
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
				explanation:
					"Every file carries three permission triples — owner, group, others — each a combination of read/write/execute. The octal form (755, 644…) sets all three at once by adding read=4, write=2, execute=1 per triple, which is precise but requires knowing the full target state; the symbolic form (+x, u+w, go-w) adjusts just one bit relative to whatever the permissions already are, which is safer when you don't want to accidentally reset bits you didn't mean to touch.",
				examples: [
					{ code: 'chmod +x deploy.sh', note: 'Adds execute for everyone, without touching read/write bits.' },
					{ code: 'chmod 644 file.txt', note: 'Owner read+write, group and others read-only — the common "data file" mode.' },
					{ code: 'chmod -R go-w /var/www/app', note: 'Recursively removes group/others write access — a quick lockdown.' },
				],
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
				explanation:
					"Ownership and permissions are separate mechanisms that work together: chmod controls what the owner/group/others are allowed to do, while chown controls who those roles actually are. Files deployed by one process (often root, during install) frequently end up owned by the wrong account for the service that needs to write them — the correct fix is chown to hand ownership to the right user, not chmod 777 to make the file writable by anyone, which fixes the symptom by removing the protection entirely.",
				examples: [
					{ code: 'chown -R deploy:deploy /opt/app', note: '-R applies recursively to every file and subdirectory.' },
					{ code: 'chown alice file.txt', note: 'Changes just the owning user, leaves the group untouched.' },
					{ code: 'chown :developers shared.txt', note: 'Changes just the group (leading colon), owner untouched.' },
				],
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
				explanation:
					"On its own, useradd creates the account entry (in /etc/passwd and /etc/shadow) but skips two things you almost always want: a home directory and a real login shell — without -m the home directory doesn't get created, and without -s the default shell is often /bin/sh or nothing usable interactively. That's why -m -s is close to a fixed idiom rather than two independent options you'd reach for separately; some distros' `adduser` wrapper applies sane defaults automatically where raw `useradd` doesn't.",
				examples: [
					{ code: 'sudo useradd -m -s /bin/bash alice', note: 'Creates alice with a home directory and bash as her shell.' },
					{ code: 'sudo useradd -m -G sudo -s /bin/bash bob', note: 'Same, plus adds bob to the sudo group at creation time.' },
					{ code: 'useradd -r svc-app', note: '-r creates a system account: no home directory, no password login — for services.' },
				],
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
				explanation:
					"passwd's -l flag doesn't delete or blank the password — it prefixes the stored hash in /etc/shadow with an invalid character, so no input can ever match it, while leaving the account, its files, its group memberships, and its original password hash (recoverable by unlocking) all intact. That reversibility is exactly why it's the right tool for 'disable access now, decide about deletion later' — deleting a user is a much harder action to undo.",
				examples: [
					{ code: 'sudo passwd -l alice', note: 'Locks the account by disabling its password hash.' },
					{ code: 'sudo passwd -u alice', note: 'Reverses -l — re-enables password login.' },
					{ code: 'passwd', note: "No arguments: change your own password (prompts for the current one first)." },
				],
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
				explanation:
					"sudo's design goal is auditable, scoped privilege escalation instead of logging in as root directly: every invocation is tied to the real user who ran it (visible in the auth log), rules in /etc/sudoers can restrict exactly which commands and target users are permitted rather than granting all-or-nothing root, and elevation lasts only for that one command. -u generalizes it beyond root entirely — running as any account the sudoers rules permit, useful for services (like a database) that should only ever be touched as their own dedicated user.",
				examples: [
					{ code: 'sudo -u postgres psql', note: 'Runs psql as the "postgres" user, not root.' },
					{ code: 'sudo systemctl restart nginx', note: 'Runs a single command as root — the everyday case.' },
					{ code: 'sudo -l', note: "Lists what commands the current user is permitted to run with sudo." },
				],
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
				explanation:
					"usermod edits the account fields useradd set at creation time — shell, home directory, lock state, and especially group membership — without needing to recreate the account. Group changes only take effect for new login sessions, because a running shell's group membership is fixed at login time; that's why 'add to docker group' is reliably followed by 'now log out and back in' rather than the change applying immediately.",
				examples: [
					{ code: 'sudo usermod -aG docker alice', note: "Appends alice to the docker group; takes effect after her next login." },
					{ code: 'sudo usermod -s /usr/bin/zsh alice', note: "Changes alice's login shell to zsh." },
					{ code: 'sudo usermod -L alice', note: 'Locks the account — equivalent effect to `passwd -l`.' },
				],
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
				explanation:
					"apt itself resolves dependencies against a local index of what's available in configured repositories (listed in /etc/apt/sources.list) — that index is a cache, not a live query, which is why `apt update` (refresh the index) is a distinct, necessary step before `apt install` or `apt upgrade` can see anything new. apt is the friendlier front-end over the lower-level dpkg, handling dependency resolution and repository downloads that dpkg leaves to you.",
				examples: [
					{ code: 'sudo apt update && sudo apt upgrade', note: 'Refreshes the index, then upgrades every installed package.' },
					{ code: 'sudo apt install nginx', note: 'Installs nginx and its dependencies from configured repositories.' },
					{ code: 'sudo apt remove nginx', note: 'Uninstalls nginx but leaves its config files (see apt-autoremove\'s purge note).' },
				],
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
				explanation:
					"dpkg is the low-level engine apt is built on: it installs and removes individual .deb packages, tracks which files belong to which package, and runs package maintainer scripts — but it has no concept of a remote repository and won't fetch or resolve dependencies for you. That split is exactly why dpkg -i on a standalone downloaded .deb can fail with unmet dependencies that a plain `apt install ./file.deb` (which does resolve them) would handle cleanly.",
				examples: [
					{ code: 'dpkg -S /usr/bin/curl', note: 'Which installed package provides this file.' },
					{ code: 'dpkg -i app_1.0.deb', note: 'Installs a local .deb file directly — no dependency resolution.' },
					{ code: 'dpkg -L nginx', note: 'Lists every file the installed nginx package placed on disk.' },
				],
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
				explanation:
					"dnf plays the same role for RPM-based distros (Fedora, RHEL, Rocky, Alma) that apt plays for Debian/Ubuntu: dependency resolution over a repository index, with a friendlier front-end than the low-level rpm command underneath it (the rpm/dnf pairing mirrors dpkg/apt). Unlike apt, dnf doesn't need a separate `update` step before installing — its dependency solver checks repository metadata as needed — though `dnf update` (or `check-update`) is still how you see or apply pending upgrades.",
				examples: [
					{ code: 'sudo dnf update', note: 'Updates every installed package to its latest available version.' },
					{ code: 'sudo dnf install httpd', note: 'Installs the Apache package and its dependencies.' },
					{ code: 'dnf search redis', note: 'Searches repository metadata for packages matching "redis".' },
				],
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
				explanation:
					"apt-cache is entirely read-only — it inspects the local metadata index that `apt update` downloaded, never touches installed packages or reaches the network itself. `policy` is the workhorse subcommand for debugging version confusion: it shows the currently-installed version, the candidate version apt would install, and every repository offering the package with its priority, which is exactly what you need when 'the wrong version is installing' and you suspect a repo pinning issue.",
				examples: [
					{ code: 'apt-cache policy nginx', note: 'Installed vs. candidate version, and which repo each comes from.' },
					{ code: 'apt-cache search redis', note: 'Searches package names and descriptions for "redis".' },
					{ code: 'apt-cache show nginx', note: 'Full metadata for a package: description, dependencies, size.' },
				],
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
				explanation:
					"apt list is the quick inventory command — it filters by state (--installed, --upgradable, --all-versions) rather than requiring you to grep dpkg's denser output. --upgradable specifically previews what `apt upgrade` would touch before you commit to running it, which is useful on a production box where you want to review the list of pending changes first rather than upgrading blind.",
				examples: [
					{ code: 'apt list --installed', note: 'Every package currently installed on the system.' },
					{ code: 'apt list --upgradable', note: 'Installed packages with a newer version available.' },
					{ code: 'apt list --installed | grep nginx', note: "Checks whether a specific package (and which version) is installed." },
				],
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
				explanation:
					"apt tracks which packages were installed explicitly by you versus pulled in automatically as someone else's dependency — autoremove targets only the latter: dependency-only packages that are now orphaned because whatever needed them was removed. It's the routine cleanup step after `apt remove`, and it's conservative by design: it never touches something you explicitly installed, even if nothing currently depends on it.",
				examples: [
					{ code: 'sudo apt autoremove --purge', note: 'Removes orphaned dependency packages and their config files.' },
					{ code: 'sudo apt autoremove', note: 'Removes orphaned dependencies, leaving their config files behind.' },
					{ code: 'apt autoremove --dry-run', note: 'Previews what would be removed, without removing anything.' },
				],
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
				explanation:
					"grep (the name comes from the ed editor command g/re/p — 'globally search a regular expression and print') is the baseline text-search tool everything else in this category assumes you already know: awk, sed, and find -exec all lean on the same regex vocabulary. Its flags compose freely — -r for whole trees, -i for case, -n for line numbers, -v to invert the match — which is why chains like `grep -rn` read as one idiomatic unit rather than three separate decisions.",
				examples: [
					{ code: 'grep -rn "TODO" src/', note: 'Recursively finds "TODO", printing file name and line number.' },
					{ code: 'grep -v "^#" config.conf', note: 'Prints every line that is NOT a comment (inverted match).' },
					{ code: 'grep -c "error" app.log', note: 'Counts matching lines instead of printing them.' },
				],
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
				explanation:
					"find matches on file metadata (name, type, size, modification time, permissions), not file contents — that's grep's job — and chains criteria as an implicit AND, so `-type f -mtime +7` means 'files AND older than 7 days'. Its action flags (-delete, -exec) turn a search into a batch operation, which makes it dangerous by default: always run the search alone first to see what would match before adding -delete, since there's no undo once it runs.",
				examples: [
					{ code: 'find /tmp -type f -mtime +7 -delete', note: 'Deletes files in /tmp untouched for 7+ days.' },
					{ code: 'find / -type f -size +100M', note: 'Every file larger than 100 MB under /.' },
					{ code: 'find . -name "*.tmp" -exec rm {} \\;', note: 'Runs rm on each match individually via -exec (see xargs for the faster batch version).' },
				],
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
				explanation:
					"awk is a small programming language built around one idea: it reads input line by line, automatically splits each line into whitespace-separated fields ($1, $2, … $NF for the last one), and runs your program's action for every line matching an optional pattern — which is why `'{print $1}'` alone, with no pattern, means 'do this for every line'. That field-splitting is awk's whole advantage over grep (which only matches, never extracts) and over cut (which only splits on a literal fixed delimiter).",
				examples: [
					{ code: "awk '{print $1}' access.log | sort | uniq -c | sort -rn", note: 'Extracts a column, then counts and ranks occurrences — a classic log-analysis pipeline.' },
					{ code: "awk '{print $NF}' file.log", note: 'Prints the last field of each line, whatever its position.' },
					{ code: "awk -F: '{print $1}' /etc/passwd", note: '-F sets the field separator — here, colon, matching /etc/passwd\'s format.' },
				],
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
				explanation:
					"sed processes input one line at a time without ever loading the whole file into an interactive buffer — a 'stream editor', not a text editor — which is what makes it scriptable and safe to run against huge files or as a pipeline stage. Without -i it prints the transformed result to stdout, leaving the original file untouched; -i is what commits the change back to disk in place, so it's worth a habit of testing a sed expression without -i first and only adding it once the output looks right.",
				examples: [
					{ code: "sed -i 's/DEBUG=false/DEBUG=true/' .env", note: '-i edits the file in place, replacing the first match per line.' },
					{ code: "sed 's/foo/bar/g' file.txt", note: 'Prints the result to stdout without touching the file — safe to preview.' },
					{ code: "sed '/^#/d' config.conf", note: 'Deletes every line starting with # (comments), printed to stdout.' },
				],
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
				explanation:
					"Most Unix commands that take filenames — rm, cp, chmod — expect them as arguments, not as lines on stdin, which is a mismatch with find and grep -l that produce a stream of names. xargs bridges that gap: it reads stdin and builds one or more command invocations from it, batching many names into each call rather than launching a new process per line (which `-exec ... \\;` does, and `-exec ... +` or xargs both avoid). The NUL-delimited form (-print0/-0) exists because plain newline-delimited names silently break on filenames containing spaces or embedded newlines.",
				examples: [
					{ code: 'find . -name "*.tmp" -print0 | xargs -0 rm', note: 'Deletes every .tmp file; -print0/-0 safely handles spaces in names.' },
					{ code: 'find . -name "*.tmp" | xargs rm', note: 'Same idea without NUL-safety — fine when filenames are simple.' },
					{ code: 'echo "a b c" | xargs -n 1 echo', note: '-n 1 runs the command once per argument instead of batching them.' },
				],
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
				explanation:
					"cut does exactly one thing — split each line on a fixed, single-character delimiter and print chosen fields (or a fixed character range with -c) — which makes it faster to reach for than awk when the format is simple and truly fixed-delimiter, like /etc/passwd's colons or a CSV with no quoted commas. The moment fields are whitespace-separated with variable spacing, or you need any logic beyond 'pick these columns,' awk takes over, since cut has no concept of a field being empty or repeated delimiters collapsing.",
				examples: [
					{ code: 'cut -d: -f1 /etc/passwd', note: 'Every username — field 1 of the colon-separated file.' },
					{ code: 'cut -d, -f2,4 data.csv', note: 'Fields 2 and 4 of a simple comma-separated file.' },
					{ code: 'cut -c1-10 file.txt', note: 'The first 10 characters of each line, ignoring delimiters entirely.' },
				],
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
				explanation:
					"Linux aggressively uses spare RAM for disk cache and buffers because unused memory is otherwise wasted — that cache is reclaimed instantly under pressure, so it shouldn't count as 'used' from a troubleshooting standpoint. free's 'available' column already does that math for you (used minus what's actually reclaimable); the plain 'free' column is the more naive number and looks alarmingly low on a perfectly healthy, well-utilized system, which is the single most common misreading of this command's output.",
				examples: [
					{ code: 'free -h', note: 'RAM and swap in human-readable MB/GB instead of raw kilobytes.' },
					{ code: 'free -h -s 2', note: 'Repeats the report every 2 seconds — a lightweight live view.' },
					{ code: 'free -h --total', note: 'Adds a combined RAM+swap total row.' },
				],
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
				explanation:
					"Load average counts the number of processes that are runnable (wanting CPU) or stuck in uninterruptible I/O wait, averaged over three trailing windows — three numbers instead of one so you can see whether load is climbing (1min > 5min > 15min), steady, or already recovering (1min < 5min). The number is meaningless without knowing the core count: a load of 4.0 is idle headroom on a 32-core box and complete saturation on a 4-core one, so always read it relative to `nproc`.",
				examples: [
					{ code: 'uptime', note: 'Example output: "up 14 days, load average: 0.15, 0.22, 0.30".' },
					{ code: 'nproc', note: 'Core count — the number to compare load average against.' },
					{ code: 'w', note: 'Shows the same load averages plus who is logged in and running what.' },
				],
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
				explanation:
					"vmstat's first output line is always a since-boot average and should be ignored — the useful data starts from the second line, once the interval sampling kicks in. It's a single-command overview spanning what free (memory), and iostat (I/O) each cover separately, which makes it a fast first check before drilling into a more specific tool; the si/so (swap in/out) columns are the fastest way to confirm the machine is actually swapping, not just low on free memory.",
				examples: [
					{ code: 'vmstat 2 5', note: 'A snapshot every 2 seconds, 5 times total.' },
					{ code: 'vmstat', note: 'One-shot report: since-boot averages, ignore the first-line caveat.' },
					{ code: 'vmstat -a 2', note: '-a shows active/inactive memory instead of buffers/cache, repeating every 2s.' },
				],
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
				explanation:
					"iostat is the tool that separates 'the CPU is busy' from 'the CPU is waiting on disk' — high %iowait in its CPU section, paired with a device near 100% %util, is the fingerprint of a disk-bound slowdown that top or ps alone won't clearly show (a process waiting on I/O looks idle in CPU terms, not busy). Like vmstat, the first report line is a since-boot average; the extended -x view adds per-device queue length and service time, the detail you need to identify which disk specifically is saturated.",
				examples: [
					{ code: 'iostat -x 2', note: 'Extended per-device stats (including %util), every 2 seconds.' },
					{ code: 'iostat', note: 'Basic report: CPU usage plus simple per-device I/O counts.' },
					{ code: 'iostat -x 2 5', note: 'Extended stats, every 2 seconds, 5 times, then stops.' },
				],
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
				explanation:
					"w is essentially `who` (list of logged-in sessions) merged with `uptime` (load averages) plus one more column neither has: each session's current foreground command, read live from the process table. That combination makes it the fastest way to answer 'who's on this box right now and what are they doing' on a shared server — useful both for coordinating with other admins and for noticing an unexpected session.",
				examples: [
					{ code: 'w', note: 'Every logged-in user, terminal, idle time, current command, plus load averages.' },
					{ code: 'w alice', note: 'Filters the output to just one user\'s sessions.' },
					{ code: 'who', note: 'The simpler ancestor: just who\'s logged in, no command or load info.' },
				],
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
				explanation:
					"watch turns any one-shot command into an ad-hoc live dashboard by literally re-executing it on a timer and redrawing the full-screen output each time — it doesn't understand what the command does, it just reruns it, which is why it works identically well on `df -h`, `ls -la`, or a custom script. -d diffs consecutive outputs and highlights the changed characters, which is the fast way to spot exactly what moved between refreshes on a screen with a lot of numbers.",
				examples: [
					{ code: 'watch -d -n 2 "ss -tulpn"', note: '-d highlights what changed; -n 2 refreshes every 2 seconds.' },
					{ code: 'watch -n 2 df -h', note: 'Live-updating disk usage, refreshed every 2 seconds.' },
					{ code: 'watch -n 1 "ls -la /var/spool/mail"', note: "Quoting matters once the watched command itself has pipes or multiple arguments." },
				],
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
				explanation:
					"tar ('tape archive', from its magnetic-tape-backup origins) itself only concatenates files into one stream, preserving permissions, ownership, and directory structure — compression is a separate, composable step layered on with -z (gzip), -j (bzip2), or -J (xz), which is why 'tar' and '.tar.gz' are conceptually two operations bundled into one command line. The letter combination is always create-or-extract plus compression plus verbose plus filename, so -czvf and -xzvf are near-mirror-images of each other: same flags, -c swapped for -x.",
				examples: [
					{ code: 'tar -xzvf backup.tar.gz -C /restore', note: 'Extracts a gzip archive verbosely into /restore.' },
					{ code: 'tar -czvf backup.tar.gz /data', note: 'Creates a gzip-compressed archive of /data.' },
					{ code: 'tar -tvf backup.tar.gz', note: 'Lists the archive\'s contents without extracting anything.' },
				],
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
				explanation:
					"rsync's delta-transfer algorithm compares source and destination and sends only the changed blocks within a file, not the whole file — so a second sync of a mostly-unchanged directory can be dramatically faster than scp copying everything again from scratch. -a (archive) is itself a bundle of sensible defaults (recursive, preserves permissions/times/symlinks); the trailing slash on a source directory matters — with it, the directory's contents sync into the destination, without it, the directory itself is nested one level deeper.",
				examples: [
					{ code: 'rsync -avz --delete /data/ user@host:/backup/', note: '--delete also removes destination files no longer in the source — a true mirror.' },
					{ code: 'rsync -avz /data/ user@host:/backup/', note: 'Standard sync: archive mode, verbose, compressed transfer.' },
					{ code: 'rsync -avzn /data/ user@host:/backup/', note: '-n (dry run) shows what would transfer without actually copying anything.' },
				],
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
				explanation:
					"scp reuses your existing SSH authentication (keys, agent, config) and always transfers the entire file, with no delta comparison and no resume if interrupted — it's simpler than rsync precisely because it skips that machinery, which makes it the right choice for a single quick copy but the wrong choice for repeated syncs of a large, mostly-unchanged directory. Syntax mirrors `cp`: source then destination, either side can be `user@host:/path` and the other can be local.",
				examples: [
					{ code: 'scp -r ./dist user@host:/var/www/app', note: '-r recursively copies a whole directory to the remote server.' },
					{ code: 'scp config.yml user@host:/etc/app/', note: 'Copies one file to a remote path.' },
					{ code: 'scp user@host:/var/log/app.log ./', note: 'Direction reversed: pulls a file from the remote host to here.' },
				],
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
				explanation:
					"gzip compresses exactly one file into one .gz file — it has no concept of bundling multiple files or directories the way tar does, which is why 'compress a whole directory' means tar first (to combine) and gzip second (to shrink), often fused as tar -z. Its default 'replace in place' behavior surprises people coming from tools that keep the original; -k exists specifically to opt out of that, and zcat/zless let you read a .gz file's contents without decompressing it to disk at all.",
				examples: [
					{ code: 'gzip -k access.log', note: 'Compresses to access.log.gz but keeps the original too.' },
					{ code: 'gzip access.log', note: 'Default: compresses and removes the original file.' },
					{ code: 'gzip -d access.log.gz', note: 'Decompresses — equivalent to running gunzip.' },
				],
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
				explanation:
					"wget was built for exactly the case its name suggests — 'get' a file over the 'web' — and its defaults reflect that: it writes straight to disk (no piping-to-stdout dance needed like curl), retries automatically on a dropped connection, and -c lets it resume a partial download rather than restarting from zero. curl and wget overlap heavily for a plain download, but curl's real strength (inspecting/scripting arbitrary parts of an HTTP exchange) isn't wget's design center, and vice versa for unattended, resumable, recursive fetching.",
				examples: [
					{ code: 'wget -O app.tar.gz https://example.com/latest', note: '-O sets the output filename explicitly.' },
					{ code: 'wget -c https://example.com/big-file.iso', note: '-c resumes an interrupted download instead of restarting it.' },
					{ code: 'wget -q https://example.com/file.tar.gz', note: '-q suppresses progress output — quiet mode for scripts.' },
				],
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
				explanation:
					"dd copies raw bytes with no awareness of filesystems, files, or partition tables — it treats its input and output purely as byte streams, which is exactly why it can write a bootable ISO directly onto a block device (something a normal file copy can't do) and exactly why a typo in of= silently destroys whatever that device was, with no confirmation prompt. bs= (block size) controls how many bytes move per read/write cycle; too small and the copy is needlessly slow, too large wastes memory — 4M is a reasonable default for most USB/disk work.",
				examples: [
					{ code: 'dd if=ubuntu.iso of=/dev/sdb bs=4M status=progress', note: 'Writes an ISO onto a USB stick with a live progress counter.' },
					{ code: 'lsblk', note: 'Always run this first to confirm the exact device name before any dd write.' },
					{ code: 'dd if=/dev/zero of=/dev/sdb bs=1M count=10', note: 'Zeroes the first 10 MB of a device — wipes the partition table.' },
				],
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
				explanation:
					"systemctl's core distinction — running-now vs. starts-on-boot — trips people up because the two are entirely independent flags on a unit: start/stop control the current running state, enable/disable control whether systemd launches it automatically at the next boot, and neither implies the other. `enable --now` exists as a shortcut precisely because 'enable it and also start it right now' is the common case when standing up a new service, but forgetting the --now leaves it enabled yet not actually running until the next reboot.",
				examples: [
					{ code: 'systemctl status nginx', note: 'Running state, recent log lines, and enabled/disabled state in one view.' },
					{ code: 'systemctl enable --now nginx', note: 'Enables at boot AND starts it immediately — the common "stand it up" idiom.' },
					{ code: 'systemctl restart nginx', note: 'Stops then starts the service — the standard way to apply a config change.' },
				],
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
				explanation:
					"Each user has their own crontab, stored and validated separately from anyone else's — `crontab -e` edits the current user's, and jobs run with that user's permissions and environment (which is why a script that works interactively can mysteriously fail under cron: the shell environment, PATH, and working directory are all different and much sparser). The five schedule fields go narrowest-to-widest — minute, hour, day-of-month, month, day-of-week — and `*` in any field means 'every value.'",
				examples: [
					{ code: '0 3 * * * /opt/scripts/backup.sh', note: 'Runs backup.sh every day at 3:00 AM.' },
					{ code: 'crontab -l', note: "Lists the current user's scheduled jobs without opening an editor." },
					{ code: '*/15 * * * * /opt/scripts/healthcheck.sh', note: 'Runs every 15 minutes, all day, every day (*/N = every N units).' },
				],
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
				explanation:
					"Because every systemd unit's stdout/stderr and log calls funnel into the same journal, -u is the filter that turns that firehose into just one service's story — the natural first move after `systemctl status` shows a unit failed, since status only shows the last few lines while journalctl -u shows the full history. -p adds a priority floor (err and worse: crit, alert, emerg) to cut noise further, and --no-pager is useful in scripts or when piping into another command, since it skips the interactive `less`-style pager.",
				examples: [
					{ code: 'journalctl -u sshd.service -p err', note: 'Only error-priority-or-worse messages from sshd.' },
					{ code: 'journalctl -u nginx --no-pager', note: 'Full journal for nginx, printed straight to the terminal (no pager).' },
					{ code: 'journalctl -u nginx -b', note: "This unit's journal entries since the current boot only." },
				],
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
				explanation:
					"A server's clock quietly drifting or its timezone being wrong causes a specific, recognizable class of bugs — cron jobs firing at unexpected times, TLS certificate validation failing near expiry, logs from different hosts not lining up when correlated — which is why timedatectl is worth checking early rather than assuming application logic is at fault. It's the systemd-native replacement for the older `date`/`hwclock`/`ntpdate` combination, unifying clock, timezone, and NTP sync status behind one command.",
				examples: [
					{ code: 'timedatectl', note: 'Local time, UTC time, timezone, and whether NTP sync is active.' },
					{ code: 'timedatectl set-timezone UTC', note: "Sets the system timezone — servers are commonly kept on UTC." },
					{ code: 'timedatectl set-ntp true', note: 'Turns on automatic NTP clock synchronization.' },
				],
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
				explanation:
					"at fills the gap cron deliberately doesn't cover: 'run this once, at this time,' with no need to write and then remember to remove a recurring crontab entry. It accepts flexible, English-like time expressions (02:00, now + 30 minutes, tomorrow, next monday) rather than cron's rigid five-field syntax, since a one-off schedule is usually phrased that way in a person's head. Jobs queue up and can be inspected or cancelled before they fire, via atq and atrm.",
				examples: [
					{ code: 'at now + 30 minutes', note: 'Opens a prompt for a command that runs once, 30 minutes from now.' },
					{ code: 'echo "systemctl restart app" | at 02:00', note: 'Pipes the command directly instead of using the interactive prompt.' },
					{ code: 'atq', note: 'Lists all pending at jobs with their job numbers.' },
				],
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
				explanation:
					"systemd starts independent units in parallel wherever their dependency graph allows, so a slow boot is rarely one single cause — systemd-analyze exists to break that parallel startup down into numbers instead of guesswork. Plain `systemd-analyze` gives the headline split (firmware/loader/kernel/userspace time); `blame` ranks individual units by how long each took, the natural next step once userspace time looks too high; `critical-chain` goes further and shows the actual dependency chain that determined the critical path.",
				examples: [
					{ code: 'systemd-analyze blame | head', note: 'The slowest-starting units, ranked — the usual suspects for a slow boot.' },
					{ code: 'systemd-analyze', note: 'Total boot time, split into firmware/loader/kernel/userspace.' },
					{ code: 'systemd-analyze critical-chain', note: 'Shows the dependency chain that determined the longest boot path.' },
				],
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
