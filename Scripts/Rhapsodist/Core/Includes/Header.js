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
		
		g.setFont(Style.header.font, Style.header.fontSize);
		g.setColour(this.get("textColour"));
		g.drawAlignedText(this.get("text"), [a[0] + 10, a[1], a[2], a[3] + Style.header.textHeightOffset], "left");

		g.setColour(this.get("itemColour2"));
		g.drawHorizontalLine(a[3] - 1, a[0], a[2]);

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	});
	
	//! knbMasterPan
	const knbMasterPan = Content.getComponent("knbMasterPan");
	const lafPanVol = Content.createLocalLookAndFeel();
	knbMasterPan.setLocalLookAndFeel(lafPanVol);

	lafPanVol.registerFunction("drawRotarySlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPanVolSliders))
			return LookAndFeel.drawPanVolSliders();

		g.setFont(Style.header.sliderFont, Style.header.sliderFontSize);
		g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.hover || obj.clicked ? 1.0 : 0.8));
		g.drawAlignedText(obj.text + "  " + obj.valueAsText, obj.area, "left");
	});
	
	//! knbMasterVolume
	const knbMasterVolume = Content.getComponent("knbMasterVolume");
	knbMasterVolume.setLocalLookAndFeel(lafPanVol);
		
	//! fltMasterPeak
	const fltMasterPeak = Content.getComponent("fltMasterPeak");
	fltMasterPeak.setLocalLookAndFeel(CoreLookAndFeel.peakMeter);

	//! Functions
	
	//! Broadcasters
	/*Presets.broadcasters.preLoad.addListener({}, "Preset has been loaded", function(isInternal)
	{
		if (!isInternal)
		{
			masterVolumeValue = knbMasterVolume.getValue();
			masterPanValue = knbMasterPan.getValue();
		}
	});
	
	Presets.broadcasters.postLoad.addListener({}, "Preset has been loaded", function(isInternal)
	{
		if (!isInternal && isDefined(masterVolumeValue))
		{
			knbMasterVolume.setValue(masterVolumeValue);
			knbMasterPan.setValue(masterPanValue);
			knbMasterVolume.changed();
			knbMasterPan.changed();
		}			
	});*/
}