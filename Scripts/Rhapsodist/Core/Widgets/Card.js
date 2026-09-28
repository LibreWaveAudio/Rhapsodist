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

/*
@description: A card is a panel, used as a main UI layout element. Cards are automatically created from panels that have ids containing pnlCard.
They can also be created manually, and there is a grid layout helper function for quickly creating card grids.
Cards have styling automatically applied, including titles taken from the card text or build from panels within the cards.
If a card contains two or more panels these will automatically be treated as tabs, with clickable links for controlling their visibility.
*/

namespace Card
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;
	const allCards = [];
	const cards = {};

	//! Functions
	inline function createGrid(parentPanel: ScriptObject, gutter: number, layout: Array, options: JSON)
	{
		local numColumns = isDefined(options.numColumns) ? options.numColumns : 6;
		local numRows = isDefined(options.numRows) ? options.numRows : 4;
		local totalWidth = parentPanel.getWidth();
		local totalHeight = parentPanel.getHeight();

		for (i = 0; i < layout.length; i++)
		{
			local id = "pnlCard" + i;
	
			if (!Content.componentExists(id))
				Content.addPanel(id);
				
			local c = create(id, options);			
			local column = layout[i].column;
			local row = layout[i].row;
			local columnSpan = layout[i].columnSpan;
			local rowSpan = layout[i].rowSpan;

			local colWidth  = (totalWidth  - gutter * (numColumns + 1)) / numColumns;
			local rowHeight = (totalHeight - gutter * (numRows + 1)) / numRows;

			Content.setPropertiesFromJSON(id, {
				x: gutter + column * (colWidth + gutter),
				y: gutter + row * (rowHeight + gutter),
				width: colWidth * columnSpan + gutter * (columnSpan - 1),
				height: rowHeight * rowSpan + gutter * (rowSpan - 1),
				parentComponent: parentPanel.getId()
			});
		}
	}
	
	inline function createCardsFromPanels()
	{
		for (x in Content.getAllComponents("pnlCard\\d"))
		{
			local parent = x.get("parentComponent");
	
			if (!isDefined(cards[parent]))
				cards[parent] = [];
	
			local c = create(x.getId(), {tabWidth: 95});
	
			if (isDefined(style.card.font))
				c.data.font = style.card.font;
	
			if (isDefined(style.card.fontSize))
				c.data.fontSize = style.card.fontSize;				
	
			cards[parent].push(c);
		}
	}
	
	inline function: ScriptObject create(panelId: string, options: JSON)
	{
		local isNewPanel = !Content.componentExists(panelId);	

		local panel = SwitcherPanel.create(panelId, panelId, "ScriptPanel", {});
		panel.data.hover = -1;

		for (x in options)
			panel.data[x] = options[x];

		panel.data.labels = [];

		for (x in panel.getChildComponents())
		{
			if (x.get("type") != "ScriptPanel" || x.get("parentComponent") != panelId)
				continue;

			if (x.get("text") != "")
				panel.data.labels.push(x.get("text"));
		}

		if (!panel.data.labels.length)
		{
			panel.data.labels.push(panel.get("text"));
		}			
		else if (panel.data.labels.length > 1)
		{
			panel.set("allowCallbacks", "All Callbacks");
			panel.setMouseCallback(function(event) {mouseCallback();});
		}

		if (!isDefined(panel.data.tabWidth))
			panel.data.tabWidth = panel.getWidth() / panel.data.labels.length;

		panel.setPaintRoutine(function(g)
		{
			if (isDefined(LookAndFeel.drawCard))
				return LookAndFeel.drawCard();

			paintRoutine();
		});

		if (isNewPanel)
		{
			Content.setPropertiesFromJSON(panelId, {
				borderSize: 0,			
				borderRadius: 3,
				bgColour: 0xff313244,
				itemColour: 0x0,
				itemColour2: 0x0,
				textColour: 0xffcdd6f4
			});
		}

		panel.data.cardIndex = allCards.length;
		allCards.push(panel);

		return panel;
	}

	inline function paintRoutine()
	{
		local a = this.getLocalBounds(0);
		local radius = this.get("borderRadius");
		local w = this.data.labels.length > 1 ? this.data.tabWidth : a[2];
		local font = isDefined(this.data.font) ? this.data.font : fonts.semibold;
		local fontSize = isDefined(this.data.fontSize) ? this.data.fontSize : 16 + fonts.size;
		local borderSize = this.get("borderSize");

		if (isDefined(LookAndFeel.drawCard))
			return LookAndFeel.drawCard();

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);

		if (isDefined(LookAndFeel.drawCardBackground))
			LookAndFeel.drawCardBackground();

		g.setColour(this.get("itemColour2"));

		if (isDefined(LookAndFeel.drawCardBorder))
			LookAndFeel.drawCardBorder();		
		else
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);

		if (this.get("bgColour") != 0x0 && (!isDefined(style.useNoise) || style.useNoise))
			g.addNoise({alpha: 0.03, scaleFactor: 2.0, area: a, monochromatic: true});

		g.setFont(font, fontSize);

		for (i = 0; i < this.data.labels.length; i++)
		{
			local x = 15 + i * w;
			local text = this.data.labels[i];

			if (isDefined(LookAndFeel.drawCardLabel))
			{
				LookAndFeel.drawCardLabel(Rectangle(x, 5, w, 25), text);
				continue;
			}

			local c = Colours.withMultipliedBrightness(this.get("textColour"), this.data.hover == i ? 1.0 : 0.7);
			
			if (this.getValue() == i || this.data.labels.length == 1)
				c = this.get("textColour");
			
			g.setColour(Colours.withMultipliedAlpha(c, this.get("enabled") ? 1.0 : 0.5));
			g.drawAlignedText(text, [x, 5, w, 25], "left");
		}
	}
	
	inline function mouseCallback()
	{
		local value = Math.floor(event.x / this.data.tabWidth);
		this.data.hover = event.hover && this.data.labels.length > 1 ? value : -1;

		if (value > this.data.labels.length - 1)
		{
			this.data.hover = -1;
			return this.repaint();
		}

		if (!event.clicked || event.rightClick)
			return this.repaint();
				
		this.setValue(value);

		this.changed();
	}
	
	//! Function Calls
	createCardsFromPanels();
}
