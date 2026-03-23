/*
    Copyright 2024 David Healey

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

namespace Mpe
{
	UserSettings.setMenuIcon("MPE", "\ue521");

	//! pnlMpe
	const pnlMpe = Content.addPanel("pnlMpe", 0, 0);
	pnlMpe.set("parentComponent", "pnlSettings");
	pnlMpe.set("text", "MPE");
	pnlMpe.setPosition(200, 35, 390, 305);
	pnlMpe.setPaintRoutine(function(g){});
	
	//! fltMpe
	const fltMpe = Content.addFloatingTile("fltMpe", 0, 0);
	fltMpe.set("parentComponent", "pnlMpe");
	fltMpe.setPosition(0, 0, 390, 305);
	fltMpe.set("ContentType", "MPEPanel");
	fltMpe.set("Font", "regular");
	fltMpe.set("FontSize", 14);

	const laffltMpe = Content.createLocalLookAndFeel();
	fltMpe.setLocalLookAndFeel(laffltMpe);

	laffltMpe.registerFunction("drawScrollbar", function(g, obj)
	{
		var colours = {
			bgColour: pnlMpe.get("bgColour"),
			itemColour: pnlMpe.get("itemColour")
		};

		CoreLookAndFeel.drawScrollbar(); 
	});
	
	laffltMpe.registerFunction("drawDialogButton", function(g, obj)
	{
		var a = obj.area;
		var text = obj.text.replace(" Mode");
		var radius = 1;
		var bgColour = pnlMpe.get("itemColour");
		var itemColour = Colours.withMultipliedBrightness(pnlMpe.get("itemColour"), 1.2);
		var itemColour2 = pnlMpe.get("textColour");
		var textColour = pnlMpe.get("textColour");

		if (text == "Enable MPE")
			text = Engine.isMpeEnabled() ? "ENABLED" : "ENABLE MPE";

		var c0 = obj.value ? itemColour : bgColour;
		var c1 = Colours.withMultipliedBrightness(c0, obj.over ? 1.0 - 0.1 * obj.down : 0.8 + 0.1 * obj.value);

		g.setColour(Colours.withMultipliedAlpha(c1, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle(a, radius);

		g.setColour(Colours.withAlpha(Colours.black, 0.8));
		g.drawRoundedRectangle([a[0] + 0.25, a[1] + 0.25, a[2] - 0.5, a[3] - 0.5], radius, 1);

		g.setFont("medium", 14);
		g.setColour(Colours.withAlpha(obj.value ? itemColour2 : textColour, obj.over || obj.value ? 1.0 : 0.9));
		g.drawAlignedText(isDefined(text) ? text : obj.text, a, "centred");
	});

	laffltMpe.registerFunction("drawTableBackground", function(g, obj)
	{
		var colours = {textColour: pnlMpe.get("textColour")};
		CoreLookAndFeel.drawTableBackground(); 
	});
	
	laffltMpe.registerFunction("drawTablePath", function(g, obj)
	{
		var colours = {bgColour: pnlMpe.get("bgColour")};
		CoreLookAndFeel.drawTablePath(); 
	});
	
	laffltMpe.registerFunction("drawTableRuler", function(g, obj)
	{
		var colours = {itemColour2: pnlMpe.get("itemColour2")};
		CoreLookAndFeel.drawTableRuler(); 
	});
	
	laffltMpe.registerFunction("drawTablePoint", function(g, obj)
	{
		var colours = {itemColour: pnlMpe.get("itemColour")};
		CoreLookAndFeel.drawTablePoint(); 
	});
}
