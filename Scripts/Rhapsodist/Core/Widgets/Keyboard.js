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
	const range = [];
	
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
		local isLowKey = obj.noteNumber == range[0];
		local isHighKey = obj.noteNumber == range[1];
		local cornerData = [0, 0, 1, 1];
		local keyColour = obj.keyColour == 0 ? 0xff9399b2 : obj.keyColour;
		local hsl = Colours.toHsl(keyColour);
		hsl[2] = hsl[2] < 0.5 ? 0.9 : 0.1; // Invert lightness for hover and down

		g.setColour(keyColour);

		if (isLowKey)
			cornerData = [Style.keyboard.roundEndKeys, 0, !obj.down, !obj.down];

		if (isHighKey)
			cornerData = [0, Style.keyboard.roundEndKeys, !obj.down, !obj.down];
		
		if (isLowKey || isHighKey || !obj.down)
			g.fillRoundedRectangle(a, {CornerSize: Style.keyboard.radius, Rounded: cornerData});
		else
			g.fillRoundedRectangle(a, {CornerSize: 1, Rounded: cornerData});

		if (obj.hover)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.3));

		if (obj.down)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.5));

		if (obj.hover || obj.down)
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 1 : Style.keyboard.radius, Rounded: cornerData});
		
		if (Style.keyboard.shadow)
		{
			g.setGradientFill([Colours.withAlpha(Colours.black, 0.3), a[2] / 2, a[1], 0x0, a[2] / 2, a[3] / 2]);
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 1 : Style.keyboard.radius, Rounded: cornerData});
		}

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});

		local noteName = Engine.getMidiNoteName(obj.noteNumber);
		
		if (noteName.contains("C"))
		{
			g.setColour(fltKeyboard.get("textColour"));
			g.setFont(obj.font, obj.fontSize);
			g.drawAlignedText(noteName, a.withTrimmedBottom(5), "centredBottom");
		}
	}
		
	inline function drawBlackNote()
	{
		local a = obj.area.withTrimmedBottom(1);
		local cornerData = [0, 0, 1, 1];
		local keyColour = obj.keyColour == 0 ? 0xff11111b : obj.keyColour;
		local hsl = Colours.toHsl(keyColour);
		hsl[2] = hsl[2] < 0.5 ? 0.9 : 0.1; // Invert lightness for hover and down

		g.setColour(Colours.black);
		g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : Style.keyboard.radius, Rounded: cornerData});

		g.setColour(keyColour);
		g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : Style.keyboard.radius, Rounded: cornerData});

		if (obj.hover)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.3));

		if (obj.down)
			g.setColour(Colours.withAlpha(Colours.fromHsl(hsl), 0.5));

		if (obj.hover || obj.down)
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : Style.keyboard.radius, Rounded: cornerData});

		if (Style.keyboard.shadow)
		{
			g.setGradientFill([Colours.withAlpha(Colours.black, 0.3), a[2] / 2, a[1], 0x0, a[2] / 2, a[3] / 2]);
			g.fillRoundedRectangle(a, {CornerSize: obj.down ? 0 : Style.keyboard.radius, Rounded: cornerData});
		}
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
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
	
	inline function updateRange()
	{
		range[0] = getDataProperty("LowKey");
		range[1] = getDataProperty("HiKey");
	}
	
	//! Function Calls
	updateRange();
}
