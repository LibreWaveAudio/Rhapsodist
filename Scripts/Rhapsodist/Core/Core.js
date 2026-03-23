/*
    Copyright 2024, 2025, 2026 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

namespace Core
{
	Content.setWidth(1000);
	Content.setHeight(710);

	Synth.deferCallbacks(true);
	Engine.setAllowDuplicateSamples(false);
	Engine.loadAudioFilesIntoPool();
	Engine.loadImageIntoPool("Icon.png");
	Content.setUseHighResolutionForPanels(true);
	
	const samplers = getSamplers();
	
	//! Functions
	inline function getSamplers()
	{
		local result = [];

		for (x in Synth.getIdList("Sampler"))
			result.push(Synth.getChildSynth(x));

		return result;
	}
}

//! Includes
include("Rhapsodist/Core/Includes/CoreLookAndFeel.js");
include("Rhapsodist/Core/Includes/ErrorManager.js");
include("Rhapsodist/Core/Includes/Expansions.js");
include("Rhapsodist/Core/Widgets/SwitcherPanel.js");
include("Rhapsodist/Core/Widgets/SettingsPanel.js");
include("Rhapsodist/Core/Widgets/ValueEdit.js");
include("Rhapsodist/Core/Widgets/Card.js");
include("Rhapsodist/Core/Includes/LayoutBuilder.js");
include("Rhapsodist/Core/Includes/ShellLayout.js");
include("Rhapsodist/Core/Includes/ArticulationDataManager.js");
include("Rhapsodist/Core/Includes/ComponentHandler.js");
include("Rhapsodist/Core/Includes/Presets.js");
include("Rhapsodist/Core/Includes/Header.js");
include("Rhapsodist/Core/Includes/Footer.js");
include("Rhapsodist/Core/Widgets/Keyboard.js");
include("Rhapsodist/Core/Includes/PreloadBar.js");
include("Rhapsodist/Core/Includes/UserSettings.js");
include("Rhapsodist/Core/Includes/Tooltips.js");
include("Rhapsodist/Core/Includes/ZoomHandler.js");
