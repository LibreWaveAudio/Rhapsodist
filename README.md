# Rhapsodist

## A toolkit of modules, processors, and script libraries for creating instruments for Rhapsody

The majority of the code is released under the GNU GPLv3 but check the headers of individual source files for more details.

For ease of management across multiple projects, Rhapsodist should be used with the HISE asset manager.

The core should be included before any other toolkit includes.

`include("Rhapsodist/Core/Core.js");`

Files in the processors folder should be loaded as separate MIDI processors. Scripts in the includes and widgets folders should be included in `on init`.

The Fonts folder should be copied to your project's Images folder. The HISE asset manager will do this automatically.