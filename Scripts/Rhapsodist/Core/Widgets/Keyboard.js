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

namespace Keyboard
{
	reg transposition = 0;

	const lowHiKey = [];
	const keyRanges = {};
	const style = CoreLookAndFeel.style.keyboard;
	const laf = Content.createLocalLookAndFeel();

	laf.registerFunction("drawWhiteNote", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawWhiteNote))
			return LookAndFeel.drawWhiteNote();
			
		drawWhiteNote();
	});
	
	laf.registerFunction("drawBlackNote", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawBlackNote))
			return LookAndFeel.drawBlackNote();
	
		drawBlackNote();
	});

	inline function drawWhiteNote()
	{
		local a = obj.area.reduced(0.5, 0);
		local isLowKey = obj.noteNumber == lowHiKey[0];
		local isHighKey = obj.noteNumber == lowHiKey[1];
		local roundEndKeys = style.roundEndKeys;
		local radius = style.radius;
		local useShadow = style.useShadow;
		local cornerData = [0, 0, 1, 1];
		local keyColour = obj.keyColour == 0 ? 0xff9399b2 : obj.keyColour;
		local hsl = Colours.toHsl(keyColour);
		hsl[2] = hsl[2] < 0.5 ? 0.9 : 0.1; // Invert lightness for hover and down

		g.setColour(keyColour);

		if (isLowKey)
			cornerData = [roundEndKeys, 0, !obj.down, !obj.down];

		if (isHighKey)
			cornerData = [0, roundEndKeys, !obj.down, !obj.down];
		
		if (isLowKey || isHighKey || !obj.down)
			g.fillRoundedRectangle(a, {CornerSize: radius, Rounded: cornerData});
		else
			g.fillRoundedRectangle(a, {CornerSize: 1, Rounded: cornerData});

		if (obj.hover)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.3));

		if (obj.down)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.5));

		if (obj.hover || obj.down)
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 1 : radius, Rounded: cornerData});
		
		if (useShadow)
		{
			g.setGradientFill([Colours.withAlpha(Colours.black, 0.3), a[2] / 2, a[1], 0x0, a[2] / 2, a[3] / 2]);
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 1 : radius, Rounded: cornerData});
		}

		if (!isDefined(style.useNoise) || !style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});

		local noteName = Engine.getMidiNoteName(obj.noteNumber);
		
		if (noteName.contains("C"))
		{
			g.setColour(style.textColour);
			g.setFont(obj.font, obj.fontSize);
			g.drawAlignedText(noteName, a.withTrimmedBottom(2), "centredBottom");
		}
	}
		
	inline function drawBlackNote()
	{
		local a = obj.area.withTrimmedBottom(1);
		local radius = style.radius;
		local useShadow = style.useShadow;
		local cornerData = [0, 0, 1, 1];
		local keyColour = obj.keyColour == 0 ? 0xff11111b : obj.keyColour;
		local hsl = Colours.toHsl(keyColour);
		hsl[2] = hsl[2] < 0.5 ? 0.9 : 0.1; // Invert lightness for hover and down

		g.setColour(Colours.black);
		g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : radius, Rounded: cornerData});

		g.setColour(keyColour);
		g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : radius, Rounded: cornerData});

		if (obj.hover)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.2));

		if (obj.down)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.3));

		if (obj.hover || obj.down)
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : radius, Rounded: cornerData});

		if (useShadow)
		{
			g.setGradientFill([Colours.withAlpha(Colours.black, 0.3), a[2] / 2, a[1], 0x0, a[2] / 2, a[3] / 2]);
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : radius, Rounded: cornerData});
		}
		
		if (!isDefined(style.useNoise) || !style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	}
	
	//! fltKeyboard
	const fltKeyboard = Content.getComponent("fltKeyboard");
	fltKeyboard.setLocalLookAndFeel(laf);
	
	//! Functions
	inline function setProperty(key: string, value: NotUndefined)
	{
		fltKeyboard.set(key, value);
	}

	inline function setDataProperty(key: string, value: NotUndefined)
	{
		local obj = fltKeyboard.get("Data").parseAsJSON();
		
		obj[key] = value;
		fltKeyboard.set("Data", trace(obj));
	}

	inline function: NotUndefined getDataProperty(key: string)
	{
		local obj = fltKeyboard.get("Data").parseAsJSON();
		return obj[key];
	}
	
	inline function updateVisibleRange()
	{
		lowHiKey[0] = getDataProperty("LowKey");
		lowHiKey[1] = getDataProperty("HiKey");
	}

	inline function setKeyRanges()
	{
		local keyColours = style.colours;

		for (k in keyRanges)
		{
			local data = keyRanges[k];

			if (!data.length)
				continue;	

			for (x in data)
			{
				if ((!isDefined(x.loKey) || !isDefined(x.hiKey)) && !isDefined(x.keys))
					continue;
	
				for (i = 0; i < 127; i++)
				{
					if (isDefined(x.keys) && !x.keys.contains(i))
						continue;
	
					if ((isDefined(x.loKey) && isDefined(x.hiKey)) && (i < x.loKey || i > x.hiKey))
						continue;
	
					local note = i + transposition;
					local isBlack = [1, 3, 6, 8, 10].contains(note % 12);
					local c = keyColours[x.colour][isBlack];
	
					if (!isDefined(c))
						continue;
	
					Engine.setKeyColour(note, c);
				}
			}
		}
		

	}
	
	inline function resetKeyColours()
	{
		local keyColours = style.colours.inactive;

		for (i = 0; i < 128; i++)
		{
			local isBlack = [1, 3, 6, 8, 10].contains(i % 12);
			Engine.setKeyColour(i, keyColours[isBlack]);
		}
	}
	
	//! Function Calls
	updateVisibleRange();
	resetKeyColours();

	if (isDefined(Manifest.keyranges))
	{
		keyRanges.manifest = Manifest.keyranges;
		setKeyRanges();
	}		

	//! Broadcasters
	const bcPatchChanged = Engine.createBroadcaster({id: "keyboardPatchChanged", args: ["component", "value"]});
	bcPatchChanged.setEnableQueue(true);
	bcPatchChanged.attachToComponentValue("knbPatch", "");
	
	bcPatchChanged.addListener(0, "Patch change listener", function(component, value)
	{	
		var patch = Manifest.patches[value];
	
		if (!isDefined(patch.keyranges))
			return;

		keyRanges.patch = patch.keyranges;
		resetKeyColours();
		setKeyRanges();
	});

	const bcArticulationChanged = Engine.createBroadcaster({id: "keyboardArticulationChanged", args: ["component", "value"]});
	bcArticulationChanged.attachToComponentValue("knbArticulation", "");

	bcArticulationChanged.addListener(0, "Articulation change listener", function(component, value)
	{	
		var articulation = ArticulationDataManager.getArticulation(value);

		if (!isDefined(articulation.keyranges))
			return;

		keyRanges.articulation = articulation.keyranges;
		resetKeyColours();
		setKeyRanges();
	});

	const bcTranposeChanged = Engine.createBroadcaster({id: "bcTranposeChanged", args: ["component", "value"]});
	bcTranposeChanged.attachToComponentValue("knbTranspose", "");
	
	bcTranposeChanged.addListener(0, "Transposition value changed", function(component, value)
	{
		transposition = value;
		resetKeyColours();
		setKeyRanges();
	});	
}
