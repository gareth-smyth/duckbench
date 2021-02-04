Master Tests:  
![Master](https://github.com/gareth-smyth/duckbench/workflows/Test/badge.svg?branch=master)  
Develop Tests:   
![Develop](https://github.com/gareth-smyth/duckbench/workflows/Test/badge.svg?branch=develop)  

# Duckbench
 * Builds Amiga Workbench hard drive images. 
 * Allows repeatable and sharable builds.

## To use Duckbench you need to
* Install Node.js, at least version 12.14.1.  See https://nodejs.org/.
* Install WinUAE. See http://www.winuae.net/.
* Install duckbench `npm install -g duckbench`

### Config
If you have an installation of Amiga Forever with the `AMIGAFOREVERDATA` and `AMIGAFOREVERROOT` environment
variables set, duckbench should pick up ROMs, OS floppies, and WinUAE automatically.

If you are not using Amiga Forever you must set the following environment variables:

`DUCKBENCH_ROMS` - Full path to your amiga ROM folder.  At the minute duckbench uses only the 3.1 ROM. It *must be named* 
* amiga-os-310-a600.rom
* amiga-os-310-a1200.rom
* amiga-os-310-cd32.rom

depending on the installed system.
  
`DUCKBENCH_DISKS` - Full path to your amiga OS disks.  At the minute duckbench uses only the 2.1, 3.1 or 3.0 OS. The disks *must be named* 
* amiga-os-NNN-workbench.adf
* amiga-os-NNN-install.adf
* amiga-os-NNN-extras.adf
* amiga-os-NNN-fonts.adf
* amiga-os-NNN-storage.adf (Not for Workbench 2.1)
* amiga-os-NNN-locale.adf

where NNN is either 210 (For Workbench 2.1), 310 (for Workbench 3.1) or 300 (for Workbench 3.0)
  
`DUCKBENCH_EMU` -  Path to WinUAE installed folder e.g. `C:\Program Files\WinUAE`

### If you have a `.db` file
Run the following command

`duckbench build --db <path/to/file.db>` 

or on Windows command prompt use

`duckbench.cmd build --db <path\to\file.db>`
 
e.g. 

`duckbench build --db ./new-workbench.db`

or on Windows command prompt

`duckbench.cmd build --db c:\users\me\Downloads\new-workbench.db`

### If you want to custom build your own Workbench
Run the command
 
`duckbench` or `duckbench.cmd`

Open a browser and go to http://localhost:8552/index.html


## If you want to develop duckbench you need to 
* Install Git.  See https://git-scm.com/downloads.

Run the following commands from a terminal
1. `git clone https://github.com/gareth-smyth/duckbench.git`
2. `cd duckbench`
3. `npm i`

### Status
*Alpha*  
* Everything is liable to change and should not be relied upon to work a certain way.  
* Issues/bugs, and feature requests are always welcome using GitHub issues.

### Current limitations
* Only supports Workbench 3.1, 3.0 and 2.1 installs
* Small set of available plugins
* Only supports FastFileSystem, with its associated limitations

### Assumptions
Tested with
- Windows 10
- Amiga Forever 8R2
- NodeJs V12.14.1

### Additional tools
#### convertrom
 * Translates ROM images from real Amigas to a format used by emulators.
 * Translates emulator ROM images to a format used in real Amigas. 

### Licences & Thanks

#### WinUAE
https://github.com/tonioni/WinUAE

#### InstallerLG
https://github.com/sodero/InstallerLG

#### ADF/RDB
* https://github.com/cnvogelg/amitools
* http://lclevy.free.fr/adflib/adf_info.html

#### LHA
* [http://www.osirusoft.com/joejared/lzhformat.html](https://web.archive.org/web/20021005080911/http://www.osirusoft.com/joejared/lzhformat.html)
* https://fragglet.github.io/lhasa/

### Release process
npm login
npm publish
