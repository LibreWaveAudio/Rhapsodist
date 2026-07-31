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

namespace Header
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	reg masterVolumeValue;
	reg masterPanValue;

	//! pnlHeader
	const pnlHeader = Content.getComponent("pnlHeader");

	pnlHeader.setPaintRoutine(function(g)
	{
		if (isDefined(LookAndFeel.drawHeader))
			return LookAndFeel.drawHeader();

		var a = this.getLocalBounds(0);

		g.setColour(this.get("bgColour"));
		g.fillRect(a);
		
		var font = fonts.title;
		var fontSize = fonts.titleSize;

		g.setFont(font, fontSize);
		g.setColour(this.get("textColour"));
		g.drawAlignedText(this.get("text"), [a[0] + 40, a[1], a[2], a[3] + fonts.titleOffset], "left");

		g.setColour(this.get("itemColour2"));
		g.drawHorizontalLine(a[3] - 1, a[0], a[2]);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	});
	
	//! knbMasterPan
	const knbMasterPan = Content.getComponent("knbMasterPan");
	const lafPanVol = Content.createLocalLookAndFeel();
	knbMasterPan.setLocalLookAndFeel(lafPanVol);

	lafPanVol.registerFunction("drawRotarySlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPanVolSliders))
			return LookAndFeel.drawPanVolSliders();
			
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;

		g.setFont(font, fontSize);
		
		if (style.mode == "dark")
			g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.hover || obj.clicked ? 1.0 : 0.8));
		else
			g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.hover || obj.clicked ? 1.5 : 1.0));
			
		g.drawAlignedText(obj.text + " " + obj.valueAsText, obj.area, "left");
	});
	
	//! knbMasterVolume
	const knbMasterVolume = Content.getComponent("knbMasterVolume");
	knbMasterVolume.setLocalLookAndFeel(lafPanVol);
		
	//! fltMasterPeak
	const fltMasterPeak = Content.getComponent("fltMasterPeak");
	fltMasterPeak.setLocalLookAndFeel(CoreLookAndFeel.peakMeter);

	//! Functions
	
	//! Broadcasters
	Presets.broadcasters.preLoad.addListener({}, "Preset preload", function(isInternal)
	{
		if (!isInternal)
		{
			masterVolumeValue = knbMasterVolume.getValue();
			masterPanValue = knbMasterPan.getValue();
		}
	});
	
	Presets.broadcasters.postLoad.addListener({}, "Preset post load", function(isInternal)
	{
		if (!isInternal && isDefined(masterVolumeValue))
		{
			knbMasterVolume.setValue(masterVolumeValue);
			knbMasterPan.setValue(masterPanValue);

			knbMasterVolume.changed();
			knbMasterPan.changed();
		}			
	});
}